import { NextResponse } from "next/server"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!(image instanceof File) || !image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please upload a valid crop image." }, { status: 400 })
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be smaller than 8 MB." }, { status: 413 })
    }

    const apiKey = process.env.KINDWISE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Crop diagnosis is not configured yet." }, { status: 503 })
    }

    const bytes = Buffer.from(await image.arrayBuffer())
    const imageData = bytes.toString("base64")
    const response = await fetch("https://crop.kindwise.com/api/v1/identification", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": apiKey },
      body: JSON.stringify({
        images: [imageData],
        similar_images: true,
        details: ["common_names", "description", "treatment", "url"],
      }),
    })

    const payload = await response.json()
    if (response.ok) {
      const cropSuggestion = payload.result?.crop?.suggestions?.[0]
      const diseaseSuggestions = payload.result?.disease?.suggestions || []
      return NextResponse.json({
        result: {
          plant: cropSuggestion && { name: cropSuggestion.name, probability: cropSuggestion.probability },
          disease: diseaseSuggestions.map((suggestion: { name?: string; probability?: number }) => ({ name: suggestion.name, probability: suggestion.probability })),
          is_healthy: diseaseSuggestions.length === 0 || diseaseSuggestions[0]?.name?.toLowerCase() === "healthy",
          notes: "Powered by Kindwise Crop.health. Confirm serious symptoms with a local agronomist.",
        },
      })
    }

    if (response.status === 401 && process.env.OPENAI_API_KEY) {
      const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Analyze this crop image for visible disease. Return only JSON with this shape: {is_healthy:boolean, plant:{name:string,probability:number}, disease:[{name:string,probability:number}], notes:string}. Probabilities must be between 0 and 1. If uncertain, say so in notes and use low probabilities." },
              { type: "image_url", image_url: { url: `data:${image.type};base64,${imageData}`, detail: "high" } },
            ],
          }],
        }),
      })
      const visionPayload = await visionResponse.json()
      if (visionResponse.ok) {
        const content = visionPayload.choices?.[0]?.message?.content
        if (content) return NextResponse.json({ result: JSON.parse(content), source: "vision" })
      }
    }

    return NextResponse.json({ error: payload?.message || "The diagnosis service could not analyze this image. Please try again with a clearer photo." }, { status: response.status })
  } catch (error) {
    console.error("[v0] Crop disease diagnosis failed", error)
    return NextResponse.json({ error: "Something went wrong while analyzing the image." }, { status: 500 })
  }
}
