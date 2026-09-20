"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Droplets, Coins, Gamepad2, Leaf, RotateCcw, Sparkles, Sun, Trophy } from "lucide-react"

type Plot = "empty" | "seedling" | "growing" | "ready"

const plotLabels: Record<Plot, string> = {
  empty: "Empty plot",
  seedling: "Seedling",
  growing: "Growing crop",
  ready: "Ready to harvest",
}

const plotColors: Record<Plot, string> = {
  empty: "bg-amber-950/15 border-amber-900/20",
  seedling: "bg-lime-500/15 border-lime-600/30",
  growing: "bg-green-600/20 border-green-700/30",
  ready: "bg-yellow-400/25 border-yellow-500/50",
}

export default function FarmGamePage() {
  const [plots, setPlots] = useState<Plot[]>(Array(9).fill("empty"))
  const [water, setWater] = useState(6)
  const [coins, setCoins] = useState(30)
  const [day, setDay] = useState(1)
  const [message, setMessage] = useState("Plant a crop to start your first season.")

  const readyCount = plots.filter((plot) => plot === "ready").length
  const plantedCount = plots.filter((plot) => plot !== "empty").length
  const progress = Math.round((plantedCount / plots.length) * 100)

  const seasonTip = useMemo(() => {
    if (readyCount > 0) return "Harvest ready plots before the next day to earn bonus coins."
    if (water === 0) return "Your water tank is empty. Refill before advancing the day."
    return "Healthy crops need one watering action each day."
  }, [readyCount, water])

  function plant(index: number) {
    if (plots[index] !== "empty" || coins < 5) return
    const next = [...plots]
    next[index] = "seedling"
    setPlots(next)
    setCoins((value) => value - 5)
    setMessage("A seedling is planted. Keep it watered and watch it grow.")
  }

  function waterPlot(index: number) {
    if (plots[index] === "empty" || plots[index] === "ready" || water === 0) return
    const next = [...plots]
    next[index] = plots[index] === "seedling" ? "growing" : "ready"
    setPlots(next)
    setWater((value) => value - 1)
    setMessage("Nice work. Consistent watering improves your harvest.")
  }

  function harvest(index: number) {
    if (plots[index] !== "ready") return
    const next = [...plots]
    next[index] = "empty"
    setPlots(next)
    setCoins((value) => value + 12)
    setMessage("Harvest collected. Reinvest your coins in new seeds.")
  }

  function nextDay() {
    if (water === 0) {
      setMessage("Refill your water tank before starting another day.")
      return
    }
    setDay((value) => value + 1)
    setWater(6)
    setMessage("A new day begins. Your water tank has been refilled.")
  }

  function resetGame() {
    setPlots(Array(9).fill("empty"))
    setWater(6)
    setCoins(30)
    setDay(1)
    setMessage("Plant a crop to start your first season.")
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary px-6 py-8 text-primary-foreground md:px-10">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Field challenge</Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Grow a smarter farm</h1>
          <p className="mt-3 max-w-xl text-primary-foreground/80">Plan, water, and harvest a small field while learning the rhythm of a healthy growing season.</p>
        </div>
        <Sparkles className="absolute -right-5 -top-5 h-40 w-40 text-primary-foreground/10" aria-hidden="true" />
      </section>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat icon={Sun} label="Season day" value={String(day)} />
        <Stat icon={Coins} label="Farm coins" value={String(coins)} />
        <Stat icon={Droplets} label="Water left" value={String(water)} />
        <Stat icon={Trophy} label="Ready crops" value={String(readyCount)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary" />Your field</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Select a plot, then choose the action it needs.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={resetGame} aria-label="Reset game"><RotateCcw className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted/50 p-3 md:gap-4 md:p-5">
              {plots.map((plot, index) => (
                <div key={index} className={cn("flex min-h-28 flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-colors md:min-h-36", plotColors[plot])}>
                  <Leaf className={cn("mb-2 h-7 w-7", plot === "empty" ? "text-amber-900/40" : "text-primary")} aria-hidden="true" />
                  <span className="text-xs font-medium text-foreground">{plotLabels[plot]}</span>
                  <div className="mt-2 flex gap-1">
                    {plot === "empty" && <Button size="sm" variant="outline" onClick={() => plant(index)} disabled={coins < 5}>Plant</Button>}
                    {(plot === "seedling" || plot === "growing") && <Button size="sm" variant="outline" onClick={() => waterPlot(index)} disabled={water === 0}>Water</Button>}
                    {plot === "ready" && <Button size="sm" onClick={() => harvest(index)}>Harvest</Button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between text-sm"><span className="font-medium">Field planted</span><span className="text-muted-foreground">{plantedCount}/9 plots</span></div>
            <Progress value={progress} className="mt-2" />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20"><CardContent className="p-5"><p className="text-sm font-semibold text-amber-950 dark:text-amber-100">Today&apos;s field note</p><p className="mt-2 text-sm leading-6 text-amber-900/80 dark:text-amber-100/70">{seasonTip}</p><Button className="mt-4 w-full" onClick={nextDay}><Sun className="mr-2 h-4 w-4" />Start next day</Button></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm font-semibold">Farm log</p><p className="mt-2 text-sm leading-6 text-muted-foreground" aria-live="polite">{message}</p><div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">Seeds cost 5 coins. Each harvest earns 12 coins. Watering twice grows a crop to harvest.</div></CardContent></Card>
        </aside>
      </div>
    </main>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Sun; label: string; value: string }) {
  return <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p></div></CardContent></Card>
}
