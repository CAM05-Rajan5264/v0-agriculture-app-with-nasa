import { NextRequest, NextResponse } from "next/server"
import { analyzePlantImage } from "@/lib/plant-disease-detector"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { image, cropId, farmId } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    console.log("[v0] Starting plant disease detection analysis")

    // Analyze the plant image
    const analysis = await analyzePlantImage(image)

    console.log("[v0] Analysis complete:", analysis.disease, "Confidence:", analysis.confidence)

    // Try to save to database
    let savedToDb = false
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user && cropId) {
        console.log("[v0] Attempting to save analysis to database")
        const { error } = await supabase.from("disease_detections").insert({
          user_id: user.id,
          crop_id: cropId,
          farm_id: farmId,
          disease_name: analysis.disease,
          confidence: analysis.confidence,
          severity: analysis.severity,
          symptoms: analysis.symptoms,
          treatment: analysis.treatment,
          urgency: analysis.urgency,
          recommendations: analysis.recommendations,
          is_disease: analysis.isDisease,
          analysis_data: analysis,
          created_at: new Date().toISOString()
        })

        if (error) {
          console.log("[v0] Database save skipped:", error.message)
        } else {
          console.log("[v0] Analysis saved to database")
          savedToDb = true
        }
      }
    } catch (dbError) {
      console.log("[v0] Database operation skipped, returning analysis only")
    }

    return NextResponse.json({
      success: true,
      analysis,
      savedToDb
    })
  } catch (error) {
    console.error("[v0] Disease detection error:", error)
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    )
  }
}
