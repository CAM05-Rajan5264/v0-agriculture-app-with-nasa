import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { AlertCard } from "@/components/alerts/alert-card"
import { CheckAlertsButton } from "@/components/alerts/check-alerts-button"
import { SmartRecommendations } from "@/components/alerts/smart-recommendations"
import { Bell, CheckCircle, AlertTriangle, Info, Zap } from "lucide-react"
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Alert Center</h2>
            <p className="text-muted-foreground">Monitor crop health, weather forecasts, and farming activities</p>
          </div>
          <CheckAlertsButton />
        </div>

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
                    Alerts check for: frost warnings, drought conditions, heat stress, heavy rainfall, crop health
                    decline, irrigation needs, harvest reminders, and growth stage transitions.
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
