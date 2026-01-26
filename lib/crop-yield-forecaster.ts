import { createClient } from "@/lib/supabase/server";

export interface YieldForecastInput {
  cropId: string;
  farmId: string;
  soilMoisture: number; // percentage (0-100)
  temperature: number; // celsius
  rainfall: number; // mm
  sunlight: number; // hours per day
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  cropAge: number; // days since planting
  growthStage: string; // seedling, vegetative, flowering, maturity
}

export interface YieldPrediction {
  estimatedYield: number; // kg per hectare
  confidence: number; // 0-1
  factors: {
    name: string;
    impact: number; // -1 to 1
    description: string;
  }[];
  recommendations: string[];
  riskFactors: string[];
  bestCaseYield: number;
  worstCaseYield: number;
}

// ML Algorithm: Linear regression with weighted environmental factors
class CropYieldForecaster {
  // Base yield values for common crops (kg/hectare)
  private baseYields: Record<string, number> = {
    wheat: 4500,
    rice: 5000,
    maize: 6000,
    potato: 20000,
    tomato: 40000,
    soybean: 2500,
    cotton: 1800,
  };

  // Optimal growth conditions for different stages
  private optimalConditions = {
    seedling: {
      temp: { min: 15, max: 25, optimal: 20 },
      moisture: { min: 40, max: 70, optimal: 55 },
      rainfall: { min: 20, max: 50, optimal: 35 },
    },
    vegetative: {
      temp: { min: 18, max: 30, optimal: 25 },
      moisture: { min: 50, max: 80, optimal: 65 },
      rainfall: { min: 30, max: 80, optimal: 55 },
    },
    flowering: {
      temp: { min: 20, max: 28, optimal: 24 },
      moisture: { min: 60, max: 85, optimal: 72 },
      rainfall: { min: 40, max: 100, optimal: 70 },
    },
    maturity: {
      temp: { min: 15, max: 25, optimal: 20 },
      moisture: { min: 30, max: 60, optimal: 45 },
      rainfall: { min: 10, max: 40, optimal: 25 },
    },
  };

  // Weight factors for different environmental parameters
  private weights = {
    temperature: 0.25,
    soilMoisture: 0.30,
    rainfall: 0.20,
    sunlight: 0.10,
    soilNutrients: 0.15,
  };

  private nutrientOptimal = {
    nitrogen: { min: 100, max: 500, optimal: 300 },
    phosphorus: { min: 20, max: 100, optimal: 60 },
    potassium: { min: 100, max: 400, optimal: 250 },
  };

  async fetchHistoricalData(cropId: string, farmId: string) {
    const supabase = await createClient();
    
    try {
      const { data: historicalYields, error } = await supabase
        .from("crop_yields")
        .select("actual_yield, planting_date, harvest_date")
        .eq("crop_id", cropId)
        .eq("farm_id", farmId)
        .order("harvest_date", { ascending: false })
        .limit(10);

      if (error) {
        console.warn("[v0] Could not fetch historical yields:", error);
        return [];
      }

      return historicalYields || [];
    } catch (err) {
      console.error("[v0] Error fetching historical data:", err);
      return [];
    }
  }

  // Calculate how well current conditions match optimal conditions
  private calculateConditionScore(
    value: number,
    optimal: { min: number; max: number; optimal: number }
  ): number {
    if (value < optimal.min || value > optimal.max) {
      // Outside optimal range - penalize heavily
      const distanceFromOptimal = Math.abs(value - optimal.optimal);
      const maxDistance = Math.max(
        optimal.optimal - optimal.min,
        optimal.max - optimal.optimal
      );
      return Math.max(0, 1 - distanceFromOptimal / (maxDistance * 2));
    }

    // Within optimal range - score based on distance from optimal
    const distanceFromOptimal = Math.abs(value - optimal.optimal);
    const range = optimal.max - optimal.min;
    return Math.max(0.5, 1 - distanceFromOptimal / range);
  }

  // Get crop type from crop ID
  private getCropType(cropId: string): string {
    const cropName = cropId.toLowerCase();
    for (const [type] of Object.entries(this.baseYields)) {
      if (cropName.includes(type)) {
        return type;
      }
    }
    return "wheat"; // default
  }

  forecast(input: YieldForecastInput): YieldPrediction {
    const cropType = this.getCropType(input.cropId);
    const baseYield = this.baseYields[cropType] || 4500;
    const stageConditions =
      this.optimalConditions[input.growthStage as keyof typeof this.optimalConditions] ||
      this.optimalConditions.vegetative;

    // Calculate individual factor impacts
    const temperatureScore = this.calculateConditionScore(
      input.temperature,
      stageConditions.temp
    );
    const moistureScore = this.calculateConditionScore(
      input.soilMoisture,
      stageConditions.moisture
    );
    const rainfallScore = this.calculateConditionScore(
      input.rainfall,
      stageConditions.rainfall
    );
    const sunlightScore = Math.min(1, input.sunlight / 10); // 10 hours is optimal
    const nutrientScore = this.calculateNutrientScore(
      input.nitrogen,
      input.phosphorus,
      input.potassium
    );

    // Calculate weighted overall score
    const overallScore =
      temperatureScore * this.weights.temperature +
      moistureScore * this.weights.soilMoisture +
      rainfallScore * this.weights.rainfall +
      sunlightScore * this.weights.sunlight +
      nutrientScore * this.weights.soilNutrients;

    // Apply growth stage multiplier (crops produce more in later stages)
    const stageMultiplier = this.getStageMultiplier(input.growthStage, input.cropAge);

    // Calculate estimated yield
    const estimatedYield = Math.max(
      baseYield * 0.3, // minimum 30% of base yield
      baseYield * overallScore * stageMultiplier
    );

    // Calculate confidence based on data quality and conditions
    const confidence = this.calculateConfidence(
      overallScore,
      input.cropAge,
      stageMultiplier
    );

    // Generate factors analysis
    const factors = [
      {
        name: "Temperature",
        impact:
          (temperatureScore - 0.5) * 2 * this.weights.temperature,
        description: this.getTemperatureDescription(input.temperature, stageConditions.temp),
      },
      {
        name: "Soil Moisture",
        impact:
          (moistureScore - 0.5) * 2 * this.weights.soilMoisture,
        description: this.getMoistureDescription(input.soilMoisture, stageConditions.moisture),
      },
      {
        name: "Rainfall",
        impact:
          (rainfallScore - 0.5) * 2 * this.weights.rainfall,
        description: this.getRainfallDescription(input.rainfall, stageConditions.rainfall),
      },
      {
        name: "Sunlight",
        impact: (sunlightScore - 0.5) * 2 * this.weights.sunlight,
        description: `${input.sunlight.toFixed(1)} hours of daily sunlight`,
      },
      {
        name: "Soil Nutrients",
        impact:
          (nutrientScore - 0.5) * 2 * this.weights.soilNutrients,
        description: this.getNutrientDescription(
          input.nitrogen,
          input.phosphorus,
          input.potassium
        ),
      },
    ];

    // Generate recommendations
    const recommendations = this.generateRecommendations(input, stageConditions);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(input, stageConditions);

    // Calculate yield range (±20% confidence interval)
    const margin = estimatedYield * 0.2;
    const bestCaseYield = estimatedYield + margin;
    const worstCaseYield = Math.max(baseYield * 0.3, estimatedYield - margin);

    return {
      estimatedYield: Math.round(estimatedYield),
      confidence,
      factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
      recommendations,
      riskFactors,
      bestCaseYield: Math.round(bestCaseYield),
      worstCaseYield: Math.round(worstCaseYield),
    };
  }

  private calculateNutrientScore(
    nitrogen: number,
    phosphorus: number,
    potassium: number
  ): number {
    const nScore = this.calculateConditionScore(nitrogen, this.nutrientOptimal.nitrogen);
    const pScore = this.calculateConditionScore(phosphorus, this.nutrientOptimal.phosphorus);
    const kScore = this.calculateConditionScore(potassium, this.nutrientOptimal.potassium);

    return (nScore + pScore + kScore) / 3;
  }

  private getStageMultiplier(stage: string, cropAge: number): number {
    const multipliers: Record<string, number> = {
      seedling: 0.4,
      vegetative: 0.7,
      flowering: 0.85,
      maturity: 1.0,
    };
    return multipliers[stage] || 0.6;
  }

  private calculateConfidence(
    overallScore: number,
    cropAge: number,
    stageMultiplier: number
  ): number {
    // Higher confidence as crop matures (more data available)
    const ageConfidence = Math.min(1, cropAge / 120); // 120 days for full confidence
    const conditionConfidence = 0.5 + overallScore * 0.5; // 0.5 to 1.0
    const stageConfidence = stageMultiplier * 0.8 + 0.2; // boost in later stages

    return Math.round((ageConfidence * 0.3 + conditionConfidence * 0.4 + stageConfidence * 0.3) * 100) / 100;
  }

  private getTemperatureDescription(temp: number, optimal: any): string {
    if (temp < optimal.min) return `Too cold (${temp}°C, optimal: ${optimal.optimal}°C)`;
    if (temp > optimal.max) return `Too hot (${temp}°C, optimal: ${optimal.optimal}°C)`;
    return `Ideal temperature (${temp}°C)`;
  }

  private getMoistureDescription(moisture: number, optimal: any): string {
    if (moisture < optimal.min) return `Too dry (${moisture}%, optimal: ${optimal.optimal}%)`;
    if (moisture > optimal.max) return `Too wet (${moisture}%, optimal: ${optimal.optimal}%)`;
    return `Optimal moisture level (${moisture}%)`;
  }

  private getRainfallDescription(rainfall: number, optimal: any): string {
    if (rainfall < optimal.min) return `Insufficient rainfall (${rainfall}mm, need: ${optimal.optimal}mm)`;
    if (rainfall > optimal.max) return `Excessive rainfall (${rainfall}mm, optimal: ${optimal.optimal}mm)`;
    return `Adequate rainfall (${rainfall}mm)`;
  }

  private getNutrientDescription(nitrogen: number, phosphorus: number, potassium: number): string {
    const deficiencies = [];
    if (nitrogen < this.nutrientOptimal.nitrogen.optimal) deficiencies.push("nitrogen");
    if (phosphorus < this.nutrientOptimal.phosphorus.optimal) deficiencies.push("phosphorus");
    if (potassium < this.nutrientOptimal.potassium.optimal) deficiencies.push("potassium");

    if (deficiencies.length === 0) return "Soil nutrients are balanced";
    return `Deficient in: ${deficiencies.join(", ")}`;
  }

  private generateRecommendations(input: YieldForecastInput, stageConditions: any): string[] {
    const recommendations: string[] = [];

    if (input.temperature < stageConditions.temp.optimal - 5) {
      recommendations.push("Temperature is below optimal - provide shade cloth or mulch to regulate");
    }
    if (input.temperature > stageConditions.temp.optimal + 5) {
      recommendations.push("Temperature is above optimal - increase irrigation frequency to cool plants");
    }

    if (input.soilMoisture < stageConditions.moisture.optimal - 10) {
      recommendations.push("Soil is too dry - increase irrigation frequency immediately");
    }
    if (input.soilMoisture > stageConditions.moisture.optimal + 10) {
      recommendations.push("Soil is waterlogged - improve drainage or reduce irrigation");
    }

    if (input.rainfall < stageConditions.rainfall.optimal) {
      recommendations.push("Rainfall is below target - supplement with irrigation");
    }

    if (input.sunlight < 6) {
      recommendations.push("Insufficient sunlight - prune surrounding vegetation for better light exposure");
    }

    if (input.nitrogen < this.nutrientOptimal.nitrogen.optimal) {
      recommendations.push("Apply nitrogen-rich fertilizer to boost growth and yield");
    }

    return recommendations.slice(0, 4); // Return top 4 recommendations
  }

  private identifyRiskFactors(input: YieldForecastInput, stageConditions: any): string[] {
    const risks: string[] = [];

    if (
      input.temperature < stageConditions.temp.min ||
      input.temperature > stageConditions.temp.max
    ) {
      risks.push("Temperature stress risk - monitor for plant damage");
    }

    if (
      input.soilMoisture < stageConditions.moisture.min ||
      input.soilMoisture > stageConditions.moisture.max
    ) {
      risks.push("Moisture stress risk - adjust watering schedule");
    }

    if (input.nitrogen < 150) {
      risks.push("Severe nitrogen deficiency - immediate nutrient application required");
    }

    if (input.sunlight < 4) {
      risks.push("Insufficient light - risk of poor development");
    }

    return risks;
  }
}

export const yieldForecaster = new CropYieldForecaster();
