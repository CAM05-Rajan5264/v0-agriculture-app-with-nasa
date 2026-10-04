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
  const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"])
  if (!(image instanceof File) || !supportedTypes.has(image.type)) return Response.json({ error: "Please upload a JPG, PNG, or WEBP plant image." }, { status: 400 })
  if (image.size > 8 * 1024 * 1024) return Response.json({ error: "Image must be smaller than 8 MB." }, { status: 413 })
  const bytes = Buffer.from(await image.arrayBuffer())

  try {
    const apiKey = process.env.KINDWISE_API_KEY || process.env.CROP_HEALTH_API_KEY || process.env.PLANT_ID_API_KEY || process.env.PLANTID_API_KEY
    if (!apiKey) return Response.json({ error: "Plant diagnosis is not configured." }, { status: 503 })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)
    const response = await fetch("https://crop.kindwise.com/api/v1/identification", {
      method: "POST",
      headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        images: [bytes.toString("base64")],
      }),
    })
    clearTimeout(timeout)
    const initialPayload = await response.json().catch(() => null)
    let payload = initialPayload
    if (response.ok && initialPayload?.access_token) {
      const resultResponse = await fetch(`https://crop.kindwise.com/api/v1/identification/${initialPayload.access_token}`, {
        headers: { "Api-Key": apiKey },
      })
      payload = await resultResponse.json().catch(() => null)
    }
    if (!response.ok) {
      console.error("[v0] Plant.id request failed:", response.status, payload)
      const providerMessage = typeof payload?.error?.message === "string" ? payload.error.message : response.status === 401 ? "The Crop Health API key was rejected." : "The Crop Health provider rejected the image."
      const suffix = response.status === 401 ? "Check the KINDWISE_API_KEY configuration." : "Please try a clear JPG, PNG, or WEBP photo."
      return Response.json({ error: `${providerMessage} ${suffix}` }, { status: 502 })
    }

    const suggestions = payload?.result?.crop?.suggestions || []
    const diseases = payload?.result?.disease?.suggestions || []
    const findings = [
      ...diseases.slice(0, 5).map((disease: { name?: string; probability?: number; details?: { description?: string; treatment?: { chemical?: string[]; biological?: string[] }; symptoms?: string } }) => ({
        category: /healthy|no disease/i.test(disease.name || "") ? "healthy" as const : "disease" as const,
        name: disease.name || "Possible plant disease",
        confidence: Math.min(1, Math.max(0, disease.probability || 0)),
        severity: (disease.probability || 0) > 0.8 ? "high" as const : "moderate" as const,
        evidence: disease.details?.description || disease.details?.symptoms || "Visible symptoms detected by the plant health model.",
        action: disease.details?.treatment?.biological?.[0] || disease.details?.treatment?.chemical?.[0] || "Isolate the affected plant and confirm with an agronomist.",
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
      findings: (findings.length ? findings : [{ category: "healthy", name: "Insufficient evidence", confidence: 0, severity: "low", evidence: "The provider returned no confident finding for this image.", action: "Retake a close-up photo in natural light." }]).slice(0, 6),
    })
    return Response.json(parsed)
  } catch (error) {
    console.error("[v0] Plant analysis failed:", error)
    return Response.json({ error: "The diagnosis response could not be processed. Please retake the photo in natural light and try again." }, { status: 502 })
  }
}
