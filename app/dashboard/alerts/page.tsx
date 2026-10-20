import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { AlertCard } from "@/components/alerts/alert-card"
import { CheckAlertsButton } from "@/components/alerts/check-alerts-button"
import { SmartRecommendations } from "@/components/alerts/smart-recommendations"
import { Bell, CheckCircle, AlertTriangle, Info, Zap, ShieldCheck, Activity, Clock3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Alert } from "@/lib/types"

export default async function AlertsPage() {
  const supabase = await createClient()

  const { data: alerts } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(50)

  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  const unreadList = alerts?.filter((a: Alert) => !a.is_read) || []
  const readList = alerts?.filter((a: Alert) => a.is_read) || []

  // Count by severity
  const criticalCount = alerts?.filter((a: Alert) => a.severity === "critical" && !a.is_read).length || 0
  const warningCount = alerts?.filter((a: Alert) => a.severity === "warning" && !a.is_read).length || 0
  const infoCount = alerts?.filter((a: Alert) => a.severity === "info" && !a.is_read).length || 0

  return (
    <div className="flex flex-col">
      <Header title="Alerts" unreadAlerts={unreadAlerts || 0} />
      <div className="p-6">
        <div className="glossy-surface mb-6 overflow-hidden rounded-3xl border-white/70 p-5 md:p-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Badge variant="secondary" className="mb-3 rounded-full">Field watch</Badge><h2 className="text-3xl font-bold tracking-tight text-foreground">Alert Center</h2><p className="mt-1 text-muted-foreground">Prioritize crop health, weather, and operation signals from one calm workspace.</p></div><CheckAlertsButton /></div><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-2xl bg-white/55 p-4"><ShieldCheck className="size-4 text-primary" /><p className="mt-3 text-2xl font-bold">{alerts?.length || 0}</p><p className="text-xs text-muted-foreground">Total signals</p></div><div className="rounded-2xl bg-white/55 p-4"><Activity className="size-4 text-red-500" /><p className="mt-3 text-2xl font-bold">{unreadAlerts || 0}</p><p className="text-xs text-muted-foreground">Needs review</p></div><div className="rounded-2xl bg-white/55 p-4"><Clock3 className="size-4 text-amber-600" /><p className="mt-3 text-2xl font-bold">{warningCount}</p><p className="text-xs text-muted-foreground">Warnings</p></div><div className="rounded-2xl bg-white/55 p-4"><CheckCircle className="size-4 text-emerald-600" /><p className="mt-3 text-2xl font-bold">{readList.length}</p><p className="text-xs text-muted-foreground">Resolved</p></div></div></div>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{warningCount}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{infoCount}</p>
                <p className="text-sm text-muted-foreground">Information</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{readList.length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main alerts section */}
          <div className="lg:col-span-2">
            {alerts && alerts.length > 0 ? (
              <div className="space-y-6">
                {unreadList.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Bell className="h-4 w-4 text-primary" />
                      Active Alerts ({unreadList.length})
                    </h3>
                    <div className="space-y-3">
                      {unreadList.map((alert: Alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                      ))}
                    </div>
                  </div>
                )}

                {readList.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      Resolved ({readList.length})
                    </h3>
                    <div className="space-y-3">
                      {readList.slice(0, 5).map((alert: Alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">No alerts yet</h3>
                  <p className="mb-4 text-center text-muted-foreground">
                    Click &quot;Check for Alerts&quot; to scan your farms for weather warnings, crop health issues, and
                    activity reminders.
                  </p>
                  <CheckAlertsButton />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <SmartRecommendations />

            {/* Alert types legend */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">Alert Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white">Critical</Badge>
                  <span className="text-xs text-muted-foreground">Immediate action required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-white">Warning</Badge>
                  <span className="text-xs text-muted-foreground">Action needed soon</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white">Info</Badge>
                  <span className="text-xs text-muted-foreground">For your awareness</span>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Alerts check for: temperature shifts, rainfall pattern changes, water shortages, extreme weather, declining satellite vegetation health, crop health, irrigation needs, harvest reminders, and growth stage transitions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
