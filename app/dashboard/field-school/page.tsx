"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Leaf, RotateCcw, Sprout, Trophy, XCircle, BookOpen, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const questions = [
  { question: "What is the best time to irrigate most crops?", options: ["Midday", "Early morning", "Late afternoon heat", "Only after leaves wilt"], answer: 1, explanation: "Early morning reduces evaporation and gives roots time to absorb water before the heat of the day." },
  { question: "What does a soil moisture sensor help you avoid?", options: ["Overwatering", "Crop rotation", "Pollination", "Harvesting"], answer: 0, explanation: "Sensor readings help you irrigate based on actual root-zone moisture instead of guesswork." },
  { question: "Which practice naturally improves soil health?", options: ["Burning crop residue", "Repeated bare soil", "Cover cropping", "Over-tilling"], answer: 2, explanation: "Cover crops protect soil, add organic matter, and can reduce erosion between main crops." },
  { question: "A sudden yellowing pattern across a field should first prompt you to check...", options: ["The market price", "Water and nutrient conditions", "The farm logo", "The fence color"], answer: 1, explanation: "Field-wide symptoms often point to irrigation, drainage, or nutrient availability issues." },
  { question: "Why use weather forecasts before spraying?", options: ["To choose a brand color", "To avoid wind and rain losses", "To increase tractor speed", "To remove soil microbes"], answer: 1, explanation: "Wind can cause drift and rain can wash treatments away, reducing effectiveness and increasing risk." },
]

export default function FieldSchoolPage() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)
  const question = questions[current]

  function choose(index: number) {
    if (selected !== null) return
    setSelected(index)
    if (index === question.answer) setScore((value) => value + 1)
  }

  function next() {
    if (current === questions.length - 1) setComplete(true)
    else { setCurrent((value) => value + 1); setSelected(null) }
  }

  function restart() { setCurrent(0); setSelected(null); setScore(0); setComplete(false) }

  return (
    <div className="min-h-full bg-[#f7f8f3]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:py-12">
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        <div className="glossy-surface mb-8 overflow-hidden rounded-3xl border-white/70 p-5 md:p-7"><div className="flex items-start justify-between gap-4"><div><Badge variant="secondary" className="mb-3 rounded-full">Learning lab</Badge><p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary"><Sprout className="size-4" /> Field school</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Grow your farming know-how</h1><p className="mt-3 max-w-xl text-muted-foreground">Practical lessons and field decisions, designed to sharpen your next move.</p></div>
          <div className="hidden rounded-2xl bg-primary/10 p-4 text-primary sm:block"><Leaf className="h-8 w-8" /></div>
        </div></div>
        {complete ? <Card className="overflow-hidden border-primary/20"><CardContent className="flex flex-col items-center px-6 py-14 text-center"><div className="mb-5 rounded-full bg-amber-100 p-4 text-amber-700"><Trophy className="h-10 w-10" /></div><p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Quiz complete</p><h2 className="mt-2 text-3xl font-semibold">{score} / {questions.length} correct</h2><p className="mt-3 max-w-md text-muted-foreground">{score >= 4 ? "Excellent field sense. Keep turning observations into confident decisions." : "Good start. Review the explanations and try again to sharpen your field decisions."}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button onClick={restart} className="gap-2"><RotateCcw className="h-4 w-4" /> Play again</Button><Button variant="outline" asChild><Link href="/dashboard/crop-monitoring">Review crop monitoring</Link></Button></div></CardContent></Card> : <Card className="border-primary/15 shadow-sm"><CardHeader className="border-b bg-white/70 pb-5"><div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">Question {current + 1} of {questions.length}</span><span className="font-semibold text-primary">{score} points</span></div><Progress value={((current + 1) / questions.length) * 100} className="mt-4 h-2" /></CardHeader><CardContent className="p-6 sm:p-9"><h2 className="max-w-2xl text-2xl font-semibold leading-tight sm:text-3xl">{question.question}</h2><div className="mt-7 grid gap-3">{question.options.map((option, index) => { const isSelected = selected === index; const isCorrect = selected !== null && index === question.answer; return <button key={option} onClick={() => choose(index)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-medium transition-colors ${isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : isSelected ? "border-red-400 bg-red-50 text-red-900" : "border-border bg-white hover:border-primary/50 hover:bg-primary/5"}`}><span>{option}</span>{isCorrect ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : isSelected ? <XCircle className="h-5 w-5 shrink-0 text-red-500" /> : null}</button> })}</div>{selected !== null && <div className="mt-6 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed"><p className="font-semibold">{selected === question.answer ? "Correct choice" : "Field note"}</p><p className="mt-1 text-muted-foreground">{question.explanation}</p></div>}<div className="mt-8 flex justify-end"><Button onClick={next} disabled={selected === null}>{current === questions.length - 1 ? "See my results" : "Next question"}</Button></div></CardContent></Card>}
      </div>
    </div>
  )
}
