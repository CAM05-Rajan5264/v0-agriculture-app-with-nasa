"use client"

import type { Crop, FarmingActivity } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, Leaf, Sprout, Wrench } from "lucide-react"

interface Props {
  activities: FarmingActivity[]
  crops: Crop[]
}

export function ActivityList({ activities, crops }: Props) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pesticide":
        return <Bug className="h-5 w-5" />
      case "fertilizer":
        return <Leaf className="h-5 w-5" />
      case "harvest":
        return <Sprout className="h-5 w-5" />
      case "maintenance":
        return <Wrench className="h-5 w-5" />
      default:
        return null
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "pesticide":
        return "bg-red-50 text-red-700"
      case "fertilizer":
        return "bg-green-50 text-green-700"
      case "harvest":
        return "bg-amber-50 text-amber-700"
      case "maintenance":
        return "bg-blue-50 text-blue-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getCropName = (cropId: string) => {
    return crops.find((c) => c.id === cropId)?.name || "Unknown Crop"
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{activity.title}</h3>
                  <Badge variant="secondary">
                    {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{getCropName(activity.crop_id)}</p>
                {activity.description && <p className="text-sm mt-2">{activity.description}</p>}

                {/* Activity-specific details */}
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  {activity.activity_type === "pesticide" && activity.disease_treated && (
                    <p>
                      Disease: <span className="font-medium text-foreground">{activity.disease_treated}</span>
                    </p>
                  )}
                  {activity.activity_type === "pesticide" && activity.quantity_applied && (
                    <p>
                      Applied:{" "}
                      <span className="font-medium text-foreground">
                        {activity.quantity_applied} {activity.unit_of_measurement}
                      </span>
                    </p>
                  )}
                  {activity.activity_type === "fertilizer" && activity.fertilizer_type && (
                    <p>
                      Type: <span className="font-medium text-foreground">{activity.fertilizer_type}</span>
                    </p>
                  )}
                  {activity.activity_type === "harvest" && activity.quantity_harvested && (
                    <p>
                      Harvested:{" "}
                      <span className="font-medium text-foreground">
                        {activity.quantity_harvested} {activity.harvest_unit}
                      </span>
                    </p>
                  )}
                  {activity.activity_type === "harvest" && activity.quality_grade && (
                    <p>
                      Quality: <span className="font-medium text-foreground">Grade {activity.quality_grade}</span>
                    </p>
                  )}
                  {activity.activity_type === "maintenance" && activity.equipment_name && (
                    <p>
                      Equipment: <span className="font-medium text-foreground">{activity.equipment_name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{new Date(activity.activity_date).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">{new Date(activity.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
