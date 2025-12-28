"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SatelliteImageLayer } from "@/lib/types"
import { Layers, Info, ExternalLink, MapPin } from "lucide-react"

interface SatelliteImageViewerProps {
  latitude: number
  longitude: number
  farmName: string
  layers: SatelliteImageLayer[]
}

export function SatelliteImageViewer({ latitude, longitude, farmName, layers }: SatelliteImageViewerProps) {
  const [selectedLayer, setSelectedLayer] = useState<string>(layers[0]?.id || "")
  const currentLayer = layers.find((l) => l.id === selectedLayer) || layers[0]

  const zoom = 8

  const openInWorldview = () => {
    const url = `https://worldview.earthdata.nasa.gov/?v=${longitude - 5},${latitude - 5},${longitude + 5},${latitude + 5}&l=${currentLayer?.layer || 'MODIS_Terra_CorrectedReflectance_TrueColor'}`
    window.open(url, '_blank')
  }

  const openInGoogleEarth = () => {
    const url = `https://earth.google.com/web/@${latitude},${longitude},0a,50000d,35y,0h,0t,0r`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Satellite Layer Options</span>
        </div>
        <Select value={selectedLayer} onValueChange={setSelectedLayer}>
          <SelectTrigger className="w-full sm:w-64">
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
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.1},${latitude - 0.1},${longitude + 0.1},${latitude + 0.1}&layer=mapnik&marker=${latitude},${longitude}`}
            className="h-full w-full"
            title={`Map of ${farmName}`}
            style={{ border: 0 }}
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              {farmName} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              <MapPin className="mr-1 h-3 w-3" />
              Farm Location
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={openInWorldview}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in NASA Worldview
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={openInGoogleEarth}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View in Google Earth
        </Button>
      </div>

      {currentLayer && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>{currentLayer.name}:</strong> {currentLayer.description}. Click the buttons above to view detailed satellite imagery from NASA Worldview or explore the area in Google Earth with high-resolution satellite views.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 font-medium text-foreground">About Satellite Data Access</h4>
        <p className="text-sm text-muted-foreground">
          Full resolution NASA satellite imagery requires authentication through NASA Earthdata. The map above shows your farm location. For detailed satellite analysis including MODIS, VIIRS, Landsat, and Sentinel data, use the NASA Worldview link to access the complete Global Imagery Browse Services (GIBS) with interactive controls for dates, layers, and comparisons.
        </p>
      </div>
    </div>
  )
}
