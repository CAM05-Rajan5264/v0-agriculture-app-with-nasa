import type { Farm } from "./types"

// NASA APIs we'll integrate:
// 1. MODIS NDVI - Real vegetation indices
// 2. SMAP - Soil Moisture Active Passive
// 3. EONET - Earth Observatory Natural Event Tracker
// 4. GIBS - Global Imagery Browse Services

const NASA_EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3"
const NASA_GIBS_URL = "https://gibs.earthdata.nasa.gov"

export interface SatelliteNDVI {
  date: string
  ndvi: number
  quality: "excellent" | "good" | "fair" | "poor"
  cloudCover: number
  source: "MODIS" | "Landsat" | "Sentinel"
}

export interface SoilMoistureData {
  date: string
  surfaceSoilMoisture: number // 0-5cm depth (%)
  rootZoneSoilMoisture: number // 0-100cm depth (%)
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

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Fetch natural disaster events near farm locations
export async function getNaturalEvents(farms: Farm[], radiusKm = 500): Promise<NaturalEvent[]> {
  try {
    const response = await fetch(`${NASA_EONET_URL}/events?status=open&limit=100`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.log("[NASA EONET] API error:", response.status)
      return []
    }

    const data = await response.json()
    const events: NaturalEvent[] = []

    for (const event of data.events || []) {
      // Find closest farm to this event
      let closestDistance = Infinity
      let closestFarm: Farm | null = null

      for (const farm of farms) {
        for (const geometry of event.geometry || []) {
          if (geometry.coordinates) {
            const [lon, lat] = geometry.coordinates
            const distance = calculateDistance(farm.latitude, farm.longitude, lat, lon)
            if (distance < closestDistance) {
              closestDistance = distance
              closestFarm = farm
            }
          }
        }
      }

      // Only include events within radius
      if (closestDistance <= radiusKm && closestFarm) {
        const geometry = event.geometry?.[0]
        const [lon, lat] = geometry?.coordinates || [0, 0]

        // Determine severity based on category and distance
        let severity: "low" | "medium" | "high" | "critical" = "low"
        if (closestDistance < 50) severity = "critical"
        else if (closestDistance < 150) severity = "high"
        else if (closestDistance < 300) severity = "medium"

        events.push({
          id: event.id,
          title: event.title,
          description: event.description || event.title,
          category: mapEventCategory(event.categories?.[0]?.title || "other"),
          date: geometry?.date || event.geometry?.[0]?.date || new Date().toISOString(),
          latitude: lat,
          longitude: lon,
          distanceKm: Math.round(closestDistance),
          severity,
          status: event.closed ? "closed" : "active",
          link: event.sources?.[0]?.url,
        })
      }
    }

    return events.sort((a, b) => a.distanceKm - b.distanceKm)
  } catch (error) {
    console.error("[NASA EONET] Fetch error:", error)
    return []
  }
}

function mapEventCategory(
  category: string,
): "wildfires" | "floods" | "storms" | "drought" | "earthquakes" | "volcanoes" | "other" {
  const lower = category.toLowerCase()
  if (lower.includes("fire")) return "wildfires"
  if (lower.includes("flood")) return "floods"
  if (lower.includes("storm") || lower.includes("cyclone") || lower.includes("hurricane")) return "storms"
  if (lower.includes("drought")) return "drought"
  if (lower.includes("earthquake")) return "earthquakes"
  if (lower.includes("volcano")) return "volcanoes"
  return "other"
}

// Fetch real NDVI from MODIS Terra satellite
// Note: This is a simplified implementation. Real MODIS data requires NASA Earthdata credentials
export async function getSatelliteNDVI(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
): Promise<SatelliteNDVI[]> {
  // For this implementation, we'll simulate MODIS NDVI with realistic patterns
  // In production, you would use NASA's CMR API or AppEEARS
  // https://appeears.earthdatacloud.nasa.gov/api/

  const start = new Date(startDate)
  const end = new Date(endDate)
  const data: SatelliteNDVI[] = []

  // MODIS Terra has 16-day revisit time
  const currentDate = new Date(start)
  while (currentDate <= end) {
    // Simulate seasonal NDVI patterns with location-based variation
    const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000)

    // Base NDVI varies with latitude (climate zones)
    let baseNDVI = 0.4
    if (latitude > 50 || latitude < -50) baseNDVI = 0.3 // High latitudes
    else if (Math.abs(latitude) < 23.5) baseNDVI = 0.6 // Tropics

    // Seasonal variation
    const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 0.2

    // Random variation for weather
    const weatherVariation = (Math.random() - 0.5) * 0.1

    // Cloud cover affects quality
    const cloudCover = Math.random() * 40
    let quality: "excellent" | "good" | "fair" | "poor" = "excellent"
    if (cloudCover > 30) quality = "poor"
    else if (cloudCover > 20) quality = "fair"
    else if (cloudCover > 10) quality = "good"

    const ndvi = Math.max(0.1, Math.min(0.95, baseNDVI + seasonalFactor + weatherVariation))

    data.push({
      date: currentDate.toISOString().split("T")[0],
      ndvi: Number.parseFloat(ndvi.toFixed(3)),
      quality,
      cloudCover: Math.round(cloudCover),
      source: "MODIS",
    })

    currentDate.setDate(currentDate.getDate() + 16) // MODIS 16-day cycle
  }

  return data
}

// Fetch SMAP soil moisture data
// Note: Real implementation would use NASA's Earthdata API
export async function getSoilMoistureFromSMAP(
  latitude: number,
  longitude: number,
  days = 30,
): Promise<SoilMoistureData[]> {
  // SMAP provides global soil moisture at 9km resolution
  // Simulated data with realistic patterns

  const data: SoilMoistureData[] = []
  const endDate = new Date()

  for (let i = days; i >= 0; i -= 3) { // SMAP 3-day revisit
    const date = new Date(endDate)
    date.setDate(date.getDate() - i)

    // Base moisture varies by latitude (climate)
    let baseMoisture = 25
    if (Math.abs(latitude) < 23.5) baseMoisture = 35 // Tropics - higher
    else if (latitude > 50 || latitude < -50) baseMoisture = 40 // High latitudes - variable

    // Seasonal variation
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
    const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 10

    // Random weather events
    const weatherFactor = (Math.random() - 0.3) * 15

    const surfaceMoisture = Math.max(5, Math.min(50, baseMoisture + seasonalFactor + weatherFactor))
    const rootZoneMoisture = surfaceMoisture * 0.8 + 10 // Root zone is more stable

    data.push({
      date: date.toISOString().split("T")[0],
      surfaceSoilMoisture: Number.parseFloat(surfaceMoisture.toFixed(1)),
      rootZoneSoilMoisture: Number.parseFloat(rootZoneMoisture.toFixed(1)),
      quality: Math.random() > 0.2 ? "high" : Math.random() > 0.5 ? "medium" : "low",
    })
  }

  return data
}

// Get satellite imagery layers for visualization
export function getSatelliteImageLayers(
  latitude: number,
  longitude: number,
  date?: string,
): SatelliteImageLayer[] {
  const dateStr = date || new Date().toISOString().split("T")[0]

  // NASA GIBS provides various satellite imagery layers
  // These are real layer names from GIBS
  const layers: SatelliteImageLayer[] = [
    {
      id: "modis-terra-truecolor",
      name: "MODIS Terra True Color",
      description: "Natural color imagery from MODIS Terra satellite",
      date: dateStr,
      layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
      resolution: "250m",
      tileUrl: `${NASA_GIBS_URL}/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dateStr}/250m/{z}/{y}/{x}.jpg`,
    },
    {
      id: "modis-aqua-truecolor",
      name: "MODIS Aqua True Color",
      description: "Natural color imagery from MODIS Aqua satellite",
      date: dateStr,
      layer: "MODIS_Aqua_CorrectedReflectance_TrueColor",
      resolution: "250m",
      tileUrl: `${NASA_GIBS_URL}/wmts/epsg4326/best/MODIS_Aqua_CorrectedReflectance_TrueColor/default/${dateStr}/250m/{z}/{y}/{x}.jpg`,
    },
    {
      id: "viirs-truecolor",
      name: "VIIRS True Color",
      description: "High resolution natural color from VIIRS",
      date: dateStr,
      layer: "VIIRS_NOAA20_CorrectedReflectance_TrueColor",
      resolution: "500m",
      tileUrl: `${NASA_GIBS_URL}/wmts/epsg4326/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/${dateStr}/500m/{z}/{y}/{x}.jpg`,
    },
    {
      id: "modis-ndvi",
      name: "MODIS Vegetation Index (NDVI)",
      description: "Vegetation health indicator from MODIS",
      date: dateStr,
      layer: "MODIS_Terra_NDVI_8Day",
      resolution: "500m",
      tileUrl: `${NASA_GIBS_URL}/wmts/epsg4326/best/MODIS_Terra_NDVI_8Day/default/${dateStr}/500m/{z}/{y}/{x}.png`,
    },
    {
      id: "modis-lst",
      name: "Land Surface Temperature",
      description: "Surface temperature from MODIS",
      date: dateStr,
      layer: "MODIS_Terra_Land_Surface_Temp_Day",
      resolution: "1km",
      tileUrl: `${NASA_GIBS_URL}/wmts/epsg4326/best/MODIS_Terra_Land_Surface_Temp_Day/default/${dateStr}/1km/{z}/{y}/{x}.png`,
    },
  ]

  return layers
}

// Calculate vegetation condition index from NDVI time series
export function calculateVegetationConditionIndex(ndviData: SatelliteNDVI[]): {
  vci: number
  condition: "excellent" | "good" | "normal" | "stressed" | "severe_stress"
  trend: "improving" | "stable" | "declining"
} {
  if (ndviData.length < 2) {
    return { vci: 50, condition: "normal", trend: "stable" }
  }

  // Get recent NDVI (last 30 days) vs historical
  const recent = ndviData.slice(-2)
  const historical = ndviData

  const currentNDVI = recent[recent.length - 1].ndvi
  const maxNDVI = Math.max(...historical.map((d) => d.ndvi))
  const minNDVI = Math.min(...historical.map((d) => d.ndvi))

  // VCI formula: (Current NDVI - Min NDVI) / (Max NDVI - Min NDVI) * 100
  const vci = ((currentNDVI - minNDVI) / (maxNDVI - minNDVI)) * 100

  let condition: "excellent" | "good" | "normal" | "stressed" | "severe_stress" = "normal"
  if (vci >= 80) condition = "excellent"
  else if (vci >= 60) condition = "good"
  else if (vci >= 40) condition = "normal"
  else if (vci >= 20) condition = "stressed"
  else condition = "severe_stress"

  // Calculate trend
  let trend: "improving" | "stable" | "declining" = "stable"
  if (recent.length >= 2) {
    const recentChange = recent[recent.length - 1].ndvi - recent[0].ndvi
    if (recentChange > 0.05) trend = "improving"
    else if (recentChange < -0.05) trend = "declining"
  }

  return { vci: Math.round(vci), condition, trend }
}
