import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IndexResultsChart } from "@/components/dashboard/index-results-chart"
import { Activity, ArrowRight, CloudSun, Droplets, Gauge, Leaf, Map, Radar, ShieldCheck, Sprout, TrendingUp, Wind } from "lucide-react"

const indicators = [
  { label: "Vegetation health", value: "0.74", detail: "NDVI average", icon: Leaf, tone: "text-emerald-700", bar: "74%" },
  { label: "Water stress", value: "Low", detail: "NDWI signal", icon: Droplets, tone: "text-sky-700", bar: "28%" },
  { label: "Field coverage", value: "92%", detail: "Satellite analyzed", icon: Radar, tone: "text-violet-700", bar: "92%" },
  { label: "Carbon intensity", value: "1.8 t", detail: "CO₂e / hectare", icon: Gauge, tone: "text-amber-700", bar: "42%" },
]

export default async function FarmIntelligencePage() {
  const supabase = await createClient()
  const [{ data: farms }, { data: crops }] = await Promise.all([
    supabase.from("farms").select("id, name, location_name, area_hectares, latitude, longitude").order("created_at", { ascending: false }),
    supabase.from("crops").select("id, name, status, farms(name, location_name)").eq("status", "active").order("created_at", { ascending: false }),
  ])

  const primaryFarm = farms?.[0]
  const activeCrops = crops?.length ?? 0
  const totalArea = farms?.reduce((sum, farm) => sum + Number(farm.area_hectares || 0), 0) ?? 0

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,oklch(0.97_0.05_155),transparent_34%),linear-gradient(135deg,oklch(0.99_0.003_90),oklch(0.96_0.018_150))]">
      <Header title="Farm Intelligence" unreadAlerts={0} />
      <main className="flex flex-col gap-6 p-4 md:p-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(120deg,oklch(0.28_0.09_160),oklch(0.42_0.12_150)_58%,oklch(0.58_0.13_110))] p-6 text-white shadow-[0_22px_60px_oklch(0.32_0.12_155_/_0.22)] md:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge className="border-white/20 bg-white/15 text-white hover:bg-white/20">SATELLITE-POWERED OPERATIONS</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">One clear view of every field.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 md:text-base">FarmPulse brings together the core ideas behind Farmonaut: crop intelligence, field monitoring, weather context, irrigation decisions, traceability, and climate-ready reporting.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="bg-white text-emerald-950 hover:bg-white/90"><Link href="/dashboard/crop-monitoring">Open satellite monitor <ArrowRight data-icon="inline-end" /></Link></Button>
                <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"><Link href="/dashboard/weather">View forecast</Link></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:w-[390px]">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-white/60">Farms</p><p className="mt-1 text-2xl font-semibold">{farms?.length ?? 0}</p></div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-white/60">Active crops</p><p className="mt-1 text-2xl font-semibold">{activeCrops}</p></div>
              <div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:col-span-1"><p className="text-white/60">Tracked area</p><p className="mt-1 text-2xl font-semibold">{totalArea.toFixed(1)} ha</p></div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {indicators.map((item) => (
            <Card key={item.label} className="glossy-surface overflow-hidden rounded-2xl border-white/70">
              <CardContent className="p-5"><div className="flex items-start justify-between"><div className={`flex size-11 items-center justify-center rounded-2xl bg-white/70 ${item.tone}`}><item.icon className="size-5" /></div><TrendingUp className="size-4 text-primary/50" /></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-semibold text-foreground">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p><div className="mt-4 h-1.5 rounded-full bg-primary/10"><div className="h-full rounded-full bg-gradient-to-r from-primary via-emerald-500 to-lime-400" style={{ width: item.bar }} /></div></CardContent>
            </Card>
          ))}
        </section>

        <IndexResultsChart />

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="glossy-surface overflow-hidden rounded-3xl border-white/70">
            <CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>Field intelligence map</CardTitle><CardDescription>Satellite layers and field-level signals in one workspace.</CardDescription></div><Button asChild variant="outline" size="sm"><Link href="/dashboard/crop-monitoring">Explore map <Map data-icon="inline-end" /></Link></Button></CardHeader>
            <CardContent><div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,oklch(0.79_0.12_125),oklch(0.58_0.13_150))] p-6"><div className="absolute inset-0 opacity-40 [background-image:linear-gradient(oklch(1_0_0_/_0.18)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.18)_1px,transparent_1px)] [background-size:42px_42px]" /><div className="relative grid w-full max-w-xl grid-cols-3 gap-2 opacity-90"><div className="h-24 rounded-[40%_20%_30%_15%] bg-emerald-950/35" /><div className="h-24 rounded-[20%_45%_15%_35%] bg-lime-200/45" /><div className="h-24 rounded-[45%_15%_35%_20%] bg-emerald-950/25" /><div className="col-span-2 h-28 rounded-[20%_35%_45%_15%] bg-lime-100/40" /><div className="h-28 rounded-[35%_18%_28%_45%] bg-emerald-900/30" /></div><div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-3 py-2 text-xs font-medium text-emerald-950 shadow-lg"><span className="size-2 rounded-full bg-emerald-500" /> {primaryFarm?.name ?? "Add a farm to start mapping"}</div></div></CardContent>
          </Card>

          <Card className="glossy-surface overflow-hidden rounded-3xl border-white/70"><CardHeader><CardTitle>Decision center</CardTitle><CardDescription>Practical actions from your farm signals.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><Link href="/dashboard/irrigation" className="group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/45 p-4 transition hover:-translate-y-0.5 hover:bg-white/70"><div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><Droplets className="size-5" /></div><div className="flex-1"><p className="font-medium">Irrigation planning</p><p className="text-xs text-muted-foreground">Water only where the field needs it</p></div><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" /></Link><Link href="/dashboard/alerts" className="group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/45 p-4 transition hover:-translate-y-0.5 hover:bg-white/70"><div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><ShieldCheck className="size-5" /></div><div className="flex-1"><p className="font-medium">Early warning alerts</p><p className="text-xs text-muted-foreground">Catch crop stress before yield loss</p></div><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" /></Link><Link href="/dashboard/weather" className="group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/45 p-4 transition hover:-translate-y-0.5 hover:bg-white/70"><div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><CloudSun className="size-5" /></div><div className="flex-1"><p className="font-medium">Weather intelligence</p><p className="text-xs text-muted-foreground">Forecasts for field decisions</p></div><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" /></Link></CardContent></Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3"><Card className="glossy-surface rounded-3xl border-white/70 lg:col-span-2"><CardHeader><CardTitle>Farm portfolio</CardTitle><CardDescription>Traceable field coverage across your operation.</CardDescription></CardHeader><CardContent><div className="flex flex-col gap-3">{farms?.length ? farms.map((farm) => <div key={farm.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/70 bg-white/40 p-4"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sprout className="size-5" /></div><div className="min-w-40 flex-1"><p className="font-medium">{farm.name}</p><p className="text-xs text-muted-foreground">{farm.location_name} · {farm.area_hectares} ha</p></div><Badge variant="secondary">Monitoring active</Badge><Button asChild variant="ghost" size="sm"><Link href="/dashboard/farms">Manage</Link></Button></div>) : <p className="text-sm text-muted-foreground">Add a farm to activate satellite monitoring, traceability, and carbon reporting.</p>}</div></CardContent></Card><Card className="glossy-surface rounded-3xl border-white/70"><CardHeader><CardTitle>Live systems</CardTitle><CardDescription>Connected intelligence layers.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><span className="size-2 rounded-full bg-emerald-500" /> NASA satellite</span><span className="text-xs text-muted-foreground">Online</span></div><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><span className="size-2 rounded-full bg-emerald-500" /> Weather feed</span><span className="text-xs text-muted-foreground">Live</span></div><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><span className="size-2 rounded-full bg-amber-500" /> Carbon MRV</span><span className="text-xs text-muted-foreground">Ready</span></div><div className="mt-2 rounded-2xl bg-primary/5 p-4 text-sm text-muted-foreground"><Wind className="mb-2 size-5 text-primary" />Reliable farm decisions start with consistent field data.</div></CardContent></Card></section>
      </main>
    </div>
  )
}
