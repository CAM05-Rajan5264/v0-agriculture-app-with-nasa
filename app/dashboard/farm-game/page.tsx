import { Header } from "@/components/dashboard/header"
import { FarmGame } from "@/components/dashboard/farm-game"

export const metadata = {
  title: "Farm Game | FarmPulse",
  description: "Practice smart farming decisions in an interactive FarmPulse field game.",
}

export default function FarmGamePage() {
  return <div className="flex min-h-screen flex-col"><Header title="Farm Game" description="Learn by growing, watering, and harvesting a virtual field." /><main className="flex-1 p-4 md:p-6"><FarmGame /></main></div>
}
