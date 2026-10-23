"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Sprout, Bell, Activity, TrendingUp } from "lucide-react"

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
      meter: 72,
      trend: [42, 55, 49, 68, 62, 78, 72],
    },
    {
      label: "Active Crops",
      value: cropCount,
      icon: Sprout,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      meter: 64,
      trend: [38, 46, 44, 52, 58, 61, 64],
    },
    {
      label: "Unread Alerts",
      value: alertCount,
      icon: Bell,
      color: alertCount > 0 ? "text-amber-500" : "text-muted-foreground",
      bgColor: alertCount > 0 ? "bg-amber-500/10" : "bg-muted",
      meter: alertCount > 0 ? 38 : 92,
      trend: [85, 78, 74, 68, 62, 48, alertCount > 0 ? 38 : 92],
    },
    {
      label: "Crop Health",
      value: `${healthyPercentage}%`,
      icon: Activity,
      color: healthyPercentage >= 70 ? "text-green-500" : healthyPercentage >= 40 ? "text-amber-500" : "text-red-500",
      bgColor:
        healthyPercentage >= 70 ? "bg-green-500/10" : healthyPercentage >= 40 ? "bg-amber-500/10" : "bg-red-500/10",
      meter: healthyPercentage,
      trend: [48, 54, 52, 61, 66, 70, healthyPercentage],
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={stat.label} style={{ animationDelay: `${index * 90}ms` }} className="dashboard-stat-card group relative overflow-hidden border-white/70 bg-white/70 shadow-[0_12px_35px_oklch(0.45_0.08_160_/_0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_18px_45px_oklch(0.45_0.08_160_/_0.16)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white" />
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className={`dashboard-stat-icon flex size-11 items-center justify-center rounded-2xl ${stat.bgColor} shadow-inner`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <TrendingUp className="size-4 text-primary/60" aria-hidden="true" />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
              </div>
              <div className="flex h-10 items-end gap-1" aria-label={`${stat.label} trend`}>
                {stat.trend.map((height, index) => <span key={`${stat.label}-${index}`} className="dashboard-stat-bar w-1.5 rounded-full bg-primary/25 transition-all group-hover:bg-primary/50" style={{ height: `${Math.max(8, height / 2)}px` }} />)}
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-primary/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary/60 via-primary to-emerald-400" style={{ width: `${Math.max(4, Math.min(100, stat.meter))}%` }} />
            </div>
            <p className="mt-2 text-[11px] font-medium text-muted-foreground">Live field signal · {stat.meter}% tracked</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
