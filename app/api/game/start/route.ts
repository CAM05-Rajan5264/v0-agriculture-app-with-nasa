import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { farmName, cropType, location, latitude, longitude } = body;

    if (!farmName || !cropType || !location || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: farmName, cropType, location, latitude, longitude' },
        { status: 400 }
      );
    }

    // Create a new game farm
    const { data: gameData, error: gameError } = await supabase
      .from('game_farms')
      .insert({
        user_id: user.id,
        name: farmName,
        location: location,
        latitude: latitude,
        longitude: longitude,
        size_hectares: 10,
        total_points: 0,
        total_harvests: 0,
        best_yield: 0,
      })
      .select()
      .single();

    if (gameError) {
      console.error('[v0] Game creation error:', gameError);
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }

    // Create game resources for the farm
    const { error: resourcesError } = await supabase
      .from('game_resources')
      .insert({
        game_farm_id: gameData.id,
        water_available: 1000,
        water_capacity: 1000,
        fertilizer_available: 500,
        fertilizer_capacity: 500,
        seeds_available: 100,
        cash: 5000,
      });

    if (resourcesError) {
      console.error('[v0] Resources creation error:', resourcesError);
      return NextResponse.json({ error: 'Failed to create resources' }, { status: 500 });
    }

    // Plant initial crop
    const plantDate = new Date().toISOString();

    const { data: cropData, error: cropError } = await supabase
      .from('game_crops')
      .insert({
        game_farm_id: gameData.id,
        crop_type: cropType,
        planted_date: plantDate,
        growth_stage: 'seedling',
        health_score: 80,
        water_level: 100,
        nutrient_level: 50,
        disease_risk: 0.15,
        harvested: false,
      })
      .select()
      .single();

    if (cropError) {
      console.error('[v0] Crop creation error:', cropError);
      return NextResponse.json({ error: 'Failed to plant crop' }, { status: 500 });
    }

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
