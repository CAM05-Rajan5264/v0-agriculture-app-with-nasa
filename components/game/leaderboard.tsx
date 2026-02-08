'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  farmName: string;
  score: number;
  gold: number;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/game/leaderboard');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setTopPlayers(data.topPlayers || []);
      } catch (err) {
        console.error('[v0] Leaderboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No games yet</div>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 20).map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg font-bold w-8 text-center">
                    {getRankBadge(entry.rank)}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{entry.username}</p>
                    <p className="text-xs text-gray-600">{entry.farmName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-sm">{entry.score.toLocaleString()}</div>
                    <p className="text-xs text-gray-600">points</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {entry.gold} 🪙
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
