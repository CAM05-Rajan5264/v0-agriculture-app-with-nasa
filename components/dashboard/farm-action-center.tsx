import Link from "next/link"
import { ArrowRight, CheckCircle2, Droplets, Leaf, ShieldAlert, Sprout, Wind } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type FarmActionSignal = {
  id: string
  title: string
  detail: string
  href: string
  icon: "water" | "soil" | "weather" | "crop"
  priority: "high" | "medium" | "low"
}

const iconMap = { water: Droplets, soil: Leaf, weather: Wind, crop: Sprout }
const priorityStyles = { high: "border-amber-300/70 bg-amber-50/70", medium: "border-sky-200/70 bg-sky-50/60", low: "border-emerald-200/70 bg-emerald-50/60" }

export function FarmActionCenter({ signals }: { signals: FarmActionSignal[] }) {
  const visibleSignals = signals.slice(0, 4)

  return (
    <Card className="overflow-hidden border-primary/15 bg-white/65 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-primary/10 pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary"><ShieldAlert className="size-3.5" />Field action center</div>
          <CardTitle className="text-lg">Your next best farm actions</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Prioritized from satellite, soil moisture, weather, and crop signals.</p>
        </div>
        <Badge variant="outline" className="shrink-0 border-primary/20 bg-primary/5 text-primary">{visibleSignals.length} signals</Badge>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4 md:grid-cols-2">
        {visibleSignals.length ? visibleSignals.map((signal) => {
          const Icon = iconMap[signal.icon]
          return <Link key={signal.id} href={signal.href} className={`group flex min-w-0 items-start gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${priorityStyles[signal.priority]}`}>
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-primary shadow-sm"><Icon className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="truncate text-sm text-foreground">{signal.title}</strong><Badge variant="secondary" className="text-[10px] capitalize">{signal.priority}</Badge></span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{signal.detail}</span></span>
            <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        }) : <div className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground md:col-span-2"><CheckCircle2 className="size-5 text-emerald-600" />Connect a farm and crop to generate personalized actions.</div>}
      </CardContent>
    </Card>
  )
}
