import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ACHIEVEMENTS = {
  first_harvest: {
    id: 'first_harvest',
    title: 'First Harvest',
    description: 'Harvest your first crop',
    points: 50,
    icon: '🌾',
  },
  perfect_crop: {
    id: 'perfect_crop',
    title: 'Perfect Crop',
    description: 'Harvest a crop with 100% health',
    points: 200,
    icon: '🏆',
  },
  yield_master: {
    id: 'yield_master',
    title: 'Yield Master',
    description: 'Harvest 10 crops',
    points: 300,
    icon: '🌟',
  },
  water_saver: {
    id: 'water_saver',
    title: 'Water Saver',
    description: 'Harvest a crop with less than 20 water applications',
    points: 100,
    icon: '💧',
  },
  disease_fighter: {
    id: 'disease_fighter',
    title: 'Disease Fighter',
    description: 'Successfully treat crop disease 5 times',
    points: 150,
    icon: '⚔️',
  },
  quick_grower: {
    id: 'quick_grower',
    title: 'Quick Grower',
    description: 'Harvest a crop 10 days before expected date',
    points: 120,
    icon: '⚡',
  },
  high_yielder: {
    id: 'high_yielder',
    title: 'High Yielder',
    description: 'Harvest a crop with 15+ kg yield',
    points: 250,
    icon: '📈',
  },
  farmer_legend: {
    id: 'farmer_legend',
    title: 'Farming Legend',
    description: 'Earn 5000 total points',
    points: 500,
    icon: '👑',
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user achievements
    const { data: achievements, error } = await supabase
      .from('game_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
    }

    // Get all possible achievements
    const allAchievements = Object.values(ACHIEVEMENTS);
    const unlockedIds = new Set((achievements || []).map(a => a.achievement_type));

    return NextResponse.json({
      achievements: allAchievements.map(a => ({
        ...a,
        unlocked: unlockedIds.has(a.id),
      })),
      earnedPoints: achievements?.reduce((sum, a) => sum + a.points, 0) || 0,
    });
  } catch (error) {
    console.error('[v0] Achievements error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { achievementId } = body;

    if (!achievementId || !ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS]) {
      return NextResponse.json({ error: 'Invalid achievement' }, { status: 400 });
    }

    const achievement = ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS];

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('game_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_type', achievementId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Achievement already unlocked' });
    }

    // Insert achievement
    const { error: insertError } = await supabase
      .from('game_achievements')
      .insert({
        user_id: user.id,
        achievement_type: achievementId,
        title: achievement.title,
        description: achievement.description,
        points: achievement.points,
        unlocked_date: new Date().toISOString(),
      });

    if (insertError) {
      return NextResponse.json({ error: 'Failed to unlock achievement' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      achievement,
      message: `Achievement unlocked: ${achievement.title}`,
    });
  } catch (error) {
    console.error('[v0] Achievement unlock error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
