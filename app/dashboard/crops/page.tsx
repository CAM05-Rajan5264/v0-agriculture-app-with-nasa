import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { AddCropDialog } from "@/components/crops/add-crop-dialog"
import { CropCard } from "@/components/crops/crop-card"
import { Sprout } from "lucide-react"
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
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Crop Management</h2>
            <p className="text-muted-foreground">Track and monitor your crops across all farms</p>
          </div>
          <AddCropDialog farms={farms || []} />
        </div>

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
