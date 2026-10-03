import { generateText, Output } from "ai"
import { z } from "zod"

const analysisSchema = z.object({
  summary: z.string(),
  findings: z.array(z.object({
    category: z.enum(["disease", "pest", "nutrient", "healthy"]),
    name: z.string(),
    confidence: z.number().min(0).max(1),
    severity: z.enum(["low", "moderate", "high", "critical"]),
    evidence: z.string(),
    action: z.string(),
  })).max(6),
})

export async function POST(request: Request) {
  const formData = await request.formData()
  const image = formData.get("image")
  if (!(image instanceof File) || !image.type.startsWith("image/")) return Response.json({ error: "Please upload a valid plant image." }, { status: 400 })
  if (image.size > 8 * 1024 * 1024) return Response.json({ error: "Image must be smaller than 8 MB." }, { status: 413 })
  const bytes = Buffer.from(await image.arrayBuffer())
  const { output } = await generateText({
    model: "google/gemini-3-flash",
    output: Output.object({ schema: analysisSchema }),
    system: "You are an agricultural crop scout. Analyze only visible evidence in the plant photo. Identify likely disease, pest damage, nutrient deficiency, or healthy tissue. Never claim certainty, avoid pesticide dosage, and recommend an agronomist for severe or uncertain cases. Return concise practical actions.",
    messages: [{ role: "user", content: [{ type: "text", text: "Analyze this plant photo for early visible signs of disease, pests, or nutrient deficiency. If the image is not a plant or evidence is insufficient, say so in the summary and use one healthy or uncertain finding." }, { type: "image", image: bytes, mediaType: image.type }] }],
  })
  return Response.json(output)
}
