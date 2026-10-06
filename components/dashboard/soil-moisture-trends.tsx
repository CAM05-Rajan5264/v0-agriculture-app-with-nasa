"use client"

import { Droplets, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SoilPoint = { date: string; value: number; kind: "historical" | "forecast" }
type FarmSoil = { farmId: string; farmName: string; points: SoilPoint[] }

function Meter({ value, label, tone }: { value: number; label: string; tone: "sky" | "amber" }) {
  const color = tone === "sky" ? "bg-sky-500" : "bg-amber-400"
  return <div className="space-y-1.5"><div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="font-semibold text-foreground">{Math.round(value)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted/70"><div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>
}

export function SoilMoistureTrends({ farms }: { farms: FarmSoil[] }) {
  if (!farms.length) return null
  return <section className="space-y-4"><div><h3 className="text-lg font-semibold text-foreground">Soil moisture outlook</h3><p className="text-sm text-muted-foreground">NASA POWER surface moisture history with a seven-day trend outlook for each farm.</p></div><div className="grid gap-4 lg:grid-cols-2">{farms.map((farm) => { const history = farm.points.filter((point) => point.kind === "historical"); const forecast = farm.points.filter((point) => point.kind === "forecast"); const current = history.at(-1)?.value ?? 0; const forecastEnd = forecast.at(-1)?.value ?? current; const min = Math.min(...farm.points.map((point) => point.value)); const max = Math.max(...farm.points.map((point) => point.value)); return <Card key={farm.farmId} className="glossy-surface overflow-hidden border-white/70"><CardHeader className="pb-3"><CardTitle className="flex items-center justify-between gap-3 text-base"><span className="flex items-center gap-2"><Droplets className="size-4 text-sky-500" />{farm.farmName}</span><span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">{forecastEnd >= current ? <TrendingUp className="size-3 text-primary" /> : <TrendingDown className="size-3 text-amber-500" />}{forecastEnd >= current ? "Improving" : "Drying"}</span></CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Meter value={current} label="Current moisture" tone="sky" /><Meter value={forecastEnd} label="7-day outlook" tone="amber" /></div><div className="flex h-24 items-end gap-1 rounded-xl bg-white/50 p-3" aria-label={`${farm.farmName} soil moisture trend chart`}>{farm.points.map((point, index) => <div key={`${point.date}-${index}`} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${point.date}: ${Math.round(point.value)}%`}><div className={`w-full rounded-t-md ${point.kind === "forecast" ? "bg-amber-400/80" : "bg-sky-500/80"}`} style={{ height: `${Math.max(8, ((point.value - min) / Math.max(1, max - min)) * 70 + 15)}%` }} /></div>)}</div><div className="flex justify-between text-[10px] text-muted-foreground"><span>{history[0]?.date ?? "History"}</span><span>Today</span><span>{forecast.at(-1)?.date ?? "Forecast"}</span></div><p className="text-[11px] text-muted-foreground">Blue bars show observed history. Amber bars show the forecast trend.</p></CardContent></Card> })}</div></section>
}

export type { FarmSoil }
