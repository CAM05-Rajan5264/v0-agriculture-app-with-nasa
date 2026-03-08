import { Header } from "@/components/dashboard/header"
import { IrrigationCard } from "@/components/dashboard/irrigation-card"
import { LogIrrigationDialog } from "@/components/irrigation/log-irrigation-dialog"
import { IrrigationHistory } from "@/components/irrigation/irrigation-history"
import { NextIrrigationCard } from "@/components/irrigation/next-irrigation-card"
import { getIrrigationStatus, getCropHealth } from "@/lib/nasa-api"
import { calculateNextIrrigation } from "@/lib/irrigation-calculator"
import { Droplets, Sprout } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { IrrigationEvent } from "@/lib/types"

export default async function IrrigationPage() {
  // Use demo crops instead of database
  const crops = [
    { 
      id: "1", 
      name: "Corn", 
      status: "active", 
      farm_id: "1", 
      variety: "Pioneer",
      farms: { id: "1", name: "Main Farm", latitude: 41.8781, longitude: -87.6298 } 
    },
    { 
      id: "2", 
      name: "Soybeans", 
      status: "active", 
      farm_id: "2", 
      variety: "Roundup Ready",
      farms: { id: "2", name: "North Field", latitude: 40.7128, longitude: -88.2434 } 
    },
  ]

  const unreadAlerts = 2

  // Use demo irrigation events instead of database
  const allIrrigationEvents = [
    { id: "1", crop_id: "1", irrigated_at: new Date().toISOString(), amount: 25, unit: "mm" },
    { id: "2", crop_id: "2", irrigated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), amount: 30, unit: "mm" },
  ]

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
    (crops || []).map(async (crop) => {
      const irrigation = await getIrrigationStatus(crop.farms.latitude, crop.farms.longitude, crop.name)
      const cropHealth = await getCropHealth(crop.farms.latitude, crop.farms.longitude)
      const events = eventsByCrop[crop.id] || []
      const lastEvent = events[0] || null

      const prediction = calculateNextIrrigation(irrigation, cropHealth, lastEvent, crop.name)

      return {
        crop,
        irrigation,
        cropHealth,
        prediction,
        events: events.slice(0, 5), // Last 5 events
      }
    }),
  )

  return (
    <div className="flex flex-col">
      <Header title="Irrigation" unreadAlerts={unreadAlerts || 0} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Irrigation Management</h2>
          <p className="text-muted-foreground">
            Track irrigation events and get smart recommendations based on soil moisture, weather, and crop health
          </p>
        </div>

        {crops && crops.length > 0 ? (
          <div className="space-y-8">
            {irrigationData.map(({ crop, irrigation, prediction, events }) => (
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
