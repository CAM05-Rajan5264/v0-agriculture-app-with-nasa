"use client"

import { useMemo, useState } from "react"
import { BarChart3, ChevronDown, FileBarChart, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CropImage } from "@/components/ui/crop-image"

const marketPrices = [
  { crop: "Wheat", mandi: "Indore, MP", state: "Madhya Pradesh", price: 2425, previous: 2375, arrivals: 1840, demand: "Strong", season: "Rabi", yield: "3.2–4.2 t/ha", water: "Medium" },
  { crop: "Rice (Paddy)", mandi: "Karnal, Haryana", state: "Haryana", price: 2310, previous: 2292, arrivals: 2260, demand: "Stable", season: "Kharif", yield: "3.5–5.5 t/ha", water: "High" },
  { crop: "Soybean", mandi: "Latur, Maharashtra", state: "Maharashtra", price: 4680, previous: 4746, arrivals: 980, demand: "Moderate", season: "Kharif", yield: "1.2–2.0 t/ha", water: "Low" },
  { crop: "Cotton", mandi: "Rajkot, Gujarat", state: "Gujarat", price: 7420, previous: 7332, arrivals: 760, demand: "Strong", season: "Kharif", yield: "1.5–2.5 t/ha", water: "Medium" },
  { crop: "Maize", mandi: "Davanagere, Karnataka", state: "Karnataka", price: 2180, previous: 2193, arrivals: 1210, demand: "Stable", season: "Kharif", yield: "4.0–6.0 t/ha", water: "Medium" },
  { crop: "Chickpea", mandi: "Akola, Maharashtra", state: "Maharashtra", price: 5420, previous: 5330, arrivals: 640, demand: "Strong", season: "Rabi", yield: "1.0–1.8 t/ha", water: "Low" },
  { crop: "Mustard", mandi: "Bharatpur, Rajasthan", state: "Rajasthan", price: 5860, previous: 5790, arrivals: 720, demand: "Strong", season: "Rabi", yield: "1.0–1.7 t/ha", water: "Low" },
  { crop: "Pigeon Pea (Tur)", mandi: "Gulbarga, Karnataka", state: "Karnataka", price: 8120, previous: 8050, arrivals: 390, demand: "Strong", season: "Kharif", yield: "0.8–1.4 t/ha", water: "Low" },
  { crop: "Groundnut", mandi: "Junagadh, Gujarat", state: "Gujarat", price: 6420, previous: 6500, arrivals: 580, demand: "Moderate", season: "Kharif", yield: "1.5–2.5 t/ha", water: "Medium" },
  { crop: "Sorghum (Jowar)", mandi: "Solapur, Maharashtra", state: "Maharashtra", price: 3180, previous: 3140, arrivals: 450, demand: "Stable", season: "Kharif", yield: "1.5–2.5 t/ha", water: "Low" },
  { crop: "Pearl Millet (Bajra)", mandi: "Jaipur, Rajasthan", state: "Rajasthan", price: 2650, previous: 2600, arrivals: 510, demand: "Stable", season: "Kharif", yield: "1.2–2.2 t/ha", water: "Low" },
  { crop: "Sugarcane", mandi: "Kolhapur, Maharashtra", state: "Maharashtra", price: 355, previous: 350, arrivals: 2950, demand: "Strong", season: "Year-round", yield: "70–100 t/ha", water: "High" },
  { crop: "Turmeric", mandi: "Nizamabad, Telangana", state: "Telangana", price: 12800, previous: 12600, arrivals: 260, demand: "Strong", season: "Kharif", yield: "4.0–7.0 t/ha", water: "Medium" },
  { crop: "Onion", mandi: "Lasalgaon, Maharashtra", state: "Maharashtra", price: 2860, previous: 3010, arrivals: 3240, demand: "Moderate", season: "Rabi", yield: "18–30 t/ha", water: "Medium" },
  { crop: "Potato", mandi: "Agra, Uttar Pradesh", state: "Uttar Pradesh", price: 1740, previous: 1690, arrivals: 2680, demand: "Stable", season: "Rabi", yield: "20–30 t/ha", water: "Medium" },
  { crop: "Tomato", mandi: "Kolar, Karnataka", state: "Karnataka", price: 3240, previous: 3380, arrivals: 920, demand: "Moderate", season: "Year-round", yield: "20–35 t/ha", water: "Medium" },
  { crop: "Banana", mandi: "Jalgaon, Maharashtra", state: "Maharashtra", price: 1840, previous: 1800, arrivals: 1460, demand: "Strong", season: "Year-round", yield: "35–55 t/ha", water: "High" },
]

const cities = ["All India", "Madhya Pradesh", "Haryana", "Maharashtra", "Gujarat", "Karnataka", "Rajasthan", "Telangana", "Uttar Pradesh"]
const seasons = ["All seasons", "Kharif", "Rabi", "Year-round"]
const money = new Intl.NumberFormat("en-IN")

export function IndiaMarketBoard() {
  const [selectedState, setSelectedState] = useState("All India")
  const [selectedSeason, setSelectedSeason] = useState("All seasons")
  const filtered = marketPrices.filter((item) => (selectedState === "All India" || item.state === selectedState) && (selectedSeason === "All seasons" || item.season === selectedSeason))
  const average = filtered.length ? Math.round(filtered.reduce((sum, item) => sum + item.price, 0) / filtered.length) : 0
  const totalArrivals = filtered.reduce((sum, item) => sum + item.arrivals, 0)
  const rising = filtered.filter((item) => item.price >= item.previous).length
  const strongest = [...filtered].sort((a, b) => (b.price / b.previous - 1) - (a.price / a.previous - 1))[0]
  const analysis = useMemo(() => {
    if (!filtered.length) return "No market observations are available for this region."
    if (rising / filtered.length >= 0.66) return "Most tracked crops are firm today. Compare local quality premiums before committing your harvest."
    if (rising / filtered.length <= 0.33) return "Prices are mixed to soft. Consider staggered selling and check storage costs against expected recovery."
    return "The market is mixed. Use arrivals and demand together rather than following a single crop price."
  }, [filtered, rising])

  return (
    <Card className="overflow-hidden border-emerald-900/10 bg-white/70 shadow-sm backdrop-blur-sm">
      <CardHeader className="border-b border-border/60 bg-emerald-950/[0.03] pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-xl bg-emerald-700/10 text-emerald-800"><BarChart3 className="size-4" /></div><CardTitle className="text-lg">India market watch</CardTitle></div>
            <p className="mt-2 text-sm text-muted-foreground">FarmPulse analysis of indicative modal mandi prices, arrivals, and demand for major crops.</p>
          </div>
          <div className="flex flex-wrap gap-2"><label className="relative flex items-center"><span className="sr-only">Filter by state</span><select value={selectedState} onChange={(event) => setSelectedState(event.target.value)} className="appearance-none rounded-lg border border-emerald-900/10 bg-background px-3 py-2 pr-8 text-xs font-medium text-foreground"><option value="All India">All India</option>{cities.slice(1).map((city) => <option key={city} value={city}>{city}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" /></label><label className="relative flex items-center"><span className="sr-only">Filter by season</span><select value={selectedSeason} onChange={(event) => setSelectedSeason(event.target.value)} className="appearance-none rounded-lg border border-emerald-900/10 bg-background px-3 py-2 pr-8 text-xs font-medium text-foreground">{seasons.map((season) => <option key={season} value={season}>{season}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" /></label></div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60 sm:grid-cols-4"><div className="p-4"><p className="text-xs text-muted-foreground">Average price</p><p className="mt-1 text-lg font-bold tabular-nums">₹{money.format(average)}</p><p className="text-[11px] text-muted-foreground">per quintal</p></div><div className="p-4"><p className="text-xs text-muted-foreground">Arrivals tracked</p><p className="mt-1 text-lg font-bold tabular-nums">{money.format(totalArrivals)}</p><p className="text-[11px] text-muted-foreground">quintals today</p></div><div className="p-4"><p className="text-xs text-muted-foreground">Rising crops</p><p className="mt-1 text-lg font-bold tabular-nums text-emerald-700">{rising}/{filtered.length}</p><p className="text-[11px] text-muted-foreground">vs previous session</p></div><div className="p-4"><p className="text-xs text-muted-foreground">Strongest move</p><p className="mt-1 truncate text-lg font-bold">{strongest?.crop ?? "—"}</p><p className="text-[11px] text-muted-foreground">highest positive change</p></div></div>
        <div className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-3">{filtered.map((item) => { const change = ((item.price - item.previous) / item.previous) * 100; const isUp = change >= 0; const TrendIcon = isUp ? TrendingUp : TrendingDown; return <div key={item.crop} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-emerald-50/60"><div className="flex min-w-0 items-center gap-3"><div className="size-14 shrink-0 overflow-hidden rounded-xl"><CropImage cropName={item.crop} className="h-full w-full" /></div><div className="min-w-0"><p className="font-semibold text-foreground">{item.crop}</p><p className="truncate text-xs text-muted-foreground">{item.mandi}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.arrivals.toLocaleString("en-IN")} qtl · {item.demand} demand · {item.season}</p><p className="mt-1 text-[11px] text-emerald-800/80">Expected yield: {item.yield} · Water: {item.water}</p></div></div><div className="shrink-0 text-right"><p className="font-semibold tabular-nums text-foreground">₹{money.format(item.price)}<span className="ml-1 text-xs font-normal text-muted-foreground">/qtl</span></p><p className={`mt-1 flex items-center justify-end gap-1 text-xs font-medium ${isUp ? "text-emerald-700" : "text-rose-700"}`}><TrendIcon className="size-3" />{isUp ? "+" : ""}{change.toFixed(1)}%</p></div></div> })}</div>
        <div className="border-t border-border/60 bg-emerald-950/[0.02] px-4 py-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><FileBarChart className="size-4 text-emerald-800" /> FarmPulse market analysis</div><p className="text-sm leading-6 text-muted-foreground">{analysis}</p><p className="mt-2 text-xs text-muted-foreground">Reference snapshot: 25 Oct 2026 · Yield ranges are broad planning references affected by seed, soil, weather, and management. Use local grade, moisture, transport, and buyer bids before selling. Prices are indicative planning signals, not guaranteed quotes.</p></div>
      </CardContent>
    </Card>
  )
}
