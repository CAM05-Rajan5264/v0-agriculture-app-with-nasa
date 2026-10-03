export interface Farm {
  id: string
  user_id: string
  name: string
  location_name: string
  latitude: number
  longitude: number
  area_hectares: number | null
  created_at: string
  updated_at: string
}

export interface Crop {
  id: string
  farm_id: string
  user_id: string
  name: string
  variety: string | null
  planting_date: string
  expected_harvest_date: string | null
  status: "active" | "harvested" | "failed"
  created_at: string
  updated_at: string
}

export interface CropHealthRecord {
  id: string
  crop_id: string
  user_id: string
  ndvi_value: number | null
  health_status: "excellent" | "good" | "moderate" | "poor" | "critical" | null
  notes: string | null
  recorded_at: string
}

export interface Alert {
  id: string
  user_id: string
  farm_id: string | null
  crop_id: string | null
  alert_type: "weather" | "crop_health" | "irrigation" | "phenology" | "frost" | "drought"
  severity: "info" | "warning" | "critical"
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface NASAWeatherData {
  temperature: number | null
  humidity: number | null
  precipitation: number | null
  windSpeed: number | null
  solarRadiation: number | null
  evapotranspiration: number | null
}

export interface NASAPowerResponse {
  parameters: {
    [key: string]: {
      [date: string]: number
    }
  }
}

export interface CropHealthAnalysis {
  ndvi: number | null
  healthStatus: "excellent" | "good" | "moderate" | "poor" | "critical"
  recommendations: string[]
}

export interface IrrigationStatus {
  soilMoisture: number
  evapotranspiration: number
  precipitationForecast: number
  irrigationNeeded: boolean
  recommendedAmount: number
}

export interface PhenologyData {
  currentStage: string
  daysToNextStage: number
  gdd: number // Growing Degree Days
  optimalActions: string[]
}

export interface IrrigationEvent {
  id: string
  crop_id: string
  user_id: string
  irrigation_amount_mm: number
  irrigation_method: "drip" | "sprinkler" | "flood" | "manual" | "other" | null
  soil_moisture_before: number | null
  soil_moisture_after: number | null
  notes: string | null
  irrigated_at: string
  created_at: string
}

export interface NextIrrigationPrediction {
  nextIrrigationDate: Date
  daysUntilIrrigation: number
  confidence: "high" | "medium" | "low"
  factors: {
    soilMoistureDepletion: number
    weatherImpact: string
    cropWaterNeed: number
  }
  recommendation: string
}

export interface SatelliteNDVI {
  date: string
  ndvi: number
  quality: "excellent" | "good" | "fair" | "poor"
  cloudCover: number
  source: "MODIS" | "Landsat" | "Sentinel"
}

export interface SoilMoistureData {
  date: string
  surfaceSoilMoisture: number
  rootZoneSoilMoisture: number
  quality: "high" | "medium" | "low"
}

export interface NaturalEvent {
  id: string
  title: string
  description: string
  category: "wildfires" | "floods" | "storms" | "drought" | "earthquakes" | "volcanoes" | "other"
  date: string
  latitude: number
  longitude: number
  distanceKm: number
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "closed"
  link?: string
}

export interface SatelliteImageLayer {
  id: string
  name: string
  description: string
  date: string
  layer: string
  resolution: string
  tileUrl: string
}

export interface FarmingActivity {
  id: string
  user_id: string
  crop_id: string
  farm_id: string
  activity_type: "pesticide" | "fertilizer" | "harvest" | "maintenance"
  title: string
  description: string | null
  activity_date: string
  notes: string | null

  // Pesticide specific
  product_name: string | null
  quantity_applied: number | null
  unit_of_measurement: string | null
  disease_treated: string | null
  effectiveness_rating: number | null

  // Fertilizer specific
  fertilizer_type: string | null
  nitrogen_amount: number | null
  phosphorus_amount: number | null
  potassium_amount: number | null

  // Harvest specific
  quantity_harvested: number | null
  harvest_unit: string | null
  quality_grade: string | null
  market_price_per_unit: number | null

  // Maintenance specific
  equipment_name: string | null
  maintenance_type: string | null
  cost: number | null
  service_provider: string | null
  next_maintenance_date: string | null

  created_at: string
  updated_at: string
}

export interface DiseaseDetection {
  id: string
  user_id: string
  crop_id: string | null
  farm_id: string | null
  image_url: string
  analysis_date: string
  detected_disease: string | null
  confidence_score: number | null
  severity: "mild" | "moderate" | "severe" | "critical" | null
  symptoms: string[] | null
  recommended_treatment: string | null
  treatment_urgency: "low" | "medium" | "high" | "critical" | null
  raw_analysis: string | null
  created_at: string
}
