"use client"

import { format, formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, Calendar, Gauge } from "lucide-react"
import type { IrrigationEvent } from "@/lib/types"

interface IrrigationHistoryProps {
  events: IrrigationEvent[]
  cropName: string
}

const METHOD_LABELS: Record<string, string> = {
  drip: "Drip",
  sprinkler: "Sprinkler",
  flood: "Flood/Furrow",
  manual: "Manual",
  other: "Other",
}

export function IrrigationHistory({ events, cropName }: IrrigationHistoryProps) {
  if (events.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-foreground">Irrigation History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No irrigation events logged yet for {cropName}. Log your first irrigation to start tracking.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Calendar className="h-5 w-5 text-blue-500" />
          Irrigation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-foreground">{event.irrigation_amount_mm} mm</span>
                  {event.irrigation_method && (
                    <Badge variant="outline" className="text-xs">
                      {METHOD_LABELS[event.irrigation_method] || event.irrigation_method}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.irrigated_at), "MMM d, yyyy 'at' h:mm a")}
                  <span className="ml-2">
                    ({formatDistanceToNow(new Date(event.irrigated_at), { addSuffix: true })})
                  </span>
                </p>
                {(event.soil_moisture_before !== null || event.soil_moisture_after !== null) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Gauge className="h-3 w-3" />
                    {event.soil_moisture_before !== null && <span>Before: {event.soil_moisture_before}%</span>}
                    {event.soil_moisture_before !== null && event.soil_moisture_after !== null && <span>→</span>}
                    {event.soil_moisture_after !== null && <span>After: {event.soil_moisture_after}%</span>}
                  </div>
                )}
                {event.notes && <p className="text-xs text-muted-foreground italic">"{event.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
