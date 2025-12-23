"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { SatelliteImageLayer } from "@/lib/types"
import { Layers, Info } from "lucide-react"

interface SatelliteImageViewerProps {
  latitude: number
  longitude: number
  farmName: string
  layers: SatelliteImageLayer[]
}

export function SatelliteImageViewer({ latitude, longitude, farmName, layers }: SatelliteImageViewerProps) {
  const [selectedLayer, setSelectedLayer] = useState<string>(layers[0]?.id || "")
  const currentLayer = layers.find((l) => l.id === selectedLayer) || layers[0]

  const zoom = 12
  const tileX = Math.floor(((longitude + 180) / 360) * Math.pow(2, zoom))
  const tileY = Math.floor(
    ((1 -
      Math.log(Math.tan((latitude * Math.PI) / 180) + 1 / Math.cos((latitude * Math.PI) / 180)) / Math.PI) /
      2) *
      Math.pow(2, zoom),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Select Satellite Layer</span>
        </div>
        <Select value={selectedLayer} onValueChange={setSelectedLayer}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose layer" />
          </SelectTrigger>
          <SelectContent>
            {layers.map((layer) => (
              <SelectItem key={layer.id} value={layer.id}>
                {layer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
        <div className="aspect-video w-full bg-gradient-to-br from-slate-900 to-slate-800">
          {currentLayer && (
            <img
              src={currentLayer.tileUrl.replace("{z}", String(zoom)).replace("{x}", String(tileX)).replace("{y}", String(tileY))}
              alt={`${currentLayer.name} - ${farmName}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          )}
          <div className="absolute top-3 left-3">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              {farmName} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">{currentLayer?.resolution} resolution</Badge>
          </div>
        </div>
      </div>

      {currentLayer && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>{currentLayer.name}:</strong> {currentLayer.description}. Data from NASA GIBS (Global Imagery Browse
            Services) for {currentLayer.date}.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 font-medium text-foreground">About NASA Satellite Imagery</h4>
        <p className="text-sm text-muted-foreground">
          These satellite images are provided by NASA&apos;s Global Imagery Browse Services (GIBS). They offer near real-time
          views of Earth from various satellites including MODIS (Terra/Aqua) and VIIRS. The imagery is updated daily and
          provides valuable insights into vegetation health, surface temperature, and environmental conditions.
        </p>
      </div>
    </div>
  )
}
