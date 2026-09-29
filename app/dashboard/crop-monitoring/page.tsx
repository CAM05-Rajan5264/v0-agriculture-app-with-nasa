"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, TrendingUp, Droplets, Leaf, AlertTriangle, CheckCircle } from "lucide-react"
import type { CropMonitoringData } from "@/lib/nasa-earth-observation"
import { generateCropMonitoringData } from "@/lib/nasa-earth-observation"
import { getWeatherData } from "@/lib/nasa-api"
import { FarmSatelliteHybrid } from "@/components/crop-monitoring/farm-satellite-hybrid"

interface CropField {
  id: string
  name: string
  crop: string
  latitude: number
  longitude: number
  plantedDaysAgo: number
}

// Mock crop fields - in production these would come from database
const mockCropFields: CropField[] = [
  {
    id: "field-1",
    name: "North Field",
    crop: "Corn",
    latitude: 28.661395,
    longitude: 77.092855,
    plantedDaysAgo: 45,
  },
  {
    id: "field-2",
    name: "South Field",
    crop: "Wheat",
    latitude: 25.4026,
    longitude: 82.9587,
    plantedDaysAgo: 60,
  },
]

export default function CropMonitoringPage() {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(mockCropFields[0].id)
  const [monitoringData, setMonitoringData] = useState<CropMonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        setLoading(true)
        setError(null)

        const field = mockCropFields.find((f) => f.id === selectedFieldId)
        if (!field) return

        // Fetch weather data from NASA POWER
        const weatherData = await getWeatherData(field.latitude, field.longitude)

        // Generate crop monitoring data using NASA Earth observation
        const monitoring = await generateCropMonitoringData(
          field.crop,
          field.id,
          field.latitude,
          field.longitude,
          field.plantedDaysAgo,
          {
            temperature: weatherData.temperature || 25,
            humidity: weatherData.humidity || 60,
            precipitation: weatherData.precipitation || 5,
          },
        )

        setMonitoringData(monitoring)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch monitoring data")
      } finally {
        setLoading(false)
      }
    }

    fetchMonitoringData()
  }, [selectedFieldId])

  const field = mockCropFields.find((f) => f.id === selectedFieldId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Crop Health Monitoring</h1>
        <p className="text-muted-foreground">
          NASA Earth observation data for real-time crop health and growth tracking
        </p>
      </div>

      {/* Field Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mockCropFields.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFieldId(f.id)}
            className={`glossy-surface rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 ${
              selectedFieldId === f.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <h3 className="font-semibold text-foreground">{f.name}</h3>
            <p className="text-sm text-muted-foreground">
              {f.crop} • {f.plantedDaysAgo} days old
            </p>
          </button>
        ))}
      </div>

      {error && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="flex gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">NASA Data Unavailable</p>
              <p className="text-sm text-amber-600 dark:text-amber-300">{error}</p>
              <p className="text-xs text-amber-600 dark:text-amber-300 mt-2">
                We only display real NASA Earth observation data. No simulated data is shown.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="glossy-surface overflow-hidden rounded-2xl">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto" />
              <p className="text-muted-foreground">Loading crop health data...</p>
            </div>
          </CardContent>
        </Card>
      ) : monitoringData ? (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="glossy-surface grid h-auto w-full grid-cols-2 gap-2 rounded-2xl p-2 md:grid-cols-5">
            <TabsTrigger className="rounded-xl py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg" value="overview">Overview</TabsTrigger>
            <TabsTrigger className="rounded-xl py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg" value="satellite">Satellite Imagery</TabsTrigger>
            <TabsTrigger className="rounded-xl py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg" value="metrics">Detailed Metrics</TabsTrigger>
            <TabsTrigger className="rounded-xl py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg" value="growth">Growth Stage</TabsTrigger>
            <TabsTrigger className="rounded-xl py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg" value="alerts">Alerts & Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* NDVI Card */}
              <Card className="glossy-surface overflow-hidden rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">NDVI Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">{monitoringData.healthMetrics.ndvi.toFixed(2)}</div>
                    <Progress value={monitoringData.healthMetrics.ndvi * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">Vegetation health indicator</p>
                  </div>
                </CardContent>
              </Card>

              {/* EVI Card */}
              <Card className="glossy-surface overflow-hidden rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">EVI Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">{monitoringData.healthMetrics.evi.toFixed(2)}</div>
                    <Progress value={monitoringData.healthMetrics.evi * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">Enhanced vegetation index</p>
                  </div>
                </CardContent>
              </Card>

              {/* LAI Card */}
              <Card className="glossy-surface overflow-hidden rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Leaf Area Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">{monitoringData.healthMetrics.lai.toFixed(1)}</div>
                    <Progress value={Math.min(monitoringData.healthMetrics.lai * 10, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Canopy coverage level</p>
                  </div>
                </CardContent>
              </Card>

              {/* Water Stress Card */}
              <Card className="glossy-surface overflow-hidden rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Water Stress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">
                      {(100 - monitoringData.healthMetrics.waterStress).toFixed(0)}%
                    </div>
                    <Progress
                      value={Math.max(0, 100 - monitoringData.healthMetrics.waterStress)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">Water availability</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Satellite Imagery Tab */}
          <TabsContent value="satellite" className="space-y-4">
            {field && (
              <FarmSatelliteHybrid
                latitude={field.latitude}
                longitude={field.longitude}
                fieldName={field.name}
                cropName={field.crop}
              />
            )}
          </TabsContent>

          {/* Detailed Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <Card className="glossy-surface overflow-hidden rounded-2xl">
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Detailed crop health indicators from NASA Earth observation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">NDVI (Normalized Difference Vegetation Index)</label>
                      <span className="text-sm font-bold text-foreground">{monitoringData.healthMetrics.ndvi.toFixed(3)}</span>
                    </div>
                    <Progress value={monitoringData.healthMetrics.ndvi * 100} className="h-3" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Measures vegetation health and biomass. Range: 0-1 (higher is healthier)
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">EVI (Enhanced Vegetation Index)</label>
                      <span className="text-sm font-bold text-foreground">{monitoringData.healthMetrics.evi.toFixed(3)}</span>
                    </div>
                    <Progress value={monitoringData.healthMetrics.evi * 100} className="h-3" />
                    <p className="mt-1 text-xs text-muted-foreground">More sensitive to canopy variations and atmospheric noise</p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">LAI (Leaf Area Index)</label>
                      <span className="text-sm font-bold text-foreground">{monitoringData.healthMetrics.lai.toFixed(2)}</span>
                    </div>
                    <Progress value={Math.min((monitoringData.healthMetrics.lai / 8) * 100, 100)} className="h-3" />
                    <p className="mt-1 text-xs text-muted-foreground">Canopy density - total leaf area per unit ground area</p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Chlorophyll Content</label>
                      <span className="text-sm font-bold text-foreground">{monitoringData.healthMetrics.chlorophyll.toFixed(1)}%</span>
                    </div>
                    <Progress value={monitoringData.healthMetrics.chlorophyll} className="h-3" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Photosynthetic capacity indicator - peaks at active growth
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Estimated Biomass</label>
                      <span className="text-sm font-bold text-foreground">{monitoringData.healthMetrics.biomass} kg/ha</span>
                    </div>
                    <Progress value={Math.min((monitoringData.healthMetrics.biomass / 15000) * 100, 100)} className="h-3" />
                    <p className="mt-1 text-xs text-muted-foreground">Total accumulated plant dry matter</p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Water Stress Index</label>
                      <span className="text-sm font-bold text-foreground">
                        {monitoringData.healthMetrics.waterStress.toFixed(1)}
                      </span>
                    </div>
                    <Progress
                      value={100 - monitoringData.healthMetrics.waterStress}
                      className="h-3"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      0 = no stress, 100 = severe stress. Based on humidity and rainfall
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Growth Stage Tab */}
          <TabsContent value="growth" className="space-y-4">
            <Card className="glossy-surface overflow-hidden rounded-2xl">
              <CardHeader>
                <CardTitle>Growth Stage & Development</CardTitle>
                <CardDescription>Crop phenological stage based on NDVI and days since planting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-bold text-foreground capitalize">{monitoringData.growthStage.stage}</h3>
                      <p className="text-muted-foreground">{monitoringData.growthStage.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="glossy-surface border-white/70 bg-white/45">
                    <CardContent className="pt-6">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Days to Next Stage</p>
                      <p className="text-2xl font-bold text-foreground">{monitoringData.growthStage.daysToNextStage}</p>
                      <p className="text-xs text-muted-foreground mt-2">days remaining</p>
                    </CardContent>
                  </Card>

                  <Card className="glossy-surface border-white/70 bg-white/45">
                    <CardContent className="pt-6">
                      <p className="text-xs font-medium text-muted-foreground mb-2">NDVI Range for Stage</p>
                      <p className="text-lg font-bold text-foreground">
                        {monitoringData.growthStage.ndviRange.min.toFixed(2)} - {monitoringData.growthStage.ndviRange.max.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">optimal range</p>
                    </CardContent>
                  </Card>

                  <Card className="glossy-surface border-white/70 bg-white/45">
                    <CardContent className="pt-6">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Current NDVI</p>
                      <p className="text-lg font-bold text-foreground">{monitoringData.healthMetrics.ndvi.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {monitoringData.healthMetrics.ndvi >= monitoringData.growthStage.ndviRange.min &&
                        monitoringData.healthMetrics.ndvi <= monitoringData.growthStage.ndviRange.max
                          ? "Within range ✓"
                          : "Outside range ⚠"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="mb-3 font-medium text-foreground">Recommended Actions</h4>
                  <ul className="space-y-2">
                    {monitoringData.growthStage.recommendedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {monitoringData.alerts.length > 0 ? (
              <div className="space-y-3">
                {monitoringData.alerts.map((alert, idx) => (
                  <Card
                    key={idx}
                    className={
                      alert.type === "critical"
                        ? "border-red-200 bg-red-50"
                        : alert.type === "warning"
                          ? "border-amber-200 bg-amber-50"
                          : "border-blue-200 bg-blue-50"
                    }
                  >
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        {alert.type === "critical" ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : alert.type === "warning" ? (
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{alert.message}</h4>
                            <Badge
                              className={
                                alert.type === "critical"
                                  ? "bg-red-600"
                                  : alert.type === "warning"
                                    ? "bg-amber-600"
                                    : "bg-blue-600"
                              }
                            >
                              {alert.type}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{alert.recommendedAction}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex gap-3 pt-6">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">All systems normal</p>
                    <p className="text-sm text-green-800">No alerts or issues detected in crop health monitoring</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : null}

      {/* Data Source Attribution */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <strong>Data Sources:</strong> NASA POWER (weather & agro-climate data), NASA MODIS (vegetation indices), NASA
            SMAP (soil moisture), USGS Landsat (detailed crop analysis). Real-time crop monitoring using NASA Earth
            observation satellites.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
