"use client"

import { useState } from "react"
import type { Crop, Farm, FarmingActivity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bug, Leaf, Wrench, Plus, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"
import { ActivityList } from "@/components/activities/activity-list"

export default function ActivitiesPage() {
  const [selectedType, setSelectedType] = useState<"pesticide" | "fertilizer" | "harvest" | "maintenance" | "all">(
    "all",
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  // Demo data
  const farms: Farm[] = [
    { id: "1", name: "Main Farm", location: "Iowa", acreage: 250, soil_type: "loam", created_at: new Date().toISOString() },
    { id: "2", name: "North Field", location: "Illinois", acreage: 150, soil_type: "clay", created_at: new Date().toISOString() },
  ]

  const crops: Crop[] = [
    { id: "1", name: "Corn", status: "active", farm_id: "1", planting_date: new Date().toISOString(), expected_harvest_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() },
  ]

  const activities: FarmingActivity[] = [
    { id: "1", crop_id: "1", activity_type: "pesticide", activity_date: new Date().toISOString(), notes: "Applied fungicide", created_at: new Date().toISOString() },
    { id: "2", crop_id: "1", activity_type: "fertilizer", activity_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), notes: "Applied NPK fertilizer", created_at: new Date().toISOString() },
  ]

  const filteredActivities =
    selectedType === "all" ? activities : activities.filter((a) => a.activity_type === selectedType)

  const activityStats = {
    pesticide: activities.filter((a) => a.activity_type === "pesticide").length,
    fertilizer: activities.filter((a) => a.activity_type === "fertilizer").length,
    harvest: activities.filter((a) => a.activity_type === "harvest").length,
    maintenance: activities.filter((a) => a.activity_type === "maintenance").length,
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farming Activities</h1>
          <p className="text-muted-foreground mt-2">Record and track all your farming activities</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      <AddActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        crops={crops}
        farms={farms}
        onActivityAdded={() => {
          setDialogOpen(false)
        }}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Pest Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.pesticide}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Fertilizer Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.fertilizer}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              Harvests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.harvest}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>All recorded farming activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pesticide">Pest Treatments</TabsTrigger>
              <TabsTrigger value="fertilizer">Fertilizer</TabsTrigger>
              <TabsTrigger value="harvest">Harvest</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType} className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading activities...</p>
              ) : filteredActivities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No activities recorded yet</p>
              ) : (
                <ActivityList activities={filteredActivities} crops={crops} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
