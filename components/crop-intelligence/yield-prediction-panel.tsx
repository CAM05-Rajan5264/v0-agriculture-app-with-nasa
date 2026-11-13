"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { ArrowUpRight, BrainCircuit, Loader2, Sprout } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CropIntelligenceCrop, CropIntelligenceFarm } from "@/components/crop-intelligence/crop-intelligence-workspace"

interface YieldResult {
  predictedYield: number
  yieldUnit: string
  fitScore: number
  sampleCount: number
  neighborsUsed: number
  observedRange: [number, number]
  modelVersion: string
}

interface YieldPredictionPanelProps {
  farm: CropIntelligenceFarm
  crop: CropIntelligenceCrop
}

export function YieldPredictionPanel({ farm, crop }: YieldPredictionPanelProps) {
  const [soilQuality, setSoilQuality] = useState("60")
  const [irrigationMm, setIrrigationMm] = useState("100")
  const [result, setResult] = useState<YieldResult | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const predict = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/crop-intelligence/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId: farm.id, cropId: crop.id, soilQuality: Number(soilQuality), irrigationMm: Number(irrigationMm) }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "The yield model could not run.")
      setResult(payload as YieldResult)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The yield model could not run.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <Card className="h-fit">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit gap-1"><BrainCircuit className="size-3.5" /> K-nearest neighbors</Badge>
          <CardTitle className="flex items-center gap-2"><Sprout className="size-5 text-primary" /> Estimate yield</CardTitle>
          <CardDescription>Compares this season&apos;s soil and irrigation inputs with past harvests for {crop.name} at {farm.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={predict} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="yield-soil-quality">Soil quality score (0–100)</Label>
              <Input id="yield-soil-quality" type="number" inputMode="decimal" min="0" max="100" step="1" value={soilQuality} onChange={(event) => setSoilQuality(event.target.value)} required />
              <p className="text-xs text-muted-foreground">Use the same scale as the soil quality scores in your harvest records.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="yield-irrigation">Planned seasonal irrigation (mm)</Label>
              <Input id="yield-irrigation" type="number" inputMode="decimal" min="0" max="2000" step="1" value={irrigationMm} onChange={(event) => setIrrigationMm(event.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-fit">
              {loading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <BrainCircuit data-icon="inline-start" />}
              {loading ? "Fitting farm model…" : "Estimate from harvest history"}
            </Button>
            {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>

      <Card className="min-h-64">
        {result ? (
          <>
            <CardHeader className="border-b bg-primary/[0.035]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><CardDescription>Predicted harvest yield</CardDescription><CardTitle className="mt-1 text-3xl">{result.predictedYield.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-base font-medium text-muted-foreground">{result.yieldUnit}</span></CardTitle></div>
                <Badge variant="outline">Farm ML estimate</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Model fit score</p><p className="mt-1 text-xl font-semibold">{result.fitScore}%</p></div>
                <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Comparable harvests</p><p className="mt-1 text-xl font-semibold">{result.sampleCount}</p></div>
                <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Nearest seasons used</p><p className="mt-1 text-xl font-semibold">{result.neighborsUsed}</p></div>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground"><ArrowUpRight className="mt-0.5 size-4 shrink-0 text-primary" /><p>Closest historical harvests ranged from {result.observedRange[0].toLocaleString()} to {result.observedRange[1].toLocaleString()} {result.yieldUnit}. This range describes those records; it is not a statistical prediction interval.</p></div>
              <p className="text-xs text-muted-foreground">The fit score reflects similarity and sample volume, not a calibrated probability. Model: {result.modelVersion}.</p>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sprout className="size-6" /></div>
            <div><h3 className="font-medium">Your farm-trained estimate will appear here</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">At least 3 harvest records for this crop, with yield, soil quality, and irrigation data, are needed. No sample or synthetic values are substituted.</p></div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
