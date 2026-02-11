'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FarmDisplay } from '@/components/game/farm-display';
import { GameActions } from '@/components/game/game-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Zap,
  RotateCcw,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { GameCrop } from '@/lib/game-types';
import { CROP_DATA, CropType } from '@/lib/game-mechanics';

const CROP_OPTIONS: CropType[] = ['tomato', 'wheat', 'corn', 'potato', 'rice'];

export default function GamePage() {
  const router = useRouter();
  const [gameId, setGameId] = useState<string | null>(null);
  const [crops, setCrops] = useState<GameCrop[]>([]);
  const [game, setGame] = useState<any>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropType>('tomato');
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing game or show start dialog
  useEffect(() => {
    const loadGame = async () => {
      const stored = localStorage.getItem('currentGame');
      if (stored) {
        const { gameId: id } = JSON.parse(stored);
        setGameId(id);
        await fetchGameState(id);
        setGameStarted(true);
      }
    };
    loadGame();
  }, []);

  const fetchGameState = async (id: string) => {
    try {
      const response = await fetch(`/api/game/state?gameId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch game state');

      const data = await response.json();
      setGame(data.game);
      setCrops(data.crops);
      setError(null);
    } catch (err) {
      console.error('[v0] Error fetching game state:', err);
      setError('Failed to load game');
    }
  };

  const startGame = async (farmName: string) => {
    setLoading(true);
    try {
      // Get default location (Delhi, India - where farmers often use smart farming)
      const defaultLocation = {
        location: 'Delhi, India',
        latitude: 28.661395,
        longitude: 77.092855,
      };

      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmName,
          cropType: selectedCrop,
          location: defaultLocation.location,
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start game');
      }

      const data = await response.json();
      setGameId(data.game.id);
      setGame(data.game);
      setCrops([data.crop]);
      localStorage.setItem('currentGame', JSON.stringify({ gameId: data.game.id }));
      setGameStarted(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGameAction = async (action: string, amount: number) => {
    if (!gameId || !crops[0]) return;

    try {
      const response = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          cropId: crops[0].id,
          action,
          amount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      // Refresh game state
      await fetchGameState(gameId);
    } catch (err) {
      console.error('[v0] Action error:', err);
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const resetGame = () => {
    localStorage.removeItem('currentGame');
    setGameStarted(false);
    setGameId(null);
    setCrops([]);
    setGame(null);
  };

  if (!gameStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Farm Tycoon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Manage your virtual farm using real NASA weather data. Plant crops, respond to weather conditions,
              and optimize your harvest!
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Your First Crop</label>
              <Select value={selectedCrop} onValueChange={(v) => setSelectedCrop(v as CropType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CROP_OPTIONS.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {CROP_DATA[crop].icon} {CROP_DATA[crop].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <div className="p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

            <Button
              onClick={() => startGame('My Farm')}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Starting...' : 'Start Game'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Based on real NASA POWER weather data and satellite imagery
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeCrop = crops[0];
  const harvestedCrops = crops.filter((c) => c.harvested === true);
  const totalScore = game?.total_points || 0;
  const resources = (game as any)?.resources;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farm Tycoon</h1>
          <p className="text-gray-600">{game?.name || 'My Farm'}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {totalScore.toLocaleString()} Points
          </div>
        </div>
      </div>

      {/* Resources Bar */}
      {resources && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(resources.water_available)}</div>
                <p className="text-xs text-gray-600">Water</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(resources.fertilizer_available)}</div>
                <p className="text-xs text-gray-600">Fertilizer</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{Math.round(resources.seeds_available)}</div>
                <p className="text-xs text-gray-600">Seeds</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(resources.cash)}</div>
                <p className="text-xs text-gray-600">Cash</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-600">{harvestedCrops.length}</div>
                <p className="text-xs text-gray-600">Harvested</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Display */}
        <div className="lg:col-span-2">
          <FarmDisplay crops={activeCrop ? [activeCrop] : []} gameStatus={game?.status} />
        </div>

        {/* Actions Sidebar */}
        {activeCrop && activeCrop.status !== 'harvested' && (
          <div className="space-y-4">
            <GameActions
              crop={activeCrop}
              gameId={gameId!}
              resources={{
                water: game?.resources_water || 0,
                fertilizer: game?.resources_fertilizer || 0,
                gold: game?.resources_gold || 0,
              }}
              onAction={handleGameAction}
              loading={loading}
            />

            {/* Game Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Crop Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Planted Date</p>
                  <p className="font-semibold">{new Date(activeCrop.planted_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Growth Stage</p>
                  <p className="font-semibold capitalize">{activeCrop.growth_stage || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Health Score</p>
                  <p className="font-semibold">{Math.round(activeCrop.health_score || 0)}/100</p>
                </div>
                <div>
                  <p className="text-gray-600">Water Level</p>
                  <p className="font-semibold">{Math.round(activeCrop.water_level || 0)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Disease Risk</p>
                  <p className="font-semibold">{((activeCrop.disease_risk || 0) * 100).toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Reset Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Game
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Game?</DialogTitle>
                  <DialogDescription>
                    Your current farm progress will be lost. Are you sure?
                  </DialogDescription>
                </DialogHeader>
                <Button variant="destructive" onClick={resetGame} className="w-full">
                  Start New Game
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Harvest Summary */}
      {harvestedCrops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Harvest Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              You have harvested {harvestedCrops.length} crop{harvestedCrops.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2">
              {harvestedCrops.map((crop, i) => {
                const cropData = CROP_DATA[crop.crop_type as CropType];
                const yieldEstimate = Math.round((crop.health_score || 75) * (crop.water_level || 70) / 100);
                return (
                  <div key={crop.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">
                        {cropData?.icon} {cropData?.name || crop.crop_type}
                      </p>
                      <p className="text-xs text-gray-600">Yield: {yieldEstimate} kg</p>
                    </div>
                    <Badge>{Math.round(yieldEstimate * 10)} Gold</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
