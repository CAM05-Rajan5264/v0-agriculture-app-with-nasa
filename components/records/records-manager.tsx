"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplets, Bug, Leaf, Pill, DollarSign, Wrench, Plus, Calendar } from "lucide-react"
import { AddIrrigationDialog } from "./add-irrigation-dialog"
import { AddPesticideDialog } from "./add-pesticide-dialog"
import { AddFertilizerDialog } from "./add-fertilizer-dialog"
import { AddHarvestDialog } from "./add-harvest-dialog"
import { AddCostDialog } from "./add-cost-dialog"
import { AddMaintenanceDialog } from "./add-maintenance-dialog"
import { RecordsList } from "./records-list"

export function RecordsManager() {
  const [activeTab, setActiveTab] = useState("all")
  const [refreshKey, setRefreshKey] = useState(0)

  const recordTypes = [
    { id: "all", label: "All Records", icon: Calendar },
    { id: "irrigation", label: "Irrigation", icon: Droplets },
    { id: "pesticide", label: "Pesticides", icon: Bug },
    { id: "fertilizer", label: "Fertilizers", icon: Leaf },
    { id: "harvest", label: "Harvest", icon: Pill },
    { id: "cost", label: "Costs", icon: DollarSign },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
  ]

  const dialogsByType = {
    irrigation: AddIrrigationDialog,
    pesticide: AddPesticideDialog,
    fertilizer: AddFertilizerDialog,
    harvest: AddHarvestDialog,
    cost: AddCostDialog,
    maintenance: AddMaintenanceDialog,
  }

  const handleRecordAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Quick Add Record</h3>
              <p className="text-sm text-muted-foreground mt-1">Record a new farm activity or expense</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AddIrrigationDialog onSuccess={handleRecordAdded}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Droplets className="h-4 w-4" />
                  <span className="hidden sm:inline">Irrigation</span>
                </Button>
              </AddIrrigationDialog>
              <AddPesticideDialog onSuccess={handleRecordAdded}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Sprayer className="h-4 w-4" />
                  <span className="hidden sm:inline">Pesticide</span>
                </Button>
              </AddPesticideDialog>
              <AddFertilizerDialog onSuccess={handleRecordAdded}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Leaf className="h-4 w-4" />
                  <span className="hidden sm:inline">Fertilizer</span>
                </Button>
              </AddFertilizerDialog>
              <AddHarvestDialog onSuccess={handleRecordAdded}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Harvest className="h-4 w-4" />
                  <span className="hidden sm:inline">Harvest</span>
                </Button>
              </AddHarvestDialog>
              <AddCostDialog onSuccess={handleRecordAdded}>
                <Button size="sm" variant="outline" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Cost</span>
                </Button>
              </AddCostDialog>
              <AddMaintenanceDialog onSuccess={handleRecordAdded}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  <span className="hidden sm:inline">Maintenance</span>
                </Button>
              </AddMaintenanceDialog>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-2 p-0 border-b rounded-none h-auto bg-transparent">
            {recordTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="mt-6">
            {recordTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="space-y-4">
                <RecordsList recordType={activeTab === "all" ? undefined : activeTab} refreshKey={refreshKey} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
