import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { AddCropDialog } from "@/components/crops/add-crop-dialog"
import { CropCard } from "@/components/crops/crop-card"
import { Sprout, Activity, CalendarDays, Layers3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function CropsPage() {
  const supabase = await createClient()

  const { data: farms } = await supabase.from("farms").select("*").order("name")
  const { data: crops } = await supabase.from("crops").select("*, farms(*)").order("created_at", { ascending: false })
  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  return (
    <div className="flex flex-col">
      <Header title="Crops" unreadAlerts={unreadAlerts || 0} />
      <div className="p-4 md:p-6">
        <div className="glossy-surface mb-6 overflow-hidden rounded-3xl border-white/70 p-5 md:p-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Badge variant="secondary" className="mb-3 rounded-full">Growing portfolio</Badge><h2 className="text-3xl font-bold tracking-tight text-foreground">Crop Management</h2><p className="mt-1 text-muted-foreground">Track active seasons, planting windows, and crop health across every farm.</p></div><AddCropDialog farms={farms || []} /></div><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3"><div className="rounded-2xl bg-white/55 p-4"><Sprout className="size-4 text-primary" /><p className="mt-3 text-2xl font-bold">{crops?.length || 0}</p><p className="text-xs text-muted-foreground">Tracked crops</p></div><div className="rounded-2xl bg-white/55 p-4"><Activity className="size-4 text-emerald-600" /><p className="mt-3 text-2xl font-bold">{crops?.filter((crop) => crop.status === "active").length || 0}</p><p className="text-xs text-muted-foreground">Active seasons</p></div><div className="hidden rounded-2xl bg-white/55 p-4 md:block"><Layers3 className="size-4 text-violet-600" /><p className="mt-3 text-2xl font-bold">{farms?.length || 0}</p><p className="text-xs text-muted-foreground">Farms covered</p></div></div></div>

        {farms && farms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Sprout className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">Add a farm first</h3>
            <p className="mb-4 text-center text-muted-foreground">You need to add a farm before you can track crops.</p>
            <Link
              href="/dashboard/farms"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Farms
            </Link>
          </div>
        ) : crops && crops.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop) => (
              <CropCard key={crop.id} crop={crop} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Sprout className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No crops yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Add your first crop to start tracking its health and phenology.
            </p>
            <AddCropDialog farms={farms || []} />
          </div>
        )}
      </div>
    </div>
  )
}
