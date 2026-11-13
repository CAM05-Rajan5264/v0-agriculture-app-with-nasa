"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { AlertTriangle, Camera, CheckCircle2, Loader2, ScanSearch, Upload, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CropIntelligenceCrop, CropIntelligenceFarm } from "@/components/crop-intelligence/crop-intelligence-workspace"

interface DiseaseFinding {
  category: "disease" | "pest" | "nutrient" | "healthy" | "uncertain"
  name: string
  confidence: number
  severity: "low" | "moderate" | "high"
  evidence: string
  nextStep: string
}

interface DiseaseResult {
  isPlant: boolean
  summary: string
  findings: DiseaseFinding[]
}

interface DiseaseScreeningPanelProps {
  farm: CropIntelligenceFarm
  crop: CropIntelligenceCrop
}

export function DiseaseScreeningPanel({ farm, crop }: DiseaseScreeningPanelProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<DiseaseResult | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const screen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!photo) return
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const formData = new FormData()
      formData.set("image", photo)
      formData.set("farmId", farm.id)
      formData.set("cropId", crop.id)
      const response = await fetch("/api/crop-intelligence/disease", { method: "POST", body: formData })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "The image could not be analyzed.")
      setResult(payload as DiseaseResult)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The image could not be analyzed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <Card className="h-fit">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit gap-1"><ScanSearch className="size-3.5" /> Gemini vision screen</Badge>
          <CardTitle className="flex items-center gap-2"><Camera className="size-5 text-primary" /> Check a plant photo</CardTitle>
          <CardDescription>Upload a clear close-up from {crop.name} at {farm.name}. The model flags visible symptoms; it cannot confirm a diagnosis.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={screen} className="flex flex-col gap-4">
            <label className="group relative flex min-h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.035] p-4 text-center transition hover:border-primary hover:bg-primary/5">
              {preview ? (
                <Image src={preview} alt={`Selected ${crop.name} plant photo`} fill unoptimized sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-2" />
              ) : (
                <><Upload className="mb-3 size-7 text-primary" /><span className="font-medium">Capture or choose a plant image</span><span className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WEBP · up to 5 MB</span></>
              )}
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" aria-label="Upload a plant image" onChange={(event) => { const file = event.target.files?.[0] ?? null; setPhoto(file); setPreview(file ? URL.createObjectURL(file) : null); setResult(null); setError("") }} />
            </label>
            {photo && <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm"><span className="truncate">{photo.name}</span><Button type="button" size="icon" variant="ghost" aria-label="Remove selected image" onClick={() => { setPhoto(null); setPreview(null); setResult(null) }}><X className="size-4" /></Button></div>}
            <Button type="submit" disabled={!photo || loading} className="w-full sm:w-fit">
              {loading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <ScanSearch data-icon="inline-start" />}
              {loading ? "Screening image…" : "Screen for visible symptoms"}
            </Button>
            {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">The image is sent securely for analysis and is not retained by this feature.</p>
          </form>
        </CardContent>
      </Card>

      <Card className="min-h-64">
        {result ? (
          <>
            <CardHeader className="border-b bg-muted/30">
              <Badge variant={result.isPlant ? "secondary" : "outline"} className="mb-2 w-fit">{result.isPlant ? "Plant image" : "Image needs review"}</Badge>
              <CardTitle>{result.isPlant ? "Screening results" : "Could not confirm a plant"}</CardTitle>
              <CardDescription>{result.summary}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
              {result.findings.map((finding, index) => (
                <article key={`${finding.category}-${finding.name}-${index}`} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant={finding.category === "healthy" ? "secondary" : "outline"}>{finding.category}</Badge><span className="text-xs text-muted-foreground">Model score {Math.round(finding.confidence * 100)}%</span></div>
                  <h3 className="mt-3 font-medium">{finding.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{finding.evidence}</p>
                  <p className="mt-3 flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /><span>{finding.nextStep}</span></p>
                </article>
              ))}
              <p className="flex gap-2 text-xs text-muted-foreground sm:col-span-2"><AlertTriangle className="size-4 shrink-0" />Model scores are not diagnostic probabilities. Confirm severe or spreading symptoms with a local agronomist before treatment.</p>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Camera className="size-6" /></div>
            <div><h3 className="font-medium">Early visual screening</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">The model describes visible evidence and suggests a safe next check. Image quality, cultivar, lighting, and local disease pressure can affect results.</p></div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
