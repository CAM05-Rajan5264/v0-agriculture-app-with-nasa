import { Header } from "@/components/dashboard/header"
import { PhenologyCard } from "@/components/dashboard/phenology-card"
import { CropGuideCard } from "@/components/phenology/crop-guide-card"
import { SowingRecommendationCard } from "@/components/phenology/sowing-recommendation-card"
import { HarvestTimelineCard } from "@/components/phenology/harvest-timeline-card"
import { calculatePhenology, getWeatherData } from "@/lib/nasa-api"
import { getCropGuide } from "@/lib/crop-guide"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function PhenologyPage() {
  // Use demo data instead of database
  const farms = [
    { id: "1", name: "Main Farm", latitude: 41.8781, longitude: -87.6298 },
  ]
  const crops = [
    { 
      id: "1", 
      name: "Corn", 
      status: "active", 
      farm_id: "1", 
      planting_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      farms: farms[0]
    },
    { 
      id: "2", 
      name: "Soybeans", 
      status: "active", 
      farm_id: "1", 
      planting_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      farms: farms[0]
    },
  ]
  const unreadAlerts = 2

  // Get weather data from the first farm for sowing recommendations
  const defaultFarm = farms?.[0]
  const weather = defaultFarm ? await getWeatherData(defaultFarm.latitude, defaultFarm.longitude) : null
  const latitude = defaultFarm?.latitude ?? 40

  const phenologyData = await Promise.all(
    (crops || []).map(async (crop) => ({
      crop,
      phenology: await calculatePhenology(crop.name, crop.planting_date, crop.farms.latitude, crop.farms.longitude),
      guide: getCropGuide(crop.name),
    }))
  )

  return (
    <div className="flex flex-col">
      <Header title="Phenology & Crop Guide" unreadAlerts={unreadAlerts || 0} />
      <div className="p-6">
        <Tabs defaultValue="my-crops" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="my-crops" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              My Crops
            </TabsTrigger>
            <TabsTrigger value="crop-guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Crop Guide
            </TabsTrigger>
            <TabsTrigger value="sowing-calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Sowing Calendar
            </TabsTrigger>
          </TabsList>

          {/* My Crops Tab - Active crop tracking */}
          <TabsContent value="my-crops">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Active Crops</h2>
              <p className="text-muted-foreground">Track growth stages and harvest timelines</p>
            </div>

            {crops && crops.length > 0 ? (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {phenologyData.map(({ crop, phenology }) => (
                    <PhenologyCard key={crop.id} phenology={phenology} cropName={`${crop.name} - ${crop.farms.name}`} />
                  ))}
                </div>

                {phenologyData.some(({ guide }) => guide) && (
                  <>
                    <h3 className="mt-8 text-xl font-semibold text-foreground">Harvest Timelines</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {phenologyData
                        .filter(({ guide }) => guide)
                        .map(({ crop, guide }) => (
                          <HarvestTimelineCard
                            key={crop.id}
                            guide={guide!}
                            cropName={crop.name}
                            farmName={crop.farms.name}
                            plantingDate={crop.planting_date}
                          />
                        ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
                <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium text-foreground">No crops to track</h3>
                <p className="mb-4 text-center text-muted-foreground">
                  Add crops to start tracking their growth stages and phenology.
                </p>
                <Button asChild>
                  <Link href="/dashboard/crops">
                    <Sprout className="mr-2 h-4 w-4" />
                    Add Crop
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Crop Guide Tab - Reference information */}
          <TabsContent value="crop-guide">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Crop Growing Guide</h2>
              <p className="text-muted-foreground">
                Comprehensive information on optimal conditions, growth stages, and best practices
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {CROP_GUIDES.map((guide) => (
                <CropGuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </TabsContent>

          {/* Sowing Calendar Tab - Weather-based recommendations */}
          <TabsContent value="sowing-calendar">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Sowing Calendar</h2>
              <p className="text-muted-foreground">
                Real-time recommendations based on current weather conditions
                {defaultFarm && ` at ${defaultFarm.name}`}
              </p>
            </div>

            {weather ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Current Weather Conditions</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{weather.temperature.toFixed(1)}°C</p>
                      <p className="text-xs text-muted-foreground">Temperature</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{weather.humidity.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{weather.precipitation.toFixed(1)}mm</p>
                      <p className="text-xs text-muted-foreground">Rainfall</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{weather.windSpeed.toFixed(1)}m/s</p>
                      <p className="text-xs text-muted-foreground">Wind Speed</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground">Sowing Recommendations</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {CROP_GUIDES.map((guide) => (
                    <SowingRecommendationCard key={guide.id} guide={guide} weather={weather} latitude={latitude} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium text-foreground">Add a farm first</h3>
                <p className="mb-4 text-center text-muted-foreground">
                  Add a farm with GPS coordinates to get weather-based sowing recommendations.
                </p>
                <Button asChild>
                  <Link href="/dashboard/farms">
                    <Sprout className="mr-2 h-4 w-4" />
                    Add Farm
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
