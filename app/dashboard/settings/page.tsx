import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Shield } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  return (
    <div className="flex flex-col">
      <Header title="Settings" unreadAlerts={unreadAlerts || 0} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="font-medium text-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
              {user?.user_metadata?.farm_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Farm Name</p>
                  <p className="font-medium text-foreground">{user.user_metadata.farm_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Data Sources
              </CardTitle>
              <CardDescription>External services connected to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">NASA POWER API</p>
                  <p className="text-sm text-muted-foreground">Weather and solar radiation data</p>
                </div>
                <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">NDVI Analysis</p>
                  <p className="text-sm text-muted-foreground">Crop health vegetation index</p>
                </div>
                <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
