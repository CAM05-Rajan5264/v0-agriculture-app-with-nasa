import Groq from "groq-sdk"

const apiKey = process.env.GROQ_API_KEY
if (!apiKey) {
  console.error("[v0] GROQ_API_KEY is not set!")
}

const groqClient = new Groq({
  apiKey: apiKey,
})

export async function POST(req: Request) {
  try {
    let body
    try {
      body = await req.json()
    } catch (parseErr) {
      console.error("[v0] Failed to parse request JSON:", parseErr)
      return Response.json({ error: "Invalid request format" }, { status: 400 })
    }

    const { image } = body

    if (!image) {
      console.error("[v0] No image provided in request")
      return Response.json({ error: "Image is required" }, { status: 400 })
    }

    if (typeof image !== "string" || image.length === 0) {
      console.error("[v0] Image is not a valid base64 string")
      return Response.json({ error: "Image must be a valid base64 string" }, { status: 400 })
    }

    console.log("[v0] Starting disease detection with Groq API, image size:", image.length)

    const prompt = `You are an expert agricultural disease detection AI. Analyze this plant/leaf image and provide:
1. Disease name (or "Healthy" if no disease detected)
2. Confidence score (0-1 scale, as a decimal)
3. Severity (mild, moderate, severe, critical, or none)
4. Symptoms observed (list of visible symptoms)
5. Recommended treatment
6. Treatment urgency (low, medium, high, critical)

Respond ONLY with valid JSON, no additional text:
{
  "disease": "disease name or 'Healthy'",
  "confidence": 0.85,
  "severity": "moderate",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": "treatment recommendation",
  "urgency": "medium"
}`

    console.log("[v0] Calling Groq API for image analysis")

    const message = await groqClient.chat.completions.create({
      model: "llama-2-11b-vision",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    })

    const text = message.choices[0]?.message?.content

    if (!text) {
      console.error("[v0] No text content in Groq response")
      throw new Error("No response from AI")
    }

    console.log("[v0] Raw Groq response:", text.substring(0, 200))

    let result
    try {
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("[v0] No JSON found in response:", text)
        throw new Error("Invalid response format")
      }
      result = JSON.parse(jsonMatch[0])
      console.log("[v0] Successfully parsed disease detection result")
    } catch (parseError) {
      console.error("[v0] JSON parsing failed:", parseError)
      // Fallback response
      result = {
        disease: "Unable to determine",
        confidence: 0,
        severity: "unknown",
        symptoms: ["Please upload a clearer image of the affected plant"],
        treatment: "Try uploading a clearer, closer image of the affected leaf",
        urgency: "low",
      }
    }

    console.log("[v0] Disease detection complete:", result)
    return Response.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Disease detection error:", errorMessage)

    return Response.json(
      {
        error: "Failed to analyze image",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
