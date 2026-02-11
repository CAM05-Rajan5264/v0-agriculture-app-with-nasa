'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplets, Leaf, Heart, AlertTriangle } from 'lucide-react';
import { GameCrop } from '@/lib/game-types';
import { CROP_DATA, CropType } from '@/lib/game-mechanics';

interface FarmDisplayProps {
  crops: GameCrop[];
  gameStatus: string;
}

export function FarmDisplay({ crops, gameStatus }: FarmDisplayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'seed':
      case 'sprouted':
        return 'bg-yellow-100 text-yellow-800';
      case 'growing':
        return 'bg-green-100 text-green-800';
      case 'mature':
        return 'bg-blue-100 text-blue-800';
      case 'harvested':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 50) return 'text-yellow-600';
    if (health >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  if (crops.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          <Leaf className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No crops planted yet. Start your first game!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {crops.map((crop) => {
        const cropData = CROP_DATA[crop.crop_type as CropType];
        const health = crop.health_score || 50;
        const water = crop.water_level || 50;
        const nutrient = crop.nutrient_level || 30;
        const diseaseRisk = (crop.disease_risk || 0) * 100;
        const diseaseAlert = diseaseRisk > 40;
        const growthMap: Record<string, number> = {
          seedling: 10,
          sprouting: 25,
          vegetative: 50,
          flowering: 75,
          mature: 95,
        };
        const growthProgress = growthMap[crop.growth_stage] || 30;

        return (
          <Card key={crop.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{cropData?.icon || '🌱'}</span>
                  <div>
                    <CardTitle className="text-lg">{cropData?.name || crop.crop_type}</CardTitle>
                    <Badge className={`mt-1 ${getStatusColor(crop.growth_stage)}`}>
                      {(crop.growth_stage || 'seedling').charAt(0).toUpperCase() + (crop.growth_stage || 'seedling').slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Growth Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Growth Progress</span>
                  <span className="text-xs text-gray-500">{Math.round(growthProgress)}%</span>
                </div>
                <Progress value={growthProgress} className="h-2" />
              </div>

              {/* Health */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className={`h-4 w-4 ${getHealthColor(health)}`} />
                    <span className="font-medium">Health</span>
                  </div>
                  <span className={`text-xs font-semibold ${getHealthColor(health)}`}>
                    {Math.round(health)}%
                  </span>
                </div>
                <Progress value={health} className="h-2" />
              </div>

              {/* Water Level */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Water</span>
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(water)}%</span>
                </div>
                <Progress value={water} className="h-2" />
              </div>

              {/* Nutrients */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Nutrients</span>
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(nutrient)}%</span>
                </div>
                <Progress value={nutrient} className="h-2" />
              </div>

              {/* Disease Risk */}
              {diseaseAlert && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-700">
                    Disease risk: {Math.round(diseaseRisk)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
