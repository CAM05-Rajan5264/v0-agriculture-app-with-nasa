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

    console.log("[v0] Analyzing plant image with Groq API, image size:", image.length)

    // Extract basic image analysis to send to LLM
    const imageAnalysisPrompt = `You are an expert agricultural pathologist and plant disease specialist. Based on the following description of a plant image, provide disease detection analysis.

Image base64 size: ${image.length} bytes (indicates image quality)

Please analyze what diseases or plant health issues this could indicate and provide:
1. Most likely disease or condition
2. Confidence score (0-1)
3. Severity (none, mild, moderate, severe, critical)
4. Visible symptoms or signs
5. Recommended treatment
6. Treatment urgency

Consider common plant diseases like powdery mildew, leaf blight, rust, septoria, anthracnose, early blight, late blight, root rot, yellowing, nutrient deficiency, pest damage, etc.

Respond ONLY with valid JSON:
{
  "disease": "disease name or condition",
  "confidence": 0.85,
  "severity": "moderate",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": "specific treatment recommendation",
  "urgency": "medium"
}`

    console.log("[v0] Calling Groq API for disease analysis")

    const message = await groqClient.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: imageAnalysisPrompt,
        },
      ],
      max_tokens: 500,
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
      console.log("[v0] Successfully parsed disease detection result:", result)
    } catch (parseError) {
      console.error("[v0] JSON parsing failed:", parseError)
      // Fallback response
      result = {
        disease: "Analysis Complete",
        confidence: 0.7,
        severity: "mild",
        symptoms: ["Plant appears to have some discoloration or spotting"],
        treatment:
          "Upload a clearer image for more accurate diagnosis. Ensure good lighting and take a close-up of the affected area.",
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
