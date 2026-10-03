"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Wind, Sun, CloudRain } from "lucide-react"
import type { NASAWeatherData } from "@/lib/types"

interface WeatherCardProps {
  weather: NASAWeatherData
  locationName?: string
}

export function WeatherCard({ weather, locationName }: WeatherCardProps) {
  const display = (value: number | null, digits = 1, suffix = "") => value === null ? "Unavailable" : `${value.toFixed(digits)}${suffix}`
  const comfort = weather.temperature === null ? null : Math.round(Math.max(0, 100 - Math.abs(weather.temperature - 24) * 3))
  return (
    <Card className="glossy-surface overflow-hidden border-white/70">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Sun className="h-5 w-5 text-amber-500" />
          Current Weather
          {locationName && <span className="text-sm font-normal text-muted-foreground">- {locationName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-white/60 bg-white/45 p-3 sm:grid-cols-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Comfort index</p><p className="mt-1 text-xl font-bold text-primary">{comfort === null ? "Unavailable" : `${comfort}%`}</p><div className="mt-2 h-1.5 rounded-full bg-primary/10"><div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-emerald-400" style={{ width: `${comfort ?? 0}%` }} /></div></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Rain outlook</p><p className="mt-1 text-xl font-bold text-sky-600">{weather.precipitation > 2 ? "Likely" : "Low"}</p><p className="mt-1 text-xs text-muted-foreground">Next field window</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Wind risk</p><p className="mt-1 text-xl font-bold text-amber-600">{weather.windSpeed > 7 ? "Watch" : "Calm"}</p><p className="mt-1 text-xs text-muted-foreground">Spray conditions</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Thermometer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-lg font-semibold text-foreground">{display(weather.temperature, 1, "°C")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Droplets className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="text-lg font-semibold text-foreground">{display(weather.humidity, 0, "%")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <CloudRain className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precipitation</p>
              <p className="text-lg font-semibold text-foreground">{display(weather.precipitation, 1, " mm")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10">
              <Wind className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="text-lg font-semibold text-foreground">{display(weather.windSpeed, 1, " m/s")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solar Radiation</p>
              <p className="text-lg font-semibold text-foreground">{display(weather.solarRadiation, 0, " W/m²")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Droplets className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ET</p>
              <p className="text-lg font-semibold text-foreground">{display(weather.evapotranspiration, 1, " mm/day")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
