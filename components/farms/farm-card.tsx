"use client"

import type { Farm } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface FarmCardProps {
  farm: Farm
}

export function FarmCard({ farm }: FarmCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

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
        <div className="mt-2 text-xs text-muted-foreground">
          <span>
            Coordinates: {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
          </span>
        </div>
        {farm.area_hectares && (
          <div className="mt-1 text-xs text-muted-foreground">
            <span>Area: {farm.area_hectares} hectares</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
