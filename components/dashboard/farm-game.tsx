"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, Leaf, RotateCcw, Sparkles, Sun, Wheat } from "lucide-react"

type Plot = { crop: string | null; growth: number; water: number; ready: boolean }
const crops = [
  { name: "Tomato", icon: "🍅", color: "bg-rose-500", days: 3 },
  { name: "Wheat", icon: "🌾", color: "bg-amber-400", days: 2 },
  { name: "Lettuce", icon: "🥬", color: "bg-emerald-500", days: 2 },
]
const initialPlots: Plot[] = Array.from({ length: 12 }, () => ({ crop: null, growth: 0, water: 0, ready: false }))

export function FarmGame() {
  const [plots, setPlots] = useState(initialPlots)
  const [selectedCrop, setSelectedCrop] = useState(crops[0])
  const [coins, setCoins] = useState(120)
  const [harvests, setHarvests] = useState(0)
  const [message, setMessage] = useState("Choose a seed, plant a plot, then water it to grow your farm.")

  const progress = useMemo(() => plots.filter((plot) => plot.ready).length, [plots])
  const updatePlot = (index: number, action: "plant" | "water" | "harvest") => {
    setPlots((current) => current.map((plot, plotIndex) => {
      if (plotIndex !== index) return plot
      if (action === "plant" && !plot.crop) { setMessage(`${selectedCrop.name} planted. Give it water and sunlight.`); return { crop: selectedCrop.name, growth: 0, water: 0, ready: false } }
      if (action === "water" && plot.crop && !plot.ready) { const growth = Math.min(100, plot.growth + 50); setMessage(growth >= 100 ? `${plot.crop} is ready to harvest.` : `${plot.crop} received water and is growing.`); return { ...plot, growth, water: 100, ready: growth >= 100 } }
      if (action === "harvest" && plot.ready) { setCoins((value) => value + 25); setHarvests((value) => value + 1); setMessage(`Harvest collected. You earned 25 coins.`); return { crop: null, growth: 0, water: 0, ready: false } }
      return plot
    }))
  }

  const reset = () => { setPlots(initialPlots); setCoins(120); setHarvests(0); setMessage("Your field is ready for a new season.") }

  return <div className="space-y-6">
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-emerald-950 via-green-900 to-lime-800 p-6 text-white shadow-xl md:p-8">
      <div className="absolute -right-10 -top-16 size-56 rounded-full bg-lime-300/15 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Badge className="mb-3 border-white/20 bg-white/10 text-lime-100"><Sparkles className="mr-1 size-3" /> Farm simulation</Badge><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Grow a smarter little farm</h1><p className="mt-2 max-w-xl text-sm leading-6 text-green-100">Practice planting, irrigation, and harvest timing in a quick interactive field game.</p></div><div className="flex gap-3"><div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><p className="text-xs text-green-100">Coins</p><p className="text-2xl font-bold">{coins}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><p className="text-xs text-green-100">Harvests</p><p className="text-2xl font-bold">{harvests}</p></div></div></div>
    </div>
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit"><CardHeader><CardTitle className="text-base">Seed shed</CardTitle></CardHeader><CardContent className="space-y-3">{crops.map((crop) => <button key={crop.name} onClick={() => setSelectedCrop(crop)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selectedCrop.name === crop.name ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}><span className="text-2xl">{crop.icon}</span><span className="flex-1"><span className="block text-sm font-medium">{crop.name}</span><span className="text-xs text-muted-foreground">{crop.days} growth cycles</span></span>{selectedCrop.name === crop.name && <Leaf className="size-4 text-primary" />}</button>)}<div className="rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground"><Sun className="mb-1 size-4 text-amber-500" />Each watering action advances growth. Harvest when the plot turns bright green.</div><Button variant="outline" className="w-full" onClick={reset}><RotateCcw className="mr-2 size-4" />Reset season</Button></CardContent></Card>
      <Card className="overflow-hidden"><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-base">Your field</CardTitle><p className="mt-1 text-sm text-muted-foreground">{progress}/12 plots ready to harvest</p></div><Badge variant="secondary">{message}</Badge></CardHeader><CardContent><div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:gap-4">{plots.map((plot, index) => <button key={index} onClick={() => updatePlot(index, plot.ready ? "harvest" : plot.crop ? "water" : "plant")} className={`group relative aspect-square overflow-hidden rounded-2xl border-2 p-2 transition hover:-translate-y-0.5 ${plot.ready ? "border-lime-400 bg-lime-100" : plot.crop ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-100/70"}`}><div className="absolute inset-x-2 bottom-2 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${plot.growth}%` }} /></div>{plot.crop ? <><span className="text-4xl transition group-hover:scale-110">{crops.find((crop) => crop.name === plot.crop)?.icon}</span><span className="absolute left-2 top-2 text-[10px] font-medium text-emerald-800">{plot.ready ? "Harvest" : plot.water ? "Growing" : "Needs water"}</span>{!plot.ready && <Droplets className="absolute right-2 top-2 size-4 text-sky-500" />}</> : <span className="text-2xl text-amber-700/50">+</span>}</button>)}</div><div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground"><Wheat className="size-4 text-primary" />{message}</div></CardContent></Card>
    </div>
  </div>
}

export default FarmGame
