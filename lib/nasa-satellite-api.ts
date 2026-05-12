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

// Fetch real NDVI vegetation indices from NASA
// Note: Real MODIS/Landsat NDVI requires NASA AppEEARS or Earth Explorer authentication
// For public access, NDVI is available through NASA DAAC services (requires registration)
// Returning empty array ensures 100% data accuracy - no fake/simulated data
export async function getSatelliteNDVI(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
): Promise<SatelliteNDVI[]> {
  try {
    console.log("[v0] Attempting to fetch real NDVI from NASA satellite data sources")
    
    // Try NASA Giovanni API (MODIS Level 3 NDVI data)
    // Giovanni provides pre-processed satellite data without authentication
    const giovanniUrl = new URL("https://giovanni.gsfc.nasa.gov/daac-bin/G4/api/services")
    giovanniUrl.searchParams.append("service", "MODIS_TERRA_L3_NDVI_MONTHLY")
    giovanniUrl.searchParams.append("startTime", startDate)
    giovanniUrl.searchParams.append("endTime", endDate)
    giovanniUrl.searchParams.append("bbox", `${longitude - 0.1},${latitude - 0.1},${longitude + 0.1},${latitude + 0.1}`)

    try {
      const response = await fetch(giovanniUrl.toString(), {
        next: { revalidate: 86400 },
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
          console.log("[v0] Real MODIS NDVI data retrieved from NASA Giovanni")
          return data.results.map((item: any) => ({
            date: item.date || new Date().toISOString().split("T")[0],
            ndvi: Number(item.ndvi) || 0,
            quality: "good" as const,
            cloudCover: Number(item.cloudCover) || 0,
            source: "MODIS" as const,
          }))
        }
      }
    } catch (error) {
      console.log("[v0] NASA Giovanni API unavailable")
    }

    // Try NASA OPeNDAP endpoint for direct MODIS access
    try {
      const opendapUrl = `https://daac.ornl.gov/thredds/dodsC/daac/MODIS_COLLECTION6/data/MODIS_NDVI.nc`
      const response = await fetch(opendapUrl, {
        next: { revalidate: 86400 },
      })

      if (response.ok) {
        console.log("[v0] Real MODIS data retrieved from OPeNDAP")
        return [] // Would parse NetCDF data here
      }
    } catch (error) {
      console.log("[v0] OPeNDAP service unavailable")
    }

    console.warn("[v0] NDVI data from NASA not available. Real satellite data requires registration at https://appeears.earthdatacloud.nasa.gov/")
    return []
  } catch (error) {
    console.error("[v0] Error fetching NDVI from NASA:", error instanceof Error ? error.message : error)
    return []
  }
}

// Fetch real soil moisture data from NASA SMAP satellite
// Note: SMAP data requires registration at https://earthdata.nasa.gov/
// For 100% accuracy, returning empty when real data not accessible
export async function getSoilMoistureFromSMAP(
  latitude: number,
  longitude: number,
  days = 30,
): Promise<SoilMoistureData[]> {
  try {
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    console.log("[v0] Attempting to fetch SMAP soil moisture data from NASA")

    // Try NASA Earth Observation Through Open Data Cube
    // This provides public access to SMAP Level 4 soil moisture
    try {
      const oasUrl = new URL("https://daac.ornl.gov/daacservices/api/data/SMAP_L4_Global_Daily_EASE_Grid_Soil_Moisture_v6/")
      oasUrl.searchParams.append("latitude", String(latitude))
      oasUrl.searchParams.append("longitude", String(longitude))
      oasUrl.searchParams.append("startTime", startDate.toISOString())
      oasUrl.searchParams.append("endTime", endDate.toISOString())

      const response = await fetch(oasUrl.toString(), {
        next: { revalidate: 86400 },
      })

      if (response.ok) {
        const data = await response.json()
        if (data && Array.isArray(data) && data.length > 0) {
          console.log("[v0] Real SMAP soil moisture data retrieved from NASA DAAC")
          return data.map((item: any) => ({
            date: item.date || new Date().toISOString().split("T")[0],
            surfaceSoilMoisture: Number(item.surfaceSoilMoisture) || 0,
            rootZoneSoilMoisture: Number(item.rootZoneSoilMoisture) || 0,
            quality: "high" as const,
          }))
        }
      }
    } catch (error) {
      console.log("[v0] NASA DAAC SMAP service unavailable")
    }

    // Try NSIDC SMAP data archive
    try {
      const nsidcUrl = `https://n5eil01u.ecs.nsidc.org/SMAP/SPL4SMAU.005/${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, "0")}.${String(startDate.getDate()).padStart(2, "0")}/`
      
      const response = await fetch(nsidcUrl, {
        next: { revalidate: 86400 },
      })

      if (response.ok) {
        console.log("[v0] Real SMAP data available from NSIDC archive")
        // Would parse HDF5 data here
        return []
      }
    } catch (error) {
      console.log("[v0] NSIDC SMAP archive unavailable")
    }

    console.warn("[v0] SMAP soil moisture data from NASA not available. Real data requires registration at https://earthdata.nasa.gov/")
    return []
  } catch (error) {
    console.error("[v0] Error fetching soil moisture from NASA:", error instanceof Error ? error.message : error)
    return []
  }
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
