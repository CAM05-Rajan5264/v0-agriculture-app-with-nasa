import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateHarvestPoints } from '@/lib/game-mechanics';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, cropId, action, amount } = body;

    if (!gameId || !cropId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: gameId, cropId, action' },
        { status: 400 }
      );
    }

    // Fetch game to verify ownership
    const { data: game, error: gameError } = await supabase
      .from('game_farms')
      .select('*')
      .eq('id', gameId)
      .eq('user_id', user.id)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Fetch crop
    const { data: crop, error: cropError } = await supabase
      .from('game_crops')
      .select('*')
      .eq('id', cropId)
      .single();

    if (cropError || !crop) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    let updateData: any = {};
    let resourceCosts: any = {};

    switch (action) {
      case 'water':
        resourceCosts = { resources_water: -amount };
        updateData = {
          water_level: Math.min(100, crop.water_level + amount * 2),
          health: Math.min(100, crop.health + 5),
        };
        break;

      case 'fertilize':
        resourceCosts = { resources_fertilizer: -amount };
        updateData = {
          health: Math.min(100, crop.health + 10),
          growth_progress: Math.min(100, crop.growth_progress + 3),
        };
        break;

      case 'treat':
        resourceCosts = { resources_gold: -50 };
        updateData = {
          disease_risk: Math.max(0, crop.disease_risk - 30),
          health: Math.min(100, crop.health + 8),
        };
        break;

      case 'harvest':
        if (crop.growth_progress < 80) {
          return NextResponse.json(
            { error: 'Crop is not ready to harvest yet' },
            { status: 400 }
          );
        }

        const daysGrown = Math.floor(
          (new Date(crop.planted_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );

        const yield_ = crop.estimated_yield || 5;
        const points = calculateHarvestPoints(yield_, crop.crop_type, crop.health, Math.abs(daysGrown));

        updateData = {
          status: 'harvested',
          growth_progress: 100,
        };
        resourceCosts = {
          score: points,
          resources_gold: yield_ * 10,
        };
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Check resources
    if (resourceCosts.resources_water && game.resources_water + resourceCosts.resources_water < 0) {
      return NextResponse.json({ error: 'Insufficient water' }, { status: 400 });
    }
    if (resourceCosts.resources_fertilizer && game.resources_fertilizer + resourceCosts.resources_fertilizer < 0) {
      return NextResponse.json({ error: 'Insufficient fertilizer' }, { status: 400 });
    }
    if (resourceCosts.resources_gold && game.resources_gold + resourceCosts.resources_gold < 0) {
      return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 });
    }

    // Update crop
    const { error: updateError } = await supabase
      .from('game_crops')
      .update(updateData)
      .eq('id', cropId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update crop' }, { status: 500 });
    }

    // Update game resources
    const gameUpdate = {
      resources_water: game.resources_water + (resourceCosts.resources_water || 0),
      resources_fertilizer: game.resources_fertilizer + (resourceCosts.resources_fertilizer || 0),
      resources_gold: game.resources_gold + (resourceCosts.resources_gold || 0),
      score: game.score + (resourceCosts.score || 0),
    };

    await supabase
      .from('game_farms')
      .update(gameUpdate)
      .eq('id', gameId);

    return NextResponse.json({
      success: true,
      action,
      updatedCrop: { ...crop, ...updateData },
      updatedGame: gameUpdate,
    });
  } catch (error) {
    console.error('[v0] Game action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
