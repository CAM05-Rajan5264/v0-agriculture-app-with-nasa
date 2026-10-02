"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Crop, Farm, FarmingActivity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Sprout, Bug, Leaf, Wrench, CalendarDays, Activity, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="glossy-surface overflow-hidden rounded-3xl border-white/70 p-5 md:p-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Badge variant="secondary" className="mb-3 rounded-full">Field operations</Badge><h1 className="text-3xl font-bold tracking-tight">Farming Activities</h1><p className="mt-2 text-muted-foreground">Record, review, and keep every field action moving.</p></div><Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="size-4" />Log Activity</Button></div><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-2xl bg-white/55 p-4"><Activity className="size-4 text-primary" /><p className="mt-3 text-2xl font-bold">{activities.length}</p><p className="text-xs text-muted-foreground">Total actions</p></div><div className="rounded-2xl bg-white/55 p-4"><CalendarDays className="size-4 text-sky-600" /><p className="mt-3 text-2xl font-bold">{new Set(activities.map((a) => a.activity_date)).size}</p><p className="text-xs text-muted-foreground">Active days</p></div><div className="rounded-2xl bg-white/55 p-4"><TrendingUp className="size-4 text-emerald-600" /><p className="mt-3 text-2xl font-bold">{activityStats.harvest}</p><p className="text-xs text-muted-foreground">Harvests</p></div><div className="rounded-2xl bg-white/55 p-4"><Leaf className="size-4 text-amber-600" /><p className="mt-3 text-2xl font-bold">{farms.length}</p><p className="text-xs text-muted-foreground">Farms covered</p></div></div></div>
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
