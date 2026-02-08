export interface GameCrop {
  id: string;
  gameId: string;
  cropType: string;
  status: 'seed' | 'sprouted' | 'growing' | 'mature' | 'harvested' | 'failed';
  health: number; // 0-100
  waterLevel: number; // 0-100
  growthProgress: number; // 0-100 (days grown / total growth days)
  plantedDate: string;
  expectedHarvestDate: string;
  nasaWeatherScore: number; // 0-100 based on weather conditions
  ndviScore: number; // 0-1 from satellite data
  estimatedYield: number;
  diseaseRisk: number; // 0-100
}

export interface GameResources {
  gameId: string;
  water: number;
  fertilizer: number;
  seeds: number;
  gold: number; // earned from harvests
}

export interface GameWeatherEffect {
  cropId: string;
  weatherType: 'sunny' | 'rainy' | 'drought' | 'frost' | 'heatwave';
  severity: number; // 0-100
  impact: number; // -100 to +100 on crop health
  durationDays: number;
}

export interface GameAchievement {
  id: string;
  userId: string;
  achievementType: string;
  title: string;
  description: string;
  points: number;
  unlockedDate: string;
  icon: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
  harvestsCompleted: number;
  maxYield: number;
  rank: number;
}

export interface GameStatistics {
  totalGamesPlayed: number;
  totalHarvests: number;
  totalCropsGrown: number;
  averageYield: number;
  highestYield: number;
  successRate: number;
  totalPointsEarned: number;
  achievementsUnlocked: number;
}
