import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SatelliteImageViewer } from "@/components/satellite/satellite-image-viewer"
import { SatelliteNDVIChart } from "@/components/satellite/satellite-ndvi-chart"
import { SoilMoistureChart } from "@/components/satellite/soil-moisture-chart"
import { NaturalEventsMap } from "@/components/satellite/natural-events-map"
import { getSatelliteNDVI, getSoilMoistureFromSMAP, getNaturalEvents, getSatelliteImageLayers } from "@/lib/nasa-satellite-api"
import { Satellite, MapPin, Flame, CloudRain, Leaf } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SatellitePage() {
  const supabase = await createClient()

  const { data: farms } = await supabase.from("farms").select("*").order("created_at", { ascending: false })
  const { data: crops } = await supabase.from("crops").select("*, farms(*)").eq("status", "active")
  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  const primaryFarm = farms?.[0]
  const primaryCrop = crops?.[0]

  // Fetch satellite data for primary farm
  let satelliteNDVI = null
  let soilMoisture = null
  let naturalEvents = []
  let imageLayers = []
  let farmsSatelliteData: Record<string, { ndvi: any; moisture: any; layers: any }> = {}

  if (primaryFarm) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90) // Last 90 days

    satelliteNDVI = await getSatelliteNDVI(
      primaryFarm.latitude,
      primaryFarm.longitude,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    )

    soilMoisture = await getSoilMoistureFromSMAP(primaryFarm.latitude, primaryFarm.longitude, 30)

    imageLayers = getSatelliteImageLayers(primaryFarm.latitude, primaryFarm.longitude)

    // Fetch satellite data for all farms
    if (farms && farms.length > 0) {
      for (const farm of farms) {
        const farmNDVI = await getSatelliteNDVI(
          farm.latitude,
          farm.longitude,
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
        )

        const farmMoisture = await getSoilMoistureFromSMAP(farm.latitude, farm.longitude, 30)
        const farmLayers = getSatelliteImageLayers(farm.latitude, farm.longitude)

        farmsSatelliteData[farm.id] = {
          ndvi: farmNDVI,
          moisture: farmMoisture,
          layers: farmLayers,
        }
      }
    }

    naturalEvents = await getNaturalEvents(farms || [], 500)
  }

  return (
    <div className="flex flex-col">
      <Header title="Satellite Monitoring" unreadAlerts={unreadAlerts || 0} />
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Satellite className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">NASA Satellite Monitoring</h2>
            <p className="text-muted-foreground">Real-time satellite imagery, vegetation indices, and environmental alerts</p>
          </div>
        </div>

        {!primaryFarm ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Satellite className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">Add a farm to view satellite data</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Add your farm location to access NASA satellite imagery and monitoring.
            </p>
            <Button asChild>
              <Link href="/dashboard/farms">
                <MapPin className="mr-2 h-4 w-4" />
                Add Farm
              </Link>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="imagery" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="imagery" className="flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                Satellite Imagery
              </TabsTrigger>
              <TabsTrigger value="vegetation" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Vegetation Health
              </TabsTrigger>
              <TabsTrigger value="soil" className="flex items-center gap-2">
                <CloudRain className="h-4 w-4" />
                Soil Moisture
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Natural Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="imagery">
              <div className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Satellite className="h-5 w-5 text-primary" />
                      Live Satellite View - {primaryFarm.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SatelliteImageViewer
                      latitude={primaryFarm.latitude}
                      longitude={primaryFarm.longitude}
                      farmName={primaryFarm.name}
                      layers={imageLayers}
                    />
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Available Satellite Layers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {imageLayers.map((layer) => (
                        <div key={layer.id} className="rounded-lg border border-border p-3">
                          <h4 className="font-medium text-foreground">{layer.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{layer.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">NASA</Badge>
                            <Badge variant="outline">{layer.resolution} resolution</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {farms && farms.length > 0 && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>All Farms Satellite Analysis</CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">Comprehensive satellite monitoring for your {farms.length} farm{farms.length > 1 ? "s" : ""}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {farms.map((farm) => {
                          const farmData = farmsSatelliteData[farm.id]
                          const latestNDVI = farmData?.ndvi?.[farmData.ndvi.length - 1]
                          const latestMoisture = farmData?.moisture?.[farmData.moisture.length - 1]

                          // Determine crop health based on NDVI
                          let healthStatus = "Unknown"
                          let healthColor = "text-gray-600"
                          if (latestNDVI) {
                            const ndviValue = latestNDVI.ndvi
                            if (ndviValue > 0.6) {
                              healthStatus = "Excellent"
                              healthColor = "text-green-600"
                            } else if (ndviValue > 0.4) {
                              healthStatus = "Good"
                              healthColor = "text-emerald-600"
                            } else if (ndviValue > 0.2) {
                              healthStatus = "Fair"
                              healthColor = "text-yellow-600"
                            } else {
                              healthStatus = "Poor"
                              healthColor = "text-red-600"
                            }
                          }

                          // Determine moisture status
                          let moistureStatus = "Normal"
                          let moistureColor = "text-blue-600"
                          if (latestMoisture) {
                            const moisture = latestMoisture.surfaceSoilMoisture
                            if (moisture < 20) {
                              moistureStatus = "Dry"
                              moistureColor = "text-orange-600"
                            } else if (moisture < 30) {
                              moistureStatus = "Low"
                              moistureColor = "text-yellow-600"
                            } else if (moisture > 60) {
                              moistureStatus = "High"
                              moistureColor = "text-blue-600"
                            }
                          }

                          return (
                            <div key={farm.id} className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-foreground">{farm.name}</h4>
                                  <p className="text-sm text-muted-foreground">{farm.location}</p>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-semibold ${healthColor}`}>
                                    {healthStatus} Health
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-4 md:grid-cols-3">
                                {latestNDVI && (
                                  <div className="rounded bg-muted p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Vegetation Index (NDVI)</p>
                                    <p className="text-lg font-semibold text-foreground">{latestNDVI.ndvi.toFixed(3)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {latestNDVI.date ? new Date(latestNDVI.date).toLocaleDateString() : "Latest data"}
                                    </p>
                                  </div>
                                )}
                                {latestMoisture && (
                                  <div className="rounded bg-muted p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Soil Moisture</p>
                                    <p className={`text-lg font-semibold ${moistureColor}`}>
                                      {latestMoisture.surfaceSoilMoisture.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">{moistureStatus}</p>
                                  </div>
                                )}
                                <div className="rounded bg-muted p-3">
                                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                                  <p className="text-lg font-semibold text-foreground">{farm.latitude.toFixed(2)}, {farm.longitude.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Coordinates</p>
                                </div>
                              </div>

                              {/* Recommendations based on data */}
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Recommendations:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {latestNDVI && latestNDVI.ndvi < 0.4 && (
                                    <li>• Crop health is below optimal. Consider applying fertilizer or adjusting irrigation.</li>
                                  )}
                                  {latestMoisture && latestMoisture.surfaceSoilMoisture < 25 && (
                                    <li>• Soil moisture is low. Increase irrigation frequency to maintain crop health.</li>
                                  )}
                                  {latestMoisture && latestMoisture.surfaceSoilMoisture > 60 && (
                                    <li>• Soil moisture is high. Monitor for waterlogging; ensure proper drainage.</li>
                                  )}
                                  {latestNDVI && latestNDVI.ndvi > 0.5 && latestMoisture && latestMoisture.surfaceSoilMoisture > 30 && latestMoisture.surfaceSoilMoisture < 60 && (
                                    <li>• Farm conditions are optimal. Maintain current management practices.</li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="vegetation">
              {satelliteNDVI && (
                <SatelliteNDVIChart
                  data={satelliteNDVI}
                  farmName={primaryFarm.name}
                  cropName={primaryCrop?.name}
                />
              )}
            </TabsContent>

            <TabsContent value="soil">
              {soilMoisture && <SoilMoistureChart data={soilMoisture} farmName={primaryFarm.name} />}
            </TabsContent>

            <TabsContent value="events">
              <NaturalEventsMap events={naturalEvents} farms={farms || []} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
