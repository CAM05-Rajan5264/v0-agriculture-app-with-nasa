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

interface AddHarvestDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function AddHarvestDialog({ children, onSuccess }: AddHarvestDialogProps) {
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
        record_type: "harvest",
        title: formData.get("title"),
        description: formData.get("description"),
        recorded_date: formData.get("harvest_date"),
        crop_id: selectedCrop,
      }

      const { data: record, error: recordError } = await supabase
        .from("farm_records")
        .insert([farmRecord])
        .select()
        .single()

      if (recordError) throw recordError

      const harvestRecord = {
        record_id: record.id,
        crop_id: selectedCrop,
        quantity_harvested: parseFloat(formData.get("quantity_harvested") as string),
        unit: formData.get("unit"),
        quality_grade: formData.get("quality_grade"),
        harvest_date: formData.get("harvest_date"),
        yield_per_hectare: formData.get("yield_per_hectare") ? parseFloat(formData.get("yield_per_hectare") as string) : null,
        market_price_per_unit: formData.get("market_price_per_unit") ? parseFloat(formData.get("market_price_per_unit") as string) : null,
        total_revenue: formData.get("total_revenue") ? parseFloat(formData.get("total_revenue") as string) : null,
        storage_location: formData.get("storage_location"),
        notes: formData.get("notes"),
      }

      const { error: harvError } = await supabase.from("harvest_records").insert([harvestRecord])

      if (harvError) throw harvError

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error adding harvest record:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Harvest</DialogTitle>
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
            <Input id="title" name="title" placeholder="e.g., Wheat harvest" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="harvest_date">Harvest Date</Label>
            <Input id="harvest_date" name="harvest_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity_harvested">Quantity</Label>
              <Input id="quantity_harvested" name="quantity_harvested" type="number" step="0.01" placeholder="0.0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select name="unit" defaultValue="kg">
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="tonnes">Tonnes</SelectItem>
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality_grade">Quality Grade</Label>
            <Select name="quality_grade" defaultValue="grade_a">
              <SelectTrigger id="quality_grade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="grade_a">Grade A</SelectItem>
                <SelectItem value="grade_b">Grade B</SelectItem>
                <SelectItem value="grade_c">Grade C</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yield_per_hectare">Yield per Hectare (optional)</Label>
            <Input id="yield_per_hectare" name="yield_per_hectare" type="number" step="0.01" placeholder="0.0" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="market_price_per_unit">Market Price/Unit</Label>
              <Input id="market_price_per_unit" name="market_price_per_unit" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_revenue">Total Revenue</Label>
              <Input id="total_revenue" name="total_revenue" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage_location">Storage Location</Label>
            <Input id="storage_location" name="storage_location" placeholder="e.g., Storage shed A" />
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
