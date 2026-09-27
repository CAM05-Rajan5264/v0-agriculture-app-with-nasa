"use client"

import { Activity, ArrowDownRight, ArrowUpRight, Gauge, Sparkles, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const history = [48, 53, 51, 62, 60, 71, 76, 73, 82, 88]
const forecast = [88, 84, 91, 86, 94]

function TrendBars({ values, accent = "bg-primary" }: { values: number[]; accent?: string }) {
  return (
    <div className="flex h-12 items-end gap-1.5" aria-label="Trend chart">
      {values.map((value, index) => (
        <span key={`${value}-${index}`} className={`min-w-1.5 flex-1 rounded-t-full ${accent} opacity-80 transition-all hover:opacity-100`} style={{ height: `${value}%` }} />
      ))}
    </div>
  )
}

function Speedometer({ label, value, tone = "primary" }: { label: string; value: number; tone?: "primary" | "amber" | "sky" }) {
  const toneClass = tone === "amber" ? "text-amber-500" : tone === "sky" ? "text-sky-500" : "text-primary"
  const track = tone === "amber" ? "oklch(0.78 0.16 75)" : tone === "sky" ? "oklch(0.68 0.14 220)" : "oklch(0.52 0.16 160)"
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-16 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${track} ${value * 3.6}deg, oklch(0.93 0.02 150) 0deg)` }}>
        <div className="grid size-12 place-items-center rounded-full bg-card/95 shadow-inner">
          <span className={`text-sm font-bold ${toneClass}`}>{value}%</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{value >= 75 ? "On track" : "Needs attention"}</p>
      </div>
    </div>
  )
}

export function GlossyInsights() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <Card className="glossy-surface overflow-hidden border-white/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-primary" /> Farm performance</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Historical health signal and five-day outlook</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"><ArrowUpRight className="size-3" /> 12.4%</span>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-4xl font-bold tracking-tight">82.6</p><p className="text-xs text-muted-foreground">composite field score</p></div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="size-2 rounded-full bg-primary" /> History <span className="size-2 rounded-full bg-amber-400" /> Forecast</div>
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
            <div><TrendBars values={history} /><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>10 days ago</span><span>Today</span></div></div>
            <div className="flex h-12 items-end gap-1.5 border-l border-border pl-4"><TrendBars values={forecast} accent="bg-amber-400" /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="glossy-surface border-white/70">
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Gauge className="size-4 text-primary" /> Field meters</CardTitle><p className="mt-1 text-xs text-muted-foreground">Live readiness indicators</p></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><Speedometer label="Crop vitality" value={86} /><Speedometer label="Water balance" value={72} tone="sky" /><Speedometer label="Harvest readiness" value={64} tone="amber" /></CardContent>
      </Card>
    </div>
  )
}

export function GlossySignal({ label, value, delta, description }: { label: string; value: string; delta: string; description: string }) {
  const positive = !delta.startsWith("-")
  return <div className="glossy-surface rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span><Activity className="size-4 text-primary/70" /></div><div className="mt-3 flex items-end justify-between gap-2"><span className="text-2xl font-bold">{value}</span><span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${positive ? "text-primary" : "text-amber-600"}`}>{positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{delta}</span></div><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>
}

export function GlossyStatus() {
  return <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-white/60 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"><Sparkles className="size-3.5 text-amber-500" />Live NASA signals synced</div>
}

export { TrendBars, Speedometer }
