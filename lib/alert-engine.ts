import type { Farm, Crop, Alert } from "./types"
import { getWeatherData, calculateNDVI, analyzeCropHealth, getIrrigationStatus, getWeatherForecast } from "./nasa-api"
import { getNaturalEvents } from "./nasa-satellite-api"
import { CROP_GUIDES } from "./crop-guide"

export interface AlertTrigger {
  type: Alert["alert_type"]
  severity: Alert["severity"]
  title: string
  message: string
  farmId?: string
  cropId?: string
}

async function checkForecastDisasters(farm: Farm): Promise<AlertTrigger[]> {
  const alerts: AlertTrigger[] = []
  const forecast = await getWeatherForecast(farm.latitude, farm.longitude, 7)

  for (let i = 0; i < Math.min(forecast.length, 5); i++) {
    const day = forecast[i]
    const dayLabel = i === 0 ? "Tomorrow" : `in ${i + 1} days`

    // Frost forecast
    if (day.tempMin < 2) {
      alerts.push({
        type: "frost",
        severity: "critical",
        title: `Frost Forecasted ${dayLabel}`,
        message: `Temperature expected to drop to ${day.tempMin.toFixed(1)}°C at ${farm.name}. Prepare frost protection measures.`,
        farmId: farm.id,
      })
    }

    // Heavy rain forecast
    if (day.precipProbability > 70 && day.rainfall > 20) {
      alerts.push({
        type: "weather",
        severity: "warning",
        title: `Heavy Rain Expected ${dayLabel}`,
        message: `${day.precipProbability}% chance of ${day.rainfall.toFixed(1)}mm rainfall at ${farm.name}. Check drainage systems.`,
        farmId: farm.id,
      })
    }

    // Extreme heat forecast
    if (day.tempMax > 38) {
      alerts.push({
        type: "weather",
        severity: "warning",
        title: `Extreme Heat ${dayLabel}`,
        message: `Temperature expected to reach ${day.tempMax.toFixed(1)}°C at ${farm.name}. Plan for heat stress mitigation.`,
        farmId: farm.id,
      })
    }

    // Strong winds forecast
    if (day.windSpeed > 25) {
      alerts.push({
        type: "weather",
        severity: "warning",
        title: `Strong Winds Expected ${dayLabel}`,
        message: `Wind speeds up to ${day.windSpeed.toFixed(1)} m/s expected at ${farm.name}. Secure equipment and structures.`,
        farmId: farm.id,
      })
    }
  }

  return alerts
}

function checkCropActivityAlerts(crop: Crop & { farms: Farm }): AlertTrigger[] {
  const alerts: AlertTrigger[] = []
  const planted = new Date(crop.planting_date)
  const now = new Date()
  const daysSincePlanting = Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24))

  const guide = CROP_GUIDES.find(
    (g) => g.name.toLowerCase() === crop.name.toLowerCase() || crop.name.toLowerCase().includes(g.name.toLowerCase()),
  )

  if (guide) {
    // Determine current growth stage and next activity
    let totalDays = 0
    let currentStage = ""
    let nextStage = ""
    let daysToNextStage = 0

    for (let i = 0; i < guide.growthDuration.stages.length; i++) {
      totalDays += guide.growthDuration.stages[i].durationDays
      if (daysSincePlanting < totalDays) {
        currentStage = guide.growthDuration.stages[i].name
        daysToNextStage = totalDays - daysSincePlanting
        if (i + 1 < guide.growthDuration.stages.length) {
          nextStage = guide.growthDuration.stages[i + 1].name
        }
        break
      }
    }

    // Alert for upcoming stage transition
    if (nextStage && daysToNextStage <= 7 && daysToNextStage > 0) {
      alerts.push({
        type: "phenology",
        severity: "info",
        title: `Growth Stage Change Soon`,
        message: `${crop.name} at ${crop.farms.name} will enter ${nextStage} stage in ${daysToNextStage} days. Prepare necessary activities.`,
        farmId: crop.farm_id,
        cropId: crop.id,
      })
    }

    // Fertilization reminder based on stage
    if (currentStage.toLowerCase().includes("vegetative") && daysSincePlanting % 14 < 2) {
      alerts.push({
        type: "phenology",
        severity: "info",
        title: `Fertilization Reminder`,
        message: `Consider applying nitrogen fertilizer to ${crop.name} at ${crop.farms.name} during vegetative growth phase.`,
        farmId: crop.farm_id,
        cropId: crop.id,
      })
    }

    // Pest monitoring reminder
    if (daysSincePlanting > 21 && daysSincePlanting % 7 < 2) {
      alerts.push({
        type: "crop_health",
        severity: "info",
        title: `Pest Monitoring Due`,
        message: `Weekly pest and disease inspection recommended for ${crop.name} at ${crop.farms.name}.`,
        farmId: crop.farm_id,
        cropId: crop.id,
      })
    }
  }

  // Harvest approaching
  if (crop.expected_harvest_date) {
    const harvest = new Date(crop.expected_harvest_date)
    const daysToHarvest = Math.floor((harvest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysToHarvest > 0 && daysToHarvest <= 14) {
      alerts.push({
        type: "phenology",
        severity: daysToHarvest <= 3 ? "critical" : daysToHarvest <= 7 ? "warning" : "info",
        title: daysToHarvest <= 3 ? "Harvest Imminent" : "Harvest Approaching",
        message: `${crop.name} at ${crop.farms.name} is expected to be ready for harvest in ${daysToHarvest} days. ${daysToHarvest <= 7 ? "Prepare harvesting equipment and labor." : "Plan your harvest logistics."}`,
        farmId: crop.farm_id,
        cropId: crop.id,
      })
    }

    if (daysToHarvest < 0 && daysToHarvest > -14) {
      alerts.push({
        type: "phenology",
        severity: "critical",
        title: "Harvest Overdue",
        message: `${crop.name} at ${crop.farms.name} passed expected harvest date ${Math.abs(daysToHarvest)} days ago. Harvest immediately to prevent crop loss.`,
        farmId: crop.farm_id,
        cropId: crop.id,
      })
    }
  }

  return alerts
}

export async function checkForAlerts(
  farms: Farm[],
  crops: (Crop & { farms: Farm })[],
  userId: string,
): Promise<AlertTrigger[]> {
  const alerts: AlertTrigger[] = []

  for (const farm of farms) {
    const weather = await getWeatherData(farm.latitude, farm.longitude)

    // Current weather alerts
    if (weather.temperature < 2) {
      alerts.push({
        type: "frost",
        severity: "critical",
        title: "Frost Warning - Now",
        message: `Current temperature at ${farm.name} is ${weather.temperature.toFixed(1)}°C. Protect sensitive crops immediately.`,
        farmId: farm.id,
      })
    }

    if (weather.humidity < 30 && weather.precipitation < 0.5) {
      alerts.push({
        type: "drought",
        severity: "warning",
        title: "Drought Conditions",
        message: `Low humidity (${weather.humidity.toFixed(0)}%) and minimal precipitation at ${farm.name}. Consider increasing irrigation.`,
        farmId: farm.id,
      })
    }

    if (weather.temperature > 35) {
      alerts.push({
        type: "weather",
        severity: "warning",
        title: "Heat Stress Warning",
        message: `High temperature (${weather.temperature.toFixed(1)}°C) at ${farm.name}. Crops may experience heat stress.`,
        farmId: farm.id,
      })
    }

    if (weather.precipitation > 25) {
      alerts.push({
        type: "weather",
        severity: "info",
        title: "Heavy Rainfall",
        message: `Significant rainfall (${weather.precipitation.toFixed(1)}mm) recorded at ${farm.name}. Check for waterlogging.`,
        farmId: farm.id,
      })
    }

    const forecastAlerts = await checkForecastDisasters(farm)
    alerts.push(...forecastAlerts)
  }

  for (const crop of crops) {
    const ndvi = calculateNDVI(crop.farms.latitude, crop.farms.longitude, crop.planting_date)
    const health = analyzeCropHealth(ndvi)

    // Crop health alerts
    if (health.healthStatus === "critical") {
      alerts.push({
        type: "crop_health",
        severity: "critical",
        title: "Critical Crop Health",
        message: `${crop.name} at ${crop.farms.name} shows critical health status (NDVI: ${ndvi.toFixed(2)}). ${health.recommendations[0] || "Immediate inspection required."}`,
        farmId: crop.farm_id,
        cropId: crop.id,
      })
    } else if (health.healthStatus === "poor") {
      alerts.push({
        type: "crop_health",
        severity: "warning",
        title: "Poor Crop Health",
        message: `${crop.name} at ${crop.farms.name} shows declining health (NDVI: ${ndvi.toFixed(2)}). ${health.recommendations[0] || "Review growing conditions."}`,
        farmId: crop.farm_id,
        cropId: crop.id,
      })
    }

    // Irrigation alerts
    const irrigation = await getIrrigationStatus(crop.farms.latitude, crop.farms.longitude, crop.name)

    if (irrigation.irrigationNeeded && irrigation.soilMoisture < 35) {
      alerts.push({
        type: "irrigation",
        severity: irrigation.soilMoisture < 25 ? "critical" : "warning",
        title: irrigation.soilMoisture < 25 ? "Urgent Irrigation Needed" : "Irrigation Required",
        message: `${crop.name} at ${crop.farms.name} needs water. Soil moisture is ${irrigation.soilMoisture.toFixed(0)}%. Recommend ${irrigation.recommendedAmount.toFixed(1)}mm.`,
        farmId: crop.farm_id,
        cropId: crop.id,
      })
    }

    const activityAlerts = checkCropActivityAlerts(crop)
    alerts.push(...activityAlerts)
  }

  // Check for natural disaster events nearby
  const naturalEvents = await getNaturalEvents(farms, 500)
  for (const event of naturalEvents) {
    // Only alert for high severity events
    if (event.severity === "critical" || event.severity === "high") {
      alerts.push({
        type: "weather",
        severity: event.severity === "critical" ? "critical" : "warning",
        title: `${event.category === "wildfires" ? "Wildfire" : event.category === "floods" ? "Flood" : event.category === "storms" ? "Storm" : "Natural Event"} Alert`,
        message: `${event.title} detected ${event.distanceKm}km from your farm. ${event.description}. Monitor conditions and take precautions if needed.`,
        farmId: farms[0]?.id,
      })
    }
  }

  return alerts
}

export function getAlertIcon(type: Alert["alert_type"]) {
  switch (type) {
    case "weather":
      return "Cloud"
    case "crop_health":
      return "Activity"
    case "irrigation":
      return "Droplets"
    case "phenology":
      return "TrendingUp"
    case "frost":
      return "Snowflake"
    case "drought":
      return "Sun"
    default:
      return "Bell"
  }
}
