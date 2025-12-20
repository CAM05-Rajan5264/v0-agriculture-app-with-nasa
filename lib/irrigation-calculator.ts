import type { IrrigationStatus, IrrigationEvent, NextIrrigationPrediction, CropHealthAnalysis } from "./types"

// Crop water requirements in mm/day based on crop type and growth stage
const CROP_WATER_REQUIREMENTS: Record<string, number> = {
  wheat: 4.5,
  corn: 6.0,
  rice: 8.0,
  soybean: 5.0,
  cotton: 5.5,
  tomato: 4.0,
  potato: 5.0,
  sugarcane: 7.0,
  default: 5.0,
}

// Soil moisture thresholds
const SOIL_MOISTURE_THRESHOLDS = {
  critical: 20, // Below this, immediate irrigation needed
  low: 35, // Irrigation recommended soon
  optimal: 50, // Ideal moisture level
  high: 75, // No irrigation needed
}

export function calculateNextIrrigation(
  irrigation: IrrigationStatus,
  cropHealth: CropHealthAnalysis | null,
  lastIrrigationEvent: IrrigationEvent | null,
  cropName: string,
): NextIrrigationPrediction {
  const cropWaterNeed = CROP_WATER_REQUIREMENTS[cropName.toLowerCase()] || CROP_WATER_REQUIREMENTS.default

  // Calculate daily soil moisture depletion rate
  const dailyDepletion = irrigation.evapotranspiration + cropWaterNeed * 0.5

  // Adjust for recent rainfall
  const effectiveDepletion = Math.max(0, dailyDepletion - irrigation.precipitationForecast / 7)

  // Calculate current effective soil moisture
  const currentMoisture = irrigation.soilMoisture

  // Adjust based on crop health - stressed crops may need more water
  let healthMultiplier = 1.0
  if (cropHealth) {
    switch (cropHealth.healthStatus) {
      case "critical":
        healthMultiplier = 1.5
        break
      case "poor":
        healthMultiplier = 1.3
        break
      case "moderate":
        healthMultiplier = 1.1
        break
      default:
        healthMultiplier = 1.0
    }
  }

  const adjustedDepletion = effectiveDepletion * healthMultiplier

  // Calculate days until soil moisture reaches low threshold
  const moistureToDeplete = currentMoisture - SOIL_MOISTURE_THRESHOLDS.low
  const daysUntilIrrigation = Math.max(0, Math.floor(moistureToDeplete / (adjustedDepletion / 10)))

  // Determine confidence based on data quality
  let confidence: "high" | "medium" | "low" = "medium"
  if (lastIrrigationEvent && cropHealth) {
    confidence = "high"
  } else if (!lastIrrigationEvent && !cropHealth) {
    confidence = "low"
  }

  // Calculate next irrigation date
  const nextIrrigationDate = new Date()
  nextIrrigationDate.setDate(nextIrrigationDate.getDate() + daysUntilIrrigation)

  // Determine weather impact description
  let weatherImpact = "Normal conditions"
  if (irrigation.precipitationForecast > 10) {
    weatherImpact = "Rain expected - irrigation may be delayed"
  } else if (irrigation.evapotranspiration > 6) {
    weatherImpact = "High evaporation - may need earlier irrigation"
  } else if (irrigation.evapotranspiration < 3) {
    weatherImpact = "Low evaporation - can extend irrigation interval"
  }

  // Generate recommendation
  let recommendation = ""
  if (daysUntilIrrigation === 0) {
    recommendation = "Irrigate today! Soil moisture is below optimal levels."
  } else if (daysUntilIrrigation <= 2) {
    recommendation = `Plan irrigation within ${daysUntilIrrigation} day${daysUntilIrrigation > 1 ? "s" : ""}. Prepare equipment and water resources.`
  } else if (daysUntilIrrigation <= 5) {
    recommendation = `Irrigation recommended in ${daysUntilIrrigation} days. Monitor soil moisture levels.`
  } else {
    recommendation = `Soil moisture is adequate. Next irrigation estimated in ${daysUntilIrrigation} days.`
  }

  // Adjust recommendation based on crop health
  if (cropHealth?.healthStatus === "critical" || cropHealth?.healthStatus === "poor") {
    recommendation += " Consider additional irrigation due to crop stress indicators."
  }

  return {
    nextIrrigationDate,
    daysUntilIrrigation,
    confidence,
    factors: {
      soilMoistureDepletion: adjustedDepletion,
      weatherImpact,
      cropWaterNeed: cropWaterNeed * healthMultiplier,
    },
    recommendation,
  }
}

export function getIrrigationUrgency(daysUntil: number): {
  level: "urgent" | "soon" | "scheduled" | "adequate"
  color: string
} {
  if (daysUntil === 0) {
    return { level: "urgent", color: "text-red-600" }
  } else if (daysUntil <= 2) {
    return { level: "soon", color: "text-amber-600" }
  } else if (daysUntil <= 5) {
    return { level: "scheduled", color: "text-blue-600" }
  }
  return { level: "adequate", color: "text-green-600" }
}
