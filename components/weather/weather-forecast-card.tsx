"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Cloud, CloudRain, CloudSun, Wind, Droplets, TrendingUp, Umbrella } from "lucide-react"

interface ForecastDay {
  date: string
  dayName: string
  temperature: number
  tempMin: number
  tempMax: number
  precipitation: number
  humidity: number
  windSpeed: number
  cloudCover: number
  condition: "sunny" | "partly-cloudy" | "cloudy" | "rainy"
  precipProbability: number
}

interface WeatherForecastCardProps {
  forecast: ForecastDay[]
  farmName: string
}

function getWeatherIcon(condition: string, size: "sm" | "lg" = "sm") {
  const className = size === "lg" ? "h-8 w-8" : "h-5 w-5"
  switch (condition) {
    case "sunny":
      return <Sun className={`${className} text-amber-500`} />
    case "partly-cloudy":
      return <CloudSun className={`${className} text-amber-400`} />
    case "cloudy":
      return <Cloud className={`${className} text-slate-400`} />
    case "rainy":
      return <CloudRain className={`${className} text-blue-500`} />
    default:
      return <Sun className={`${className} text-amber-500`} />
  }
}

function getConditionLabel(condition: string) {
  switch (condition) {
    case "sunny":
      return "Sunny"
    case "partly-cloudy":
      return "Partly Cloudy"
    case "cloudy":
      return "Cloudy"
    case "rainy":
      return "Rainy"
    default:
      return condition
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function WeatherForecastCard({ forecast, farmName }: WeatherForecastCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          7-Day Weather Forecast - {farmName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {forecast.map((day, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 rounded-lg p-3 ${
                index === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
              }`}
            >
              {/* Day and Date */}
              <div className="w-20">
                <div className="font-semibold text-foreground">{index === 0 ? "Tomorrow" : day.dayName}</div>
                <div className="text-xs text-muted-foreground">{formatDate(day.date)}</div>
              </div>

              {/* Weather Icon and Condition */}
              <div className="flex items-center gap-2 w-36">
                {getWeatherIcon(day.condition, "lg")}
                <span className="text-sm text-foreground">{getConditionLabel(day.condition)}</span>
              </div>

              {/* Temperature */}
              <div className="flex items-center gap-1 w-24">
                <span className="text-lg font-bold text-foreground">{day.tempMax.toFixed(0)}°</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{day.tempMin.toFixed(0)}°</span>
              </div>

              {/* Precipitation Probability */}
              <div className="flex items-center gap-1 w-20">
                <Umbrella className="h-4 w-4 text-blue-500" />
                <span
                  className={`text-sm ${day.precipProbability > 50 ? "text-blue-500 font-medium" : "text-muted-foreground"}`}
                >
                  {day.precipProbability}%
                </span>
              </div>

              {/* Rainfall */}
              {day.precipitation > 0 && (
                <div className="flex items-center gap-1 w-20">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-500">{day.precipitation.toFixed(1)}mm</span>
                </div>
              )}

              {/* Wind */}
              <div className="flex items-center gap-1 w-20">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{day.windSpeed.toFixed(0)} m/s</span>
              </div>

              {/* Humidity */}
              <div className="hidden md:flex items-center gap-1 w-16">
                <span className="text-sm text-muted-foreground">{day.humidity}% RH</span>
              </div>
            </div>
          ))}
        </div>

        {/* Forecast Note */}
        {forecast.length > 0 ? (
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Data Source:</strong> Forecast generated from NASA POWER historical climatology and seasonal trends.
              Based on 30-day historical analysis for improved accuracy.
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> Weather forecast data currently unavailable. NASA POWER API may be temporarily unavailable.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
