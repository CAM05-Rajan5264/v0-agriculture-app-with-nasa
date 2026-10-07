"use client"

import { useMemo, useState } from "react"
import { Bell, BellRing, CalendarDays, Check, Clock3, Droplets, Leaf, Sprout } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Crop = { id: string; name: string; variety: string | null; planting_date: string; expected_harvest_date: string | null; farms?: { name?: string } | null }
type Reminder = { id: string; crop: Crop; title: string; type: "Fertilize" | "Spray" | "Harvest" | "Irrigate"; date: Date; days: number; description: string }

const stages = [
  { offset: 14, type: "Fertilize" as const, title: "First nutrient check", description: "Inspect early growth and apply a balanced starter feed if needed." },
  { offset: 28, type: "Spray" as const, title: "Scout and protect", description: "Walk the field for pests or disease before choosing a treatment." },
  { offset: 45, type: "Irrigate" as const, title: "Root-zone irrigation", description: "Check soil moisture and irrigate deeply if the root zone is dry." },
  { offset: 70, type: "Fertilize" as const, title: "Mid-season feeding", description: "Review crop vigor and schedule the next nutrient application." },
]

function addDays(date: Date, days: number) { const next = new Date(date); next.setDate(next.getDate() + days); return next }
function dateLabel(date: Date) { return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) }

export function CropCalendar({ crops }: { crops: Crop[] }) {
  const [notifications, setNotifications] = useState(false)
  const reminders = useMemo<Reminder[]>(() => crops.flatMap((crop) => {
    const planted = new Date(`${crop.planting_date}T12:00:00`)
    const generated = stages.map((stage) => ({ ...stage, date: addDays(planted, stage.offset) }))
    if (crop.expected_harvest_date) generated.push({ offset: 0, type: "Harvest", title: "Harvest window", description: "Check maturity, quality, and weather before harvesting.", date: new Date(`${crop.expected_harvest_date}T12:00:00`) })
    return generated.map((item) => ({ ...item, id: `${crop.id}-${item.type}-${item.date.toISOString()}`, crop, days: Math.ceil((item.date.getTime() - Date.now()) / 86400000) }))
  }).sort((a, b) => a.date.getTime() - b.date.getTime()), [crops])
  const upcoming = reminders.filter((reminder) => reminder.days >= -1).slice(0, 12)
  const activateNotifications = async () => {
    if ("Notification" in window) { const permission = await Notification.requestPermission(); setNotifications(permission === "granted") }
  }

  return <div className="mx-auto max-w-7xl space-y-6">
    <section className="overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#123c2d,#277453_60%,#b7d789)] p-6 text-white shadow-xl md:p-8"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Badge className="border-white/20 bg-white/10 text-white hover:bg-white/20">Season planner</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Crop Calendar & Timely Reminders</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">Turn every planting date into a practical plan for feeding, scouting, irrigation, and harvest readiness.</p></div><Button onClick={activateNotifications} variant="secondary" className="gap-2 rounded-xl">{notifications ? <BellRing data-icon="inline-start" /> : <Bell data-icon="inline-start" />}{notifications ? "Reminders enabled" : "Enable push reminders"}</Button></div></section>
    <div className="grid gap-4 md:grid-cols-3"><Card className="rounded-2xl"><CardContent className="p-5"><Sprout className="size-5 text-primary" /><p className="mt-3 text-2xl font-bold">{crops.length}</p><p className="text-sm text-muted-foreground">Tracked crops</p></CardContent></Card><Card className="rounded-2xl"><CardContent className="p-5"><CalendarDays className="size-5 text-amber-600" /><p className="mt-3 text-2xl font-bold">{upcoming.length}</p><p className="text-sm text-muted-foreground">Upcoming actions</p></CardContent></Card><Card className="rounded-2xl"><CardContent className="p-5"><BellRing className="size-5 text-violet-600" /><p className="mt-3 text-2xl font-bold">{notifications ? "On" : "Off"}</p><p className="text-sm text-muted-foreground">Browser notifications</p></CardContent></Card></div>
    {crops.length === 0 ? <Card className="rounded-2xl"><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><Sprout className="size-10 text-muted-foreground" /><h2 className="text-xl font-semibold">Add crops to build your calendar</h2><p className="text-muted-foreground">Planting dates will automatically create task reminders here.</p></CardContent></Card> : <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"><Card className="rounded-2xl"><CardHeader><CardTitle>Upcoming field work</CardTitle></CardHeader><CardContent className="space-y-3">{upcoming.map((reminder) => <div key={reminder.id} className="flex gap-4 rounded-2xl border bg-card p-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{reminder.type === "Fertilize" ? <Leaf /> : reminder.type === "Spray" ? <Droplets /> : reminder.type === "Harvest" ? <Check /> : <Clock3 />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><Badge variant="secondary" className="mb-1">{reminder.type}</Badge><h3 className="font-semibold">{reminder.title}</h3></div><span className="text-sm font-medium text-primary">{reminder.days < 0 ? "Due today" : reminder.days === 0 ? "Today" : `In ${reminder.days} days`}</span></div><p className="mt-1 text-sm text-muted-foreground">{reminder.crop.name} · {reminder.crop.farms?.name || "Farm"} · {dateLabel(reminder.date)}</p><p className="mt-2 text-sm text-muted-foreground">{reminder.description}</p></div></div>)}</CardContent></Card><Card className="rounded-2xl"><CardHeader><CardTitle>Season progress</CardTitle></CardHeader><CardContent className="space-y-5">{crops.map((crop) => { const planted = new Date(crop.planting_date).getTime(); const harvest = crop.expected_harvest_date ? new Date(crop.expected_harvest_date).getTime() : planted + 100 * 86400000; const progress = Math.max(0, Math.min(100, ((Date.now() - planted) / (harvest - planted)) * 100)); return <div key={crop.id}><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{crop.name}</span><span className="text-muted-foreground">{Math.round(progress)}%</span></div><Progress value={progress} /><p className="mt-2 text-xs text-muted-foreground">Planted {dateLabel(new Date(crop.planting_date))}</p></div> })}</CardContent></Card></div>}
  </div>
}
