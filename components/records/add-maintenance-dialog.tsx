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

interface AddMaintenanceDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function AddMaintenanceDialog({ children, onSuccess }: AddMaintenanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [farms, setFarms] = useState<any[]>([])
  const [selectedFarm, setSelectedFarm] = useState("")

  useEffect(() => {
    if (open) {
      loadFarms()
    }
  }, [open])

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFarm) return

    setLoading(true)
    try {
      const supabase = createClient()
      const formData = new FormData(e.currentTarget)

      const farmRecord = {
        record_type: "maintenance",
        title: formData.get("title"),
        description: formData.get("description"),
        recorded_date: formData.get("date_performed"),
        farm_id: selectedFarm,
      }

      const { data: record, error: recordError } = await supabase
        .from("farm_records")
        .insert([farmRecord])
        .select()
        .single()

      if (recordError) throw recordError

      const maintenanceRecord = {
        record_id: record.id,
        farm_id: selectedFarm,
        equipment_name: formData.get("equipment_name"),
        maintenance_type: formData.get("maintenance_type"),
        description: formData.get("description"),
        cost: formData.get("cost") ? parseFloat(formData.get("cost") as string) : null,
        date_performed: formData.get("date_performed"),
        next_service_date: formData.get("next_service_date"),
        notes: formData.get("notes"),
      }

      const { error: maintError } = await supabase.from("maintenance_records").insert([maintenanceRecord])

      if (maintError) throw maintError

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error adding maintenance record:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Maintenance</DialogTitle>
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
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g., Tractor oil change" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_name">Equipment Name</Label>
            <Input id="equipment_name" name="equipment_name" placeholder="e.g., John Deere Tractor" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance_type">Maintenance Type</Label>
            <Select name="maintenance_type" defaultValue="service">
              <SelectTrigger id="maintenance_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="replacement">Replacement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_performed">Date Performed</Label>
            <Input id="date_performed" name="date_performed" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (optional)</Label>
              <Input id="cost" name="cost" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_service_date">Next Service Date</Label>
              <Input id="next_service_date" name="next_service_date" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="What was done, parts replaced, etc." className="resize-none" />
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
