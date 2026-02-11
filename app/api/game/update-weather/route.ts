import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateGrowthModifier, calculateDiseaseRisk, applyNdviImpact, CROP_DATA, CropType } from '@/lib/game-mechanics';
import { fetchPOWERData } from '@/lib/nasa-api';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, latitude, longitude } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch game
    const { data: game, error: gameError } = await supabase
      .from('game_farms')
      .select('*')
      .eq('id', gameId)
      .eq('user_id', user.id)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Fetch active crops
    const { data: crops, error: cropsError } = await supabase
      .from('game_crops')
      .select('*')
      .eq('game_id', gameId)
      .neq('status', 'harvested');

    if (cropsError) {
      return NextResponse.json({ error: 'Failed to fetch crops' }, { status: 500 });
    }

    if (!crops || crops.length === 0) {
      return NextResponse.json({ message: 'No active crops to update' });
    }

    // Get NASA weather data (use game coordinates or default)
    const lat = latitude || 35.6762; // Default: Tokyo
    const lon = longitude || 139.6503;
    const today = new Date().toISOString().split('T')[0];

    let nasaData: any = null;
    try {
      nasaData = await fetchPOWERData(lat, lon, today, today);
      console.log('[v0] NASA weather data:', nasaData);
    } catch (err) {
      console.log('[v0] Could not fetch NASA data, using simulated values');
      // Use simulated values if API fails
      nasaData = {
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        rainfall: Math.random() * 20,
        solarRadiation: 200 + Math.random() * 100,
      };
    }

    // Update each active crop
    const updatedCrops = [];

    for (const crop of crops) {
      const cropData = CROP_DATA[crop.crop_type as CropType];
      if (!cropData) continue;

      // Calculate growth modifier based on weather
      const growthModifier = calculateGrowthModifier(
        nasaData.temperature,
        nasaData.humidity,
        nasaData.rainfall,
        crop.crop_type
      );

      // Calculate disease risk
      const diseaseRisk = calculateDiseaseRisk(
        nasaData.temperature,
        nasaData.humidity,
        nasaData.rainfall,
        0 // Days since last treatment
      );

      // Update growth progress (daily increment)
      let newGrowthProgress = crop.growth_progress + growthModifier;

      // Update health based on conditions
      let newHealth = crop.health;
      if (nasaData.rainfall > 50) newHealth = Math.max(0, newHealth - 10); // Too much rain
      if (nasaData.rainfall < 5) newHealth = Math.max(0, newHealth - 5); // Too dry
      if (nasaData.temperature < cropData.optimalTemp.min - 5) newHealth = Math.max(0, newHealth - 10);
      if (nasaData.temperature > cropData.optimalTemp.max + 5) newHealth = Math.max(0, newHealth - 10);

      newHealth = Math.min(100, newHealth + growthModifier * 2);

      // Update water level based on rainfall
      let newWaterLevel = Math.min(100, crop.water_level + nasaData.rainfall);

      // Update status based on growth
      let newStatus = crop.status;
      if (newGrowthProgress >= 100) {
        newStatus = 'mature';
        newGrowthProgress = 100;
      } else if (newGrowthProgress >= 30) {
        newStatus = 'growing';
      }

      // Crop failure if health drops too low
      if (newHealth <= 0) {
        newStatus = 'failed';
      }

      // Calculate estimated yield
      const estimatedYield = (newHealth / 100) * cropData.baseYield;

      // Update crop in database
      const { error: updateError } = await supabase
        .from('game_crops')
        .update({
          health: newHealth,
          water_level: Math.max(0, newWaterLevel - 2), // Daily water loss
          growth_progress: newGrowthProgress,
          status: newStatus,
          nasa_weather_score: Math.round(growthModifier * 100),
          disease_risk: Math.round(diseaseRisk),
          estimated_yield: estimatedYield,
        })
        .eq('id', crop.id);

      if (updateError) {
        console.error('[v0] Error updating crop:', updateError);
        continue;
      }

      // Record weather effect
      await supabase
        .from('game_weather_effects')
        .insert({
          crop_id: crop.id,
          weather_type: nasaData.rainfall > 30 ? 'rainy' : nasaData.temperature > 30 ? 'heatwave' : 'sunny',
          severity: Math.round((Math.abs(nasaData.temperature - cropData.optimalTemp.max) / 10) * 100),
          impact: Math.round((growthModifier - 1) * 100),
          duration_days: 1,
        });

      updatedCrops.push({
        ...crop,
        health: newHealth,
        water_level: Math.max(0, newWaterLevel - 2),
        growth_progress: newGrowthProgress,
        status: newStatus,
      });
    }

    return NextResponse.json({
      success: true,
      updatedCrops,
      weatherData: nasaData,
      message: 'Crops updated with weather data',
    });
  } catch (error) {
    console.error('[v0] Weather update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
