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

interface AddCostDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function AddCostDialog({ children, onSuccess }: AddCostDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [farms, setFarms] = useState<any[]>([])
  const [crops, setCrops] = useState<any[]>([])
  const [selectedFarm, setSelectedFarm] = useState("")
  const [selectedCrop, setSelectedCrop] = useState("")

  useEffect(() => {
    if (open) {
      loadFarms()
    }
  }, [open])

  useEffect(() => {
    if (selectedFarm) {
      loadCrops(selectedFarm)
    }
  }, [selectedFarm])

  const loadFarms = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("farms")
        .select("id, name")
        .order("created_at", { ascending: false })

      if (error) throw error
      setFarms(data || [])
      if (data && data.length > 0) {
        setSelectedFarm(data[0].id)
      }
    } catch (error) {
      console.error("Error loading farms:", error)
    }
  }

  const loadCrops = async (farmId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crops")
        .select("id, name")
        .eq("farm_id", farmId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCrops(data || [])
      setSelectedCrop("")
    } catch (error) {
      console.error("Error loading crops:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFarm) return

    setLoading(true)
    try {
      const supabase = createClient()
      const formData = new FormData(e.currentTarget)

      const farmRecord = {
        record_type: "cost",
        title: formData.get("title"),
        description: formData.get("description"),
        recorded_date: formData.get("date_incurred"),
        farm_id: selectedFarm,
        crop_id: selectedCrop || null,
      }

      const { data: record, error: recordError } = await supabase
        .from("farm_records")
        .insert([farmRecord])
        .select()
        .single()

      if (recordError) throw recordError

      const costRecord = {
        record_id: record.id,
        farm_id: selectedFarm,
        crop_id: selectedCrop || null,
        expense_type: formData.get("expense_type"),
        category: formData.get("category"),
        amount: parseFloat(formData.get("amount") as string),
        currency: formData.get("currency") || "USD",
        description: formData.get("description"),
        date_incurred: formData.get("date_incurred"),
      }

      const { error: costError } = await supabase.from("cost_records").insert([costRecord])

      if (costError) throw costError

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error adding cost record:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Farm Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="farm">Farm</Label>
            <Select value={selectedFarm} onValueChange={setSelectedFarm}>
              <SelectTrigger id="farm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop">Crop (optional)</Label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger id="crop">
                <SelectValue placeholder="Select a crop or leave blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g., Fertilizer purchase" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_incurred">Date</Label>
            <Input id="date_incurred" name="date_incurred" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_type">Expense Type</Label>
            <Select name="expense_type" defaultValue="other">
              <SelectTrigger id="expense_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seeds">Seeds</SelectItem>
                <SelectItem value="fertilizer">Fertilizer</SelectItem>
                <SelectItem value="pesticide">Pesticide</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="fuel">Fuel</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" placeholder="e.g., Urea, Diesel, Labor Cost" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue="USD">
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="ZAR">ZAR (R)</SelectItem>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Invoice number, details, notes..." className="resize-none" />
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
