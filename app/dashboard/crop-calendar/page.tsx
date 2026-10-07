import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { CropCalendar } from "@/components/dashboard/crop-calendar"

export const metadata = {
  title: "Crop Calendar | FarmPulse",
  description: "Plan crop tasks and receive timely reminders from planting to harvest.",
}

export default async function CropCalendarPage() {
  const supabase = await createClient()
  const { data: crops } = await supabase.from("crops").select("id, name, variety, planting_date, expected_harvest_date, farms(name)").eq("status", "active").order("planting_date", { ascending: false })
  return <div className="flex min-h-screen flex-col"><Header title="Crop Calendar" description="Timely field reminders from sowing to harvest." /><main className="flex-1 p-4 md:p-6"><CropCalendar crops={(crops || []) as never[]} /></main></div>
}
