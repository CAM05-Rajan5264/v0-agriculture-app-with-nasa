"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface AddIrrigationDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function AddIrrigationDialog({ children, onSuccess }: AddIrrigationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [crops, setCrops] = useState<any[]>([])
  const [selectedCrop, setSelectedCrop] = useState("")

  useEffect(() => {
    if (open) {
      loadCrops()
    }
  }, [open])

  const loadCrops = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crops")
        .select("id, name, farms(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCrops(data || [])
      if (data && data.length > 0) {
        setSelectedCrop(data[0].id)
      }
    } catch (error) {
      console.error("Error loading crops:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCrop) return

    setLoading(true)
    try {
      const supabase = createClient()
      const formData = new FormData(e.currentTarget)

      const farmRecord = {
        record_type: "irrigation",
        title: formData.get("title"),
        description: formData.get("description"),
        recorded_date: formData.get("recorded_date"),
        crop_id: selectedCrop,
      }

      const { data: record, error: recordError } = await supabase
        .from("farm_records")
        .insert([farmRecord])
        .select()
        .single()

      if (recordError) throw recordError

      const irrigationRecord = {
        record_id: record.id,
        crop_id: selectedCrop,
        water_amount_mm: parseFloat(formData.get("water_amount_mm") as string),
        irrigation_method: formData.get("irrigation_method"),
        soil_moisture_before: formData.get("soil_moisture_before") ? parseFloat(formData.get("soil_moisture_before") as string) : null,
        soil_moisture_after: formData.get("soil_moisture_after") ? parseFloat(formData.get("soil_moisture_after") as string) : null,
        duration_minutes: formData.get("duration_minutes") ? parseInt(formData.get("duration_minutes") as string) : null,
        notes: formData.get("notes"),
      }

      const { error: irrigError } = await supabase.from("irrigation_records").insert([irrigationRecord])

      if (irrigError) throw irrigError

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error adding irrigation record:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Irrigation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crop">Crop</Label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger id="crop">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name} - {crop.farms?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g., Morning irrigation" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recorded_date">Date</Label>
            <Input id="recorded_date" name="recorded_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="water_amount_mm">Water Amount (mm)</Label>
            <Input id="water_amount_mm" name="water_amount_mm" type="number" step="0.1" placeholder="0.0" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="irrigation_method">Method</Label>
            <Select name="irrigation_method" defaultValue="drip">
              <SelectTrigger id="irrigation_method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drip">Drip</SelectItem>
                <SelectItem value="sprinkler">Sprinkler</SelectItem>
                <SelectItem value="flood">Flood</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="soil_moisture_before">Soil Moisture Before (%)</Label>
              <Input id="soil_moisture_before" name="soil_moisture_before" type="number" min="0" max="100" step="1" placeholder="0-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soil_moisture_after">Soil Moisture After (%)</Label>
              <Input id="soil_moisture_after" name="soil_moisture_after" type="number" min="0" max="100" step="1" placeholder="0-100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
            <Input id="duration_minutes" name="duration_minutes" type="number" min="0" placeholder="Optional" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Additional observations..." className="resize-none" />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Record
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
