"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Droplets, AlertTriangle, CheckCircle } from "lucide-react"
import type { IrrigationStatus } from "@/lib/types"

interface IrrigationCardProps {
  irrigation: IrrigationStatus
  farmName: string
}

export function IrrigationCard({ irrigation, farmName }: IrrigationCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Droplets className="h-5 w-5 text-blue-500" />
            Irrigation Status
          </CardTitle>
          {irrigation.irrigationNeeded ? (
            <Badge className="bg-amber-500 text-white">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Needed
            </Badge>
          ) : (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="mr-1 h-3 w-3" />
              Adequate
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{farmName}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Soil Moisture</span>
              <span className="font-medium text-foreground">{irrigation.soilMoisture.toFixed(0)}%</span>
            </div>
            <Progress
              value={irrigation.soilMoisture}
              className={`h-2 ${irrigation.soilMoisture > 50 ? "bg-blue-500" : "bg-amber-500"}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Evapotranspiration</p>
              <p className="text-lg font-semibold text-foreground">{irrigation.evapotranspiration.toFixed(1)} mm/day</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recent Rainfall</p>
              <p className="text-lg font-semibold text-foreground">{irrigation.precipitationForecast.toFixed(1)} mm</p>
            </div>
          </div>

          {irrigation.irrigationNeeded && (
            <div className="rounded-lg bg-amber-500/10 p-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Recommended irrigation: {irrigation.recommendedAmount.toFixed(1)} mm
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
