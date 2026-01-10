import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkForAlerts } from "@/lib/alert-engine"

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: farms, error: farmsError } = await supabase.from("farms").select("*")
    if (farmsError) throw farmsError

    const { data: crops, error: cropsError } = await supabase.from("crops").select("*, farms(*)").eq("status", "active")
    if (cropsError) throw cropsError

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
      const { error: insertError } = await supabase.from("alerts").insert(alertsToInsert)
      if (insertError) throw insertError
    }

    return NextResponse.json({
      message: `Found ${alertsToInsert.length} new alerts`,
      alerts: alertsToInsert,
    })
  } catch (error) {
    console.error("Error in alerts check:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check alerts" },
      { status: 500 }
    )
  }
}
