"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, MapPin, Layers, ZoomIn, ZoomOut, Navigation } from "lucide-react"

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
  const [selectedLayer, setSelectedLayer] = useState("true-color")
  const [zoomLevel, setZoomLevel] = useState(17)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [captureDate, setCaptureDate] = useState<string>("")
  const [cloudCover, setCloudCover] = useState<number | null>(null)
  const [placeLabels, setPlaceLabels] = useState(true)

  const satelliteLayers = [
    { id: "true-color", name: "Natural color", description: "True-color NASA MODIS Terra imagery for field context.", tileUrl: "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/__GIBS_DATE__/GoogleMapsCompatible_Level9/9/{y}/{x}.jpg", attribution: "NASA GIBS / MODIS Terra True Color" },
    { id: "ndvi", name: "Crop health (NDVI)", description: "NASA vegetation index layer for crop vigor and stress patterns.", tileUrl: "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Vegetation_Indices_16Day_NDVI/default/__GIBS_DATE__/GoogleMapsCompatible_Level9/9/{y}/{x}.jpg", attribution: "NASA GIBS / MODIS NDVI" },
    { id: "moisture", name: "Water stress", description: "NASA land-surface temperature layer to help identify water-stressed areas.", tileUrl: "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temperature_Day/default/__GIBS_DATE__/GoogleMapsCompatible_Level9/9/{y}/{x}.jpg", attribution: "NASA GIBS / MODIS Land Surface Temperature" },
  ]

  useEffect(() => {
    if (!mapContainerRef.current) return

    const loadMapLibraries = async () => {
      try {
        setLoading(true)
        setError(null)
        const metadataResponse = await fetch(`/api/satellite-metadata?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`)
        let imageryDate = new Date().toISOString().slice(0, 10)
        if (metadataResponse.ok) {
          const { capture } = await metadataResponse.json()
          imageryDate = capture?.date || imageryDate
          setCaptureDate(capture?.date || "")
          setCloudCover(typeof capture?.cloudCover === "number" ? capture.cloudCover : null)
        }

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
        initializeMap(imageryDate)
      } catch (err) {
        console.error("[v0] Error loading map libraries:", err)
        setError("Failed to load mapping library. Satellite imagery display requires internet connection.")
        setLoading(false)
      }
    }

    const initializeMap = (imageryDate: string) => {
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
          minZoom: 3,
          maxZoom: 19,
          zoomControl: false,
          attributionControl: true,
        })

        const clearFarmBase = window.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution: "Esri World Imagery; NASA MODIS overlay",
          minZoom: 3,
          maxZoom: 19,
          maxNativeZoom: 18,
        }).addTo(map)

        const layer = satelliteLayers.find((l) => l.id === selectedLayer)
        if (!layer) throw new Error("Selected satellite layer not found")

        const satelliteLayer = window.L.tileLayer(layer.tileUrl.replace("__GIBS_DATE__", imageryDate.replace(/-/g, "")), {
          attribution: layer.attribution,
          maxZoom: 9,
          minZoom: 3,
          maxNativeZoom: 9,
          opacity: 0.62,
          crossOrigin: "anonymous",
          subdomains: "abc",
          tms: false,
        }).addTo(map)

        if (placeLabels) {
          window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "Place labels © OpenStreetMap contributors",
            opacity: 0.78,
            minZoom: 3,
            maxZoom: 19,
            zIndex: 500,
          }).addTo(map)
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

        // Keep the farm nomenclature visible even when the popup is closed.
        const locationLabel = window.L.divIcon({
          className: "farm-location-label",
          html: `<span>${fieldName}</span>`,
          iconSize: [0, 0],
          iconAnchor: [-14, 18],
        })
        window.L.marker([latitude, longitude], { icon: locationLabel, interactive: false, zIndexOffset: 1000 }).addTo(map)

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
  }, [latitude, longitude, fieldName, cropName, selectedLayer])

  const navigateToFarm = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/satellite-metadata?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&refresh=1`, { cache: "no-store" })
      if (response.ok) {
        const { capture } = await response.json()
        setCaptureDate(capture?.date || "")
        setCloudCover(typeof capture?.cloudCover === "number" ? capture.cloudCover : null)
      }
      mapRef.current?.flyTo([latitude, longitude], Math.max(zoomLevel, 17), { duration: 1.2 })
    } finally {
      setLoading(false)
    }
  }

  const handleZoom = (direction: "in" | "out") => {
    if (!mapRef.current) return
    const newZoom = direction === "in" ? zoomLevel + 1 : zoomLevel - 1
    if (newZoom >= 3 && newZoom <= 19) {
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
              <CardTitle>NASA MODIS True Color Imaging</CardTitle>
              <CardDescription>Latest clear NASA capture with sharp high-zoom farm imagery and visible place names</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToFarm}
            disabled={loading}
            className="gap-2"
          >
            <Navigation className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Latest at farm
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Satellite imagery layers">{satelliteLayers.map((layer) => <Button key={layer.id} type="button" variant={selectedLayer === layer.id ? "default" : "outline"} size="sm" onClick={() => setSelectedLayer(layer.id)} disabled={loading} className="justify-start gap-2"><Layers className="h-4 w-4" />{layer.name}</Button>)}</div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted p-2.5 text-xs">
        <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Latest satellite + high-resolution farm view</p>
          </div>
          <span className="text-muted-foreground">{captureDate ? `Capture: ${captureDate}` : "Latest capture unavailable"}{cloudCover !== null ? ` · ${cloudCover.toFixed(0)}% cloud` : ""}</span>
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
                disabled={loading || zoomLevel <= 3}
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
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{currentLayer.name} through zoom 9; Esri high-resolution imagery beyond zoom 9</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{currentLayer.description}</p>
              </div>
            </div>
          </div>
        )}

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
