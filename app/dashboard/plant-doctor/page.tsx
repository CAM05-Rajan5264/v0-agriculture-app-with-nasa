"use client"

import { ChangeEvent, useState } from "react"
import { AlertTriangle, Camera, CheckCircle2, ChevronRight, Leaf, Loader2, ScanSearch, ShieldCheck, UploadCloud } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const MAX_FILE_SIZE = 6 * 1024 * 1024

type Diagnosis = { diagnosis: string; confidence: number; severity: "low" | "moderate" | "high"; signs: string[]; actions: string[]; treatment: string; followUp: string }

export default function PlantDoctorPage() {
  const [image, setImage] = useState<string>("")
  const [fileName, setFileName] = useState("")
  const [crop, setCrop] = useState("")
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [error, setError] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  async function analyzeImage(imageData: string) {
    if (!imageData || isAnalyzing) return
    setIsAnalyzing(true)
    setError("")
    setDiagnosis(null)
    try {
      const response = await fetch("/api/plant-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, crop }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || `Analysis failed (${response.status})`)
      setDiagnosis(payload)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setError("")
    setDiagnosis(null)
    if (!file) return
    if (!file.type.startsWith("image/")) return setError("Choose a JPG, PNG, or WEBP image.")
    if (file.size > MAX_FILE_SIZE) return setError("Please use an image smaller than 6 MB.")
    const reader = new FileReader()
    reader.onload = () => {
      const imageData = String(reader.result)
      setImage(imageData)
      setFileName(file.name)
      void analyzeImage(imageData)
    }
    reader.onerror = () => setError("The image could not be read. Please choose it again.")
    reader.readAsDataURL(file)
  }

  function analyze() {
    void analyzeImage(image)
  }

  const severityLabel = diagnosis?.severity === "high" ? "Needs attention" : diagnosis?.severity === "moderate" ? "Monitor closely" : "Early signal"

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top_right,oklch(0.96_0.05_150),transparent_35%),linear-gradient(135deg,oklch(0.99_0.003_90),oklch(0.95_0.02_150))] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><Badge variant="secondary" className="mb-3 gap-2"><ScanSearch /> AI crop health check</Badge><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Plant Doctor</h1><p className="mt-2 max-w-2xl text-muted-foreground">Upload a leaf or crop photo to screen for early signs of disease, pests, and stress. No API key or setup is needed.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-xs font-medium text-primary shadow-sm backdrop-blur"><ShieldCheck /> Photos stay in this session</div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="overflow-hidden border-white/70 bg-white/70 shadow-[0_18px_50px_oklch(0.45_0.08_160_/_0.12)] backdrop-blur-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="text-primary" /> Upload a field photo</CardTitle><CardDescription>Use a close, well-lit photo of one affected leaf or crop area. Analysis starts automatically after upload.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <label className="group relative flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/25 bg-primary/[0.04] p-6 text-center transition hover:border-primary/60 hover:bg-primary/[0.08]">
                {image ? <img src={image} alt="Selected crop for analysis" className="absolute inset-0 size-full object-cover" /> : <><div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner"><UploadCloud /></div><p className="font-semibold">Drop a photo here or browse</p><p className="mt-1 text-sm text-muted-foreground">JPG, PNG, or WEBP · up to 6 MB</p></>}
                <Input type="file" accept="image/*" onChange={handleFile} className="sr-only" aria-label="Upload crop photo" />
                {image && <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/60 px-3 py-2 text-left text-xs text-white backdrop-blur"><p className="truncate font-medium">{fileName}</p><p>Click to replace photo</p></div>}
              </label>
              <div className="flex flex-col gap-2"><label htmlFor="crop" className="text-sm font-medium">Crop or plant (optional)</label><Input id="crop" value={crop} onChange={(event) => setCrop(event.target.value)} placeholder="e.g. tomato, wheat, maize" /></div>
              {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <Button onClick={analyze} disabled={!image || isAnalyzing} className="w-full rounded-xl py-6 text-base">{isAnalyzing ? <><Loader2 className="animate-spin" data-icon="inline-start" /> Analyzing photo...</> : <><ScanSearch data-icon="inline-start" /> Analyze crop health</>}</Button>
              <p className="text-center text-xs text-muted-foreground">AI screening is informational, not a definitive diagnosis.</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/70 bg-white/70 shadow-[0_18px_50px_oklch(0.45_0.08_160_/_0.12)] backdrop-blur-xl">
            <CardHeader className="border-b border-white/60"><CardTitle className="flex items-center gap-2"><Leaf className="text-primary" /> Field health report</CardTitle><CardDescription>{diagnosis ? "Photo-based observations and practical next steps" : "Your analysis will appear here"}</CardDescription></CardHeader>
            <CardContent className="flex min-h-[540px] flex-col gap-5 p-5 md:p-6">
              {!diagnosis ? <div className="flex flex-1 flex-col items-center justify-center text-center"><div className="mb-5 flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary"><Leaf className="size-9" /></div><h2 className="text-xl font-semibold">Ready when you are</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Add a clear photo to identify visible patterns and get a prioritized field action plan.</p><div className="mt-6 grid w-full max-w-md gap-2 text-left text-sm"><div className="flex items-center gap-3 rounded-xl bg-background/65 p-3"><CheckCircle2 className="text-primary" /> Spots, discoloration, and leaf damage</div><div className="flex items-center gap-3 rounded-xl bg-background/65 p-3"><CheckCircle2 className="text-primary" /> Disease and pest risk signals</div><div className="flex items-center gap-3 rounded-xl bg-background/65 p-3"><CheckCircle2 className="text-primary" /> Safe next steps and monitoring</div></div></div> : <><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge variant={diagnosis.severity === "high" ? "destructive" : "secondary"}>{severityLabel}</Badge><h2 className="mt-3 text-2xl font-semibold">{diagnosis.diagnosis}</h2></div><div className="rounded-2xl bg-primary/10 px-4 py-3 text-center"><p className="text-2xl font-bold text-primary">{Math.round(diagnosis.confidence)}%</p><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">confidence</p></div></div><section><h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible signs</h3><ul className="grid gap-2">{diagnosis.signs?.map((sign) => <li key={sign} className="flex items-start gap-2 rounded-xl bg-background/65 p-3 text-sm"><ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />{sign}</li>)}</ul></section><section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"><h3 className="flex items-center gap-2 font-semibold text-amber-800"><AlertTriangle className="size-4" /> Recommended treatment</h3><p className="mt-2 text-sm leading-6 text-amber-950/80">{diagnosis.treatment}</p></section><section><h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Next actions</h3><ol className="grid gap-2">{diagnosis.actions?.map((action, index) => <li key={action} className="flex items-start gap-3 text-sm"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span><span className="pt-0.5">{action}</span></li>)}</ol></section><p className="rounded-xl bg-primary/5 p-3 text-sm text-muted-foreground"><strong className="text-foreground">Follow-up:</strong> {diagnosis.followUp}</p></>}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
