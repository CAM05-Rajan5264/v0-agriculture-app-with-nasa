"use client"

import { useState } from "react"
import { AlertTriangle, CloudSun, Droplets, Loader2, RefreshCw, Wind } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CropIntelligenceCrop, CropIntelligenceFarm } from "@/components/crop-intelligence/crop-intelligence-workspace"

interface AdvisoryResult {
  advisory: {
    headline: string
    microclimateSummary: string
    actions: Array<{ priority: "now" | "soon" | "monitor"; title: string; action: string; rationale: string }>
    uncertainties: string[]
  }
  observation: {
    date: string
    temperatureC: number | null
    precipitationMm: number | null
    relativeHumidityPct: number | null
    windSpeedMps: number | null
    solarRadiation: number | null
  } | null
  soilMoisture: { date: string; rootZone: number | null; surface: number | null; quality: string | null; source: string | null } | null
  ndvi: { date: string; value: number | null; quality: string | null; source: string | null } | null
  cropAgeDays: number | null
}

interface MicroclimateAdvisoryPanelProps {
  farm: CropIntelligenceFarm
  crop: CropIntelligenceCrop
}

function Measurement({ label, value, unit, date }: { label: string; value: number | null | undefined; unit: string; date?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{typeof value === "number" ? `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}` : "Not available"}</p>
      {date && <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>}
    </div>
  )
}

export function MicroclimateAdvisoryPanel({ farm, crop }: MicroclimateAdvisoryPanelProps) {
  const [result, setResult] = useState<AdvisoryResult | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const generateAdvisory = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const response = await fetch("/api/crop-intelligence/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId: farm.id, cropId: crop.id }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "The advisory could not be generated.")
      setResult(payload as AdvisoryResult)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The advisory could not be generated.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card className="h-fit">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit gap-1"><CloudSun className="size-3.5" /> Coordinate-scale weather + field records</Badge>
          <CardTitle>Microclimate-aware crop guidance</CardTitle>
          <CardDescription>Combine the latest available NASA POWER daily observation with this farm&apos;s latest soil-moisture, NDVI, and irrigation records for {crop.name}.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Measurement label="Air temperature" value={result?.observation?.temperatureC} unit="°C" date={result?.observation?.date} />
            <Measurement label="Recent rainfall" value={result?.observation?.precipitationMm} unit="mm/day" date={result?.observation?.date} />
            <Measurement label="Root-zone moisture" value={result?.soilMoisture?.rootZone} unit="" date={result?.soilMoisture?.date} />
            <Measurement label="Latest NDVI" value={result?.ndvi?.value} unit="" date={result?.ndvi?.date} />
          </div>
          <Button type="button" onClick={generateAdvisory} disabled={loading} className="w-full sm:w-fit">
            {loading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <RefreshCw data-icon="inline-start" />}
            {loading ? "Reading field signals…" : result ? "Refresh advisory" : "Generate crop advisory"}
          </Button>
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">NASA POWER is a gridded weather product with a typical 1–2 day lag, not a field sensor or forecast. Missing measurements remain unavailable rather than being filled with simulated values.</p>
        </CardContent>
      </Card>

      <Card className="min-h-64">
        {result ? (
          <>
            <CardHeader className="border-b bg-primary/[0.035]">
              <Badge variant="outline" className="mb-2 w-fit">AI decision support · {result.cropAgeDays === null ? "stage unknown" : `${result.cropAgeDays} days after planting`}</Badge>
              <CardTitle>{result.advisory.headline}</CardTitle>
              <CardDescription>{result.advisory.microclimateSummary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="grid gap-3">
                {result.advisory.actions.map((item, index) => (
                  <article key={`${item.title}-${index}`} className="flex gap-3 rounded-xl border p-3">
                    <Badge variant={item.priority === "now" ? "default" : "secondary"} className="mt-0.5 h-fit shrink-0">{item.priority}</Badge>
                    <div><h3 className="font-medium">{item.title}</h3><p className="mt-1 text-sm">{item.action}</p><p className="mt-1 text-xs text-muted-foreground">{item.rationale}</p></div>
                  </article>
                ))}
              </div>
              {result.advisory.uncertainties.length > 0 && <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3"><p className="flex items-center gap-2 text-sm font-medium"><AlertTriangle className="size-4 text-amber-600" />What to verify</p><ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">{result.advisory.uncertainties.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>}
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><Droplets className="size-3.5" /><Wind className="size-3.5" />Advice is conditional on the available observations; check local conditions before acting.</p>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CloudSun className="size-6" /></div>
            <div><h3 className="font-medium">Personalized field guidance</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">Generate an advisory grounded in the latest measurements available for {farm.name}. Any missing source will be called out explicitly.</p></div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
