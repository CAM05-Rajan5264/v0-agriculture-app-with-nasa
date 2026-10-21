"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Droplets, Leaf, Satellite, ShieldCheck, SlidersHorizontal, Sprout } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const strategies = [
  { name: "Legume cover → water-wise grain", crops: "Clover / soybean → millet / wheat", soil: "Adds nitrogen and keeps living roots between cash crops.", water: "Low", resilience: 93, waterScore: 95, soilScore: 96, crops: ["legume", "grain"] },
  { name: "Deep-rooted break → legume", crops: "Sorghum / sunflower → clover / soybean", soil: "Relieves compaction, improves infiltration, then rebuilds nitrogen.", water: "Moderate", resilience: 89, waterScore: 78, soilScore: 94, crops: ["deep-rooted", "legume"] },
  { name: "Cover crop → diversified grain", crops: "Rye / oats → wheat + pulse", soil: "Maintains cover, spreads pest pressure, and protects topsoil from erosion.", water: "Low–moderate", resilience: 91, waterScore: 88, soilScore: 91, crops: ["cover", "grain"] },
]

export function CropRotationPlanner({ crops, observations = [] }: { crops: Array<{ name: string; farms?: { name?: string } | null }>; observations?: Array<{ farmName: string; ndvi: number; soilMoisture: number }> }) {
  const [selected, setSelected] = useState(0)
  const [waterPriority, setWaterPriority] = useState(70)
  const [soilPriority, setSoilPriority] = useState(85)
  const [adaptationPriority, setAdaptationPriority] = useState(80)
  const [soilTexture, setSoilTexture] = useState("loam")
  const strategy = strategies[selected]
  const observation = observations[0]
  const soilAdjustment = soilTexture === "sandy" && strategy.water === "Low" ? 5 : soilTexture === "clay" && strategy.crops[0] === "deep-rooted" ? 6 : soilTexture === "clay" ? -4 : 0
  const observationAdjustment = observation
    ? observation.soilMoisture < 35 && strategy.water === "Low"
      ? 6
      : observation.ndvi < 0.45 && strategy.soilScore >= 94
        ? 5
        : 0
    : 0
  const adjustedScore = useMemo(
    () => Math.min(99, Math.max(1, Math.round((strategy.waterScore * waterPriority + strategy.soilScore * soilPriority + strategy.resilience * adaptationPriority + soilAdjustment * 20 + observationAdjustment * 20) / (waterPriority + soilPriority + adaptationPriority)))),
    [strategy, waterPriority, soilPriority, adaptationPriority, soilAdjustment, observationAdjustment],
  )
  const signal = !observation
    ? "Connect a farm with NASA observations to refine this recommendation."
    : observation.soilMoisture < 35
      ? "Dryness signal: prioritize low-water crops, residue, and living ground cover."
      : observation.ndvi < 0.45
        ? "Crop-health signal: add a restorative break crop before another high-demand crop."
        : "Earth-observation signal: vegetation is stable; diversify to protect that baseline."

  return <Card className="overflow-hidden rounded-3xl border-primary/10 bg-gradient-to-br from-card via-card to-primary/5">
    <CardHeader className="border-b border-border/60 pb-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><Badge variant="secondary" className="mb-2 rounded-full">NASA + soil decision support</Badge><CardTitle className="text-2xl">Explore a resilient crop rotation</CardTitle><CardDescription className="mt-1 max-w-2xl">Compare sequences using Earth observations, local soil context, crop traits, and your priorities. This is a planning aid, not a replacement for a soil test.</CardDescription></div><div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"><ShieldCheck className="size-4" /> {adjustedScore}/100 fit</div></div></CardHeader>
    <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_1.05fr] lg:p-6">
      <div className="space-y-3"><p className="text-sm font-semibold">Strategy options</p>{strategies.map((item, index) => <button key={item.name} type="button" onClick={() => setSelected(index)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${selected === index ? "border-primary bg-primary/10" : "border-border/70 bg-background/60 hover:bg-muted/60"}`}><span className={`mt-1 size-3 shrink-0 rounded-full ${index === 0 ? "bg-emerald-500" : index === 1 ? "bg-amber-500" : "bg-sky-500"}`} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{item.name}</span><Badge variant={selected === index ? "default" : "outline"}>{item.resilience}/100 base</Badge></span><span className="mt-1 block text-sm text-muted-foreground">{item.crops} · {item.water} water demand</span><span className="mt-2 block text-sm text-foreground/80">{item.soil}</span></span></button>)}</div>
      <div className="space-y-4"><div className="rounded-2xl bg-muted/50 p-4"><div className="mb-3 flex items-center gap-2 font-semibold"><SlidersHorizontal className="size-4 text-primary" /> Farmer priorities</div><div className="grid gap-4 sm:grid-cols-3"><div><Label>Water conservation: {waterPriority}%</Label><input aria-label="Water conservation priority" className="mt-3 w-full accent-primary" type="range" value={waterPriority} onChange={(event) => setWaterPriority(Number(event.target.value))} max={100} step={5} /></div><div><Label>Soil protection: {soilPriority}%</Label><input aria-label="Soil protection priority" className="mt-3 w-full accent-primary" type="range" value={soilPriority} onChange={(event) => setSoilPriority(Number(event.target.value))} max={100} step={5} /></div><div><Label>Climate adaptation: {adaptationPriority}%</Label><input aria-label="Climate adaptation priority" className="mt-3 w-full accent-primary" type="range" value={adaptationPriority} onChange={(event) => setAdaptationPriority(Number(event.target.value))} max={100} step={5} /></div></div><div className="mt-4"><Label>Local soil texture</Label><Select value={soilTexture} onValueChange={setSoilTexture}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loam">Loam — balanced infiltration</SelectItem><SelectItem value="sandy">Sandy — fast drainage</SelectItem><SelectItem value="clay">Clay — compaction risk</SelectItem></SelectContent></Select></div></div>
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground"><div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/75"><Satellite className="size-4" /> Selected planning pathway</div><h3 className="mt-2 text-2xl font-bold">{strategy.crops}</h3><p className="mt-2 text-sm leading-6 text-primary-foreground/80">{strategy.soil}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-white/10 p-3"><Leaf className="size-4" /><p className="mt-2 text-xs text-primary-foreground/70">Soil</p><p className="font-semibold">{soilTexture} fit</p></div><div className="rounded-xl bg-white/10 p-3"><Droplets className="size-4" /><p className="mt-2 text-xs text-primary-foreground/70">Water</p><p className="font-semibold">{strategy.water}</p></div><div className="rounded-xl bg-white/10 p-3"><CheckCircle2 className="size-4" /><p className="mt-2 text-xs text-primary-foreground/70">Fit score</p><p className="font-semibold">{adjustedScore}/100</p></div></div><Button variant="secondary" className="mt-5 w-full rounded-xl" onClick={() => setSelected((selected + 1) % strategies.length)}>Compare next strategy <Sprout data-icon="inline-end" /></Button></div>
        <p className="rounded-xl border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">{signal}</p>
      </div>
    </CardContent>
    <div className="border-t border-border/60 px-5 py-4 text-sm text-muted-foreground lg:px-6">{observation ? `NASA snapshot: ${observation.farmName} · NDVI ${(observation.ndvi * 100).toFixed(0)}% · root-zone moisture ${observation.soilMoisture.toFixed(0)}%.` : "No NASA snapshot is available yet."} {crops.length > 0 && `Current crops: ${crops.slice(0, 3).map((crop) => crop.name).join(" · ")}.`}</div>
  </Card>
}
