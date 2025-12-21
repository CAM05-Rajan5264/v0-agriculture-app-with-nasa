"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity } from "lucide-react"
import type { CropHealthAnalysis } from "@/lib/types"

interface CropHealthCardProps {
  analysis: CropHealthAnalysis
  cropName: string
}

export function CropHealthCard({ analysis, cropName }: CropHealthCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500 text-white"
      case "good":
        return "bg-emerald-500 text-white"
      case "moderate":
        return "bg-amber-500 text-white"
      case "poor":
        return "bg-orange-500 text-white"
      case "critical":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getProgressColor = (ndvi: number) => {
    if (ndvi >= 0.7) return "bg-green-500"
    if (ndvi >= 0.5) return "bg-emerald-500"
    if (ndvi >= 0.3) return "bg-amber-500"
    if (ndvi >= 0.15) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            {cropName} Health
          </CardTitle>
          <Badge className={getStatusColor(analysis.healthStatus)}>{analysis.healthStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">NDVI Index</span>
              <span className="font-medium text-foreground">{analysis.ndvi.toFixed(2)}</span>
            </div>
            <Progress value={analysis.ndvi * 100} className={`h-2 ${getProgressColor(analysis.ndvi)}`} />
            <p className="mt-2 text-xs text-amber-600">
              Note: NDVI values are estimated based on growth stage. For actual satellite imagery, consider using dedicated NDVI services.
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Recommendations</h4>
            <ul className="space-y-1">
              {analysis.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
