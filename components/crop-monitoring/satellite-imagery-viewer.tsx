"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, RefreshCw, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SatelliteImageryViewerProps {
  latitude: number
  longitude: number
  fieldName: string
  cropName: string
}

interface MapLayer {
  id: string
  name: string
  description: string
  tileUrl: string
}

export function SatelliteImageryViewer({
  latitude,
  longitude,
  fieldName,
  cropName,
}: SatelliteImageryViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<string>("ndvi")
  const [zoomLevel, setZoomLevel] = useState(12)

  // NASA GIBS Layers for crop monitoring
  const satelliteLayers: MapLayer[] = [
    {
      id: "ndvi",
      name: "Vegetation Index (NDVI)",
      description: "Normalized Difference Vegetation Index - green areas show healthy vegetation",
      tileUrl: "https://gibs.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default//GoogleMapsCompatible_Level{z}/{y}/{x}.jpg",
    },
    {
      id: "true-color",
      name: "True Color Imagery",
      description: "Natural color satellite imagery from NASA MODIS",
      tileUrl: "https://gibs.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default//GoogleMapsCompatible_Level{z}/{y}/{x}.jpg",
    },
    {
      id: "agricultural",
      name: "Agricultural Stress",
      description: "Detects agricultural stress and vegetation anomalies",
      tileUrl: "https://gibs.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_Brightness_Temp_Band31_Day/default//GoogleMapsCompatible_Level{z}/{y}/{x}.jpg",
    },
  ]

  useEffect(() => {
    // Initialize Leaflet map only if container exists
    if (!mapContainerRef.current) return

    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load Leaflet CSS if not already loaded
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
          document.head.appendChild(link)
        }

        // Load Leaflet JS if not already loaded
        if (!window.L) {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
          script.onload = () => initializeMap()
          document.head.appendChild(script)
        } else {
          initializeMap()
        }
      } catch (err) {
        setError("Failed to load map library")
        console.error("[v0] Leaflet load error:", err)
      }
    }

    const initializeMap = () => {
      if (!mapContainerRef.current || !window.L) return

      try {
        // Create map instance
        const map = window.L.map(mapContainerRef.current).setView([latitude, longitude], zoomLevel)

        // Add selected layer
        const layer = satelliteLayers.find((l) => l.id === selectedLayer)
        if (layer) {
          window.L.tileLayer(layer.tileUrl, {
            attribution: "NASA GIBS",
            maxZoom: 19,
            minZoom: 1,
          }).addTo(map)
        }

        // Add marker for field location
        window.L.circleMarker([latitude, longitude], {
          radius: 8,
          fillColor: "#10b981",
          color: "#059669",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
          title: `${fieldName} - ${cropName}`,
        }).addTo(map)

        // Add popup to marker
        window.L.popup({
          className: "satellite-popup",
        })
          .setLatLng([latitude, longitude])
          .setContent(`<div class="p-2 text-sm"><p class="font-semibold">${fieldName}</p><p class="text-muted-foreground">${cropName}</p></div>`)
          .addTo(map)

        mapRef.current = map

        // Handle resize
        const handleResize = () => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }

        window.addEventListener("resize", handleResize)
        setLoading(false)

        return () => {
          window.removeEventListener("resize", handleResize)
          if (mapRef.current) {
            mapRef.current.remove()
            mapRef.current = null
          }
        }
      } catch (err) {
        setError("Failed to initialize map")
        console.error("[v0] Map initialization error:", err)
      }
    }

    loadLeaflet()
  }, [latitude, longitude, selectedLayer, zoomLevel])

  const handleLayerChange = (layerId: string) => {
    setSelectedLayer(layerId)
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], zoomLevel)
    }
  }

  const handleZoom = (direction: "in" | "out") => {
    const newZoom = direction === "in" ? zoomLevel + 1 : zoomLevel - 1
    if (newZoom >= 1 && newZoom <= 19) {
      setZoomLevel(newZoom)
      if (mapRef.current) {
        mapRef.current.setZoom(newZoom)
      }
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    // Refresh map tiles
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], zoomLevel)
      setTimeout(() => setLoading(false), 1000)
    }
  }

  const currentLayer = satelliteLayers.find((l) => l.id === selectedLayer)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Satellite Imagery</CardTitle>
              <CardDescription>NASA GIBS satellite data of {fieldName}</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading satellite imagery...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="h-96 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {!error && (
            <div ref={mapContainerRef} className="h-96 w-full bg-muted" />
          )}
        </div>

        {/* Layer Information */}
        {currentLayer && !error && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium text-foreground">{currentLayer.name}</p>
            <p className="text-xs text-muted-foreground">{currentLayer.description}</p>
          </div>
        )}

        {/* Layer Selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Select Satellite Layer:</p>
          <div className="grid gap-2">
            {satelliteLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => handleLayerChange(layer.id)}
                className={`rounded-lg border-2 p-3 text-left transition-all ${
                  selectedLayer === layer.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{layer.name}</p>
                    <p className="text-xs text-muted-foreground">{layer.description}</p>
                  </div>
                  {selectedLayer === layer.id && (
                    <Badge variant="default" className="ml-2">
                      Active
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map Controls Info */}
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
          <p className="text-xs text-blue-700 dark:text-blue-200">
            <strong>Map Controls:</strong> Use scroll to zoom, drag to pan. Green circle marks your field location.
          </p>
        </div>

        {/* Data Source Attribution */}
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Satellite imagery provided by NASA&apos;s Global Imagery Browse Services (GIBS) and MODIS Terra satellite.
            Data is updated regularly for crop monitoring and health assessment.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
