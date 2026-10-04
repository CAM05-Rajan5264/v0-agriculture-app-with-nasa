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

  try {
    const apiKey = process.env.PLANT_ID_API_KEY || process.env.PLANTID_API_KEY
    if (!apiKey) return Response.json({ error: "Plant diagnosis is not configured. Add a Plant.id API key to enable image analysis." }, { status: 503 })

    const response = await fetch("https://api.plant.id/v3/identification", {
      method: "POST",
      headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [`data:${image.type};base64,${bytes.toString("base64")}`],
        health_assessment: true,
        similar_images: false,
        details: "common_names,description,treatment,classification",
      }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      console.error("[v0] Plant.id request failed:", response.status, payload)
      return Response.json({ error: "Plant diagnosis provider rejected the image. Please try a clearer photo." }, { status: 502 })
    }

    const suggestions = payload?.result?.classification?.suggestions || []
    const diseases = payload?.result?.health_assessment?.diseases || []
    const findings = [
      ...diseases.slice(0, 5).map((disease: { name?: string; probability?: number; description?: string; treatment?: { chemical?: string[]; biological?: string[] } }) => ({
        category: "disease" as const,
        name: disease.name || "Possible plant disease",
        confidence: Math.min(1, Math.max(0, disease.probability || 0)),
        severity: (disease.probability || 0) > 0.8 ? "high" as const : "moderate" as const,
        evidence: disease.description || "Visible symptoms detected by the plant health model.",
        action: disease.treatment?.biological?.[0] || disease.treatment?.chemical?.[0] || "Isolate the affected plant and confirm with an agronomist.",
      })),
      ...suggestions.slice(0, 3).map((suggestion: { name?: string; probability?: number; details?: { description?: string } }) => ({
        category: "healthy" as const,
        name: suggestion.name || "Plant identified",
        confidence: Math.min(1, Math.max(0, suggestion.probability || 0)),
        severity: "low" as const,
        evidence: suggestion.details?.description || "Plant identity suggested from visible leaf and plant features.",
        action: "Continue monitoring and compare with future photos.",
      })),
    ]
    const parsed = analysisSchema.parse({
      summary: diseases.length ? "Potential health issues detected. Review the findings and confirm severe cases with an agronomist." : "No clear disease signal was detected. Continue monitoring the crop.",
      findings: findings.length ? findings : [{ category: "healthy", name: "Insufficient evidence", confidence: 0, severity: "low", evidence: "The provider returned no confident finding for this image.", action: "Retake a close-up photo in natural light." }],
    })
    return Response.json(parsed)
  } catch (error) {
    console.error("[v0] Plant analysis failed:", error)
    return Response.json({ error: "Plant diagnosis is temporarily unavailable. Please try again with a clear JPG, PNG, or WEBP image." }, { status: 502 })
  }
}
