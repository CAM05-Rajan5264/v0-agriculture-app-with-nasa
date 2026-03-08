"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Crop, Farm } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  crops: Crop[]
  farms: Farm[]
  onActivityAdded: () => void
}

export function AddActivityDialog({ open, onOpenChange, crops, farms, onActivityAdded }: Props) {
  const [activityType, setActivityType] = useState<"pesticide" | "fertilizer" | "harvest" | "maintenance">("pesticide")
  const [loading, setLoading] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState<string>("")
  const [selectedFarm, setSelectedFarm] = useState<string>("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activityDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [pesticideData, setPesticideData] = useState({
    productName: "",
    quantityApplied: "",
    unit: "liters",
    diseaseTreated: "",
    effectivenessRating: "3",
  })

  const [fertilizerData, setFertilizerData] = useState({
    fertilizerType: "NPK",
    nitrogenAmount: "",
    phosphorusAmount: "",
    potassiumAmount: "",
  })

  const [harvestData, setHarvestData] = useState({
    quantityHarvested: "",
    harvestUnit: "kg",
    qualityGrade: "A",
    marketPrice: "",
  })

  const [maintenanceData, setMaintenanceData] = useState({
    equipmentName: "",
    maintenanceType: "service",
    cost: "",
    serviceProvider: "",
    nextMaintenanceDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCrop || !selectedFarm) {
      alert("Please select a crop and farm")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const activityData: any = {
        user_id: user.id,
        crop_id: selectedCrop,
        farm_id: selectedFarm,
        activity_type: activityType,
        title: formData.title,
        description: formData.description,
        activity_date: formData.activityDate,
        notes: formData.notes,
      }

      if (activityType === "pesticide") {
        activityData.product_name = pesticideData.productName
        activityData.quantity_applied = Number.parseFloat(pesticideData.quantityApplied)
        activityData.unit_of_measurement = pesticideData.unit
        activityData.disease_treated = pesticideData.diseaseTreated
        activityData.effectiveness_rating = Number.parseInt(pesticideData.effectivenessRating)
      } else if (activityType === "fertilizer") {
        activityData.fertilizer_type = fertilizerData.fertilizerType
        activityData.nitrogen_amount = Number.parseFloat(fertilizerData.nitrogenAmount) || null
        activityData.phosphorus_amount = Number.parseFloat(fertilizerData.phosphorusAmount) || null
        activityData.potassium_amount = Number.parseFloat(fertilizerData.potassiumAmount) || null
      } else if (activityType === "harvest") {
        activityData.quantity_harvested = Number.parseFloat(harvestData.quantityHarvested)
        activityData.harvest_unit = harvestData.harvestUnit
        activityData.quality_grade = harvestData.qualityGrade
        activityData.market_price_per_unit = Number.parseFloat(harvestData.marketPrice) || null
      } else if (activityType === "maintenance") {
        activityData.equipment_name = maintenanceData.equipmentName
        activityData.maintenance_type = maintenanceData.maintenanceType
        activityData.cost = Number.parseFloat(maintenanceData.cost) || null
        activityData.service_provider = maintenanceData.serviceProvider
        activityData.next_maintenance_date = maintenanceData.nextMaintenanceDate || null
      }

      const { error } = await supabase.from("farming_activities").insert([activityData])

      if (error) throw error

      onActivityAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error adding activity:", error)
      alert("Failed to save activity")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Farming Activity</DialogTitle>
          <DialogDescription>Record your farming activities to maintain detailed farm records</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type Selection */}
          <Tabs value={activityType} onValueChange={(v) => setActivityType(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pesticide">Pest Treatment</TabsTrigger>
              <TabsTrigger value="fertilizer">Fertilizer</TabsTrigger>
              <TabsTrigger value="harvest">Harvest</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            {/* Common Fields */}
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farm">Farm</Label>
                  <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select farm" />
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

                <div>
                  <Label htmlFor="crop">Crop</Label>
                  <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.id}>
                          {crop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., First pesticide spray"
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.activityDate}
                  onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about this activity"
                  rows={2}
                />
              </div>
            </div>

            {/* Pesticide Tab */}
            <TabsContent value="pesticide" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={pesticideData.productName}
                    onChange={(e) => setPesticideData({ ...pesticideData, productName: e.target.value })}
                    placeholder="e.g., Neem Oil"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="diseaseTreated">Disease Treated</Label>
                  <Input
                    id="diseaseTreated"
                    value={pesticideData.diseaseTreated}
                    onChange={(e) => setPesticideData({ ...pesticideData, diseaseTreated: e.target.value })}
                    placeholder="e.g., Powdery Mildew"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantityApplied">Quantity Applied</Label>
                  <Input
                    id="quantityApplied"
                    type="number"
                    step="0.01"
                    value={pesticideData.quantityApplied}
                    onChange={(e) => setPesticideData({ ...pesticideData, quantityApplied: e.target.value })}
                    placeholder="Amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={pesticideData.unit}
                    onValueChange={(v) => setPesticideData({ ...pesticideData, unit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="ml">Milliliters</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="grams">Grams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="effectiveness">Effectiveness Rating (1-5)</Label>
                <Select
                  value={pesticideData.effectivenessRating}
                  onValueChange={(v) => setPesticideData({ ...pesticideData, effectivenessRating: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Fair</SelectItem>
                    <SelectItem value="3">3 - Good</SelectItem>
                    <SelectItem value="4">4 - Very Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Fertilizer Tab */}
            <TabsContent value="fertilizer" className="space-y-4">
              <div>
                <Label htmlFor="fertilizerType">Fertilizer Type</Label>
                <Select
                  value={fertilizerData.fertilizerType}
                  onValueChange={(v) => setFertilizerData({ ...fertilizerData, fertilizerType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NPK">NPK Mix</SelectItem>
                    <SelectItem value="Organic">Organic</SelectItem>
                    <SelectItem value="Micronutrients">Micronutrients</SelectItem>
                    <SelectItem value="Nitrogen">Nitrogen Only</SelectItem>
                    <SelectItem value="Phosphorus">Phosphorus Only</SelectItem>
                    <SelectItem value="Potassium">Potassium Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nitrogen">Nitrogen (kg)</Label>
                  <Input
                    id="nitrogen"
                    type="number"
                    step="0.01"
                    value={fertilizerData.nitrogenAmount}
                    onChange={(e) => setFertilizerData({ ...fertilizerData, nitrogenAmount: e.target.value })}
                    placeholder="N amount"
                  />
                </div>
                <div>
                  <Label htmlFor="phosphorus">Phosphorus (kg)</Label>
                  <Input
                    id="phosphorus"
                    type="number"
                    step="0.01"
                    value={fertilizerData.phosphorusAmount}
                    onChange={(e) => setFertilizerData({ ...fertilizerData, phosphorusAmount: e.target.value })}
                    placeholder="P amount"
                  />
                </div>
                <div>
                  <Label htmlFor="potassium">Potassium (kg)</Label>
                  <Input
                    id="potassium"
                    type="number"
                    step="0.01"
                    value={fertilizerData.potassiumAmount}
                    onChange={(e) => setFertilizerData({ ...fertilizerData, potassiumAmount: e.target.value })}
                    placeholder="K amount"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Harvest Tab */}
            <TabsContent value="harvest" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantityHarvested">Quantity Harvested</Label>
                  <Input
                    id="quantityHarvested"
                    type="number"
                    step="0.01"
                    value={harvestData.quantityHarvested}
                    onChange={(e) => setHarvestData({ ...harvestData, quantityHarvested: e.target.value })}
                    placeholder="Amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="harvestUnit">Unit</Label>
                  <Select
                    value={harvestData.harvestUnit}
                    onValueChange={(v) => setHarvestData({ ...harvestData, harvestUnit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="tons">Tons</SelectItem>
                      <SelectItem value="quintals">Quintals</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qualityGrade">Quality Grade</Label>
                  <Select
                    value={harvestData.qualityGrade}
                    onValueChange={(v) => setHarvestData({ ...harvestData, qualityGrade: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Premium</SelectItem>
                      <SelectItem value="B">B - Good</SelectItem>
                      <SelectItem value="C">C - Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marketPrice">Market Price per Unit</Label>
                  <Input
                    id="marketPrice"
                    type="number"
                    step="0.01"
                    value={harvestData.marketPrice}
                    onChange={(e) => setHarvestData({ ...harvestData, marketPrice: e.target.value })}
                    placeholder="Price"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <div>
                <Label htmlFor="equipmentName">Equipment Name</Label>
                <Input
                  id="equipmentName"
                  value={maintenanceData.equipmentName}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, equipmentName: e.target.value })}
                  placeholder="e.g., Tractor, Pump"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Select
                    value={maintenanceData.maintenanceType}
                    onValueChange={(v) => setMaintenanceData({ ...maintenanceData, maintenanceType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={maintenanceData.cost}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, cost: e.target.value })}
                    placeholder="Amount"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="serviceProvider">Service Provider</Label>
                <Input
                  id="serviceProvider"
                  value={maintenanceData.serviceProvider}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, serviceProvider: e.target.value })}
                  placeholder="Name or business"
                />
              </div>
              <div>
                <Label htmlFor="nextMaintenance">Next Maintenance Date</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={maintenanceData.nextMaintenanceDate}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, nextMaintenanceDate: e.target.value })}
                />
              </div>
            </TabsContent>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </Tabs>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Save Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
