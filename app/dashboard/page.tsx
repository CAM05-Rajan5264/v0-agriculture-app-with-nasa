import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { WeatherCard } from "@/components/dashboard/weather-card"
import { CropHealthCard } from "@/components/dashboard/crop-health-card"
import { IrrigationCard } from "@/components/dashboard/irrigation-card"
import { PhenologyCard } from "@/components/dashboard/phenology-card"
import {
  getWeatherData,
  calculateNDVI,
  calculateNASAIndices,
  analyzeCropHealth,
  getIrrigationStatus,
  calculatePhenology,
} from "@/lib/nasa-api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Sprout, Activity } from "lucide-react"
import { SmartFarmingPanel } from "@/components/dashboard/smart-farming-panel"
import { GlossyStatus } from "@/components/dashboard/glossy-insights"
import { FarmIndexResults, type FarmIndexResult } from "@/components/dashboard/farm-index-results"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: farms } = await supabase.from("farms").select("*").order("created_at", { ascending: false })
  const { data: crops } = await supabase
    .from("crops")
    .select("*, farms(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  const farmCount = farms?.length || 0
  const cropCount = crops?.length || 0

  const primaryFarm = farms?.[0]
  const primaryCrop = crops?.[0]

  const weatherResults = await Promise.all((farms || []).map(async (farm) => ({
    farm,
    weather: await getWeatherData(farm.latitude, farm.longitude),
  })))
  let cropHealth = null
  let irrigation = null
  let phenology = null

  if (primaryFarm) {
    if (primaryCrop) {
      const ndvi = await calculateNDVI(primaryFarm.latitude, primaryFarm.longitude, primaryCrop.planting_date)
      cropHealth = analyzeCropHealth(ndvi)
      irrigation = await getIrrigationStatus(primaryFarm.latitude, primaryFarm.longitude, primaryCrop.name)
      phenology = await calculatePhenology(primaryCrop.name, primaryCrop.planting_date, primaryFarm.latitude, primaryFarm.longitude)
    }
  }

  const farmIndexResults: FarmIndexResult[] = await Promise.all((farms || []).map(async (farm) => {
    const farmCrop = crops?.find((crop) => crop.farm_id === farm.id)
    const indices = await calculateNASAIndices(farm.latitude, farm.longitude)
    return {
      id: farm.id,
      name: farm.name,
      location: farm.location_name,
      area: farm.area_hectares,
      ndvi: indices?.ndvi ?? null,
      evi: indices?.evi ?? null,
      ndre: indices?.ndre ?? null,
      savi: indices?.savi ?? null,
      ndwi: indices?.ndwi ?? null,
    }
  }))

  let healthyPercentage = 0
  if (crops && crops.length > 0) {
    let healthyCount = 0
    for (const crop of crops) {
      const ndvi = await calculateNDVI(crop.farms.latitude, crop.farms.longitude, crop.planting_date)
      if (ndvi !== null && ndvi >= 0.5) {
        healthyCount++
      }
    }
    healthyPercentage = Math.round((healthyCount / crops.length) * 100)
  }

  return (
    <div className="flex min-h-full flex-col bg-[radial-gradient(circle_at_top_right,oklch(0.97_0.05_155),transparent_34%),linear-gradient(135deg,oklch(0.99_0.003_90),oklch(0.96_0.018_150))]">
      <Header title="Dashboard" unreadAlerts={unreadAlerts || 0} />
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="mb-2"><GlossyStatus /></div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Welcome to FarmPulse</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Monitor your farm&apos;s vital signs with NASA satellite data
            </p>
          </div>
        </div>

        <StatsGrid
          farmCount={farmCount}
          cropCount={cropCount}
          alertCount={unreadAlerts || 0}
          healthyPercentage={healthyPercentage}
        />

        {farmIndexResults.length > 0 && <FarmIndexResults farms={farmIndexResults} />}

        <SmartFarmingPanel farmCount={farmCount} cropCount={cropCount} alertCount={unreadAlerts || 0} />

        {!primaryFarm ? (
          <div className="flex flex-col items-center justify-center glossy-surface rounded-2xl border-dashed py-10 md:py-16 px-4 backdrop-blur-sm">
            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-primary/10">
              <MapPin className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-base md:text-lg font-semibold text-foreground text-center">
              Get started by adding a farm
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm md:text-base text-muted-foreground">
              Add your first farm to start monitoring crop health with NASA satellite data.
            </p>
            <Button asChild className="mt-6 shadow-lg shadow-primary/25">
              <Link href="/dashboard/farms">Add Farm</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Current weather by farm</h3>
                <p className="text-sm text-muted-foreground">Live NASA POWER conditions for every farm location.</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {weatherResults.map(({ farm, weather }) => (
                  <WeatherCard key={farm.id} weather={weather} locationName={`${farm.name} · ${farm.location_name}`} />
                ))}
              </div>
            </section>

            {!primaryCrop ? (
              <div className="flex flex-col items-center justify-center glossy-surface rounded-2xl border-dashed py-10 md:py-12 px-4 backdrop-blur-sm">
                <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Sprout className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-base md:text-lg font-semibold text-foreground text-center">
                  Add your first crop
                </h3>
                <p className="mt-2 max-w-sm text-center text-sm md:text-base text-muted-foreground">
                  Start tracking crop health by adding a crop to your farm.
                </p>
                <Button asChild className="mt-6 shadow-lg shadow-primary/25">
                  <Link href="/dashboard/crops">Add Crop</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                {cropHealth && <CropHealthCard analysis={cropHealth} cropName={primaryCrop.name} />}
                {irrigation && <IrrigationCard irrigation={irrigation} farmName={primaryFarm.name} />}
                {phenology && <PhenologyCard phenology={phenology} cropName={primaryCrop.name} />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
