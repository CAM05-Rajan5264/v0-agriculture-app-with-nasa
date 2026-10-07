"use client"

import { useState } from "react"
import { AlertTriangle, LocateFixed, Radar, Thermometer, Droplets, CloudRain, Wind } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type WeatherSnapshot = { temperature: number | null; humidity: number | null; precipitation: number | null; windSpeed: number | null }
type ForecastPoint = { dayName: string; precipProbability: number; precipitation: number; tempMax: number; tempMin: number; humidity: number }

export function WeatherIntelligence({ farmName, weather, forecast }: { farmName: string; weather: WeatherSnapshot; forecast: ForecastPoint[] }) {
  const [gpsStatus, setGpsStatus] = useState("Farm coordinates")
  const rainWindow = forecast.find((day) => day.precipProbability >= 50)
  const heatRisk = weather.temperature !== null && weather.temperature >= 35
  const windRisk = weather.windSpeed !== null && weather.windSpeed >= 8
  const humidityRisk = weather.humidity !== null && weather.humidity >= 85
  const alerts = [
    ...(rainWindow ? [`Rain likely ${rainWindow.dayName} (${rainWindow.precipProbability}%) — postpone spraying.`] : []),
    ...(heatRisk ? ["High heat stress risk — irrigate early and inspect leaves."] : []),
    ...(windRisk ? ["Strong wind detected — avoid spraying until conditions settle."] : []),
    ...(humidityRisk ? ["High humidity may increase fungal pressure — scout crops closely."] : []),
  ]
  function useGps() {
    if (!navigator.geolocation) return setGpsStatus("GPS unavailable")
    setGpsStatus("Locating…")
    navigator.geolocation.getCurrentPosition(() => setGpsStatus("GPS location ready"), () => setGpsStatus("Farm coordinates"))
  }
  const value = (number: number | null, suffix = "") => number === null ? "Unavailable" : `${number.toFixed(0)}${suffix}`
  return <section className="space-y-4" aria-label={`${farmName} weather intelligence`}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Radar className="size-5 text-primary" /><h3 className="text-xl font-semibold">Live weather intelligence</h3></div><p className="mt-1 text-sm text-muted-foreground">NASA satellite observations, local coordinates, and field-ready alerts for {farmName}.</p></div><Button variant="outline" size="sm" onClick={useGps}><LocateFixed data-icon="inline-start" />{gpsStatus}</Button></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Card className="glossy-surface"><CardContent className="p-4"><Thermometer className="size-5 text-orange-500" /><p className="mt-3 text-xs text-muted-foreground">Temperature</p><p className="text-2xl font-bold">{value(weather.temperature, "°C")}</p></CardContent></Card><Card className="glossy-surface"><CardContent className="p-4"><Droplets className="size-5 text-sky-500" /><p className="mt-3 text-xs text-muted-foreground">Humidity</p><p className="text-2xl font-bold">{value(weather.humidity, "%")}</p></CardContent></Card><Card className="glossy-surface"><CardContent className="p-4"><CloudRain className="size-5 text-blue-500" /><p className="mt-3 text-xs text-muted-foreground">Rain today</p><p className="text-2xl font-bold">{value(weather.precipitation, " mm")}</p></CardContent></Card><Card className="glossy-surface"><CardContent className="p-4"><Wind className="size-5 text-slate-500" /><p className="mt-3 text-xs text-muted-foreground">Wind speed</p><p className="text-2xl font-bold">{value(weather.windSpeed, " m/s")}</p></CardContent></Card></div>
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"><Card className="glossy-surface"><CardHeader><CardTitle className="text-base">Rain probability radar</CardTitle></CardHeader><CardContent className="space-y-3">{forecast.slice(0, 5).map((day) => <div key={day.dayName} className="flex items-center gap-3"><span className="w-20 text-sm text-muted-foreground">{day.dayName}</span><div className="h-2 flex-1 rounded-full bg-sky-100"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600" style={{ width: `${Math.min(100, day.precipProbability)}%` }} /></div><span className="w-10 text-right text-sm font-semibold">{day.precipProbability}%</span></div>)}</CardContent></Card><Card className="glossy-surface"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="size-4 text-amber-500" />Field alerts</CardTitle></CardHeader><CardContent>{alerts.length ? <div className="flex flex-col gap-2">{alerts.map((alert) => <div key={alert} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{alert}</div>)}</div> : <div className="flex items-center gap-2"><Badge variant="secondary">Clear window</Badge><p className="text-sm text-muted-foreground">No extreme weather risks detected.</p></div>}</CardContent></Card></div>
  </section>
}
