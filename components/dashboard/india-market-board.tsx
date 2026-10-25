import Link from "next/link"
import { ArrowUpRight, BarChart3, ExternalLink, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const marketPrices = [
  { crop: "Wheat", mandi: "Indore, MP", price: "₹2,425", unit: "/quintal", change: "+2.1%", direction: "up" },
  { crop: "Rice (Paddy)", mandi: "Karnal, Haryana", price: "₹2,310", unit: "/quintal", change: "+0.8%", direction: "up" },
  { crop: "Soybean", mandi: "Latur, Maharashtra", price: "₹4,680", unit: "/quintal", change: "-1.4%", direction: "down" },
  { crop: "Cotton", mandi: "Rajkot, Gujarat", price: "₹7,420", unit: "/quintal", change: "+1.2%", direction: "up" },
  { crop: "Maize", mandi: "Davanagere, Karnataka", price: "₹2,180", unit: "/quintal", change: "-0.6%", direction: "down" },
  { crop: "Chickpea", mandi: "Akola, Maharashtra", price: "₹5,420", unit: "/quintal", change: "+1.7%", direction: "up" },
]

export function IndiaMarketBoard() {
  return (
    <Card className="overflow-hidden border-emerald-900/10 bg-white/70 shadow-sm backdrop-blur-sm">
      <CardHeader className="border-b border-border/60 bg-emerald-950/[0.03] pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-700/10 text-emerald-800"><BarChart3 className="size-4" /></div>
              <CardTitle className="text-lg">India market watch</CardTitle>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Indicative modal mandi prices for major crops to support harvest and rotation planning.</p>
          </div>
          <span className="rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-medium text-emerald-800">Updated 25 Oct 2026</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-3">
          {marketPrices.map((item) => {
            const isUp = item.direction === "up"
            const TrendIcon = isUp ? TrendingUp : TrendingDown
            return (
              <div key={item.crop} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-emerald-50/60">
                <div className="min-w-0"><p className="font-semibold text-foreground">{item.crop}</p><p className="truncate text-xs text-muted-foreground">{item.mandi}</p></div>
                <div className="shrink-0 text-right"><p className="font-semibold tabular-nums text-foreground">{item.price}<span className="ml-1 text-xs font-normal text-muted-foreground">{item.unit}</span></p><p className={`mt-1 flex items-center justify-end gap-1 text-xs font-medium ${isUp ? "text-emerald-700" : "text-rose-700"}`}><TrendIcon className="size-3" />{item.change}</p></div>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground"><span>Reference values; verify quality, grade, and local mandi bids before selling.</span><Link href="https://agmarknet.gov.in/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-emerald-800 hover:underline">Verify on AGMARKNET <ExternalLink className="size-3" /></Link></div>
      </CardContent>
    </Card>
  )
}
