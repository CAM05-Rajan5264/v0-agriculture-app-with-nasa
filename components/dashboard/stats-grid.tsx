"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Sprout, Bell, Activity } from "lucide-react"

interface StatsGridProps {
  farmCount: number
  cropCount: number
  alertCount: number
  healthyPercentage: number
}

export function StatsGrid({ farmCount, cropCount, alertCount, healthyPercentage }: StatsGridProps) {
  const stats = [
    {
      label: "Total Farms",
      value: farmCount,
      icon: MapPin,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active Crops",
      value: cropCount,
      icon: Sprout,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Unread Alerts",
      value: alertCount,
      icon: Bell,
      color: alertCount > 0 ? "text-amber-500" : "text-muted-foreground",
      bgColor: alertCount > 0 ? "bg-amber-500/10" : "bg-muted",
    },
    {
      label: "Crop Health",
      value: `${healthyPercentage}%`,
      icon: Activity,
      color: healthyPercentage >= 70 ? "text-green-500" : healthyPercentage >= 40 ? "text-amber-500" : "text-red-500",
      bgColor:
        healthyPercentage >= 70 ? "bg-green-500/10" : healthyPercentage >= 40 ? "bg-amber-500/10" : "bg-red-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
