import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { AddFarmDialog } from "@/components/farms/add-farm-dialog"
import { FarmCard } from "@/components/farms/farm-card"
import type { Farm } from "@/lib/types"
import { MapPin } from "lucide-react"

export default async function FarmsPage() {
  const supabase = await createClient()
  const { data: farms } = await supabase.from("farms").select("*").order("created_at", { ascending: false })

  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  return (
    <div className="flex flex-col">
      <Header title="My Farms" unreadAlerts={unreadAlerts || 0} />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Farm Management</h2>
            <p className="text-muted-foreground">Add and manage your farms to start tracking crop health</p>
          </div>
          <AddFarmDialog />
        </div>

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
      </div>
    </div>
  )
}
