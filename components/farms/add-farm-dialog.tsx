"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, MapPin } from "lucide-react"

export function AddFarmDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    locationName: "",
    latitude: "",
    longitude: "",
    areaHectares: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate adding farm - in production this would call an API
      if (!formData.name || !formData.locationName) {
        setError("Please fill in all required fields")
        setIsLoading(false)
        return
      }

      // Farm added successfully
      setOpen(false)
      setFormData({ name: "", locationName: "", latitude: "", longitude: "", areaHectares: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add farm")
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }))
        },
        (err) => {
          setError("Could not get your location: " + err.message)
        },
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Farm
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Farm</DialogTitle>
          <DialogDescription>Enter your farm details to start monitoring crop health.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Farm Name</Label>
              <Input
                id="name"
                placeholder="Green Valley Farm"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="locationName">Location</Label>
              <Input
                id="locationName"
                placeholder="County, State"
                value={formData.locationName}
                onChange={(e) => setFormData((prev) => ({ ...prev, locationName: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="40.7128"
                  value={formData.latitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="-74.0060"
                  value={formData.longitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                  required
                />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={getCurrentLocation} className="w-full bg-transparent">
              <MapPin className="mr-2 h-4 w-4" />
              Use Current Location
            </Button>
            <div className="grid gap-2">
              <Label htmlFor="areaHectares">Area (hectares, optional)</Label>
              <Input
                id="areaHectares"
                type="number"
                step="any"
                placeholder="50"
                value={formData.areaHectares}
                onChange={(e) => setFormData((prev) => ({ ...prev, areaHectares: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Farm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
