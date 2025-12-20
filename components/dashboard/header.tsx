"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { MobileNav } from "./mobile-nav"

interface HeaderProps {
  title: string
  unreadAlerts?: number
}

export function Header({ title, unreadAlerts = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 md:h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
        <div className="hidden md:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Live
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search - hidden on mobile */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="w-64 pl-9 bg-secondary/50 border-0 focus-visible:ring-1" />
        </div>

        {/* Alerts */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10" asChild>
          <Link href="/dashboard/alerts">
            <Bell className="h-5 w-5" />
            {unreadAlerts > 0 && (
              <Badge
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs animate-pulse"
                variant="destructive"
              >
                {unreadAlerts > 9 ? "9+" : unreadAlerts}
              </Badge>
            )}
            <span className="sr-only">View alerts</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
