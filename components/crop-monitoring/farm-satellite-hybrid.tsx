"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, MapPin, Layers, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

interface FarmSatelliteHybridProps {
  latitude: number
  longitude: number
  fieldName: string
  cropName: string
}

export function FarmSatelliteHybrid({
  latitude,
  longitude,
  fieldName,
  cropName,
}: FarmSatelliteHybridProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<string>("hybrid")
  const [zoomLevel, setZoomLevel] = useState(9)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const gibsDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  // NASA GIBS Satellite Layers for Hybrid View - Using correct WMTS REST API
  const satelliteLayers = [
    {
      id: "hybrid",
      name: "Satellite Hybrid",
      description: "True color satellite + map overlay showing field boundaries",
      tileUrl: "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/__GIBS_DATE__/GoogleMapsCompatible_Level9/9/{y}/{x}.jpg",
      overlay: "openstreetmap",
    },
    {
      id: "true-color",
      name: "True Color (NASA MODIS)",
      description: "Natural color satellite imagery from NASA MODIS Terra satellite",
      tileUrl: "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/__GIBS_DATE__/GoogleMapsCompatible_Level9/9/{y}/{x}.jpg",
      overlay: null,
    },
    {
      id: "vegetation",
      name: "Agriculture/Vegetation",
      description: "False color composite emphasizing healthy vegetation (green areas)",
      tileUrl: "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_Bands721/default/__GIBS_DATE__/GoogleMapsCompatible_Level9/9/{y}/{x}.jpg",
      overlay: null,
    },
    {
      id: "thermal",
      name: "Thermal/Temperature",
      description: "Infrared thermal data showing soil temperature and moisture stress",
      tileUrl: "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_BrightnessTemp_Band31_Day/default/__GIBS_DATE__/GoogleMapsCompatible_Level9/9/{y}/{x}.jpg",
      overlay: null,
    },
    {
      id: "aqua",
      name: "MODIS Aqua (Afternoon)",
      description: "Afternoon satellite pass showing afternoon vegetation conditions",
      tileUrl: "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_CorrectedReflectance_TrueColor/default/__GIBS_DATE__/GoogleMapsCompatible_Level9/9/{y}/{x}.jpg",
      overlay: null,
    },
  ]

  useEffect(() => {
    if (!mapContainerRef.current) return

    const loadMapLibraries = async () => {
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
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed to load Leaflet"))
            document.head.appendChild(script)
          })
        }

        // Initialize map after libraries are loaded
        initializeMap()
      } catch (err) {
        console.error("[v0] Error loading map libraries:", err)
        setError("Failed to load mapping library. Satellite imagery display requires internet connection.")
        setLoading(false)
      }
    }

    const initializeMap = () => {
      if (!mapContainerRef.current || !window.L) {
        setError("Map container or Leaflet not available")
        setLoading(false)
        return
      }

      try {
        // Clear existing map
        if (mapRef.current) {
          mapRef.current.remove()
        }

        // Create new map instance
        const map = window.L.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: zoomLevel,
          attributionControl: true,
        })

        // Add base layer (OpenStreetMap for map overlay)
        const osmLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 9,
          minZoom: 1,
          opacity: selectedLayer === "hybrid" ? 0.3 : 0,
        })

        // Add NASA GIBS satellite layer
        const layer = satelliteLayers.find((l) => l.id === selectedLayer)
        if (!layer) {
          setError("Selected layer not found")
          setLoading(false)
          return
        }

        console.log("[v0] Loading satellite layer:", {
          id: layer.id,
          name: layer.name,
          tileUrl: layer.tileUrl,
        })

        const satelliteLayer = window.L.tileLayer(layer.tileUrl.replace("__GIBS_DATE__", gibsDate), {
          attribution: "NASA GIBS/MODIS",
          maxZoom: 9,
          minZoom: 1,
          crossOrigin: "anonymous",
          subdomains: "abc",
          tms: false,
        })

        // Add layers in correct order
        satelliteLayer.addTo(map)
        if (selectedLayer === "hybrid") {
          osmLayer.addTo(map)
        }

        // Add field location marker
        const fieldMarker = window.L.circleMarker([latitude, longitude], {
          radius: 10,
          fillColor: "#10b981",
          color: "#059669",
          weight: 2.5,
          opacity: 0.9,
          fillOpacity: 0.8,
        }).addTo(map)

        // Add popup to marker
        const popupContent = document.createElement("div")
        popupContent.className = "p-2"
        const title = document.createElement("p")
        title.className = "font-semibold text-sm"
        title.textContent = fieldName
        const crop = document.createElement("p")
        crop.className = "text-xs text-gray-600"
        crop.textContent = `Crop: ${cropName}`
        const coords = document.createElement("p")
        coords.className = "text-xs text-gray-500 mt-1"
        coords.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`

        popupContent.appendChild(title)
        popupContent.appendChild(crop)
        popupContent.appendChild(coords)

        fieldMarker.bindPopup(popupContent)
        fieldMarker.openPopup()

        // Store map reference
        mapRef.current = map

        // Set last updated time
        const now = new Date()
        setLastUpdated(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))

        // Handle window resize
        const handleResize = () => {
          if (mapRef.current) {
            setTimeout(() => mapRef.current.invalidateSize(), 100)
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
        console.error("[v0] Map initialization error:", err)
        setError("Failed to initialize satellite imagery map")
        setLoading(false)
      }
    }

    loadMapLibraries()
  }, [latitude, longitude, fieldName, cropName])

  // Update map layer when selection changes
  useEffect(() => {
    if (!mapRef.current) return

    try {
      const layer = satelliteLayers.find((l) => l.id === selectedLayer)
      if (!layer) {
        console.warn("[v0] Layer not found:", selectedLayer)
        return
      }

      console.log("[v0] Switching to satellite layer:", {
        id: layer.id,
        name: layer.name,
        tileUrl: layer.tileUrl,
      })

      // Remove all layers
      mapRef.current.eachLayer((l: any) => {
        if (l instanceof window.L.TileLayer) {
          mapRef.current.removeLayer(l)
        }
      })

      // Add new satellite layer
      const satelliteLayer = window.L.tileLayer(layer.tileUrl.replace("__GIBS_DATE__", gibsDate), {
        attribution: "NASA GIBS/MODIS",
        maxZoom: 19,
        minZoom: 1,
        crossOrigin: "anonymous",
        subdomains: "abc",
        tms: false,
      }).addTo(mapRef.current)

      // Add OSM layer if hybrid view
      if (selectedLayer === "hybrid") {
        const osmLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 9,
          minZoom: 1,
          opacity: 0.3,
        }).addTo(mapRef.current)
      }

      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    } catch (err) {
      console.error("[v0] Layer switch error:", err)
    }
  }, [selectedLayer])

  const handleZoom = (direction: "in" | "out") => {
    if (!mapRef.current) return
    const newZoom = direction === "in" ? zoomLevel + 1 : zoomLevel - 1
    if (newZoom >= 1 && newZoom <= 9) {
      setZoomLevel(newZoom)
      mapRef.current.setZoom(newZoom)
    }
  }

  const currentLayer = satelliteLayers.find((l) => l.id === selectedLayer)

  return (
    <Card className="border-border bg-card w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>Farm Satellite Hybrid Imaging</CardTitle>
              <CardDescription>NASA GIBS real-time satellite imagery of {fieldName}</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mapRef.current?.setView([latitude, longitude], zoomLevel)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between rounded-lg bg-muted p-2.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">NASA MODIS Satellite</span>
          </div>
          {lastUpdated && <span className="text-muted-foreground">Updated: {lastUpdated}</span>}
        </div>

        {/* Map Container */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading satellite imagery...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="h-96 flex flex-col items-center justify-center gap-3 p-6 bg-muted">
              <AlertCircle className="h-10 w-10 text-amber-600" />
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">Satellite Imagery Unavailable</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          )}

          <div ref={mapContainerRef} className={`w-full ${error ? "hidden" : "h-96"}`} />

          {/* Zoom Controls */}
          {!error && (
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => handleZoom("in")}
                disabled={loading || zoomLevel >= 19}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => handleZoom("out")}
                disabled={loading || zoomLevel <= 1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Layer Information */}
        {currentLayer && !error && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
            <div className="flex items-start gap-3">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{currentLayer.name}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{currentLayer.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Layer Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Satellite Layers:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {satelliteLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`relative rounded-lg border-2 p-3 text-left transition-all duration-200 ${
                  selectedLayer === layer.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                {selectedLayer === layer.id && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"></div>
                )}
                <p className="text-sm font-medium text-foreground">{layer.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{layer.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Field Information */}
        <div className="rounded-lg bg-muted p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Field:</span>
            <span className="font-medium">{fieldName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Crop:</span>
            <span className="font-medium">{cropName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Coordinates:</span>
            <span className="font-medium font-mono">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data Source:</span>
            <Badge variant="secondary" className="text-xs">NASA MODIS</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
