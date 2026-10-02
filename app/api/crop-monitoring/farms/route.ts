import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("farms").select("id,name,latitude,longitude,location_name,area_hectares,crops(name,planting_date,status)").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: "Unable to load farms" }, { status: 500 })
  return NextResponse.json(data ?? [])
}
