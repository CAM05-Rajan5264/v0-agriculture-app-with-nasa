"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { NaturalEvent, Farm } from "@/lib/types"
import { Flame, CloudRain, Wind, AlertTriangle, Mountain, Activity, ExternalLink, MapPin, Info } from "lucide-react"

interface NaturalEventsMapProps {
  events: NaturalEvent[]
  farms: Farm[]
}

const categoryIcons = {
  wildfires: Flame,
  floods: CloudRain,
  storms: Wind,
  drought: AlertTriangle,
  earthquakes: Activity,
  volcanoes: Mountain,
  other: AlertTriangle,
}

const categoryColors = {
  wildfires: "text-orange-500 bg-orange-500/10",
  floods: "text-blue-500 bg-blue-500/10",
  storms: "text-purple-500 bg-purple-500/10",
  drought: "text-amber-500 bg-amber-500/10",
  earthquakes: "text-red-500 bg-red-500/10",
  volcanoes: "text-red-600 bg-red-600/10",
  other: "text-gray-500 bg-gray-500/10",
}

const severityColors = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-blue-500 text-white",
}

export function NaturalEventsMap({ events, farms }: NaturalEventsMapProps) {
  const groupedEvents = events.reduce(
    (acc, event) => {
      if (!acc[event.category]) {
        acc[event.category] = []
      }
      acc[event.category].push(event)
      return acc
    },
    {} as Record<string, NaturalEvent[]>,
  )

  const categoryStats = Object.entries(groupedEvents).map(([category, eventList]) => ({
    category: category as keyof typeof categoryIcons,
    count: eventList.length,
    critical: eventList.filter((e) => e.severity === "critical").length,
  }))

  return (
    <div className="space-y-6">
      {events.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No Active Natural Events Nearby</h3>
            <p className="text-center text-muted-foreground">
              There are currently no significant natural events within 500km of your farms. NASA EONET monitors events
              globally.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {categoryStats.map(({ category, count, critical }) => {
              const Icon = categoryIcons[category]
              return (
                <Card key={category} className="border-border bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm capitalize text-muted-foreground">{category}</p>
                        <p className="mt-1 text-3xl font-bold text-foreground">{count}</p>
                        {critical > 0 && (
                          <Badge className="mt-2 bg-red-500 text-white">
                            {critical} critical
                          </Badge>
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${categoryColors[category]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Active Natural Events
                </CardTitle>
                <Badge variant="outline">{events.length} events within 500km</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => {
                  const Icon = categoryIcons[event.category]
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 rounded-lg border border-border p-4 transition-all hover:border-primary/50 hover:shadow-md"
                    >
                      <div className={`rounded-lg p-3 ${categoryColors[event.category]}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-foreground">{event.title}</h4>
                            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <Badge className={severityColors[event.severity]}>{event.severity}</Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {event.distanceKm} km from nearest farm
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="capitalize">
                              {event.category.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className={event.status === "active" ? "border-red-500 text-red-500" : ""}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>

                        {event.link && (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View source
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Your Farms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {farms.map((farm) => (
                  <div key={farm.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{farm.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {farm.location_name} ({farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>About NASA EONET:</strong> The Earth Observatory Natural Event Tracker (EONET) provides near
              real-time tracking of natural events worldwide including wildfires, storms, floods, volcanoes, and more.
              Events are sourced from multiple government agencies and research organizations. Distance is calculated from
              your nearest farm location. Monitor these events for potential impacts on your agricultural operations.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
