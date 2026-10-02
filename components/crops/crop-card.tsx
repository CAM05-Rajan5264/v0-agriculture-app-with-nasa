"use client"

import type { Crop, Farm } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CropCardProps {
  crop: Crop & { farms: Farm }
}

export function CropCard({ crop }: CropCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this crop?")) {
      return
    }

    setIsDeleting(true)
    const supabase = createClient()
    await supabase.from("crops").delete().eq("id", crop.id)
    router.refresh()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground"
      case "harvested":
        return "bg-muted text-muted-foreground"
      case "failed":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="glossy-surface overflow-hidden rounded-3xl border-white/70 transition-all hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-medium text-foreground">{crop.name}</CardTitle>
          <Badge className={getStatusColor(crop.status)}>{crop.status}</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete crop</span>
        </Button>
      </CardHeader>
      <CardContent>
        {crop.variety && <p className="text-sm text-muted-foreground">{crop.variety}</p>}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{crop.farms?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Planted: {formatDate(crop.planting_date)}</span>
          </div>
          {crop.expected_harvest_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Harvest: {formatDate(crop.expected_harvest_date)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
