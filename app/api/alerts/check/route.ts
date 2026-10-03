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

    const { data: farms } = await supabase.from("farms").select("*")
    const { data: crops } = await supabase.from("crops").select("*, farms(*)").eq("status", "active")

    if (!farms || farms.length === 0) {
      return NextResponse.json({ message: "No farms to check", alerts: [] })
    }

    console.log("[v0] Checking alerts for", farms.length, "farms")

    const alertTriggers = await checkForAlerts(farms, crops || [], user.id)

    console.log("[v0] Found", alertTriggers.length, "alert triggers")

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
      const { error } = await supabase.from("alerts").insert(alertsToInsert)
      if (error) {
        console.error("[v0] Error inserting alerts:", error)
        return NextResponse.json({
          message: `Found ${alertsToInsert.length} alerts but failed to save`,
          alerts: alertsToInsert,
          saveError: error.message,
        })
      }
    }

    return NextResponse.json({
      message: `Found ${alertsToInsert.length} new alerts`,
      alerts: alertsToInsert,
    })
  } catch (error) {
    console.error("[v0] Error in alerts check route:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred while checking alerts",
      },
      { status: 500 }
    )
  }
}
