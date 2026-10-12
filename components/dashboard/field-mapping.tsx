"use client"

import "leaflet/dist/leaflet.css"
import { useMemo, useState } from "react"
import { Circle, MapContainer, Popup, TileLayer, useMap } from "react-leaflet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ArrowRight, CheckCircle2, MapPinned, RotateCcw, ScanLine, Sprout, Tractor } from "lucide-react"

type Farm = { id: string; name: string; location_name: string; latitude: number; longitude: number; area_hectares: number | null }
type Crop = { id: string; name: string; variety: string | null; planting_date: string | null; expected_harvest_date: string | null; farms: { name: string } | null }

const rotations = [
  { season: "2026", crop: "Maize", field: "North block", status: "Current", color: "bg-primary" },
  { season: "2025", crop: "Legumes", field: "North block", status: "Completed", color: "bg-amber-500" },
  { season: "2024", crop: "Wheat", field: "North block", status: "Completed", color: "bg-sky-500" },
]

function FitBounds({ farms, activeFarm }: { farms: Farm[]; activeFarm?: Farm }) {
  const map = useMap()
  const target = activeFarm || farms[0]
  if (target) map.setView([target.latitude, target.longitude], activeFarm ? 16 : 12, { animate: false })
  return null
}

export function FieldMapping({ farms, crops, latestImagery }: { farms: Farm[]; crops: Crop[]; latestImagery: Record<string, { date: string; cloudCover: number; satellite: string } | null> }) {
  const [selectedFarm, setSelectedFarm] = useState(farms[0]?.id || "")
  const activeFarm = farms.find((farm) => farm.id === selectedFarm) || farms[0]
  const activeCrops = crops.filter((crop) => crop.farms?.name === activeFarm?.name)
  const traceSteps = ["Seed source verified", "Field geotagged", "Crop monitored", "Harvest destination"]
  const mapCenter = useMemo(() => [activeFarm?.latitude || 20.5937, activeFarm?.longitude || 78.9629] as [number, number], [activeFarm])

  if (!farms.length) return <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><MapPinned className="size-10 text-muted-foreground" /><h2 className="text-xl font-semibold">Add a farm to start mapping</h2><p className="max-w-md text-sm text-muted-foreground">Your GPS coordinates will appear here as a digital field boundary and traceability record.</p></CardContent></Card>

  return <div className="flex flex-col gap-6">
    <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
      <Card className="overflow-hidden border-0 shadow-sm"><CardHeader className="flex flex-row items-start justify-between gap-4"><div><Badge className="mb-2 gap-1"><ScanLine data-icon="inline-start" /> Live GPS layer</Badge><CardTitle>Latest satellite field view</CardTitle><CardDescription>Clear NASA imagery with place labels and farm-level zoom.</CardDescription></div><Button variant="outline" size="sm" onClick={() => window.location.reload()}><RotateCcw data-icon="inline-start" />Refresh GPS</Button></CardHeader><CardContent className="p-0"><MapContainer center={mapCenter} zoom={activeFarm ? 16 : 5} scrollWheelZoom className="h-[380px] w-full"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.82} /><TileLayer attribution='Imagery &copy; NASA GIBS' url={`https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${(latestImagery[activeFarm.id]?.date || new Date().toISOString().slice(0, 10)).replace(/-/g, '')}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`} opacity={0.68} maxNativeZoom={9} maxZoom={18} /><FitBounds farms={farms} activeFarm={activeFarm} />{farms.map((farm) => <Circle key={farm.id} center={[farm.latitude, farm.longitude]} radius={Math.max(110, (farm.area_hectares || 4) * 42)} pathOptions={{ color: farm.id === selectedFarm ? "#18794e" : "#94a3b8", fillColor: farm.id === selectedFarm ? "#5ebd87" : "#cbd5e1", fillOpacity: 0.35 }} eventHandlers={{ click: () => setSelectedFarm(farm.id) }}><Popup><strong>{farm.name}</strong><br />{farm.location_name}<br />{farm.area_hectares || "—"} hectares</Popup></Circle>)}</MapContainer></CardContent></Card>
      <Card className="border-0 shadow-sm"><CardHeader><CardTitle>Mapped farms</CardTitle><CardDescription>Select a boundary to inspect it.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{farms.map((farm) => <button key={farm.id} type="button" onClick={() => setSelectedFarm(farm.id)} className={cn("flex items-center justify-between rounded-2xl border p-3 text-left transition-colors", selectedFarm === farm.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50")}><span><span className="block font-semibold">{farm.name}</span><span className="text-xs text-muted-foreground">{farm.location_name}</span></span><span className="text-right text-xs text-muted-foreground">{farm.area_hectares || "—"} ha<br />{farm.latitude.toFixed(3)}, {farm.longitude.toFixed(3)}</span></button>)}<Separator /><div className="rounded-2xl bg-primary/5 p-4"><div className="flex items-center gap-2 font-semibold"><ScanLine className="size-4 text-primary" /> Latest clear capture</div><p className="mt-1 text-sm text-muted-foreground">{latestImagery[activeFarm?.id || ""] ? `${latestImagery[activeFarm?.id || ""]?.date} · ${latestImagery[activeFarm?.id || ""]?.cloudCover.toFixed(0)}% cloud cover` : "NASA imagery metadata is unavailable"}</p></div><div className="rounded-2xl bg-muted/50 p-4"><div className="flex items-center gap-2 font-semibold"><Tractor className="size-4 text-primary" /> Active field</div><p className="mt-1 text-sm text-muted-foreground">{activeFarm?.name} has {activeCrops.length} tracked crop{activeCrops.length === 1 ? "" : "s"}.</p></div></CardContent></Card>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Sprout className="size-5 text-primary" /> Crop rotation plan</CardTitle><CardDescription>Keep soil productive with a clear field history.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{rotations.map((rotation) => <div key={rotation.season} className="flex items-center gap-3 rounded-2xl border p-3"><div className={cn("size-3 rounded-full", rotation.color)} /><div className="min-w-0 flex-1"><p className="font-semibold">{rotation.crop} <span className="font-normal text-muted-foreground">· {rotation.field}</span></p><p className="text-xs text-muted-foreground">{rotation.season} season</p></div><Badge variant={rotation.status === "Current" ? "default" : "secondary"}>{rotation.status}</Badge></div>)}<Button variant="outline" className="mt-1">Plan next rotation <ArrowRight data-icon="inline-end" /></Button></CardContent></Card>
      <Card className="border-0 shadow-sm"><CardHeader><CardTitle>Farm-to-fork traceability</CardTitle><CardDescription>{activeFarm?.name} · {activeCrops[0]?.name || "No active crop selected"}</CardDescription></CardHeader><CardContent className="flex flex-col gap-4">{traceSteps.map((step, index) => <div key={step} className="flex items-center gap-3"><CheckCircle2 className={cn("size-5", index < 3 ? "text-primary" : "text-muted-foreground")} /><div className="flex-1"><p className="font-medium">{step}</p><p className="text-xs text-muted-foreground">{index < 3 ? "Verified in FarmPulse records" : "Ready for harvest entry"}</p></div><span className="text-xs font-medium text-muted-foreground">{index < 3 ? "Done" : "Next"}</span></div>)}</CardContent></Card>
    </div>
  </div>
}
