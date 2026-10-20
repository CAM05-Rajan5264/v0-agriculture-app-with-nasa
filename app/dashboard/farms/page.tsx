import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { AddFarmDialog } from "@/components/farms/add-farm-dialog"
import { FarmCard } from "@/components/farms/farm-card"
import { AddCropDialog } from "@/components/crops/add-crop-dialog"
import { CropCard } from "@/components/crops/crop-card"
import type { Farm } from "@/lib/types"
import { MapPin, Sprout, Satellite, Ruler } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CropRotationPlanner } from "@/components/dashboard/crop-rotation-planner"

export default async function FarmsPage() {
  const supabase = await createClient()
  const { data: farms } = await supabase.from("farms").select("*").order("created_at", { ascending: false })
  const { data: crops } = await supabase.from("crops").select("*, farms(*)").order("created_at", { ascending: false })

  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  return (
    <div className="flex flex-col">
      <Header title="My Farms" unreadAlerts={unreadAlerts || 0} />
      <div className="p-4 md:p-6">
        <div className="glossy-surface mb-6 overflow-hidden rounded-3xl border-white/70 p-5 md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><Badge variant="secondary" className="mb-3 rounded-full">Portfolio overview</Badge><h2 className="text-3xl font-bold tracking-tight text-foreground">Farm Management</h2><p className="mt-1 max-w-xl text-muted-foreground">Add and manage your farms, satellite coverage, and field health in one place.</p></div><AddFarmDialog />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3"><div className="rounded-2xl bg-white/55 p-4"><MapPin className="size-4 text-primary" /><p className="mt-3 text-2xl font-bold">{farms?.length || 0}</p><p className="text-xs text-muted-foreground">Tracked farms</p></div><div className="rounded-2xl bg-white/55 p-4"><Sprout className="size-4 text-emerald-600" /><p className="mt-3 text-2xl font-bold">{crops?.filter((crop) => crop.status === "active").length || 0}</p><p className="text-xs text-muted-foreground">Active crops</p></div><div className="rounded-2xl bg-white/55 p-4"><Ruler className="size-4 text-amber-600" /><p className="mt-3 text-2xl font-bold">{(farms || []).reduce((sum, farm) => sum + (farm.area_hectares || 0), 0).toFixed(1)}</p><p className="text-xs text-muted-foreground">Total hectares</p></div><div className="hidden rounded-2xl bg-white/55 p-4 md:block"><Satellite className="size-4 text-sky-600" /><p className="mt-3 text-2xl font-bold">NASA</p><p className="text-xs text-muted-foreground">Data connected</p></div></div>
        </div>

        <div className="mb-8 flex items-end justify-between gap-4"><div><Badge variant="secondary" className="mb-2 rounded-full">Farm portfolio</Badge><h3 className="text-2xl font-bold tracking-tight">Your farms</h3><p className="text-sm text-muted-foreground">Manage locations, acreage, and satellite coverage.</p></div><AddFarmDialog /></div>
        {farms && farms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {farms.map((farm: Farm) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No farms yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Add your first farm to start monitoring crop health with NASA satellite data.
            </p>
            <AddFarmDialog />
          </div>
        )}

        <CropRotationPlanner crops={(crops || []).map((crop) => ({ name: crop.name, farms: crop.farms ? { name: crop.farms.name } : null }))} />

        <div className="mb-8 mt-12 flex items-end justify-between gap-4"><div><Badge variant="secondary" className="mb-2 rounded-full">Growing portfolio</Badge><h3 className="text-2xl font-bold tracking-tight">Your crops</h3><p className="text-sm text-muted-foreground">Track active seasons and planting progress across every farm.</p></div>{farms && farms.length > 0 && <AddCropDialog farms={farms} />}</div>
        {crops && crops.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{crops.map((crop) => <CropCard key={crop.id} crop={crop} />)}</div> : <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12"><Sprout className="mb-4 size-10 text-muted-foreground" /><h3 className="mb-2 text-lg font-medium">No crops yet</h3><p className="mb-4 text-center text-muted-foreground">Add a crop to start tracking its health and phenology.</p>{farms && farms.length > 0 && <AddCropDialog farms={farms} />}</div>}
      </div>
    </div>
  )
}
