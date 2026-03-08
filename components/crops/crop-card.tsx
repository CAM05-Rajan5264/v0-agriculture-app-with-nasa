"use client"

import type { Crop, Farm } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

interface CropCardProps {
  crop: Crop & { farms: Farm }
}

export function CropCard({ crop }: CropCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground"
      case "harvested":
        return "bg-muted text-muted-foreground"
      case "failed":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="border-border bg-card transition-shadow hover:shadow-md">
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-medium text-foreground">{crop.name}</CardTitle>
          <Badge className={getStatusColor(crop.status)}>{crop.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {crop.variety && <p className="text-sm text-muted-foreground">{crop.variety}</p>}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{crop.farms?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Planted: {formatDate(crop.planting_date)}</span>
          </div>
          {crop.expected_harvest_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Harvest: {formatDate(crop.expected_harvest_date)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
