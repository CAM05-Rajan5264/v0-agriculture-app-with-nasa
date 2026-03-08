"use client"

import type { Farm } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Eye } from "lucide-react"
import Link from "next/link"

interface FarmCardProps {
  farm: Farm
}

export function FarmCard({ farm }: FarmCardProps) {

  return (
    <Card className="border-border bg-card transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-foreground">{farm.name}</CardTitle>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/farms/${farm.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View farm</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{farm.location_name || "Unknown location"}</span>
        </div>
        {farm.latitude && farm.longitude && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span>
              Coordinates: {Number(farm.latitude).toFixed(4)}, {Number(farm.longitude).toFixed(4)}
            </span>
          </div>
        )}
        {farm.area_hectares && (
          <div className="mt-1 text-xs text-muted-foreground">
            <span>Area: {farm.area_hectares} hectares</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
