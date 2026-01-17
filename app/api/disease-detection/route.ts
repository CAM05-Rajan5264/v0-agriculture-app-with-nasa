import OpenAI from "openai"

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  console.error("[v0] OPENAI_API_KEY is not set!")
}

const openaiClient = new OpenAI({
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

    console.log("[v0] Starting disease detection analysis with image size:", image.length)

    const prompt = `You are an expert agricultural disease detection AI. Analyze this plant image and provide:
1. Disease name (or "Healthy" if no disease)
2. Confidence score (0-1)
3. Severity (mild, moderate, severe, critical)
4. Symptoms observed (list)
5. Recommended treatment
6. Treatment urgency (low, medium, high, critical)

Respond in JSON format only, no other text:
{
  "disease": "disease name or 'Healthy'",
  "confidence": 0.95,
  "severity": "moderate",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": "treatment recommendation",
  "urgency": "high"
}`

    console.log("[v0] Calling OpenAI API with model: gpt-4o")

    let response
    try {
      response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
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
      })
    } catch (apiErr) {
      const errorMsg = apiErr instanceof Error ? apiErr.message : String(apiErr)
      console.error("[v0] OpenAI API call failed:", errorMsg)
      console.error("[v0] Full error object:", apiErr)
      throw new Error(`OpenAI API error: ${errorMsg}`)
    }

    console.log("[v0] OpenAI API response received successfully")
    const text = response.choices[0]?.message?.content

    if (!text) {
      console.error("[v0] No text content in OpenAI response:", response)
      throw new Error("No response from AI")
    }

    console.log("[v0] Raw AI response:", text.substring(0, 200))

    let result
    try {
      // Try to find and parse JSON object
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("[v0] No JSON found in response:", text)
        throw new Error("Invalid response format from AI")
      }
      result = JSON.parse(jsonMatch[0])
      console.log("[v0] Successfully parsed disease detection result")
    } catch (parseError) {
      console.error("[v0] JSON parsing failed:", parseError)
      // Fallback: return a default response
      result = {
        disease: "Unable to determine",
        confidence: 0,
        severity: "unknown",
        symptoms: ["Analysis failed - please try with a clearer image"],
        treatment: "Please upload a clearer image of the affected plant",
        urgency: "low",
      }
    }

    console.log("[v0] Disease detection complete:", result)
    return Response.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Disease detection error:", errorMessage)
    console.error("[v0] Full error stack:", error instanceof Error ? error.stack : "No stack trace")

    return Response.json(
      {
        error: "Failed to analyze image",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
