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
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  solarRadiation: number
  evapotranspiration: number
}

export interface NASAPowerResponse {
  parameters: {
    [key: string]: {
      [date: string]: number
    }
  }
}

export interface CropHealthAnalysis {
  ndvi: number
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

export interface FarmRecord {
  id: string
  user_id: string
  farm_id: string
  crop_id: string | null
  record_type: "irrigation" | "weeding" | "pesticide" | "fertilizer" | "harvest" | "maintenance" | "cost" | "inspection" | "other"
  title: string
  description: string | null
  recorded_date: string
  created_at: string
  updated_at: string
}

export interface IrrigationRecord extends FarmRecord {
  irrigation_records?: {
    water_amount_mm: number
    irrigation_method: "drip" | "sprinkler" | "flood" | "manual" | "other"
    soil_moisture_before: number | null
    soil_moisture_after: number | null
    duration_minutes: number | null
    notes: string | null
  }
}

export interface PesticideRecord extends FarmRecord {
  pesticide_records?: {
    product_name: string
    chemical_type: "insecticide" | "fungicide" | "herbicide" | "nematicide" | "other"
    quantity_applied: number
    unit: "L" | "kg" | "mL" | "g"
    target_issue: string | null
    safety_precautions: string | null
    notes: string | null
  }
}

export interface FertilizerRecord extends FarmRecord {
  fertilizer_records?: {
    product_name: string
    fertilizer_type: "organic" | "synthetic" | "foliar" | "other"
    quantity_applied: number
    unit: "kg" | "L" | "g" | "mL"
    npk_ratio: string | null
    application_method: "broadcast" | "banding" | "foliar" | "drip" | "other"
    notes: string | null
  }
}

export interface HarvestRecord extends FarmRecord {
  harvest_records?: {
    quantity_harvested: number
    unit: "kg" | "tonnes" | "bags" | "other"
    quality_grade: "premium" | "grade_a" | "grade_b" | "grade_c" | "poor"
    harvest_date: string
    yield_per_hectare: number | null
    market_price_per_unit: number | null
    total_revenue: number | null
    storage_location: string | null
    notes: string | null
  }
}

export interface CostRecord extends FarmRecord {
  cost_records?: {
    expense_type: "seeds" | "fertilizer" | "pesticide" | "labor" | "fuel" | "equipment" | "maintenance" | "other"
    category: string
    amount: number
    currency: string
    description: string | null
    date_incurred: string
  }
}

export interface MaintenanceRecord extends FarmRecord {
  maintenance_records?: {
    equipment_name: string
    maintenance_type: "repair" | "cleaning" | "service" | "inspection" | "replacement" | "other"
    description: string | null
    cost: number | null
    date_performed: string
    next_service_date: string | null
    notes: string | null
  }
}
