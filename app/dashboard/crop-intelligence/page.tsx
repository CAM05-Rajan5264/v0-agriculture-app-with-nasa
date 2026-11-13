import type { Metadata } from "next"
import { Header } from "@/components/dashboard/header"
import { CropIntelligenceWorkspace } from "@/components/crop-intelligence/crop-intelligence-workspace"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Crop Intelligence | FarmPulse",
  description: "Farm-calibrated yield estimates, AI plant screening, and microclimate-aware crop guidance.",
}

export default async function CropIntelligencePage() {
  const supabase = await createClient()
  const [{ data: farms }, { count: unreadAlerts }] = await Promise.all([
    supabase
      .from("farms")
      .select("id,name,location_name,latitude,longitude,crops(id,name,variety,status,planting_date,expected_harvest_date)")
      .order("created_at", { ascending: false }),
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("is_read", false),
  ])

  return (
    <>
      <Header title="Crop Intelligence" unreadAlerts={unreadAlerts ?? 0} />
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
        <CropIntelligenceWorkspace farms={farms ?? []} />
      </div>
    </>
  )
}
