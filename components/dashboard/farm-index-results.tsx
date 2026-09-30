import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Droplets, Leaf, Sprout } from "lucide-react"

export interface FarmIndexResult {
  id: string
  name: string
  location: string
  area: number | null
  ndvi: number
  evi: number
  ndre: number
  savi: number
  ndwi: number
}

const indexMeta = [
  { key: "ndvi", label: "NDVI", description: "Canopy vigor", icon: Leaf, color: "from-emerald-500 to-green-300" },
  { key: "evi", label: "EVI", description: "Dense vegetation", icon: Sprout, color: "from-lime-500 to-emerald-300" },
  { key: "ndre", label: "NDRE", description: "Chlorophyll stress", icon: Activity, color: "from-teal-500 to-cyan-300" },
  { key: "savi", label: "SAVI", description: "Sparse soil cover", icon: Sprout, color: "from-amber-500 to-yellow-300" },
  { key: "ndwi", label: "NDWI", description: "Canopy water", icon: Droplets, color: "from-sky-500 to-cyan-300" },
] as const

function IndexCard({ label, description, value, color, icon: Icon }: { label: string; description: string; value: number; color: string; icon: typeof Leaf }) {
  const percentage = Math.max(8, Math.min(100, Math.round(value * 100)))
  return (
    <div className="rounded-2xl border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-md transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2"><Icon className="size-4 text-primary" /><span className="text-xs font-bold tracking-wide">{label}</span></div>
        <span className="text-lg font-bold text-foreground">{value.toFixed(2)}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10"><div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${percentage}%` }} /></div>
    </div>
  )
}

export function FarmIndexResults({ farms }: { farms: FarmIndexResult[] }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Farm-specific intelligence</p><h2 className="text-xl font-semibold">Vegetation index results</h2><p className="text-sm text-muted-foreground">Satellite-derived indicators for every farm in your portfolio.</p></div><Badge variant="secondary" className="w-fit rounded-full">{farms.length} {farms.length === 1 ? "farm" : "farms"} monitored</Badge></div>
      <div className="grid gap-5 xl:grid-cols-2">{farms.map((farm) => <Card key={farm.id} className="glossy-surface overflow-hidden rounded-3xl border-white/70"><CardHeader className="flex flex-row items-start justify-between gap-3"><div><CardTitle className="text-lg">{farm.name}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{farm.location}{farm.area ? ` · ${farm.area} ha` : ""}</p></div><Badge variant="outline" className="rounded-full border-primary/20 bg-white/50">Latest pass</Badge></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{indexMeta.map((item) => <IndexCard key={item.key} {...item} value={farm[item.key]} />)}</CardContent></Card>)}</div>
    </section>
  )
}
