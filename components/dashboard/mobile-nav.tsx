"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { FarmPulseLogo } from "@/components/ui/farmpulse-logo"
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  Bell,
  Settings,
  LogOut,
  Cloud,
  Droplets,
  TrendingUp,
  Code,
  Menu,
  Leaf,
  GraduationCap,
  MessageCircle,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Farms", href: "/dashboard/farms", icon: MapPin },
  { name: "Crops", href: "/dashboard/crops", icon: Sprout },
  { name: "Crop Monitoring", href: "/dashboard/crop-monitoring", icon: Leaf },
  { name: "Weather", href: "/dashboard/weather", icon: Cloud },
  { name: "Irrigation", href: "/dashboard/irrigation", icon: Droplets },
  { name: "Phenology", href: "/dashboard/phenology", icon: TrendingUp },
  { name: "Field School", href: "/dashboard/field-school", icon: GraduationCap },
  { name: "Farm Assistant", href: "/dashboard/farm-assistant", icon: MessageCircle },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Developer", href: "/dashboard/developer", icon: Code },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-border px-6">
            <FarmPulseLogo size="sm" />
          </div>

          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.name}
                  {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border p-4">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                pathname === "/dashboard/settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <Button
              variant="ghost"
              className="mt-2 w-full justify-start gap-3 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                handleSignOut()
                setOpen(false)
              }}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
