const systemPrompt = "You are FarmPulse Assistant, a practical and cautious smart-farming advisor. Help with crop planning, irrigation, soil health, weather-aware decisions, pest prevention, and sustainable farming. Reply in plain language using no more than 3 short sentences or 3 bullet points. Give one clear next action first, then only essential context. Ask at most one clarifying question when needed. Avoid long introductions, repetition, jargon, and markdown headings. Never present a diagnosis or pesticide instruction as certain; recommend a local agronomist for serious crop damage."

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "A message is required." }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY
    const endpoint = process.env.GROQ_API_KEY
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions"
    const model = process.env.GROQ_API_KEY ? "openai/gpt-oss-120b" : "gpt-4o-mini"

    if (!apiKey) {
      return Response.json({ error: "The farm assistant is not configured." }, { status: 503 })
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-12)],
        max_tokens: 360,
        temperature: 0.2,
      }),
    })
    const payload = await response.json()

    if (!response.ok) {
      console.error("[v0] Farm assistant provider failed", response.status, payload?.error?.code)
      return Response.json({ error: "The farm assistant could not answer right now. Please try again." }, { status: 502 })
    }

    const message = payload.choices?.[0]?.message
    const answer = (message?.content || message?.reasoning)?.trim()
    if (!answer) {
      console.error("[v0] Farm assistant returned no message content")
      return Response.json({ error: "The farm assistant returned an empty answer. Please try again." }, { status: 502 })
    }

    return new Response(answer, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[v0] Farm assistant request failed", error)
    return Response.json({ error: "The farm assistant is temporarily unavailable." }, { status: 500 })
  }
}
