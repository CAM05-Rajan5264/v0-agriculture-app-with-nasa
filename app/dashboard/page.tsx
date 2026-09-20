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
  analyzeCropHealth,
  getIrrigationStatus,
  calculatePhenology,
} from "@/lib/nasa-api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Sprout, Activity } from "lucide-react"
import { SmartFarmingPanel } from "@/components/dashboard/smart-farming-panel"

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

  let weather = null
  let cropHealth = null
  let irrigation = null
  let phenology = null

  if (primaryFarm) {
    weather = await getWeatherData(primaryFarm.latitude, primaryFarm.longitude)

    if (primaryCrop) {
      const ndvi = await calculateNDVI(primaryFarm.latitude, primaryFarm.longitude, primaryCrop.planting_date)
      cropHealth = analyzeCropHealth(ndvi)
      irrigation = await getIrrigationStatus(primaryFarm.latitude, primaryFarm.longitude, primaryCrop.name)
      phenology = await calculatePhenology(primaryCrop.name, primaryCrop.planting_date, primaryFarm.latitude, primaryFarm.longitude)
    }
  }

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
    <div className="flex flex-col">
      <Header title="Dashboard" unreadAlerts={unreadAlerts || 0} />
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
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

        <SmartFarmingPanel farmCount={farmCount} cropCount={cropCount} alertCount={unreadAlerts || 0} />

        {!primaryFarm ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-10 md:py-16 px-4 backdrop-blur-sm">
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
            {weather && <WeatherCard weather={weather} locationName={primaryFarm.location_name} />}

            {!primaryCrop ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-10 md:py-12 px-4 backdrop-blur-sm">
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
