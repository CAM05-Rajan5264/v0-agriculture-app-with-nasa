"use client"

import { useState } from "react"
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

  const googleMapsUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.5647621646765!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${latitude}N%20${longitude}E!5e0!3m2!1sen!2s!4v1234567890`

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/@${latitude},${longitude},13z/data=!4m2!6m1!1s0x0:0x0?utm_source=mstt_1`
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
            src={googleMapsUrl}
            className="h-full w-full"
            title={`Google Maps - ${farmName}`}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              {farmName} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              <MapPin className="mr-1 h-3 w-3" />
              {currentLayer?.name || 'Satellite View'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={openInGoogleMaps}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Google Maps
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
            <strong>{currentLayer.name}:</strong> {currentLayer.description}. Switch between satellite layers above to view different imagery types and zoom in to see detailed farm information.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 font-medium text-foreground">About Satellite Imagery</h4>
        <p className="text-sm text-muted-foreground">
          Displaying satellite imagery for {farmName} via Google Maps. You can select different satellite layers to analyze your farm. Click "Open in Google Maps" for interactive satellite controls, or use "Google Earth" for high-resolution 3D imagery and historical views.
        </p>
      </div>
    </div>
  )
}
