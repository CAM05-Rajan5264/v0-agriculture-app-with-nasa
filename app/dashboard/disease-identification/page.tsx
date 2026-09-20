"use client"

import { useRef, useState } from "react"
import { AlertCircle, Camera, CheckCircle2, ImagePlus, Loader2, RotateCcw, ShieldCheck, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Diagnosis = {
  disease?: { name?: string; probability?: number }[]
  is_healthy?: boolean
  plant?: { name?: string; probability?: number }
}

export default function DiseaseIdentificationPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectImage = (nextFile?: File) => {
    if (!nextFile) return
    if (!nextFile.type.startsWith("image/")) {
      setError("Choose a JPG, PNG, or WEBP image.")
      return
    }
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
    setDiagnosis(null)
    setError(null)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append("image", file)
      const response = await fetch("/api/crop-disease", { method: "POST", body })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Unable to analyze this image.")
      setDiagnosis(payload.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze this image.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setDiagnosis(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const topDisease = diagnosis?.disease?.[0]
  const plantName = diagnosis?.plant?.name || "Crop not confidently identified"
  const confidence = Math.round((topDisease?.probability || diagnosis?.plant?.probability || 0) * 100)

  return (
    <div className="min-h-full bg-gradient-to-b from-primary/[0.04] via-background to-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 gap-2 border-primary/30 bg-primary/5 text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Field-ready crop care</Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Identify crop disease</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">Take a clear photo of an infected leaf or plant. FarmPulse will check it for common crop health issues and suggest your next step.</p>
          </div>
          <div className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">Best results: daylight, close-up, sharp focus</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle>Upload an infected crop photo</CardTitle>
              <CardDescription>Use your camera on mobile or choose a photo from your device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <input ref={inputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => selectImage(event.target.files?.[0])} />
              {preview ? (
                <div className="relative overflow-hidden rounded-2xl border bg-muted">
                  <img src={preview} alt="Selected crop for disease analysis" className="aspect-[4/3] w-full object-cover" />
                  <button type="button" onClick={reset} className="absolute right-3 top-3 rounded-full bg-background/90 p-2 text-foreground shadow" aria-label="Remove selected image"><RotateCcw className="h-4 w-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] px-6 text-center transition-colors hover:border-primary hover:bg-primary/[0.06]">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Camera className="h-7 w-7" /></span>
                  <span className="text-lg font-semibold">Tap to take a photo</span>
                  <span className="mt-1 text-sm text-muted-foreground">or upload an existing crop image</span>
                  <span className="mt-5 flex items-center gap-2 text-sm font-medium text-primary"><Upload className="h-4 w-4" /> Choose image</span>
                </button>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1 gap-2" disabled={!file || loading} onClick={analyze}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing photo...</> : <><ImagePlus className="h-4 w-4" /> Analyze crop</>}</Button>
                {file && <Button variant="outline" onClick={() => inputRef.current?.click()}>Change photo</Button>}
              </div>
              {error && <div role="alert" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader><CardTitle>Diagnosis results</CardTitle><CardDescription>Your analysis will appear here.</CardDescription></CardHeader>
            <CardContent>
              {!diagnosis && !loading && <div className="flex min-h-72 flex-col items-center justify-center rounded-xl bg-muted/50 p-6 text-center"><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></span><p className="font-medium">No diagnosis yet</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">Upload a photo to get a crop health assessment.</p></div>}
              {loading && <div className="flex min-h-72 flex-col items-center justify-center text-center"><Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" /><p className="font-medium">Examining leaf patterns...</p><p className="mt-1 text-sm text-muted-foreground">This can take a few seconds.</p></div>}
              {diagnosis && !loading && <div className="space-y-6">
                <div className="rounded-xl border bg-primary/[0.04] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted-foreground">Detected crop</p><p className="mt-1 text-xl font-semibold">{plantName}</p></div><CheckCircle2 className="h-6 w-6 text-primary" /></div></div>
                <div><div className="flex items-center justify-between"><p className="font-semibold">{diagnosis.is_healthy ? "Plant appears healthy" : topDisease?.name || "Possible crop health issue"}</p><span className="text-sm font-semibold text-primary">{confidence}% match</span></div><Progress value={confidence} className="mt-3 h-2" /><p className="mt-3 text-sm text-muted-foreground">Use this result as an early signal. Confirm severe or spreading symptoms with a local agronomist before treating.</p></div>
                {!diagnosis.is_healthy && <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm"><p className="font-semibold text-amber-800">Recommended next step</p><p className="mt-1 text-amber-700">Isolate affected plants, avoid overhead watering, and inspect nearby leaves for the same symptoms.</p></div>}
              </div>}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border bg-card p-4"><Camera className="mb-3 h-5 w-5 text-primary" /><p className="font-medium">Capture clearly</p><p className="mt-1 text-sm text-muted-foreground">Fill the frame with the affected leaf.</p></div><div className="rounded-xl border bg-card p-4"><ShieldCheck className="mb-3 h-5 w-5 text-primary" /><p className="font-medium">Private by default</p><p className="mt-1 text-sm text-muted-foreground">Your photo is used only for this analysis.</p></div><div className="rounded-xl border bg-card p-4"><AlertCircle className="mb-3 h-5 w-5 text-primary" /><p className="font-medium">Early signal</p><p className="mt-1 text-sm text-muted-foreground">Results support—not replace—expert advice.</p></div></div>
      </div>
    </div>
  )
}
