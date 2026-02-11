import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { farmName, cropType } = body;

    if (!farmName || !cropType) {
      return NextResponse.json(
        { error: 'Missing required fields: farmName, cropType' },
        { status: 400 }
      );
    }

    // Create a new game
    const { data: gameData, error: gameError } = await supabase
      .from('game_farms')
      .insert({
        user_id: user.id,
        farm_name: farmName,
        status: 'active',
        score: 0,
        resources_water: 100,
        resources_fertilizer: 50,
        resources_seeds: 50,
        resources_gold: 0,
      })
      .select()
      .single();

    if (gameError) {
      console.error('[v0] Game creation error:', gameError);
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }

    // Plant initial crop
    const plantDate = new Date().toISOString();
    const harvestDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days later

    const { data: cropData, error: cropError } = await supabase
      .from('game_crops')
      .insert({
        game_id: gameData.id,
        crop_type: cropType,
        status: 'sprouted',
        health: 80,
        water_level: 100,
        growth_progress: 5,
        planted_date: plantDate,
        expected_harvest_date: harvestDate,
        nasa_weather_score: 0,
        ndvi_score: 0.3,
        estimated_yield: 0,
        disease_risk: 15,
      })
      .select()
      .single();

    if (cropError) {
      console.error('[v0] Crop creation error:', cropError);
      return NextResponse.json({ error: 'Failed to plant crop' }, { status: 500 });
    }

    // Deduct initial resources
    await supabase
      .from('game_farms')
      .update({
        resources_water: 80,
        resources_fertilizer: 45,
        resources_seeds: 49,
      })
      .eq('id', gameData.id);

    return NextResponse.json({
      game: gameData,
      crop: cropData,
      message: 'Game started successfully',
    });
  } catch (error) {
    console.error('[v0] Game start error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
