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

// NASA GIBS tile endpoints for different satellite layers
const getTileUrl = (layerId: string, zoom: number, x: number, y: number): string => {
  const layerMap: Record<string, string> = {
    "true-color": `https://gibs.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default//GoogleMapsCompatible_Level8/${zoom}/${y}/${x}.jpg`,
    "ndvi": `https://gibs.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_NDVI_8Day/default//GoogleMapsCompatible_Level8/${zoom}/${y}/${x}.jpg`,
    "temperature": `https://gibs.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_LandSurfaceTemp_Day/default//GoogleMapsCompatible_Level8/${zoom}/${y}/${x}.jpg`,
    "nighttime": `https://gibs.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/${zoom}/${y}/${x}.jpg`,
  }

  return layerMap[layerId] || layerMap["true-color"]
}

// Convert lat/long to tile coordinates
const latLngToTile = (lat: number, lng: number, zoom: number) => {
  const n = Math.pow(2, zoom)
  const x = Math.floor(((lng + 180) / 360) * n)
  const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n)
  return { x, y }
}

export function SatelliteImageViewer({ latitude, longitude, farmName, layers }: SatelliteImageViewerProps) {
  const [selectedLayer, setSelectedLayer] = useState<string>(layers[0]?.id || "")
  const [tileUrls, setTileUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentLayer = layers.find((l) => l.id === selectedLayer) || layers[0]
  const zoom = 13

  // Generate satellite tile URLs when layer changes
  useEffect(() => {
    setIsLoading(true)
    console.log("[v0] Loading satellite layer:", selectedLayer, "for location:", latitude, longitude)

    const tile = latLngToTile(latitude, longitude, zoom)

    // Get surrounding tiles for better coverage (3x3 grid)
    const urls: string[] = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const url = getTileUrl(selectedLayer, zoom, tile.x + dx, tile.y + dy)
        urls.push(url)
      }
    }

    setTileUrls(urls)

    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [selectedLayer, latitude, longitude])

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/@${latitude},${longitude},13z/data=!4m2!6m1!1s0x0:0x0?utm_source=mstt_1`
    window.open(url, "_blank")
  }

  const openInGoogleEarth = () => {
    const url = `https://earth.google.com/web/@${latitude},${longitude},0a,50000d,35y,0h,0t,0r`
    window.open(url, "_blank")
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
        <div className="aspect-video w-full bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <div className="mb-2">Loading {currentLayer?.name || "satellite"}...</div>
                <div className="text-sm text-gray-400">Fetching NASA satellite imagery</div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full grid grid-cols-3 gap-0">
              {/* Display 3x3 grid of satellite tiles */}
              {tileUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${url}')`,
                    backgroundSize: "cover",
                  }}
                />
              ))}

              {/* Center marker for farm location */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="bg-red-500 rounded-full w-4 h-4 border-2 border-white shadow-lg" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-red-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              {farmName} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              <MapPin className="mr-1 h-3 w-3" />
              {currentLayer?.name || "Satellite View"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" className="w-full bg-transparent" onClick={openInGoogleMaps}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Google Maps
        </Button>
        <Button variant="outline" className="w-full bg-transparent" onClick={openInGoogleEarth}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View in Google Earth
        </Button>
      </div>

      {currentLayer && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>{currentLayer.name}:</strong> {currentLayer.description}. The red marker shows your farm location. Switch layers to view different aspects of your farm including true color imagery, vegetation health (NDVI), and surface temperature.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 font-medium text-foreground">Satellite Imagery Analysis</h4>
        <p className="text-sm text-muted-foreground">
          Real-time NASA satellite tiles are displayed above, zoomed to your farm location ({latitude.toFixed(4)}, {longitude.toFixed(4)}). Use the layer selector to toggle between true color imagery, vegetation indices, and thermal data for comprehensive farm monitoring. Click the external links below to access interactive maps.
        </p>
      </div>
    </div>
  )
}
