"use client"

import { Droplets, Satellite } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Point = { date: string; value: number; kind: "historical" | "forecast" }

export function SoilMoistureTrends({ farmName, points }: { farmName: string; points: Point[] }) {
  const max = Math.max(...points.map((point) => point.value), 1)
  const latest = points.at(-1)?.value ?? 0
  return (
    <Card className="glossy-surface overflow-hidden rounded-3xl border-white/70">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div><Badge variant="secondary" className="mb-2 rounded-full"><Satellite className="mr-1 size-3" /> NASA POWER</Badge><CardTitle className="flex items-center gap-2 text-lg"><Droplets className="size-5 text-sky-600" />Soil moisture trend</CardTitle><CardDescription>{farmName} · historical trend and 7-day outlook</CardDescription></div>
        <div className="text-right"><p className="text-2xl font-bold text-foreground">{latest.toFixed(0)}%</p><p className="text-xs text-muted-foreground">latest estimate</p></div>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-1.5 rounded-2xl bg-white/45 p-4" aria-label={`Soil moisture chart for ${farmName}`}>
          {points.map((point, index) => <div key={`${point.date}-${index}`} className="group flex h-full flex-1 flex-col justify-end gap-1"><div className={`relative min-h-1 rounded-t-md transition-all group-hover:opacity-80 ${point.kind === "forecast" ? "bg-sky-400/75" : "bg-primary/75"}`} style={{ height: `${Math.max(4, (point.value / max) * 100)}%` }} title={`${point.date}: ${point.value.toFixed(0)}%`} /></div>)}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground"><span>{points[0]?.date}</span><div className="flex gap-3"><span><i className="mr-1 inline-block size-2 rounded-full bg-primary" />Historical</span><span><i className="mr-1 inline-block size-2 rounded-full bg-sky-400" />Forecast</span></div><span>{points.at(-1)?.date}</span></div>
      </CardContent>
    </Card>
  )
}

export type SoilMoisturePoint = Point
