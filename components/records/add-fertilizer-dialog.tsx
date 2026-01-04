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

interface AddFertilizerDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function AddFertilizerDialog({ children, onSuccess }: AddFertilizerDialogProps) {
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
        record_type: "fertilizer",
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

      const fertilizerRecord = {
        record_id: record.id,
        crop_id: selectedCrop,
        product_name: formData.get("product_name"),
        fertilizer_type: formData.get("fertilizer_type"),
        quantity_applied: parseFloat(formData.get("quantity_applied") as string),
        unit: formData.get("unit"),
        npk_ratio: formData.get("npk_ratio"),
        application_method: formData.get("application_method"),
        notes: formData.get("notes"),
      }

      const { error: fertError } = await supabase.from("fertilizer_records").insert([fertilizerRecord])

      if (fertError) throw fertError

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error adding fertilizer record:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Fertilizer Application</DialogTitle>
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
            <Input id="title" name="title" placeholder="e.g., Nitrogen application" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recorded_date">Date</Label>
            <Input id="recorded_date" name="recorded_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name</Label>
            <Input id="product_name" name="product_name" placeholder="Brand name and product" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fertilizer_type">Fertilizer Type</Label>
            <Select name="fertilizer_type" defaultValue="synthetic">
              <SelectTrigger id="fertilizer_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="synthetic">Synthetic</SelectItem>
                <SelectItem value="foliar">Foliar</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity_applied">Quantity</Label>
              <Input id="quantity_applied" name="quantity_applied" type="number" step="0.01" placeholder="0.0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select name="unit" defaultValue="kg">
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="L">Liters (L)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="mL">Milliliters (mL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="npk_ratio">NPK Ratio (optional)</Label>
            <Input id="npk_ratio" name="npk_ratio" placeholder="e.g., 10-10-10" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="application_method">Application Method</Label>
            <Select name="application_method" defaultValue="broadcast">
              <SelectTrigger id="application_method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="broadcast">Broadcast</SelectItem>
                <SelectItem value="banding">Banding</SelectItem>
                <SelectItem value="foliar">Foliar</SelectItem>
                <SelectItem value="drip">Drip</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
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
