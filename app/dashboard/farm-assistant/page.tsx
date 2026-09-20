"use client"

import { FormEvent, useState } from "react"
import { Bot, Loader2, Send, Sprout, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const starters = [
  "What should I plant this season?",
  "How can I improve soil health?",
  "When should I irrigate my crops?",
]

type Message = { role: "user" | "assistant"; content: string }

export default function FarmAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello. I’m your FarmPulse assistant. Tell me about your crop, location, or farm challenge and I’ll help you plan the next step." },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault()
    const content = input.trim()
    if (!content || isLoading) return
    const nextMessages = [...messages, { role: "user" as const, content }]
    setMessages(nextMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/farm-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })
      if (!response.ok || !response.body) throw new Error("Assistant unavailable")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let answer = ""
      setMessages([...nextMessages, { role: "assistant", content: "" }])
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        setMessages([...nextMessages, { role: "assistant", content: answer }])
      }
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: "I couldn’t connect right now. Please try again in a moment." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-muted/30 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-sm font-medium text-primary">FarmPulse Assistant</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your on-demand farming guide</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Get practical, weather-aware guidance for crops, soil, irrigation, and sustainable farm decisions.</p>
        </header>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-background">
            <CardTitle className="flex items-center gap-2"><Bot className="size-5 text-primary" /> Farm assistant</CardTitle>
            <CardDescription>Advice is informational. Confirm high-impact decisions with a local agronomist.</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-[560px] flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Sprout className="size-4" /></div>}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {message.content || <Loader2 className="size-4 animate-spin" />}
                  </div>
                  {message.role === "user" && <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary"><User className="size-4" /></div>}
                </div>
              ))}
            </div>

            {messages.length === 1 && <div className="flex flex-wrap gap-2">{starters.map((starter) => <Button key={starter} type="button" variant="outline" size="sm" onClick={() => setInput(starter)}>{starter}</Button>)}</div>}
            <form onSubmit={sendMessage} className="flex gap-2 border-t pt-4">
              <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your farm..." aria-label="Ask the farm assistant" disabled={isLoading} />
              <Button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message"><Send data-icon="inline-start" /> Send</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
