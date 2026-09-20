"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { CalendarDays, Coins, Droplets, Leaf, RotateCcw, Sprout, Sun, Trophy, Wind } from "lucide-react"

type Crop = "empty" | "millet" | "tomato" | "beans"
type Plot = { crop: Crop; growth: number; watered: boolean }

const crops = {
  millet: { name: "Millet", cost: 8, reward: 22, water: 1, color: "bg-amber-100 border-amber-300", icon: "M" },
  tomato: { name: "Tomato", cost: 12, reward: 34, water: 2, color: "bg-red-50 border-red-200", icon: "T" },
  beans: { name: "Beans", cost: 10, reward: 28, water: 1, color: "bg-emerald-50 border-emerald-200", icon: "B" },
} as const

const weather = [
  { name: "Clear skies", detail: "Warm and bright", icon: Sun, bonus: "Crops grow +1", growth: 1 },
  { name: "Light rain", detail: "Save your tank", icon: Droplets, bonus: "Water costs 0", growth: 1 },
  { name: "Windy day", detail: "Protect young crops", icon: Wind, bonus: "Harvest +5 coins", growth: 0 },
]

const freshPlots = (): Plot[] => Array.from({ length: 12 }, () => ({ crop: "empty", growth: 0, watered: false }))

export default function FarmGamePage() {
  const [plots, setPlots] = useState<Plot[]>(freshPlots)
  const [selectedCrop, setSelectedCrop] = useState<Crop>("millet")
  const [coins, setCoins] = useState(80)
  const [water, setWater] = useState(7)
  const [day, setDay] = useState(1)
  const [weatherIndex, setWeatherIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState("Choose a crop and prepare your first plot.")

  const currentWeather = weather[weatherIndex]
  const ready = plots.filter((plot) => plot.growth >= 3).length
  const planted = plots.filter((plot) => plot.crop !== "empty").length
  const seasonProgress = Math.min(100, Math.round((day / 10) * 100))
  const bestCrop = useMemo(() => Object.values(crops).sort((a, b) => (b.reward - b.cost) - (a.reward - a.cost))[0], [])

  function plant(index: number) {
    const crop = crops[selectedCrop]
    if (plots[index].crop !== "empty") return setMessage("That plot is already in use. Choose an empty plot.")
    if (coins < crop.cost) return setMessage("Not enough coins. Harvest a crop or choose a lower-cost seed.")
    setPlots((value) => value.map((plot, i) => i === index ? { crop: selectedCrop, growth: 0, watered: false } : plot))
    setCoins((value) => value - crop.cost)
    setMessage(`${crop.name} planted. Water it before ending the day.`)
  }

  function waterPlot(index: number) {
    const plot = plots[index]
    if (plot.crop === "empty" || plot.growth >= 3 || plot.watered) return
    const cost = currentWeather.name === "Light rain" ? 0 : crops[plot.crop].water
    if (water < cost) return setMessage("Your tank is low. End the day to refill it.")
    setPlots((value) => value.map((item, i) => i === index ? { ...item, watered: true } : item))
    setWater((value) => value - cost)
    setMessage(currentWeather.name === "Light rain" ? "Rain watered the plot for free." : "Plot watered. It is ready to grow overnight.")
  }

  function harvest(index: number) {
    const plot = plots[index]
    if (plot.growth < 3 || plot.crop === "empty") return
    const reward = crops[plot.crop].reward + (currentWeather.name === "Windy day" ? 5 : 0)
    setPlots((value) => value.map((item, i) => i === index ? { crop: "empty", growth: 0, watered: false } : item))
    setCoins((value) => value + reward)
    setScore((value) => value + reward)
    setMessage(`Harvest sold for ${reward} coins. Great field planning.`)
  }

  function endDay() {
    const next = plots.map((plot) => plot.crop === "empty" ? plot : { ...plot, growth: plot.watered ? Math.min(3, plot.growth + 1 + currentWeather.growth) : plot.growth, watered: false })
    setPlots(next)
    setDay((value) => value + 1)
    setWater(7)
    setWeatherIndex((value) => (value + 1) % weather.length)
    setMessage("A new day begins. Check the forecast and plan your next action.")
  }

  function reset() { setPlots(freshPlots()); setSelectedCrop("millet"); setCoins(80); setWater(7); setDay(1); setWeatherIndex(0); setScore(0); setMessage("Choose a crop and prepare your first plot.") }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground md:px-10 md:py-10">
        <div className="relative z-10 max-w-2xl"><Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Season 01 · Strategy game</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">Harvest smarter, not harder.</h1><p className="mt-3 text-primary-foreground/80">Run a ten-day farm season. Read the forecast, balance water, and turn every plot into a profitable harvest.</p></div>
        <Sprout className="absolute -bottom-8 -right-4 h-48 w-48 rotate-12 text-primary-foreground/10" aria-hidden="true" />
      </section>

      <div className="grid gap-3 sm:grid-cols-4"><Stat icon={CalendarDays} label="Season day" value={`${day} / 10`} /><Stat icon={Coins} label="Coins" value={String(coins)} /><Stat icon={Droplets} label="Water tank" value={`${water} / 7`} /><Stat icon={Trophy} label="Harvest score" value={String(score)} /></div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden"><CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-muted/20"><div><CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" />Your field map</CardTitle><p className="mt-1 text-sm text-muted-foreground">Click an empty plot to plant, then water growing crops.</p></div><Button size="icon" variant="ghost" onClick={reset} aria-label="Reset season"><RotateCcw className="h-4 w-4" /></Button></CardHeader><CardContent className="p-4 md:p-6"><div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{plots.map((plot, index) => { const crop = plot.crop !== "empty" ? crops[plot.crop] : null; return <div key={index} className={cn("min-h-32 rounded-2xl border-2 p-3 transition-all", crop?.color ?? "border-dashed border-amber-900/20 bg-amber-950/5")}><div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Plot {index + 1}</span>{plot.growth > 0 && <span className="text-xs font-medium text-primary">{plot.growth}/3</span>}</div><div className="flex h-16 items-center justify-center"><div className={cn("flex h-11 w-11 items-center justify-center rounded-full border bg-background text-lg font-bold", crop ? "text-primary" : "text-muted-foreground/40")}>{crop?.icon ?? "+"}</div></div>{plot.crop === "empty" ? <Button className="w-full" size="sm" variant="outline" onClick={() => plant(index)}>Plant {crops[selectedCrop].name}</Button> : plot.growth >= 3 ? <Button className="w-full" size="sm" onClick={() => harvest(index)}>Harvest</Button> : <Button className="w-full" size="sm" variant="outline" disabled={plot.watered || water === 0} onClick={() => waterPlot(index)}>{plot.watered ? "Watered" : "Water plot"}</Button>}</div> })}</div><div className="mt-5 flex justify-between text-sm"><span className="font-medium">Season progress</span><span className="text-muted-foreground">{planted} / 12 plots planted</span></div><Progress className="mt-2" value={seasonProgress} /></CardContent></Card>

        <aside className="space-y-4"><Card className="border-primary/20"><CardHeader><CardTitle className="text-base">Today&apos;s forecast</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><currentWeather.icon className="h-6 w-6" /></div><div><p className="font-semibold">{currentWeather.name}</p><p className="text-sm text-muted-foreground">{currentWeather.detail}</p></div></div><p className="mt-4 rounded-lg bg-accent p-3 text-sm text-accent-foreground">Strategy bonus: {currentWeather.bonus}</p><Button className="mt-4 w-full" onClick={endDay} disabled={day >= 10}><Sun className="mr-2 h-4 w-4" />End day {day}</Button></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Seed market</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(crops).map(([key, crop]) => <button key={key} type="button" onClick={() => setSelectedCrop(key as Crop)} className={cn("flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors hover:bg-muted", selectedCrop === key && "border-primary bg-primary/5")}><span><span className="block font-medium">{crop.name}</span><span className="text-xs text-muted-foreground">Cost {crop.cost} · Harvest {crop.reward}</span></span><span className="rounded-full bg-muted px-2 py-1 text-xs">{selectedCrop === key ? "Selected" : "Choose"}</span></button>)}</CardContent></Card><Card className="bg-amber-50/70 dark:bg-amber-950/20"><CardContent className="p-4"><p className="text-sm font-semibold">Field note</p><p className="mt-2 text-sm leading-6 text-muted-foreground" aria-live="polite">{message}</p><p className="mt-3 border-t pt-3 text-xs text-muted-foreground">Tip: {bestCrop.name} gives the best margin this season. Ready crops are worth more than unplanted plots.</p></CardContent></Card></aside>
      </div>
    </main>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Sun; label: string; value: string }) { return <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p></div></CardContent></Card> }
