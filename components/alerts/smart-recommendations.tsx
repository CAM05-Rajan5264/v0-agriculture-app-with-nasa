"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, CloudRain, Thermometer, Droplets, Leaf, Calendar, TrendingUp, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Farm, Crop } from "@/lib/types"

interface Recommendation {
  id: string
  icon: typeof Lightbulb
  title: string
  description: string
  category: "weather" | "crop" | "irrigation" | "activity"
  priority: "high" | "medium" | "low"
}

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function generateRecommendations() {
      const supabase = createClient()
      const { data: farms } = await supabase.from("farms").select("*")
      const { data: crops } = await supabase.from("crops").select("*, farms(*)").eq("status", "active")

      const recs: Recommendation[] = []
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentHour = now.getHours()

      // Time-based recommendations
      if (currentHour >= 5 && currentHour <= 7) {
        recs.push({
          id: "morning-inspection",
          icon: Leaf,
          title: "Morning Field Inspection",
          description: "Early morning is ideal for inspecting crops for pests and diseases when dew is present.",
          category: "activity",
          priority: "medium",
        })
      }

      if (currentHour >= 6 && currentHour <= 9) {
        recs.push({
          id: "morning-irrigation",
          icon: Droplets,
          title: "Optimal Irrigation Time",
          description:
            "Early morning irrigation reduces water loss from evaporation and helps prevent fungal diseases.",
          category: "irrigation",
          priority: "high",
        })
      }

      // Season-based recommendations
      if (currentMonth >= 10 || currentMonth <= 1) {
        // Winter
        recs.push({
          id: "winter-crops",
          icon: Calendar,
          title: "Winter Crop Season",
          description: "Ideal time for sowing wheat, barley, peas, and mustard in most regions.",
          category: "crop",
          priority: "high",
        })
      } else if (currentMonth >= 2 && currentMonth <= 4) {
        // Spring
        recs.push({
          id: "spring-prep",
          icon: TrendingUp,
          title: "Prepare for Summer Crops",
          description: "Begin land preparation for cotton, rice, and corn. Check irrigation systems.",
          category: "activity",
          priority: "medium",
        })
      } else if (currentMonth >= 5 && currentMonth <= 8) {
        // Summer/Monsoon
        recs.push({
          id: "monsoon-care",
          icon: CloudRain,
          title: "Monsoon Crop Care",
          description: "Monitor for waterlogging and ensure proper drainage. Watch for pest outbreaks.",
          category: "weather",
          priority: "high",
        })
      }

      // Farm-specific recommendations
      if (farms && farms.length > 0) {
        recs.push({
          id: "farm-monitoring",
          icon: Thermometer,
          title: "Daily Weather Monitoring",
          description: `You have ${farms.length} farm(s). Check weather forecasts daily to plan activities.`,
          category: "weather",
          priority: "medium",
        })
      } else {
        recs.push({
          id: "add-farm",
          icon: AlertTriangle,
          title: "Add Your First Farm",
          description: "Add your farm location to receive personalized weather alerts and crop recommendations.",
          category: "activity",
          priority: "high",
        })
      }

      // Crop-specific recommendations
      if (crops && crops.length > 0) {
        const activeCrops = crops.filter((c: Crop) => c.status === "active")

        activeCrops.forEach((crop: Crop & { farms: Farm }) => {
          const planted = new Date(crop.planting_date)
          const daysSincePlanting = Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24))

          if (daysSincePlanting < 14) {
            recs.push({
              id: `seedling-${crop.id}`,
              icon: Leaf,
              title: `Seedling Care: ${crop.name}`,
              description: `Your ${crop.name} is ${daysSincePlanting} days old. Ensure adequate moisture and watch for damping-off disease.`,
              category: "crop",
              priority: "high",
            })
          }

          if (daysSincePlanting >= 30 && daysSincePlanting <= 60) {
            recs.push({
              id: `growth-${crop.id}`,
              icon: TrendingUp,
              title: `Vegetative Growth: ${crop.name}`,
              description: `Your ${crop.name} is in active growth phase. Consider side-dressing with nitrogen fertilizer.`,
              category: "crop",
              priority: "medium",
            })
          }
        })
      } else {
        recs.push({
          id: "add-crop",
          icon: Leaf,
          title: "Track Your Crops",
          description: "Add your crops to receive growth stage alerts and harvest reminders.",
          category: "activity",
          priority: "medium",
        })
      }

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

      setRecommendations(recs.slice(0, 6))
      setLoading(false)
    }

    generateRecommendations()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "low":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "weather":
        return "bg-blue-500 text-white"
      case "crop":
        return "bg-green-500 text-white"
      case "irrigation":
        return "bg-cyan-500 text-white"
      case "activity":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const Icon = rec.icon
            return (
              <div
                key={rec.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${getPriorityColor(rec.priority)}`}
              >
                <div className="mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge className={`text-xs ${getCategoryColor(rec.category)}`}>{rec.category}</Badge>
                  </div>
                  <p className="text-xs opacity-80">{rec.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
