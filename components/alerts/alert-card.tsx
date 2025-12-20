"use client"

import type { Alert } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cloud, Activity, Droplets, TrendingUp, Snowflake, Sun, Bell, Check, X, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface AlertCardProps {
  alert: Alert
}

const iconMap = {
  weather: Cloud,
  crop_health: Activity,
  irrigation: Droplets,
  phenology: TrendingUp,
  frost: Snowflake,
  drought: Sun,
}

export function AlertCard({ alert }: AlertCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const Icon = iconMap[alert.alert_type] || Bell

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white"
      case "warning":
        return "bg-amber-500 text-white"
      case "info":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getIconColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500 bg-red-500/10"
      case "warning":
        return "text-amber-500 bg-amber-500/10"
      case "info":
        return "text-blue-500 bg-blue-500/10"
      default:
        return "text-gray-500 bg-gray-500/10"
    }
  }

  const markAsRead = async () => {
    setIsUpdating(true)
    const supabase = createClient()
    await supabase.from("alerts").update({ is_read: true }).eq("id", alert.id)
    router.refresh()
    setIsUpdating(false)
  }

  const deleteAlert = async () => {
    setIsUpdating(true)
    const supabase = createClient()
    await supabase.from("alerts").delete().eq("id", alert.id)
    router.refresh()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <Card className={`border-border bg-card ${!alert.is_read ? "border-l-4 border-l-primary" : ""}`}>
      <CardContent className="flex items-start gap-4 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getIconColor(alert.severity)}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground truncate">{alert.title}</h4>
            <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{alert.message}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(alert.created_at)}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          {!alert.is_read && (
            <Button variant="ghost" size="icon" onClick={markAsRead} disabled={isUpdating} title="Mark as read">
              <Check className="h-4 w-4" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={deleteAlert} disabled={isUpdating} title="Delete alert">
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Delete alert</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
