"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Leaf, CheckCircle2 } from "lucide-react"
import type { CropGuide } from "@/lib/crop-guide"
import { calculateHarvestDate } from "@/lib/crop-guide"

interface HarvestTimelineCardProps {
  guide: CropGuide
  cropName: string
  farmName: string
  plantingDate: string
}

export function HarvestTimelineCard({ guide, cropName, farmName, plantingDate }: HarvestTimelineCardProps) {
  const { minDate, maxDate, avgDate } = calculateHarvestDate(plantingDate, guide)
  const planted = new Date(plantingDate)
  const now = new Date()

  const totalDays = guide.growthDuration.maxDays
  const daysSincePlanting = Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24))
  const progress = Math.min(100, Math.max(0, (daysSincePlanting / totalDays) * 100))

  const daysToHarvest = Math.floor((avgDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Determine current stage based on progress
  const stages = guide.growthDuration.stages
  let currentStageIndex = 0
  let accumulatedDays = 0

  for (let i = 0; i < stages.length; i++) {
    accumulatedDays += stages[i].durationDays
    if (daysSincePlanting <= accumulatedDays) {
      currentStageIndex = i
      break
    }
    if (i === stages.length - 1) {
      currentStageIndex = i
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <CalendarDays className="h-5 w-5 text-primary" />
            {cropName}
          </CardTitle>
          <Badge variant="outline">{farmName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Growth Progress</span>
            <span className="font-medium text-foreground">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Planted: {formatDate(planted)}</span>
            <span>Est. Harvest: {formatDate(avgDate)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border p-2">
            <p className="text-xs text-muted-foreground">Earliest</p>
            <p className="text-sm font-semibold text-foreground">{formatDate(minDate)}</p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-2">
            <p className="text-xs text-muted-foreground">Expected</p>
            <p className="text-sm font-semibold text-primary">{formatDate(avgDate)}</p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-xs text-muted-foreground">Latest</p>
            <p className="text-sm font-semibold text-foreground">{formatDate(maxDate)}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Leaf className="h-4 w-4 text-primary" />
              Current Stage: {stages[currentStageIndex].name}
            </h4>
            <Badge variant="outline">{daysSincePlanting} days old</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{stages[currentStageIndex].description}</p>
        </div>

        {daysToHarvest > 0 ? (
          <div className="rounded-lg bg-primary/10 p-3 text-center">
            <p className="text-sm text-muted-foreground">Days Until Harvest</p>
            <p className="text-3xl font-bold text-primary">{daysToHarvest}</p>
          </div>
        ) : (
          <div className="rounded-lg bg-green-100 p-3 text-center">
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Ready for Harvest!
            </p>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-sm font-medium text-foreground">Harvest Indicators to Watch</h4>
          <ul className="space-y-1">
            {guide.harvestIndicators.map((indicator, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {indicator}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
