import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "A message is required." }, { status: 400 })
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: "You are FarmPulse Assistant, a practical and cautious smart-farming advisor. Help users with crop planning, irrigation, soil health, weather-aware decisions, pest prevention, and sustainable farming. Ask for location, crop, growth stage, and constraints when needed. Never present a diagnosis or pesticide instruction as certain; recommend local agronomists for serious crop damage. Keep replies concise and actionable.",
      messages: messages.slice(-12),
      maxOutputTokens: 700,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] Farm assistant request failed", error)
    return Response.json({ error: "The farm assistant is temporarily unavailable." }, { status: 500 })
  }
}
