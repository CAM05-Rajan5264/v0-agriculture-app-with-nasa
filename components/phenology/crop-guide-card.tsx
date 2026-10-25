"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sprout,
  Calendar,
  Droplets,
  Sun,
  ThermometerSun,
  Clock,
  CheckCircle2,
  Leaf,
  Users,
  XCircle,
} from "lucide-react"
import type { CropGuide } from "@/lib/crop-guide"
import { CropImage } from "@/components/ui/crop-image"

interface CropGuideCardProps {
  guide: CropGuide
}

export function CropGuideCard({ guide }: CropGuideCardProps) {
  const categoryColors: Record<string, string> = {
    grain: "bg-amber-500/20 text-amber-700",
    vegetable: "bg-green-500/20 text-green-700",
    fruit: "bg-red-500/20 text-red-700",
    legume: "bg-emerald-500/20 text-emerald-700",
    oilseed: "bg-yellow-500/20 text-yellow-700",
    fiber: "bg-blue-500/20 text-blue-700",
  }

  const waterNeedsColors: Record<string, string> = {
    low: "bg-sky-100 text-sky-700",
    moderate: "bg-blue-100 text-blue-700",
    high: "bg-indigo-100 text-indigo-700",
  }

  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="relative h-32 overflow-hidden"><CropImage cropName={guide.name} className="h-full w-full" /><div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" /><span className="absolute bottom-3 left-4 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-900">{guide.name} crop</span></div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <Sprout className="h-5 w-5 text-primary" />
              {guide.name}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{guide.description}</p>
          </div>
          <Badge className={categoryColors[guide.category]}>{guide.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conditions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="conditions" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <ThermometerSun className="mt-0.5 h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Air Temperature</p>
                  <p className="text-sm font-semibold text-foreground">
                    {guide.optimalConditions.airTempMin}°C - {guide.optimalConditions.airTempMax}°C
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Droplets className="mt-0.5 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Humidity</p>
                  <p className="text-sm font-semibold text-foreground">
                    {guide.optimalConditions.humidityMin}% - {guide.optimalConditions.humidityMax}%
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Sun className="mt-0.5 h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Sun Needs</p>
                  <p className="text-sm font-semibold capitalize text-foreground">{guide.sunNeeds} sun</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Droplets className="mt-0.5 h-5 w-5 text-cyan-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Water Needs</p>
                  <Badge className={waterNeedsColors[guide.waterNeeds]}>{guide.waterNeeds}</Badge>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Monthly Rainfall Needs</p>
              <p className="text-sm font-semibold text-foreground">
                {guide.optimalConditions.rainfallMin}mm - {guide.optimalConditions.rainfallMax}mm
              </p>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4 space-y-4">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Sowing Seasons
              </h4>
              {guide.sowingSeasons.map((season, index) => (
                <div key={index} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {season.hemisphere} Hemisphere
                    </Badge>
                    <span className="text-xs text-muted-foreground">{season.description}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {season.months.map((month) => (
                      <span key={month} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {
                          ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
                            month - 1
                          ]
                        }
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border p-3">
              <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Growth Duration
              </h4>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {guide.growthDuration.minDays} - {guide.growthDuration.maxDays} days
              </p>
            </div>
          </TabsContent>

          <TabsContent value="stages" className="mt-4">
            <div className="space-y-3">
              {guide.growthDuration.stages.map((stage, index) => (
                <div key={index} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-foreground">{stage.name}</h5>
                    <Badge variant="outline">{stage.durationDays} days</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
                  <ul className="mt-2 space-y-1">
                    {stage.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="mt-4 space-y-4">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Harvest Indicators
              </h4>
              <ul className="space-y-1">
                {guide.harvestIndicators.map((indicator, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Leaf className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4 text-blue-500" />
                Companion Plants
              </h4>
              <div className="flex flex-wrap gap-1">
                {guide.companions.map((companion) => (
                  <Badge key={companion} variant="outline" className="bg-green-50 text-green-700">
                    {companion}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <XCircle className="h-4 w-4 text-red-500" />
                Avoid
              </h4>
              <ul className="space-y-1">
                {guide.avoid.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
