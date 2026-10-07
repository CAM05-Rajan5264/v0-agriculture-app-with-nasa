"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Leaf, Loader2, RotateCcw, Sprout, Trophy, XCircle, BookOpen, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import FarmAssistantPanel from "@/components/dashboard/farm-assistant-panel"

type Question = { question: string; options: string[]; answer: number; explanation: string }

function shuffleQuestions(items: Question[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

export default function FieldSchoolPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const question = questions[current]

  async function loadQuestions() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/field-school", { method: "POST", cache: "no-store" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not load new questions")
      setQuestions(shuffleQuestions(result.questions))
      setCurrent(0)
      setSelected(null)
      setScore(0)
      setComplete(false)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load new questions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadQuestions() }, [])

  function choose(index: number) {
    if (selected !== null) return
    setSelected(index)
    if (index === question.answer) setScore((value) => value + 1)
  }

  function next() {
    if (current === questions.length - 1) setComplete(true)
    else { setCurrent((value) => value + 1); setSelected(null) }
  }

  function restart() { void loadQuestions() }

  return (
    <div className="min-h-full bg-[#f7f8f3]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:py-12">
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        <div className="glossy-surface mb-8 overflow-hidden rounded-3xl border-white/70 p-5 md:p-7"><div className="flex items-start justify-between gap-4"><div><Badge variant="secondary" className="mb-3 rounded-full">Learning lab</Badge><p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary"><Sprout className="size-4" /> Field school</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Grow your farming know-how</h1><p className="mt-3 max-w-xl text-muted-foreground">Practical lessons and field decisions, designed to sharpen your next move.</p></div>
          <div className="hidden rounded-2xl bg-primary/10 p-4 text-primary sm:block"><Leaf className="h-8 w-8" /></div>
        </div></div>
        {loading ? <Card><CardContent className="flex flex-col items-center px-6 py-16 text-center"><Loader2 className="mb-4 size-8 animate-spin text-primary" /><h2 className="text-xl font-semibold">Preparing a fresh field quiz</h2><p className="mt-2 text-muted-foreground">Generating 10 practical questions for this session.</p></CardContent></Card> : error ? <Card><CardContent className="flex flex-col items-center px-6 py-16 text-center"><XCircle className="mb-4 size-8 text-destructive" /><h2 className="text-xl font-semibold">Quiz unavailable</h2><p className="mt-2 text-muted-foreground">{error}</p><Button onClick={restart} className="mt-6">Try again</Button></CardContent></Card> : complete ? <Card className="overflow-hidden border-primary/20"><CardContent className="flex flex-col items-center px-6 py-14 text-center"><div className="mb-5 rounded-full bg-amber-100 p-4 text-amber-700"><Trophy className="h-10 w-10" /></div><p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Quiz complete</p><h2 className="mt-2 text-3xl font-semibold">{score} / {questions.length} correct</h2><p className="mt-3 max-w-md text-muted-foreground">{score >= 4 ? "Excellent field sense. Keep turning observations into confident decisions." : "Good start. Review the explanations and try again to sharpen your field decisions."}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button onClick={restart} className="gap-2"><RotateCcw className="h-4 w-4" /> Play again</Button><Button variant="outline" asChild><Link href="/dashboard/crop-monitoring">Review crop monitoring</Link></Button></div></CardContent></Card> : <Card className="border-primary/15 shadow-sm"><CardHeader className="border-b bg-white/70 pb-5"><div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">Question {current + 1} of {questions.length}</span><span className="font-semibold text-primary">{score} points</span></div><Progress value={((current + 1) / questions.length) * 100} className="mt-4 h-2" /></CardHeader><CardContent className="p-6 sm:p-9"><h2 className="max-w-2xl text-2xl font-semibold leading-tight sm:text-3xl">{question.question}</h2><div className="mt-7 grid gap-3">{question.options.map((option, index) => { const isSelected = selected === index; const isCorrect = selected !== null && index === question.answer; return <button key={option} onClick={() => choose(index)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-medium transition-colors ${isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : isSelected ? "border-red-400 bg-red-50 text-red-900" : "border-border bg-white hover:border-primary/50 hover:bg-primary/5"}`}><span>{option}</span>{isCorrect ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : isSelected ? <XCircle className="h-5 w-5 shrink-0 text-red-500" /> : null}</button> })}</div>{selected !== null && <div className="mt-6 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed"><p className="font-semibold">{selected === question.answer ? "Correct choice" : "Field note"}</p><p className="mt-1 text-muted-foreground">{question.explanation}</p></div>}<div className="mt-8 flex justify-end"><Button onClick={next} disabled={selected === null}>{current === questions.length - 1 ? "See my results" : "Next question"}</Button></div></CardContent></Card>}
        <div className="my-10 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Ask your farm assistant</span><div className="h-px flex-1 bg-border" /></div>
        <FarmAssistantPanel />
      </div>
    </div>
  )
}
