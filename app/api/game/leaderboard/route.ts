import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Fetch all games with their scores, ranked
    const { data: games, error } = await supabase
      .from('game_farms')
      .select('id, user_id, farm_name, score, resources_gold, status')
      .eq('status', 'active')
      .order('score', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    if (!games || games.length === 0) {
      return NextResponse.json({ leaderboard: [], topPlayers: [] });
    }

    // Get user details for each game
    const leaderboard = await Promise.all(
      games.map(async (game, index) => {
        const { data: user } = await supabase
          .auth.admin.getUserById(game.user_id);

        return {
          rank: index + 1,
          userId: game.user_id,
          username: user?.user_metadata?.full_name || 'Anonymous Farmer',
          farmName: game.farm_name,
          score: game.score,
          gold: game.resources_gold,
        };
      })
    );

    // Get top 10
    const topPlayers = leaderboard.slice(0, 10);

    return NextResponse.json({
      leaderboard,
      topPlayers,
      totalPlayers: leaderboard.length,
    });
  } catch (error) {
    console.error('[v0] Leaderboard error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
