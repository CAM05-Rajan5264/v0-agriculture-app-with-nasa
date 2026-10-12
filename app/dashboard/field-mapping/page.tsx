import { FieldMapping } from "@/components/dashboard/field-mapping"
import { Header } from "@/components/dashboard/header"
import { createClient } from "@/lib/supabase/server"
import { MapPinned } from "lucide-react"
import { getSatelliteMetadata } from "@/lib/nasa-gibs-imagery"

export default async function FieldMappingPage() {
  const supabase = await createClient()
  const [{ data: farms }, { data: crops }, { count: unreadAlerts }] = await Promise.all([
    supabase.from("farms").select("*").order("created_at", { ascending: false }),
    supabase.from("crops").select("id,name,variety,planting_date,expected_harvest_date,farms(name)").order("created_at", { ascending: false }),
    supabase.from("alerts").select("*", { count: "exact", head: true }).eq("is_read", false),
  ])
  const imagery = await Promise.all((farms || []).map(async (farm) => {
    const metadata = await getSatelliteMetadata(farm.latitude, farm.longitude)
    return [farm.id, metadata.sort((a, b) => (a.cloudCover - b.cloudCover) || b.date.localeCompare(a.date))[0] || null] as const
  }))
  const latestImagery = Object.fromEntries(imagery)

  return <div className="flex flex-col"><Header title="GPS & Field Mapping" unreadAlerts={unreadAlerts || 0} /><main className="flex flex-col gap-6 p-4 md:p-6"><div className="glossy-surface rounded-3xl border-white/70 p-5 md:p-7"><div className="flex items-start gap-4"><div className="rounded-2xl bg-primary/10 p-3 text-primary"><MapPinned aria-hidden="true" /></div><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Connected field intelligence</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Know every field, from seed to table.</h1><p className="mt-2 max-w-2xl text-muted-foreground">Map farm boundaries with GPS coordinates, plan crop rotations, and build a trusted farm-to-fork record for every harvest.</p></div></div></div><FieldMapping farms={(farms || []) as Parameters<typeof FieldMapping>[0]["farms"]} crops={(crops || []) as Parameters<typeof FieldMapping>[0]["crops"]} latestImagery={latestImagery} /></main></div>
}

