"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"
import type { SatelliteNDVI } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus, Satellite, Info } from "lucide-react"
import { calculateVegetationConditionIndex } from "@/lib/nasa-satellite-api"

interface SatelliteNDVIChartProps {
  data: SatelliteNDVI[]
  farmName: string
  cropName?: string
}

export function SatelliteNDVIChart({ data, farmName, cropName }: SatelliteNDVIChartProps) {
  // Handle empty real NASA data - show message instead of fake data
  if (!data || data.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
            <p className="font-medium">No NDVI Data Available</p>
            <p className="mt-1 text-xs">
              NDVI satellite data from NASA is not currently available for this location. This may occur if:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
              <li>The location is outside NASA MODIS/Landsat coverage</li>
              <li>Recent cloud cover has prevented observations</li>
              <li>NASA data services are temporarily unavailable</li>
            </ul>
            <p className="mt-3 text-xs font-medium">We only display real NASA satellite data, never simulated data.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const vci = calculateVegetationConditionIndex(data)

  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2]
  const change = latestData && previousData ? latestData.ndvi - previousData.ndvi : 0

  const conditionColors = {
    excellent: "bg-green-500 text-white",
    good: "bg-emerald-500 text-white",
    normal: "bg-blue-500 text-white",
    stressed: "bg-amber-500 text-white",
    severe_stress: "bg-red-500 text-white",
  }

  const trendIcons = {
    improving: <TrendingUp className="h-4 w-4 text-green-500" />,
    stable: <Minus className="h-4 w-4 text-blue-500" />,
    declining: <TrendingDown className="h-4 w-4 text-red-500" />,
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ndvi: d.ndvi,
    quality: d.quality,
    cloudCover: d.cloudCover,
  }))

  const goodQualityData = data.filter((d) => d.quality === "excellent" || d.quality === "good")
  const avgNDVI = goodQualityData.length > 0 ? goodQualityData.reduce((sum, d) => sum + d.ndvi, 0) / goodQualityData.length : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Latest NDVI</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{latestData?.ndvi.toFixed(3)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{latestData?.date}</p>
              </div>
              <Satellite className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Vegetation Condition</p>
              <Badge className={`mt-2 ${conditionColors[vci.condition]}`}>{vci.condition.replace("_", " ")}</Badge>
              <p className="mt-1 text-xs text-muted-foreground">VCI: {vci.vci}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Trend</p>
              <div className="mt-2 flex items-center gap-2">
                {trendIcons[vci.trend]}
                <span className="font-medium capitalize text-foreground">{vci.trend}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Change: {change > 0 ? "+" : ""}{change.toFixed(3)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">90-Day Average</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{avgNDVI.toFixed(3)}</p>
              <p className="mt-1 text-xs text-muted-foreground">High quality data only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            NDVI Time Series - {farmName} {cropName && `(${cropName})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis domain={[0, 1]} stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "ndvi") return [value.toFixed(3), "NDVI"]
                  return [value, name]
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ndvi"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#ndviGradient)"
                name="NDVI"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <h4 className="mb-2 text-sm font-medium text-foreground">Data Quality Distribution</h4>
              <div className="space-y-1">
                {["excellent", "good", "fair", "poor"].map((quality) => {
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

            <div className="rounded-lg border border-border p-3">
              <h4 className="mb-2 text-sm font-medium text-foreground">NDVI Interpretation</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>0.7 - 1.0: Healthy, dense vegetation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>0.5 - 0.7: Moderate vegetation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>0.3 - 0.5: Sparse vegetation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>&lt; 0.3: Stressed or no vegetation</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <strong>About NDVI from Satellites:</strong> The Normalized Difference Vegetation Index (NDVI) is calculated
          from satellite imagery using visible and near-infrared light. It ranges from -1 to +1, where higher values
          indicate healthier, denser vegetation. This data comes from NASA&apos;s MODIS satellite with 16-day revisit cycle and
          500m resolution. Cloud cover can affect data quality.
        </div>
      </div>
    </div>
  )
}
