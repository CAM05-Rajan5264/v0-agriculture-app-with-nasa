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

    const apiKey = process.env.PLANT_ID_API_KEY || process.env.PLANTID_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Crop diagnosis is not configured yet." }, { status: 503 })
    }

    const bytes = Buffer.from(await image.arrayBuffer())
    const imageData = `data:${image.type};base64,${bytes.toString("base64")}`
    const response = await fetch("https://api.plant.id/v2/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": apiKey },
      body: JSON.stringify({
        images: [imageData],
        health: "all",
        modifiers: ["crops_fast", "similar_images"],
        plant_details: ["common_names", "taxonomy", "url"],
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: payload?.message || "The diagnosis service could not analyze this image." }, { status: response.status })
    }

    return NextResponse.json({ result: payload })
  } catch (error) {
    console.error("[v0] Crop disease diagnosis failed", error)
    return NextResponse.json({ error: "Something went wrong while analyzing the image." }, { status: 500 })
  }
}
