import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { IrrigationCard } from "@/components/dashboard/irrigation-card"
import { LogIrrigationDialog } from "@/components/irrigation/log-irrigation-dialog"
import { IrrigationHistory } from "@/components/irrigation/irrigation-history"
import { NextIrrigationCard } from "@/components/irrigation/next-irrigation-card"
import { getIrrigationStatus, getCropHealth, getSoilMoistureTrends } from "@/lib/nasa-api"
import { SoilMoistureTrends } from "@/components/dashboard/soil-moisture-trends"
import { calculateNextIrrigation } from "@/lib/irrigation-calculator"
import { Droplets, Sprout, Gauge, CloudRain, Timer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { IrrigationEvent } from "@/lib/types"

export default async function IrrigationPage() {
  const supabase = await createClient()

  const { data: crops } = await supabase.from("crops").select("*, farms(*)").eq("status", "active")
  const validCrops = (crops || []).filter((crop) => crop.farms && typeof crop.farms.latitude === "number" && typeof crop.farms.longitude === "number")

  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  // Fetch irrigation events for all crops
  const cropIds = validCrops.map((c) => c.id)
  const { data: allIrrigationEvents } = await supabase
    .from("irrigation_events")
    .select("*")
    .in("crop_id", cropIds.length > 0 ? cropIds : [""])
    .order("irrigated_at", { ascending: false })

  // Group events by crop
  const eventsByCrop: Record<string, IrrigationEvent[]> = {}
  ;(allIrrigationEvents || []).forEach((event: IrrigationEvent) => {
    if (!eventsByCrop[event.crop_id]) {
      eventsByCrop[event.crop_id] = []
    }
    eventsByCrop[event.crop_id].push(event)
  })

  // Fetch irrigation data and predictions for each crop
  const irrigationData = await Promise.all(
    validCrops.map(async (crop) => {
      try {
        const { latitude, longitude } = crop.farms
        const [irrigation, cropHealth, soilMoisture] = await Promise.all([
          getIrrigationStatus(latitude, longitude, crop.name),
          getCropHealth(latitude, longitude),
          getSoilMoistureTrends(latitude, longitude),
        ])
        const events = eventsByCrop[crop.id] || []
        const prediction = calculateNextIrrigation(irrigation, cropHealth, events[0] || null, crop.name)
        return { crop, irrigation, cropHealth, prediction, events: events.slice(0, 5), soilMoisture }
      } catch (error) {
        console.error("[v0] Irrigation data failed for crop:", crop.id, error)
        return null
      }
    }),
  )
  const availableIrrigationData = irrigationData.filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <div className="flex flex-col">
      <Header title="Irrigation" unreadAlerts={unreadAlerts || 0} />
      <div className="p-4 md:p-6">
        <div className="glossy-surface mb-6 overflow-hidden rounded-3xl border-white/70 p-5 md:p-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Badge variant="secondary" className="mb-3 rounded-full">Water intelligence</Badge><h2 className="text-3xl font-bold tracking-tight text-foreground">Irrigation Management</h2><p className="mt-1 max-w-2xl text-muted-foreground">Turn NASA weather, soil moisture, and crop health into clear watering decisions.</p></div><div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"><Droplets className="mr-2 inline size-4" />{crops?.length || 0} crops monitored</div></div><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3"><div className="rounded-2xl bg-white/55 p-4"><Gauge className="size-4 text-primary" /><p className="mt-3 text-2xl font-bold">{availableIrrigationData.filter(({ irrigation }) => irrigation.soilMoisture < 40).length}</p><p className="text-xs text-muted-foreground">Needs attention</p></div><div className="rounded-2xl bg-white/55 p-4"><Timer className="size-4 text-amber-600" /><p className="mt-3 text-2xl font-bold">{availableIrrigationData.filter(({ prediction }) => prediction.shouldIrrigate).length}</p><p className="text-xs text-muted-foreground">Recommended now</p></div><div className="hidden rounded-2xl bg-white/55 p-4 md:block"><CloudRain className="size-4 text-sky-600" /><p className="mt-3 text-2xl font-bold">NASA</p><p className="text-xs text-muted-foreground">Weather source</p></div></div></div>

        {crops && crops.length > 0 ? (
          <div className="space-y-8">
            {availableIrrigationData.map(({ crop, irrigation, prediction, events, soilMoisture }) => (
              <div key={crop.id} className="space-y-4">
                {/* Crop Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{crop.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {crop.farms.name} • {crop.variety || "Standard variety"}
                    </p>
                  </div>
                  <LogIrrigationDialog
                    cropId={crop.id}
                    cropName={crop.name}
                    recommendedAmount={irrigation.recommendedAmount}
                    currentSoilMoisture={irrigation.soilMoisture}
                  />
                </div>

                {/* Cards Grid */}
                <div className="mb-4">{soilMoisture.length > 0 ? <SoilMoistureTrends farmName={crop.farms.name} points={soilMoisture} /> : <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">NASA POWER soil moisture data is unavailable for this farm.</div>}</div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Current Status */}
                  <IrrigationCard irrigation={irrigation} farmName={`${crop.name} at ${crop.farms.name}`} />

                  {/* Next Irrigation Prediction */}
                  <NextIrrigationCard prediction={prediction} cropName={crop.name} />

                  {/* Irrigation History */}
                  <IrrigationHistory events={events} cropName={crop.name} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Droplets className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No crops to monitor</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Add crops to your farms to start tracking irrigation needs.
            </p>
            <Button asChild>
              <Link href="/dashboard/crops">
                <Sprout className="mr-2 h-4 w-4" />
                Add Crop
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
