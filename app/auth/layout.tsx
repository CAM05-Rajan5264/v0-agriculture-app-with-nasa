import type React from "react"
import { DeveloperFooter } from "@/components/site/developer-footer"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-svh flex-col"><div className="min-h-0 flex-1">{children}</div><DeveloperFooter compact /></div>
}
