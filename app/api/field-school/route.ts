import { z } from "zod"

const questionSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string().min(1)).length(4),
  answer: z.number().int().min(0).max(3),
  explanation: z.string().min(10),
})

const responseSchema = z.object({ questions: z.array(questionSchema).length(10) })

export async function POST() {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY
    const endpoint = process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions"
    const model = process.env.GROQ_API_KEY ? "openai/gpt-oss-120b" : "gpt-4o-mini"

    if (!apiKey) return Response.json({ error: "The field school quiz is not configured." }, { status: 503 })

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        max_tokens: 2600,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You create accurate, practical agricultural learning quizzes. Return only valid JSON with exactly this shape: {\"questions\":[{\"question\":string,\"options\":[string,string,string,string],\"answer\":0|1|2|3,\"explanation\":string}]}." },
          { role: "user", content: `Generate exactly 10 different multiple-choice questions for farmers. Cover a varied mix of irrigation, soil health, crop nutrition, pests, diseases, weather, sustainable practices, and farm safety. Make every question and option distinct from previous runs, avoid trick questions, use plain language, and ensure exactly one option is correct. Seed: ${crypto.randomUUID()}` },
        ],
      }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      console.error("[v0] Field school provider failed", response.status, payload?.error?.code)
      return Response.json({ error: "New quiz questions could not be generated. Please try again." }, { status: 502 })
    }

    const content = payload?.choices?.[0]?.message?.content
    const parsed = responseSchema.safeParse(typeof content === "string" ? JSON.parse(content) : null)
    if (!parsed.success) return Response.json({ error: "The generated quiz was incomplete. Please try again." }, { status: 502 })
    return Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("[v0] Field school generation failed", error)
    return Response.json({ error: "The field school is temporarily unavailable. Please try again." }, { status: 500 })
  }
}
