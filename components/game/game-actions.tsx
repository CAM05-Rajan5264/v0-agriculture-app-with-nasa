'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Droplets,
  Leaf,
  Zap,
  Scissors,
  AlertTriangle,
} from 'lucide-react';
import { GameCrop } from '@/lib/game-types';

interface GameActionsProps {
  crop: GameCrop;
  gameId: string;
  resources: {
    water: number;
    fertilizer: number;
    gold: number;
  };
  onAction: (action: string, amount: number) => Promise<void>;
  loading?: boolean;
}

export function GameActions({
  crop,
  gameId,
  resources,
  onAction,
  loading = false,
}: GameActionsProps) {
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: string, amount: number = 1) => {
    setActionLoading(true);
    try {
      await onAction(action, amount);
    } finally {
      setActionLoading(false);
    }
  };

  const canWater = resources.water >= 10;
  const canFertilize = resources.fertilizer >= 5;
  const canTreat = resources.gold >= 50;
  const canHarvest = crop.growthProgress >= 80 && crop.status !== 'harvested';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Farm Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Water Action */}
        <Button
          variant={canWater ? 'default' : 'outline'}
          disabled={!canWater || actionLoading}
          onClick={() => handleAction('water', 10)}
          className="w-full justify-start"
          size="sm"
        >
          <Droplets className="h-4 w-4 mr-2" />
          <span className="flex-1">Water Crop</span>
          <Badge variant="secondary" className="text-xs">
            -{10} Water
          </Badge>
        </Button>

        {!canWater && (
          <p className="text-xs text-red-600 px-3">Insufficient water ({resources.water}/10)</p>
        )}

        {/* Fertilize Action */}
        <Button
          variant={canFertilize ? 'default' : 'outline'}
          disabled={!canFertilize || actionLoading}
          onClick={() => handleAction('fertilize', 5)}
          className="w-full justify-start"
          size="sm"
        >
          <Leaf className="h-4 w-4 mr-2" />
          <span className="flex-1">Apply Fertilizer</span>
          <Badge variant="secondary" className="text-xs">
            -{5} Fert
          </Badge>
        </Button>

        {!canFertilize && (
          <p className="text-xs text-red-600 px-3">Insufficient fertilizer ({resources.fertilizer}/5)</p>
        )}

        {/* Treatment Action */}
        <Button
          variant={canTreat ? 'default' : 'outline'}
          disabled={!canTreat || actionLoading}
          onClick={() => handleAction('treat', 1)}
          className="w-full justify-start"
          size="sm"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="flex-1">Treat Disease</span>
          <Badge variant="secondary" className="text-xs">
            -{50} Gold
          </Badge>
        </Button>

        {!canTreat && (
          <p className="text-xs text-red-600 px-3">Insufficient gold ({resources.gold}/50)</p>
        )}

        {/* Harvest Action */}
        <Button
          variant={canHarvest ? 'default' : 'outline'}
          disabled={!canHarvest || actionLoading}
          onClick={() => handleAction('harvest', 1)}
          className="w-full justify-start bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <Scissors className="h-4 w-4 mr-2" />
          <span className="flex-1">Harvest Crop</span>
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
            Ready!
          </Badge>
        </Button>

        {!canHarvest && crop.status !== 'harvested' && (
          <p className="text-xs text-gray-600 px-3">
            Crop needs {Math.round(80 - crop.growthProgress)}% more growth
          </p>
        )}

        {crop.status === 'harvested' && (
          <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
            Crop harvested! Start a new game to plant again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
