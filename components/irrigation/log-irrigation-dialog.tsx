"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Droplets, Plus } from "lucide-react"

interface LogIrrigationDialogProps {
  cropId: string
  cropName: string
  recommendedAmount?: number
  currentSoilMoisture?: number
}

export function LogIrrigationDialog({
  cropId,
  cropName,
  recommendedAmount,
  currentSoilMoisture,
}: LogIrrigationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(recommendedAmount?.toFixed(1) || "")
  const [method, setMethod] = useState<string>("")
  const [moistureBefore, setMoistureBefore] = useState(currentSoilMoisture?.toFixed(0) || "")
  const [moistureAfter, setMoistureAfter] = useState("")
  const [notes, setNotes] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { error } = await supabase.from("irrigation_events").insert({
      crop_id: cropId,
      user_id: user.id,
      irrigation_amount_mm: Number.parseFloat(amount),
      irrigation_method: method || null,
      soil_moisture_before: moistureBefore ? Number.parseFloat(moistureBefore) : null,
      soil_moisture_after: moistureAfter ? Number.parseFloat(moistureAfter) : null,
      notes: notes || null,
      irrigated_at: new Date().toISOString(),
    })

    setLoading(false)

    if (!error) {
      setOpen(false)
      setAmount("")
      setMethod("")
      setMoistureBefore("")
      setMoistureAfter("")
      setNotes("")
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Log Irrigation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Log Irrigation Event
          </DialogTitle>
          <DialogDescription>Record irrigation for {cropName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Water Amount (mm) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.1"
                min="0"
                placeholder={recommendedAmount ? `Recommended: ${recommendedAmount.toFixed(1)} mm` : "Enter amount"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">Irrigation Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drip">Drip Irrigation</SelectItem>
                  <SelectItem value="sprinkler">Sprinkler</SelectItem>
                  <SelectItem value="flood">Flood/Furrow</SelectItem>
                  <SelectItem value="manual">Manual/Hose</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="moistureBefore">Soil Moisture Before (%)</Label>
                <Input
                  id="moistureBefore"
                  type="number"
                  min="0"
                  max="100"
                  placeholder={currentSoilMoisture ? `Current: ${currentSoilMoisture.toFixed(0)}%` : "0-100"}
                  value={moistureBefore}
                  onChange={(e) => setMoistureBefore(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="moistureAfter">Soil Moisture After (%)</Label>
                <Input
                  id="moistureAfter"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={moistureAfter}
                  onChange={(e) => setMoistureAfter(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any observations or comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount}>
              {loading ? "Saving..." : "Log Irrigation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
