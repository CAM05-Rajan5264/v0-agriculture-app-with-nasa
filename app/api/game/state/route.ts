import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gameId = request.nextUrl.searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    // Fetch game farm
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
      .eq('game_farm_id', gameId)
      .order('planted_date', { ascending: false });

    if (cropsError) {
      console.error('[v0] Error fetching crops:', cropsError);
      return NextResponse.json({ error: 'Failed to fetch crops' }, { status: 500 });
    }

    // Fetch resources
    const { data: resources } = await supabase
      .from('game_resources')
      .select('*')
      .eq('game_farm_id', gameId)
      .single();

    // Fetch weather effects
    const { data: weatherEffects } = await supabase
      .from('game_weather_effects')
      .select('*')
      .eq('game_farm_id', gameId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      game,
      crops: crops || [],
      resources,
      weatherEffects: weatherEffects || [],
    });
  } catch (error) {
    console.error('[v0] Game state error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
