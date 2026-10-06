import { Header } from "@/components/dashboard/header"
import { AgroMarket } from "@/components/dashboard/agro-market"

export const metadata = {
  title: "Agro Market | FarmPulse",
  description: "Shop trusted seeds, crop care, soil supplies, and farm equipment.",
}

export default function AgroMarketPage() {
  return <div className="flex min-h-screen flex-col"><Header title="Agro Market" description="Trusted supplies for every growing season." /><main className="flex-1 p-4 md:p-6"><AgroMarket /></main></div>
}
