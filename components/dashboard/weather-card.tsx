"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Wind, Sun, CloudRain } from "lucide-react"
import type { NASAWeatherData } from "@/lib/types"

interface WeatherCardProps {
  weather: NASAWeatherData
  locationName?: string
}

export function WeatherCard({ weather, locationName }: WeatherCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Sun className="h-5 w-5 text-amber-500" />
          Current Weather
          {locationName && <span className="text-sm font-normal text-muted-foreground">- {locationName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Thermometer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-lg font-semibold text-foreground">{weather.temperature.toFixed(1)}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Droplets className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="text-lg font-semibold text-foreground">{weather.humidity.toFixed(0)}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <CloudRain className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precipitation</p>
              <p className="text-lg font-semibold text-foreground">{weather.precipitation.toFixed(1)} mm</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10">
              <Wind className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="text-lg font-semibold text-foreground">{weather.windSpeed.toFixed(1)} m/s</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solar Radiation</p>
              <p className="text-lg font-semibold text-foreground">{weather.solarRadiation.toFixed(0)} W/m²</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Droplets className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ET</p>
              <p className="text-lg font-semibold text-foreground">{weather.evapotranspiration.toFixed(1)} mm/day</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
