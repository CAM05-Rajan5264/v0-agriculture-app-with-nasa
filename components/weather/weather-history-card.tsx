"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Cloud, CloudRain, CloudSun, Wind, Droplets, Calendar } from "lucide-react"

interface WeatherHistoryDay {
  date: string
  temperature: number
  tempMin: number
  tempMax: number
  precipitation: number
  humidity: number
  windSpeed: number
  cloudCover: number
  solarRadiation: number
  condition: "sunny" | "partly-cloudy" | "cloudy" | "rainy"
}

interface WeatherHistoryCardProps {
  history: WeatherHistoryDay[]
  farmName: string
}

function getWeatherIcon(condition: string) {
  switch (condition) {
    case "sunny":
      return <Sun className="h-5 w-5 text-amber-500" />
    case "partly-cloudy":
      return <CloudSun className="h-5 w-5 text-amber-400" />
    case "cloudy":
      return <Cloud className="h-5 w-5 text-slate-400" />
    case "rainy":
      return <CloudRain className="h-5 w-5 text-blue-500" />
    default:
      return <Sun className="h-5 w-5 text-amber-500" />
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }
}

export function WeatherHistoryCard({ history, farmName }: WeatherHistoryCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          14-Day Weather History - {farmName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {history.slice(-14).map((day, index) => {
              const { day: dayName, date } = formatDate(day.date)
              return (
                <div
                  key={index}
                  className="flex min-w-[85px] flex-col items-center rounded-lg bg-muted/50 p-3 text-center hover:bg-muted transition-colors"
                >
                  <span className="text-xs font-medium text-muted-foreground">{dayName}</span>
                  <span className="text-xs text-muted-foreground mb-2">{date}</span>

                  <div className="mb-2">{getWeatherIcon(day.condition)}</div>

                  <div className="mb-1">
                    <span className="text-sm font-semibold text-foreground">{day.tempMax.toFixed(0)}°</span>
                    <span className="text-xs text-muted-foreground"> / </span>
                    <span className="text-xs text-muted-foreground">{day.tempMin.toFixed(0)}°</span>
                  </div>

                  {day.precipitation > 0 && (
                    <div className="flex items-center gap-1 text-blue-500">
                      <Droplets className="h-3 w-3" />
                      <span className="text-xs">{day.precipitation.toFixed(1)}mm</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <Wind className="h-3 w-3" />
                    <span className="text-xs">{day.windSpeed.toFixed(0)} m/s</span>
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">{day.humidity.toFixed(0)}% RH</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-1">
            <Sun className="h-3 w-3 text-amber-500" />
            <span>Sunny</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudSun className="h-3 w-3 text-amber-400" />
            <span>Partly Cloudy</span>
          </div>
          <div className="flex items-center gap-1">
            <Cloud className="h-3 w-3 text-slate-400" />
            <span>Cloudy</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudRain className="h-3 w-3 text-blue-500" />
            <span>Rainy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
