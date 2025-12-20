"use client"

import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingDown, CloudRain, Leaf, AlertCircle } from "lucide-react"
import type { NextIrrigationPrediction } from "@/lib/types"
import { getIrrigationUrgency } from "@/lib/irrigation-calculator"

interface NextIrrigationCardProps {
  prediction: NextIrrigationPrediction
  cropName: string
}

export function NextIrrigationCard({ prediction, cropName }: NextIrrigationCardProps) {
  const urgency = getIrrigationUrgency(prediction.daysUntilIrrigation)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            Next Irrigation
          </CardTitle>
          <Badge
            variant={urgency.level === "urgent" ? "destructive" : "outline"}
            className={urgency.level === "urgent" ? "" : urgency.color}
          >
            {urgency.level === "urgent" && <AlertCircle className="mr-1 h-3 w-3" />}
            {urgency.level === "urgent"
              ? "Irrigate Now"
              : urgency.level === "soon"
                ? "Soon"
                : urgency.level === "scheduled"
                  ? "Scheduled"
                  : "Adequate"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{cropName}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline */}
          <div className="text-center">
            <p className={`text-3xl font-bold ${urgency.color}`}>
              {prediction.daysUntilIrrigation === 0
                ? "Today"
                : `${prediction.daysUntilIrrigation} day${prediction.daysUntilIrrigation !== 1 ? "s" : ""}`}
            </p>
            <p className="text-sm text-muted-foreground">{format(prediction.nextIrrigationDate, "EEEE, MMMM d")}</p>
          </div>

          {/* Confidence indicator */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Prediction confidence:</span>
            <div className="flex gap-1">
              {["high", "medium", "low"].map((level, idx) => (
                <div
                  key={level}
                  className={`h-2 w-6 rounded ${
                    (prediction.confidence === "high" && idx <= 2) ||
                    (prediction.confidence === "medium" && idx <= 1) ||
                    (prediction.confidence === "low" && idx === 0)
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium capitalize text-foreground">{prediction.confidence}</span>
          </div>

          {/* Factors */}
          <div className="space-y-3 rounded-lg bg-muted/50 p-3">
            <h4 className="text-sm font-medium text-foreground">Contributing Factors</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">Daily depletion:</span>
                <span className="font-medium text-foreground">
                  {prediction.factors.soilMoistureDepletion.toFixed(1)} mm/day
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CloudRain className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">Weather:</span>
                <span className="font-medium text-foreground">{prediction.factors.weatherImpact}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Crop water need:</span>
                <span className="font-medium text-foreground">
                  {prediction.factors.cropWaterNeed.toFixed(1)} mm/day
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-sm text-foreground">{prediction.recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
