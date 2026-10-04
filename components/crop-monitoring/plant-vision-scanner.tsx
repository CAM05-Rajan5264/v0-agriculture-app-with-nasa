"use client"

import { useState } from "react"
import { Camera, CheckCircle2, Loader2, ScanSearch, Upload, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PlantVisionScannerProps { farmId?: string; cropId?: string }
interface Finding { category: "disease" | "pest" | "nutrient" | "healthy"; name: string; confidence: number; severity: string; evidence: string; action: string }

export function PlantVisionScanner({ farmId, cropId }: PlantVisionScannerProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chooseImage = (selected: File | undefined) => {
    if (!selected || !selected.type.startsWith("image/")) return
    setFile(selected); setPreview(URL.createObjectURL(selected)); setFindings([]); setSummary(""); setError(null)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true); setError(null)
    try {
      const body = new FormData(); body.append("image", file); if (farmId) body.append("farmId", farmId); if (cropId) body.append("cropId", cropId)
      const response = await fetch("/api/plant-analysis", { method: "POST", body })
      const raw = await response.text()
      let result: { error?: string; findings?: Finding[]; summary?: string } = {}
      if (raw.trim()) {
        try { result = JSON.parse(raw) } catch { throw new Error("The diagnosis service returned an invalid response. Please try again.") }
      }
      if (!response.ok) throw new Error(result.error || "Plant analysis failed")
      if (!result.summary && !result.findings?.length) throw new Error("No diagnosis was returned. Please try a clearer plant image.")
      setFindings(result.findings || []); setSummary(result.summary || "No clear findings were detected.")
    } catch (err) { setError(err instanceof Error ? err.message : "Plant analysis failed") } finally { setLoading(false) }
  }

  return <Card className="glossy-surface overflow-hidden rounded-3xl border-white/70">
    <CardHeader className="border-b border-border/50 bg-primary/5"><div className="flex items-start justify-between gap-4"><div><Badge variant="secondary" className="mb-2 rounded-full">AI crop scout</Badge><CardTitle className="flex items-center gap-2"><ScanSearch className="size-5 text-primary" /> Photograph a plant</CardTitle><CardDescription className="mt-1">Detect visible disease, pest damage, and nutrient stress early with a vision model.</CardDescription></div><Camera className="size-7 text-primary" /></div></CardHeader>
    <CardContent className="grid gap-5 p-5 md:grid-cols-[220px_1fr]">
      <label className="group relative flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-center transition hover:border-primary hover:bg-primary/10">{preview ? <img src={preview} alt="Selected plant for analysis" className="absolute inset-0 size-full object-cover" /> : <><Upload className="mb-3 size-7 text-primary" /><span className="font-medium">Upload plant photo</span><span className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WEBP</span></>}<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => chooseImage(event.target.files?.[0])} /></label>
      <div className="flex flex-col gap-4">{preview && <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="truncate">{file?.name}</span><Button variant="ghost" size="icon" onClick={() => { setPreview(null); setFile(null); setFindings([]) }} aria-label="Remove photo"><X className="size-4" /></Button></div>}<Button onClick={analyze} disabled={!file || loading} className="w-full gap-2 md:w-fit">{loading ? <Loader2 className="size-4 animate-spin" /> : <ScanSearch className="size-4" />} {loading ? "Analyzing plant..." : "Analyze with AI"}</Button>{error && <p className="text-sm text-destructive">{error}</p>}{summary && <div className="rounded-2xl bg-muted/50 p-4"><p className="text-sm leading-6">{summary}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{findings.map((finding) => <div key={`${finding.category}-${finding.name}`} className="rounded-xl border bg-background/70 p-3"><div className="flex items-center justify-between gap-2"><Badge variant={finding.category === "healthy" ? "secondary" : "outline"}>{finding.category}</Badge><span className="text-xs text-muted-foreground">{Math.round(finding.confidence * 100)}% confidence</span></div><p className="mt-2 font-medium">{finding.name}</p><p className="mt-1 text-xs text-muted-foreground">{finding.evidence}</p><p className="mt-2 text-xs font-medium text-primary">Next: {finding.action}</p></div>)}</div><p className="mt-4 text-xs text-muted-foreground">AI screening is an early warning, not a laboratory diagnosis. Confirm severe cases with an agronomist.</p></div>}{!summary && !loading && <div className="flex items-center gap-3 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-primary" />Use a clear close-up of affected leaves in natural light.</div>}</div>
    </CardContent>
  </Card>
}

