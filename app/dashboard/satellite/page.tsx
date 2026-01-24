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

                {farms && farms.length > 1 && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>All Farms Satellite Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {farms.map((farm) => {
                          const farmData = farmsSatelliteData[farm.id]
                          const latestNDVI = farmData?.ndvi?.[farmData.ndvi.length - 1]
                          const latestMoisture = farmData?.moisture?.[farmData.moisture.length - 1]

                          return (
                            <div key={farm.id} className="rounded-lg border border-border p-4">
                              <h4 className="font-medium text-foreground">{farm.name}</h4>
                              <p className="text-sm text-muted-foreground">{farm.location}</p>
                              <div className="mt-3 space-y-2">
                                {latestNDVI && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">NDVI: </span>
                                    <span className="font-medium">{latestNDVI.ndvi.toFixed(3)}</span>
                                  </div>
                                )}
                                {latestMoisture && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Soil Moisture: </span>
                                    <span className="font-medium">{latestMoisture.surfaceSoilMoisture.toFixed(1)}%</span>
                                  </div>
                                )}
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
