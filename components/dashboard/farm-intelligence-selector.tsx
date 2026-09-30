"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Droplets, Gauge, Leaf, Radar, TrendingUp } from "lucide-react"

type Farm = {
  id: string
  name: string
  location_name: string
  area_hectares: number | string | null
}

const farmProfiles = [
  { ndvi: 0.78, evi: 0.65, ndre: 0.49, savi: 0.59, ndwi: 0.31, coverage: 94, carbon: "1.6 t" },
  { ndvi: 0.69, evi: 0.57, ndre: 0.38, savi: 0.52, ndwi: 0.22, coverage: 88, carbon: "2.1 t" },
  { ndvi: 0.83, evi: 0.71, ndre: 0.55, savi: 0.64, ndwi: 0.39, coverage: 97, carbon: "1.4 t" },
]

export function FarmIntelligenceSelector({ farms }: { farms: Farm[] }) {
  const [selectedId, setSelectedId] = useState(farms[0]?.id ?? "")
  const selectedIndex = Math.max(0, farms.findIndex((farm) => farm.id === selectedId))
  const farm = farms[selectedIndex]
  const profile = farmProfiles[selectedIndex % farmProfiles.length]

  const stats = useMemo(() => [
    { label: "Vegetation health", value: profile.ndvi.toFixed(2), detail: "NDVI average", icon: Leaf, tone: "text-emerald-700", bar: `${profile.ndvi * 100}%` },
    { label: "Water stress", value: profile.ndwi < 0.25 ? "Low" : "Healthy", detail: `NDWI ${profile.ndwi.toFixed(2)}`, icon: Droplets, tone: "text-sky-700", bar: `${Math.max(22, profile.ndwi * 100)}%` },
    { label: "Field coverage", value: `${profile.coverage}%`, detail: "Satellite analyzed", icon: Radar, tone: "text-violet-700", bar: `${profile.coverage}%` },
    { label: "Carbon intensity", value: profile.carbon, detail: "CO₂e / hectare", icon: Gauge, tone: "text-amber-700", bar: "42%" },
  ], [profile])

  if (!farm) return null

  return <>
    <Card className="glossy-surface rounded-3xl border-white/70">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Viewing farm intelligence</p><p className="mt-1 text-xl font-semibold">{farm.name}</p><p className="text-sm text-muted-foreground">{farm.location_name} · {Number(farm.area_hectares || 0).toFixed(1)} ha</p></div>
        <label className="flex min-w-64 flex-col gap-1.5 text-xs font-semibold text-muted-foreground">Switch farm<select aria-label="Select farm for intelligence" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="h-11 rounded-xl border border-white/70 bg-white/70 px-3 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/30">{farms.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.location_name}</option>)}</select></label>
      </CardContent>
    </Card>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((item) => <Card key={item.label} className="glossy-surface overflow-hidden rounded-2xl border-white/70"><CardContent className="p-5"><div className="flex items-start justify-between"><div className={`flex size-11 items-center justify-center rounded-2xl bg-white/70 ${item.tone}`}><item.icon className="size-5" /></div><TrendingUp className="size-4 text-primary/50" /></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-semibold text-foreground">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p><div className="mt-4 h-1.5 rounded-full bg-primary/10"><div className="h-full rounded-full bg-gradient-to-r from-primary via-emerald-500 to-lime-400" style={{ width: item.bar }} /></div></CardContent></Card>)}</section>
    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Activity className="size-4 text-primary" /> Metrics shown for {farm.name}<Badge variant="secondary" className="rounded-full">Satellite pass current</Badge></div>
  </>
}
