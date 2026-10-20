import Link from "next/link"
import { Activity, ArrowRight, CalendarCheck, Droplets, Leaf, Plus, Radio, Satellite, Sprout, ThermometerSun, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"

const actions = [
  {
    title: "Review field health",
    description: "Inspect satellite signals and spot stressed zones early.",
    href: "/dashboard/crop-monitoring",
    icon: Leaf,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    title: "Plan irrigation",
    description: "Use soil and weather signals to avoid overwatering.",
    href: "/dashboard/irrigation",
    icon: Droplets,
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    title: "Log farm activity",
    description: "Keep a reliable record of planting, spraying, and harvest work.",
    href: "/dashboard/activities",
    icon: CalendarCheck,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
]

export function SmartFarmingPanel({ farmCount, cropCount, alertCount }: { farmCount: number; cropCount: number; alertCount: number }) {
  const setupItems = [
    { label: "Farm location", complete: farmCount > 0 },
    { label: "Active crop", complete: cropCount > 0 },
    { label: "Alert review", complete: alertCount === 0 },
  ]
  const completed = setupItems.filter((item) => item.complete).length

  return (
    <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]" aria-labelledby="smart-farming-heading">
      <div className="glossy-surface overflow-hidden rounded-2xl p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sprout className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Smart farming cockpit</p>
              <h2 id="smart-farming-heading" className="mt-1 text-xl font-bold tracking-tight">Your next best actions</h2>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">Turn farm data into timely decisions. Start with the signals that need attention today.</p>
            </div>
          </div>
          <div className="shrink-0 rounded-full border border-primary/15 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {completed}/3 ready
          </div>
        </div>

        <div className="remote-sensing-strip mt-6" aria-label="Remote sensing network status"><div className="remote-sensing-grid" aria-hidden="true" /><div className="remote-sensing-orbit remote-sensing-orbit--one" aria-hidden="true" /><div className="remote-sensing-orbit remote-sensing-orbit--two" aria-hidden="true" /><div className="remote-sensing-satellite" aria-hidden="true"><Satellite className="size-4" /></div><div className="remote-sensing-copy"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"><span className="remote-sensing-ping" aria-hidden="true" /><span>Remote sensing active</span></div><p className="mt-1 text-xs text-muted-foreground">NASA observations are flowing from field, soil, and weather signals.</p></div><div className="remote-sensing-stats"><span><Activity className="size-3.5" />Live</span><span><Waves className="size-3.5" />3 signals</span><span><Radio className="size-3.5" />Synced</span></div></div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href} className="group rounded-xl border border-white/70 bg-white/55 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></div>
                <h3 className="mt-3 text-sm font-semibold">{action.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{action.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="glossy-surface rounded-2xl p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Farm readiness</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">Build a stronger baseline</h2>
          </div>
          <ThermometerSun className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div className="mt-5 space-y-4">
          {setupItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-sm">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.complete ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{item.complete ? "✓" : "·"}</span>
              <span className={item.complete ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
              {!item.complete && <span className="ml-auto text-xs font-medium text-amber-600">Needs setup</span>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="sm"><Link href={farmCount === 0 ? "/dashboard/farms" : cropCount === 0 ? "/dashboard/farms" : "/dashboard/alerts"}>{farmCount === 0 ? "Add farm" : cropCount === 0 ? "Add crop" : alertCount > 0 ? "Review alerts" : "View overview"}<ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></Button>
          <Button asChild size="sm" variant="outline"><Link href="/dashboard/activities"><Plus className="mr-2 h-3.5 w-3.5" />Log activity</Link></Button>
        </div>
      </div>
    </section>
  )
}
