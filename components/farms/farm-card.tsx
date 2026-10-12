"use client"

import type { Farm } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Trash2, Eye, LocateFixed, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface FarmCardProps {
  farm: Farm
}

export function FarmCard({ farm }: FarmCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const router = useRouter()

  const updateCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location services are not supported by this browser.")
      return
    }
    setIsLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const latitude = Number(coords.latitude.toFixed(6))
      const longitude = Number(coords.longitude.toFixed(6))
      const supabase = createClient()
      const { error } = await supabase.from("farms").update({ latitude, longitude }).eq("id", farm.id)
      if (error) setLocationError(error.message)
      else router.refresh()
      setIsLocating(false)
    }, (error) => {
      setLocationError(error.message || "Could not access your current location.")
      setIsLocating(false)
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this farm? All associated crops and data will be removed.")) {
      return
    }

    setIsDeleting(true)
    const supabase = createClient()
    await supabase.from("farms").delete().eq("id", farm.id)
    router.refresh()
  }

  return (
    <Card className="glossy-surface overflow-hidden rounded-3xl border-white/70 transition-all hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-foreground">{farm.name}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/farms/${farm.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View farm</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete farm</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{farm.location_name}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>Coordinates: {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}</span><Button type="button" variant="outline" size="sm" onClick={updateCurrentLocation} disabled={isLocating} className="h-8 shrink-0 px-2">{isLocating ? <Loader2 className="size-3.5 animate-spin" /> : <LocateFixed className="size-3.5" />}<span className="sr-only">{isLocating ? "Updating location" : "Use current location"}</span></Button></div>
        {locationError && <p role="alert" className="mt-2 text-xs text-destructive">{locationError}</p>}
        {farm.area_hectares && (
          <div className="mt-1 text-xs text-muted-foreground">
            <span>Area: {farm.area_hectares} hectares</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
