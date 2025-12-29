"use client"

import { useState, useEffect } from "react"
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
  const [worldviewUrl, setWorldviewUrl] = useState<string>("")
  const currentLayer = layers.find((l) => l.id === selectedLayer) || layers[0]

  useEffect(() => {
    if (currentLayer) {
      const bbox = `${longitude - 5},${latitude - 5},${longitude + 5},${latitude + 5}`
      const layerId = currentLayer.layer || 'MODIS_Terra_CorrectedReflectance_TrueColor'
      const url = `https://worldview.earthdata.nasa.gov/?v=${bbox}&l=${layerId}&t=${new Date().toISOString().split('T')[0]}`
      setWorldviewUrl(url)
    }
  }, [selectedLayer, currentLayer, latitude, longitude])

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
          {worldviewUrl && (
            <iframe
              key={worldviewUrl}
              src={worldviewUrl}
              className="h-full w-full"
              title={`NASA Worldview - ${currentLayer?.name || 'Satellite'} - ${farmName}`}
              style={{ border: 0 }}
              allowFullScreen
            />
          )}
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
          onClick={() => worldviewUrl && window.open(worldviewUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Full Screen
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
            <strong>{currentLayer.name}:</strong> {currentLayer.description}. Select different layers above to view various satellite data. Open in full screen for interactive NASA Worldview controls.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 font-medium text-foreground">About Satellite Data</h4>
        <p className="text-sm text-muted-foreground">
          Displaying NASA Worldview satellite imagery for {farmName}. You can select different satellite layers (MODIS, VIIRS, Landsat, Sentinel) to analyze vegetation health, thermal data, and environmental conditions. Change the layer to see different satellite perspectives of your farm.
        </p>
      </div>
    </div>
  )
}
