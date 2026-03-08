"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Crop, Farm, FarmingActivity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Sprout, Bug, Leaf, Wrench } from "lucide-react"
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"
import { ActivityList } from "@/components/activities/activity-list"

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<FarmingActivity[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<"pesticide" | "fertilizer" | "harvest" | "maintenance" | "all">(
    "all",
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Load farms
      const { data: farmsData } = await supabase.from("farms").select("*").eq("user_id", user.id)

      // Load crops
      const { data: cropsData } = await supabase.from("crops").select("*").eq("user_id", user.id)

      // Load activities
      const { data: activitiesData } = await supabase
        .from("farming_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("activity_date", { ascending: false })

      setFarms(farmsData || [])
      setCrops(cropsData || [])
      setActivities(activitiesData || [])
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

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
          loadData()
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
