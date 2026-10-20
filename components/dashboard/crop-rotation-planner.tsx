"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Droplets, Leaf, ShieldCheck, Sprout } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const options = [
  { name: "Legume cover", crop: "Soybean / clover", benefit: "Builds nitrogen naturally and protects soil between cash crops.", water: "Low water demand", score: 94, tone: "bg-emerald-500" },
  { name: "Deep-rooted rotation", crop: "Sorghum / sunflower", benefit: "Breaks compaction and improves infiltration for the next season.", water: "Moderate water demand", score: 88, tone: "bg-amber-500" },
  { name: "Water-wise grain", crop: "Millet / wheat", benefit: "Maintains ground cover while using less irrigation than maize or rice.", water: "Low–moderate water demand", score: 91, tone: "bg-sky-500" },
]

export function CropRotationPlanner({ crops }: { crops: Array<{ name: string; farms?: { name?: string } | null }> }) {
  const [selected, setSelected] = useState(0)
  const currentCrops = useMemo(() => crops.slice(0, 3), [crops])
  const recommendation = options[selected]

  return <Card className="overflow-hidden rounded-3xl border-primary/10 bg-gradient-to-br from-card via-card to-primary/5">
    <CardHeader className="border-b border-border/60 pb-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><Badge variant="secondary" className="mb-2 rounded-full">Resilience planner</Badge><CardTitle className="text-2xl">Choose a protective crop rotation</CardTitle><CardDescription className="mt-1 max-w-2xl">Keep living roots in the soil, spread water demand across seasons, and reduce pest pressure with a diverse sequence.</CardDescription></div><div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"><ShieldCheck className="size-4" /> Soil-first plan</div></div></CardHeader>
    <CardContent className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
      <div className="space-y-3"><p className="text-sm font-semibold">Recommended next-season options</p>{options.map((option, index) => <button key={option.name} type="button" onClick={() => setSelected(index)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${selected === index ? "border-primary bg-primary/10" : "border-border/70 bg-background/60 hover:bg-muted/60"}`}><span className={`mt-1 size-3 shrink-0 rounded-full ${option.tone}`} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{option.name}</span><Badge variant={selected === index ? "default" : "outline"}>{option.score}/100 fit</Badge></span><span className="mt-1 block text-sm text-muted-foreground">{option.crop} · {option.water}</span><span className="mt-2 block text-sm text-foreground/80">{option.benefit}</span></span></button>)}</div>
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground"><p className="text-sm font-semibold text-primary-foreground/75">Selected sequence</p><h3 className="mt-2 text-2xl font-bold">{recommendation.crop}</h3><p className="mt-2 text-sm leading-6 text-primary-foreground/80">{recommendation.benefit}</p><div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1"><div className="rounded-xl bg-white/10 p-3"><Leaf className="size-4" /><p className="mt-2 text-xs text-primary-foreground/70">Soil protection</p><p className="font-semibold">Cover maintained</p></div><div className="rounded-xl bg-white/10 p-3"><Droplets className="size-4" /><p className="mt-2 text-xs text-primary-foreground/70">Water strategy</p><p className="font-semibold">{recommendation.water}</p></div><div className="rounded-xl bg-white/10 p-3"><CheckCircle2 className="size-4" /><p className="mt-2 text-xs text-primary-foreground/70">Long-term fit</p><p className="font-semibold">{recommendation.score}% resilient</p></div></div><Button variant="secondary" className="mt-5 w-full rounded-xl" onClick={() => setSelected((selected + 1) % options.length)}>Compare next option <Sprout data-icon="inline-end" /></Button></div>
    </CardContent>
    {currentCrops.length > 0 && <div className="border-t border-border/60 px-5 py-4 text-sm text-muted-foreground lg:px-6">Based on your current crops: {currentCrops.map((crop) => crop.name).join(" · ")}. Confirm planting windows with your agronomist and local soil tests.</div>}
  </Card>
}
