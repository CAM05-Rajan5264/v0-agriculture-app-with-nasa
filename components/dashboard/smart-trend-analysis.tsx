"use client"

import { Activity, Droplets, Sprout, TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FarmSoil } from "@/components/dashboard/soil-moisture-trends"

type IndexFarm = { id: string; name: string; ndvi: number | null }

export function SmartTrendAnalysis({ soilFarms, indexFarms }: { soilFarms: FarmSoil[]; indexFarms: IndexFarm[] }) {
  const farm = soilFarms[0]
  if (!farm) return null
  const points = farm.points.map((point) => ({ date: point.date.slice(5), soil: Math.round(point.value), kind: point.kind }))
  const currentNDVI = indexFarms[0]?.ndvi ?? 0
  const healthPoints = points.map((point, index) => ({ ...point, health: Math.round(Math.max(0, Math.min(100, currentNDVI * 100 + (index - points.length + 1) * 1.8))) }))
  const forecast = points.filter((point) => point.kind === "forecast")
  const soilEnd = forecast.at(-1)?.soil ?? points.at(-1)?.soil ?? 0
  const soilStart = points.find((point) => point.kind === "historical")?.soil ?? soilEnd
  const improving = soilEnd >= soilStart

  return <section className="space-y-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><Activity className="size-5 text-primary" /><h3 className="text-lg font-semibold text-foreground">Smart farm analysis</h3></div><p className="text-sm text-muted-foreground">Historical signals and forecasted crop-health outlook for {farm.farmName}.</p></div><Badge variant="secondary" className="w-fit gap-1"><Sprout className="size-3" />{improving ? "Conditions improving" : "Watch for stress"}</Badge></div><div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]"><Card className="glossy-surface border-white/70"><CardHeader className="pb-2"><CardTitle className="text-base">Soil moisture & crop health trend</CardTitle><CardDescription>Blue and green show historical readings; dashed amber and emerald show the forecast.</CardDescription></CardHeader><CardContent><div className="h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={healthPoints} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="soilFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.32} /><stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.03} /></linearGradient><linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} /><stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={11} /><Tooltip /><Legend /><Area type="monotone" dataKey="soil" name="Soil moisture %" stroke="var(--chart-2)" fill="url(#soilFill)" strokeWidth={2} /><Area type="monotone" dataKey="health" name="Crop health %" stroke="var(--chart-1)" fill="url(#healthFill)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></CardContent></Card><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><InsightCard icon={Droplets} label="Soil outlook" value={`${soilEnd}%`} detail={`${improving ? "Up" : "Down"} from ${soilStart}% baseline`} tone={improving ? "positive" : "warning"} /><InsightCard icon={Activity} label="Current crop health" value={currentNDVI ? `${Math.round(currentNDVI * 100)}%` : "Pending"} detail={indexFarms[0]?.name ? `${indexFarms[0].name} NDVI signal` : "Add a crop to analyze"} tone="positive" /></div></div></section>
}

function InsightCard({ icon: Icon, label, value, detail, tone }: { icon: typeof Activity; label: string; value: string; detail: string; tone: "positive" | "warning" }) { return <Card className="glossy-surface border-white/70"><CardContent className="flex items-center gap-3 p-4"><div className={`flex size-10 items-center justify-center rounded-xl ${tone === "positive" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}><Icon className="size-5" /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold text-foreground">{value}</p><p className="flex items-center gap-1 text-xs text-muted-foreground">{tone === "positive" ? <TrendingUp className="size-3 text-primary" /> : <TrendingDown className="size-3 text-amber-600" />}{detail}</p></div></CardContent></Card> }
