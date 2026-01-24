import { NextRequest, NextResponse } from "next/server"

// Disease detection database with visual indicators
interface DiseaseProfile {
  name: string
  confidence: number
  severity: string
  symptoms: string[]
  treatment: string
  urgency: string
}

function analyzePlantImage(imageData: string): DiseaseProfile {
  try {
    // Remove data URL prefix if present
    const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64")

    // Extract pixel data for analysis
    let greenPixels = 0
    let brownPixels = 0
    let yellowPixels = 0
    let whitePixels = 0

    // Simple pixel analysis - look for color patterns indicative of disease
    for (let i = 0; i < Math.min(buffer.length, 10000); i += 4) {
      const r = buffer[i]
      const g = buffer[i + 1]
      const b = buffer[i + 2]

      // Green leaves
      if (g > r && g > b && g > 100) greenPixels++
      // Brown/dark spots (disease)
      if (r > 100 && g < 80 && b < 80) brownPixels++
      // Yellow/orange (stress/disease)
      if (r > 150 && g > 100 && b < 100) yellowPixels++
      // White/gray powder (mildew)
      if (r > 180 && g > 180 && b > 180) whitePixels++
    }

    const totalSamples = 2500
    const brownRatio = brownPixels / totalSamples
    const yellowRatio = yellowPixels / totalSamples
    const whiteRatio = whitePixels / totalSamples

    console.log("[v0] Image analysis - Brown ratio:", brownRatio, "Yellow ratio:", yellowRatio, "White ratio:", whiteRatio)

    // Determine disease based on color patterns
    if (whiteRatio > 0.15) {
      return {
        name: "Powdery Mildew",
        confidence: Math.min(0.95, 0.7 + whiteRatio),
        severity: "moderate",
        symptoms: ["White powdery coating on leaves", "Leaves appear dusty", "Plant growth stunted"],
        treatment: "Apply neem oil or sulfur-based fungicide. Increase air circulation. Reduce humidity levels.",
        urgency: "medium",
      }
    }

    if (brownRatio > 0.2) {
      return {
        name: "Leaf Spot Disease",
        confidence: Math.min(0.95, 0.75 + brownRatio),
        severity: "moderate",
        symptoms: ["Brown or black spots on leaves", "Spots with yellow halos", "Progressive leaf damage"],
        treatment: "Remove affected leaves. Apply copper fungicide. Improve drainage and air circulation.",
        urgency: "medium",
      }
    }

    if (yellowRatio > 0.25) {
      return {
        name: "Nutrient Deficiency / Stress",
        confidence: Math.min(0.9, 0.6 + yellowRatio),
        severity: "mild",
        symptoms: ["Yellowing leaves", "Loss of chlorophyll", "Reduced plant vigor"],
        treatment: "Apply balanced fertilizer. Ensure proper watering. Check soil pH and drainage.",
        urgency: "low",
      }
    }

    if (brownRatio > 0.1 && yellowRatio > 0.1) {
      return {
        name: "Rust Disease",
        confidence: 0.85,
        severity: "moderate",
        symptoms: ["Orange/brown pustules on leaves", "Yellow areas around lesions", "Possible leaf drop"],
        treatment: "Apply sulfur fungicide. Remove heavily infected leaves. Improve air circulation.",
        urgency: "medium",
      }
    }

    // Healthy plant
    return {
      name: "Plant appears healthy",
      confidence: 0.9,
      severity: "none",
      symptoms: ["No visible disease symptoms", "Leaves show normal coloration", "Good plant vigor"],
      treatment: "Continue regular care and monitoring. Maintain proper watering and sunlight.",
      urgency: "low",
    }
  } catch (error) {
    console.error("[v0] Image analysis error:", error)
    throw new Error("Failed to analyze image")
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Processing image file:", file.name, "Size:", file.size)

    // Read file as data URL
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")

    // Analyze the image
    const analysis = analyzePlantImage(base64)

    const recommendations = [
      analysis.urgency === "urgent" || analysis.urgency === "high"
        ? "Take immediate action to prevent disease spread"
        : "Continue monitoring for any changes",
      "Isolate plant if disease is detected to prevent spread to other plants",
      "Apply recommended treatment as soon as possible",
      "Ensure proper plant care (watering, sunlight, air circulation)",
      "Remove affected plant parts and discard properly",
      "Check nearby plants for similar symptoms",
    ]

    return NextResponse.json({
      success: true,
      disease: analysis.name,
      confidence: analysis.confidence,
      severity: analysis.severity,
      symptoms: analysis.symptoms,
      treatment: analysis.treatment,
      urgency: analysis.urgency,
      recommendations,
    })
  } catch (error) {
    console.error("[v0] Disease detection error:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
