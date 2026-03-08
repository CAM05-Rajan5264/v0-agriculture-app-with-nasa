import { NextResponse } from "next/server"
import { checkForAlerts } from "@/lib/alert-engine"

export async function POST() {
  try {
    // Use default/demo data instead of user-specific data
    const demoAlerts = [
      {
        type: "drought" as const,
        severity: "medium" as const,
        title: "Moisture levels low",
        message: "Soil moisture is below optimal range. Consider irrigation.",
        farmId: null,
        cropId: null,
      },
      {
        type: "frost" as const,
        severity: "low" as const,
        title: "Temperature forecast",
        message: "No frost warning for the next 7 days",
        farmId: null,
        cropId: null,
      },
    ]

    return NextResponse.json({
      message: "Alerts checked successfully",
      alerts: demoAlerts,
    })
  } catch (error) {
    console.error("[v0] Error checking alerts:", error)
    return NextResponse.json(
      { error: "Failed to check alerts" },
      { status: 500 }
    )
  }
}
