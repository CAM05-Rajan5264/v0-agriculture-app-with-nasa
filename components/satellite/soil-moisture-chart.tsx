"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { SoilMoistureData } from "@/lib/types"
import { Droplets, Info, TrendingUp, TrendingDown } from "lucide-react"

interface SoilMoistureChartProps {
  data: SoilMoistureData[]
  farmName: string
}

export function SoilMoistureChart({ data, farmName }: SoilMoistureChartProps) {
  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2]

  const surfaceChange = latestData && previousData ? latestData.surfaceSoilMoisture - previousData.surfaceSoilMoisture : 0
  const rootZoneChange = latestData && previousData ? latestData.rootZoneSoilMoisture - previousData.rootZoneSoilMoisture : 0

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    surface: d.surfaceSoilMoisture,
    rootZone: d.rootZoneSoilMoisture,
    quality: d.quality,
  }))

  const avgSurface = data.reduce((sum, d) => sum + d.surfaceSoilMoisture, 0) / data.length
  const avgRootZone = data.reduce((sum, d) => sum + d.rootZoneSoilMoisture, 0) / data.length

  const getMoistureStatus = (moisture: number) => {
    if (moisture < 15) return { label: "Very Dry", color: "bg-red-500 text-white" }
    if (moisture < 25) return { label: "Dry", color: "bg-amber-500 text-white" }
    if (moisture < 35) return { label: "Adequate", color: "bg-blue-500 text-white" }
    if (moisture < 45) return { label: "Good", color: "bg-emerald-500 text-white" }
    return { label: "Wet", color: "bg-cyan-500 text-white" }
  }

  const surfaceStatus = getMoistureStatus(latestData?.surfaceSoilMoisture || 0)
  const rootZoneStatus = getMoistureStatus(latestData?.rootZoneSoilMoisture || 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Surface Moisture (0-5cm)</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{latestData?.surfaceSoilMoisture.toFixed(1)}%</p>
                <Badge className={`mt-2 ${surfaceStatus.color}`}>{surfaceStatus.label}</Badge>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Root Zone (0-100cm)</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{latestData?.rootZoneSoilMoisture.toFixed(1)}%</p>
              <Badge className={`mt-2 ${rootZoneStatus.color}`}>{rootZoneStatus.label}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Surface Trend</p>
              <div className="mt-2 flex items-center gap-2">
                {surfaceChange > 0 ? (
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                ) : surfaceChange < 0 ? (
                  <TrendingDown className="h-5 w-5 text-amber-500" />
                ) : (
                  <span className="h-5 w-5" />
                )}
                <span className="font-medium text-foreground">
                  {surfaceChange > 0 ? "+" : ""}
                  {surfaceChange.toFixed(1)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">vs previous reading</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">30-Day Average</p>
              <p className="mt-1 text-xl font-bold text-foreground">{avgSurface.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Surface</p>
              <p className="mt-1 text-xl font-bold text-foreground">{avgRootZone.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Root Zone</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Soil Moisture Time Series - {farmName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis domain={[0, 60]} stroke="#6b7280" style={{ fontSize: "12px" }} label={{ value: "Moisture (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "surface") return [`${value.toFixed(1)}%`, "Surface (0-5cm)"]
                  if (name === "rootZone") return [`${value.toFixed(1)}%`, "Root Zone (0-100cm)"]
                  return [value, name]
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="surface"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                name="Surface (0-5cm)"
              />
              <Line
                type="monotone"
                dataKey="rootZone"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: "#06b6d4", r: 4 }}
                name="Root Zone (0-100cm)"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <h4 className="mb-2 text-sm font-medium text-foreground">Moisture Interpretation</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>&lt; 15%: Very dry - urgent irrigation needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>15-25%: Dry - irrigation recommended</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>25-35%: Adequate moisture</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>35-45%: Good moisture level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span>&gt; 45%: Wet - monitor drainage</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <h4 className="mb-2 text-sm font-medium text-foreground">Data Quality</h4>
              <div className="space-y-1">
                {["high", "medium", "low"].map((quality) => {
                  const count = data.filter((d) => d.quality === quality).length
                  const percentage = (count / data.length) * 100
                  return (
                    <div key={quality} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{quality}</span>
                      <span className="font-medium text-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <strong>About SMAP Soil Moisture:</strong> This data comes from NASA&apos;s Soil Moisture Active Passive (SMAP)
          satellite, which uses L-band radar to measure soil moisture globally. Surface moisture (0-5cm depth) responds
          quickly to rainfall and evaporation, while root zone moisture (0-100cm) is more stable and relevant for crop
          water availability. SMAP provides data at 9km spatial resolution with 3-day revisit cycle.
        </div>
      </div>
    </div>
  )
}
