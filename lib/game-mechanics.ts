import { GameCrop, GameWeatherEffect } from './game-types';

// Crop growth data
export const CROP_DATA = {
  tomato: {
    name: 'Tomato',
    growthDays: 60,
    baseYield: 8,
    waterNeed: 'high',
    optimalTemp: { min: 15, max: 28 },
    icon: '🍅',
  },
  wheat: {
    name: 'Wheat',
    growthDays: 120,
    baseYield: 5,
    waterNeed: 'medium',
    optimalTemp: { min: 10, max: 25 },
    icon: '🌾',
  },
  corn: {
    name: 'Corn',
    growthDays: 100,
    baseYield: 6,
    waterNeed: 'high',
    optimalTemp: { min: 15, max: 30 },
    icon: '🌽',
  },
  potato: {
    name: 'Potato',
    growthDays: 90,
    baseYield: 7,
    waterNeed: 'medium',
    optimalTemp: { min: 10, max: 24 },
    icon: '🥔',
  },
  rice: {
    name: 'Rice',
    growthDays: 130,
    baseYield: 5,
    waterNeed: 'very_high',
    optimalTemp: { min: 15, max: 32 },
    icon: '🍚',
  },
};

export type CropType = keyof typeof CROP_DATA;

// Calculate growth progression based on NASA weather data
export function calculateGrowthModifier(
  temperature: number,
  humidity: number,
  rainfall: number,
  cropType: CropType
): number {
  const crop = CROP_DATA[cropType];
  let modifier = 1.0;

  // Temperature modifier
  if (temperature < crop.optimalTemp.min) {
    modifier *= Math.max(0.5, 1 - (crop.optimalTemp.min - temperature) * 0.05);
  } else if (temperature > crop.optimalTemp.max) {
    modifier *= Math.max(0.5, 1 - (temperature - crop.optimalTemp.max) * 0.05);
  } else {
    modifier *= 1.1; // Bonus for optimal temperature
  }

  // Water modifier based on crop needs
  const rainfallNeeded = crop.waterNeed === 'high' ? 30 : crop.waterNeed === 'medium' ? 20 : 40;
  const waterModifier = Math.min(1.2, Math.max(0.3, rainfall / rainfallNeeded));
  modifier *= waterModifier;

  // Humidity modifier (helps prevent some diseases)
  if (humidity > 30 && humidity < 80) {
    modifier *= 1.05;
  } else if (humidity > 85) {
    modifier *= 0.9; // Too humid increases disease risk
  }

  return Math.max(0.3, modifier);
}

// Calculate disease risk based on weather
export function calculateDiseaseRisk(
  temperature: number,
  humidity: number,
  rainfall: number,
  daysSinceLastTreatment: number
): number {
  let risk = 20; // Base risk

  // Humidity is the biggest factor
  if (humidity > 80) {
    risk += (humidity - 80) * 2;
  }
  if (humidity < 30) {
    risk -= 10; // Lower risk in dry conditions
  }

  // Temperature affects fungal diseases
  if (temperature > 20 && temperature < 28) {
    risk += 15; // Optimal conditions for many diseases
  }

  // Rainfall increases disease pressure
  if (rainfall > 20) {
    risk += rainfall * 0.5;
  }

  // Treatment decreases risk
  risk -= Math.min(30, daysSinceLastTreatment * -0.5);

  return Math.min(100, Math.max(0, risk));
}

// Calculate NDVI impact on crop health
export function applyNdviImpact(health: number, ndvi: number): number {
  // NDVI range: 0 = dead, 0.5 = moderate, 1 = very healthy
  if (ndvi < 0.2) {
    return Math.max(0, health - 15);
  } else if (ndvi < 0.4) {
    return Math.max(0, health - 5);
  } else if (ndvi < 0.6) {
    return health; // No change
  } else {
    return Math.min(100, health + 10);
  }
}

// Calculate yield based on health and weather
export function calculateYield(
  cropType: CropType,
  finalHealth: number,
  ndviScore: number,
  harvestDays: number
): number {
  const baseYield = CROP_DATA[cropType].baseYield;
  const expectedDays = CROP_DATA[cropType].growthDays;

  // Adjust for maturity
  let yieldMultiplier = Math.min(1.2, harvestDays / expectedDays);

  // Adjust for health (poor health = poor yield)
  if (finalHealth < 30) {
    yieldMultiplier *= 0.3;
  } else if (finalHealth < 60) {
    yieldMultiplier *= 0.6;
  } else if (finalHealth < 80) {
    yieldMultiplier *= 0.85;
  } else {
    yieldMultiplier *= 1.0;
  }

  // Bonus for excellent NDVI
  if (ndviScore > 0.7) {
    yieldMultiplier *= 1.15;
  }

  return Math.round(baseYield * yieldMultiplier * 100) / 100;
}

// Calculate points earned from harvest
export function calculateHarvestPoints(
  yield_: number,
  cropType: CropType,
  finalHealth: number,
  daysGrown: number
): number {
  const basePoints = yield_ * 50;
  const healthBonus = finalHealth * 2;
  const timeBonus = Math.max(0, daysGrown === CROP_DATA[cropType].growthDays ? 100 : 0);

  return Math.round(basePoints + healthBonus + timeBonus);
}

// Get water requirement per day
export function getDailyWaterRequirement(cropType: CropType): number {
  const needs = {
    high: 3,
    medium: 2,
    very_high: 4,
  };
  return needs[CROP_DATA[cropType].waterNeed] || 2;
}

// Get initial resource costs
export function getInitialResourceCosts(cropType: CropType) {
  return {
    seeds: 10,
    water: 20,
    fertilizer: 5,
  };
}
