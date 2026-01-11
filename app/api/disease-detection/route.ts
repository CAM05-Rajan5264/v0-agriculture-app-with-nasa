import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return Response.json({ error: "Image is required" }, { status: 400 })
    }

    const prompt = `You are an expert agricultural disease detection AI. Analyze this plant image and provide:
1. Disease name (or "Healthy" if no disease)
2. Confidence score (0-1)
3. Severity (mild, moderate, severe, critical)
4. Symptoms observed (list)
5. Recommended treatment
6. Treatment urgency (low, medium, high, critical)

Respond in JSON format:
{
  "disease": "disease name or 'Healthy'",
  "confidence": 0.95,
  "severity": "moderate",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": "treatment recommendation",
  "urgency": "high"
}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: `data:image/jpeg;base64,${image}`,
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI")
    }

    const result = JSON.parse(jsonMatch[0])

    return Response.json(result)
  } catch (error) {
    console.error("[v0] Disease detection error:", error)
    return Response.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
