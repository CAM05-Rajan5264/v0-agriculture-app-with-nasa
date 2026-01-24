import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const apiKey = process.env.PLANTID_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Plant.ID API key not configured" }, { status: 500 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")

    console.log("[v0] Sending image to Plant.ID API for disease detection")

    // First API call: Identify the plant
    const identifyResponse = await fetch("https://api.plant.id/v3/identification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        images: [base64],
        similar_images: true,
      }),
    })

    if (!identifyResponse.ok) {
      const errorData = await identifyResponse.text()
      console.log("[v0] Plant.ID API error:", identifyResponse.status, errorData)
      return NextResponse.json(
        { error: `Plant.ID API error: ${identifyResponse.status}` },
        { status: identifyResponse.status }
      )
    }

    const identifyData = await identifyResponse.json()
    console.log("[v0] Plant identification response received")

    // Extract plant info and diseases
    const plantInfo = identifyData.result?.classification
    const diseases = identifyData.result?.disease

    if (!diseases || !diseases.classifications || diseases.classifications.length === 0) {
      // No disease detected
      return NextResponse.json({
        success: true,
        disease: "Plant appears healthy",
        confidence: 0.95,
        severity: "none",
        symptoms: ["Plant shows no visible signs of disease"],
        treatment: "Continue regular care and monitoring",
        urgency: "low",
        recommendations: ["Monitor plant regularly for any changes", "Maintain proper watering schedule"],
      })
    }

    // Get the top disease classification
    const topDisease = diseases.classifications[0]
    const diseaseName = topDisease.name || "Unknown disease"
    const diseaseConfidence = topDisease.probability || 0

    // Determine severity based on disease type
    const severityMap: { [key: string]: string } = {
      "leaf spot": "moderate",
      rust: "moderate",
      mildew: "mild",
      blight: "severe",
      wilt: "severe",
      mosaic: "moderate",
      canker: "severe",
      rot: "severe",
      powdery: "mild",
      downy: "moderate",
      anthracnose: "moderate",
      fusarium: "severe",
    }

    let severity = "moderate"
    const diseaseNameLower = diseaseName.toLowerCase()
    for (const [key, value] of Object.entries(severityMap)) {
      if (diseaseNameLower.includes(key)) {
        severity = value
        break
      }
    }

    // Generate symptoms based on disease type
    const symptomsMap: { [key: string]: string[] } = {
      "leaf spot": ["Brown or black spots on leaves", "Yellow halo around lesions", "Spots may have concentric rings"],
      rust: ["Orange/brown powdery spots on leaves", "Spots increase over time", "Leaves may yellow and drop"],
      mildew: ["White powdery coating on leaves", "Leaves curl and distort", "Affects new growth first"],
      blight: ["Rapid leaf discoloration", "Stem lesions present", "Plant wilting despite soil moisture"],
      wilt: ["Drooping leaves despite water", "Discolored vascular tissue", "Progressive decline"],
      mosaic: ["Yellow and green mottled pattern", "Leaf distortion", "Stunted growth"],
    }

    let symptoms: string[] = ["Visible disease symptoms detected", "Discoloration on affected areas"]
    for (const [key, symp] of Object.entries(symptomsMap)) {
      if (diseaseNameLower.includes(key)) {
        symptoms = symp
        break
      }
    }

    // Generate treatment recommendations
    const treatmentMap: { [key: string]: string } = {
      "leaf spot": "Apply copper or chlorothalonil fungicide. Remove infected leaves. Improve air circulation.",
      rust: "Use sulfur-based fungicide. Remove heavily infected leaves. Avoid overhead watering.",
      mildew: "Apply neem oil or sulfur spray. Increase air circulation. Reduce humidity.",
      blight: "Apply systemic fungicide immediately. Remove all infected plant material. Quarantine plant.",
      wilt: "Improve drainage. Reduce watering. Apply soil-based fungicide if soil-borne.",
      mosaic: "No chemical cure - remove severely infected leaves. Control aphids which spread the virus.",
    }

    let treatment = "Consult a plant pathologist for specific treatment options."
    for (const [key, treat] of Object.entries(treatmentMap)) {
      if (diseaseNameLower.includes(key)) {
        treatment = treat
        break
      }
    }

    const urgency = severity === "critical" ? "urgent" : severity === "severe" ? "high" : severity === "moderate" ? "medium" : "low"

    const recommendations = [
      severity === "critical" || severity === "severe" ? "Isolate the plant immediately to prevent spread" : "Monitor the plant closely",
      "Remove infected leaves and discard properly",
      "Apply recommended fungicide treatment",
      "Increase air circulation around the plant",
      "Avoid wetting leaves when watering",
      "Check other nearby plants for symptoms",
    ]

    return NextResponse.json({
      success: true,
      disease: diseaseName,
      confidence: diseaseConfidence,
      severity,
      symptoms,
      treatment,
      urgency,
      recommendations,
      raw_api_response: diseases,
    })
  } catch (error) {
    console.error("[v0] Disease detection API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
