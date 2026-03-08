import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkForAlerts } from "@/lib/alert-engine"

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: farms } = await supabase.from("farms").select("*")
  const { data: crops } = await supabase.from("crops").select("*, farms(*)").eq("status", "active")

  if (!farms || farms.length === 0) {
    return NextResponse.json({ message: "No farms to check", alerts: [] })
  }

  const alertTriggers = await checkForAlerts(farms, crops || [], user.id)

  // Insert new alerts
  const alertsToInsert = alertTriggers.map((trigger) => ({
    user_id: user.id,
    farm_id: trigger.farmId || null,
    crop_id: trigger.cropId || null,
    alert_type: trigger.type,
    severity: trigger.severity,
    title: trigger.title,
    message: trigger.message,
  }))

  if (alertsToInsert.length > 0) {
    await supabase.from("alerts").insert(alertsToInsert)
  }

  return NextResponse.json({
    message: `Found ${alertsToInsert.length} new alerts`,
    alerts: alertsToInsert,
  })
}
