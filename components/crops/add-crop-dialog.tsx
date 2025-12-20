"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Farm } from "@/lib/types"

interface AddCropDialogProps {
  farms: Farm[]
}

const cropTypes = [
  "Wheat",
  "Corn",
  "Rice",
  "Soybeans",
  "Cotton",
  "Barley",
  "Oats",
  "Sorghum",
  "Sunflower",
  "Canola",
  "Potatoes",
  "Tomatoes",
  "Other",
]

export function AddCropDialog({ farms }: AddCropDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    farmId: "",
    name: "",
    variety: "",
    plantingDate: "",
    expectedHarvestDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("crops").insert({
      farm_id: formData.farmId,
      user_id: user.id,
      name: formData.name,
      variety: formData.variety || null,
      planting_date: formData.plantingDate,
      expected_harvest_date: formData.expectedHarvestDate || null,
    })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    setOpen(false)
    setFormData({ farmId: "", name: "", variety: "", plantingDate: "", expectedHarvestDate: "" })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={farms.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Crop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Crop</DialogTitle>
          <DialogDescription>Track a new crop on your farm.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="farmId">Select Farm</Label>
              <Select
                value={formData.farmId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, farmId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a farm" />
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
            <div className="grid gap-2">
              <Label htmlFor="name">Crop Type</Label>
              <Select
                value={formData.name}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="variety">Variety (optional)</Label>
              <Input
                id="variety"
                placeholder="e.g., Red Winter Wheat"
                value={formData.variety}
                onChange={(e) => setFormData((prev) => ({ ...prev, variety: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plantingDate">Planting Date</Label>
              <Input
                id="plantingDate"
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, plantingDate: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expectedHarvestDate">Expected Harvest Date (optional)</Label>
              <Input
                id="expectedHarvestDate"
                type="date"
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, expectedHarvestDate: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.farmId || !formData.name}>
              {isLoading ? "Adding..." : "Add Crop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
