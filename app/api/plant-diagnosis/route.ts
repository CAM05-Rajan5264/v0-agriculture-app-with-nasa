import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

const systemPrompt = `You are FarmPulse Plant Doctor, a cautious crop-health assistant. Analyze the uploaded leaf or crop photo for visible signs of disease, pests, nutrient stress, or environmental damage. Return ONLY valid JSON with this shape: {"diagnosis":"string","confidence":number,"severity":"low"|"moderate"|"high","signs":["string"],"actions":["string"],"treatment":"string","followUp":"string"}. Never claim certainty from one image. If the photo is unclear or not a plant, say so and recommend another photo. Treatment must be conservative: prioritize isolation, sanitation, monitoring, and label-compliant products; recommend a local agronomist for high severity or uncertain cases.`

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { image, crop } = await request.json()
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return Response.json({ error: "Please upload a valid plant image." }, { status: 400 })
    }
    // A 6 MB binary image becomes roughly 8 MB after base64 encoding, plus the data URL prefix.
    if (image.length > 10_000_000) {
      return Response.json({ error: "Please use an image smaller than 6 MB." }, { status: 413 })
    }

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: `Crop or plant (optional): ${typeof crop === "string" ? crop.slice(0, 80) : "Not provided"}. Analyze this image.` },
          { type: "image", image },
        ],
      }],
      temperature: 0.2,
    })

    const cleaned = result.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    const jsonStart = cleaned.indexOf("{")
    const jsonEnd = cleaned.lastIndexOf("}")
    if (jsonStart < 0 || jsonEnd <= jsonStart) {
      throw new Error("The vision model returned an invalid diagnosis format")
    }
    const diagnosis = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
    if (typeof diagnosis.diagnosis !== "string" || !Array.isArray(diagnosis.signs) || !Array.isArray(diagnosis.actions)) {
      throw new Error("The diagnosis response was incomplete")
    }
    return Response.json(diagnosis, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("[v0] Plant diagnosis failed", error)
    return Response.json({ error: "Plant analysis is temporarily unavailable. Please try again with a clearer photo." }, { status: 502 })
  }
}
