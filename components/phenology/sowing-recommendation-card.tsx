"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarCheck, ThermometerSun, AlertTriangle, CheckCircle, XCircle, Calendar } from "lucide-react"
import type { CropGuide } from "@/lib/crop-guide"
import type { NASAWeatherData } from "@/lib/types"
import { getSowingRecommendation } from "@/lib/crop-guide"

interface SowingRecommendationCardProps {
  guide: CropGuide
  weather: NASAWeatherData
  latitude: number
}

export function SowingRecommendationCard({ guide, weather, latitude }: SowingRecommendationCardProps) {
  const recommendation = getSowingRecommendation(guide, weather, latitude)

  const suitabilityConfig = {
    excellent: {
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      icon: CheckCircle,
      label: "Excellent",
      progress: 100,
    },
    good: {
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      icon: CheckCircle,
      label: "Good",
      progress: 75,
    },
    moderate: {
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      icon: AlertTriangle,
      label: "Moderate",
      progress: 50,
    },
    poor: {
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      icon: AlertTriangle,
      label: "Poor",
      progress: 25,
    },
    not_recommended: {
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      icon: XCircle,
      label: "Not Recommended",
      progress: 0,
    },
  }

  const config = suitabilityConfig[recommendation.suitability]
  const Icon = config.icon

  return (
    <Card className={`border-border ${config.bgColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Sowing {guide.name} Now?
          </CardTitle>
          <Badge className={`${config.color} text-white`}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sowing Suitability</span>
            <span className={`font-medium ${config.textColor}`}>{config.progress}%</span>
          </div>
          <Progress value={config.progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Current Conditions Analysis</h4>
          <ul className="space-y-1">
            {recommendation.reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ThermometerSun className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Best Months</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {recommendation.bestMonths.slice(0, 4).map((month) => (
                <span key={month} className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {month}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Next Window</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
              <Calendar className="h-3 w-3" />
              {recommendation.nextWindow}
            </p>
          </div>
        </div>

        {recommendation.canSowNow ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4" />
              Conditions are favorable for sowing {guide.name}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              Consider waiting for better conditions or the next sowing window
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
