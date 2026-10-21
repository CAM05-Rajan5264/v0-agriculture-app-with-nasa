import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DeveloperFooter } from "@/components/site/developer-footer"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="dashboard-surface flex h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto"><div className="flex min-h-full flex-col">{children}<DeveloperFooter /></div></main>
    </div>
  )
}
