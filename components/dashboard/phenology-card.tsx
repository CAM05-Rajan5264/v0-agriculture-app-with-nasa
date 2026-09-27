"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Thermometer } from "lucide-react"
import type { PhenologyData } from "@/lib/types"

interface PhenologyCardProps {
  phenology: PhenologyData
  cropName: string
}

export function PhenologyCard({ phenology, cropName }: PhenologyCardProps) {
  return (
    <Card className="glossy-surface overflow-hidden border-white/70">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            {cropName} Growth Stage
          </CardTitle>
          <Badge className="bg-primary text-primary-foreground">{phenology.currentStage}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Growing Degree Days</p>
                <p className="font-semibold text-foreground">{phenology.gdd.toFixed(0)} GDD</p>
              </div>
            </div>
            {phenology.daysToNextStage > 0 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Next Stage In</p>
                  <p className="font-semibold text-foreground">~{phenology.daysToNextStage} days</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">Recommended Actions</h4>
            <ul className="space-y-1">
              {phenology.optimalActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
