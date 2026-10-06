import { Header } from "@/components/dashboard/header"
import { EmbeddedFarmGame } from "@/components/dashboard/embedded-farm-game"

export const metadata = {
  title: "Farm Game | FarmPulse",
  description: "Practice smart farming decisions in an interactive FarmPulse field game.",
}

export default function FarmGamePage() {
  return <div className="flex min-h-screen flex-col"><Header title="Farm Game" description="Learn by growing, watering, and harvesting a virtual field." /><main className="flex-1 p-4 md:p-6"><EmbeddedFarmGame /></main></div>
}
