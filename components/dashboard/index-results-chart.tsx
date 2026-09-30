"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

const indexHistory = [
  { date: "Jun 01", ndvi: 0.62, evi: 0.48, ndre: 0.31, savi: 0.44, ndwi: 0.18 },
  { date: "Jun 08", ndvi: 0.66, evi: 0.52, ndre: 0.35, savi: 0.47, ndwi: 0.24 },
  { date: "Jun 15", ndvi: 0.71, evi: 0.58, ndre: 0.41, savi: 0.52, ndwi: 0.29 },
  { date: "Jun 22", ndvi: 0.74, evi: 0.61, ndre: 0.45, savi: 0.55, ndwi: 0.34 },
  { date: "Jun 29", ndvi: 0.78, evi: 0.65, ndre: 0.49, savi: 0.59, ndwi: 0.31 },
]

const config = {
  ndvi: { label: "NDVI", color: "var(--chart-1)" }, evi: { label: "EVI", color: "var(--chart-2)" },
  ndre: { label: "NDRE", color: "var(--chart-3)" }, savi: { label: "SAVI", color: "var(--chart-4)" }, ndwi: { label: "NDWI", color: "var(--chart-5)" },
}

export function IndexResultsChart() {
  return <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
    <Card className="glossy-surface overflow-hidden rounded-3xl border-white/70">
      <CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>Vegetation index results</CardTitle><CardDescription>Weekly satellite signals normalized from -1 to 1 for your primary farm.</CardDescription></div><Badge variant="secondary" className="rounded-full">Latest pass · 29 Jun</Badge></CardHeader>
      <CardContent><ChartContainer config={config} className="h-[280px] w-full"><LineChart accessibilityLayer data={indexHistory} margin={{ left: 4, right: 12, top: 10, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} /><YAxis domain={[0, 1]} tickLine={false} axisLine={false} width={28} /><ChartTooltip content={<ChartTooltipContent indicator="line" />} />{Object.keys(config).map((key, index) => <Line key={key} type="monotone" dataKey={key} stroke={`var(--color-${key})`} strokeWidth={index === 0 ? 3 : 2} dot={false} />)}</LineChart></ChartContainer><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{[["NDVI", "0.78"], ["EVI", "0.65"], ["NDRE", "0.49"], ["SAVI", "0.59"], ["NDWI", "0.31"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/70 bg-white/45 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold text-primary">{value}</p></div>)}</div></CardContent>
    </Card>
    <Card className="glossy-surface overflow-hidden rounded-3xl border-white/70"><CardHeader><CardTitle>Index interpretation</CardTitle><CardDescription>What each signal helps you decide.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{[["NDVI", "Canopy vigor and plant density", "Healthy"], ["EVI", "Dense canopy structure", "Strong"], ["NDRE", "Chlorophyll and nitrogen stress", "Watch"], ["SAVI", "Vegetation in sparse soil", "Stable"], ["NDWI", "Water content and irrigation need", "Low stress"]].map(([name, detail, status]) => <div key={name} className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/45 p-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{name}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{detail}</p><p className="text-xs text-muted-foreground">{name} signal</p></div><Badge variant="outline" className="rounded-full text-[10px]">{status}</Badge></div>)}</CardContent></Card>
  </section>
}
