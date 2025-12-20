"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CheckAlertsButton() {
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCheck = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/alerts/check", {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Alert Check Complete",
          description:
            data.alerts?.length > 0
              ? `Found ${data.alerts.length} new alert(s) for your farms.`
              : "No new alerts found. Your farms are doing well!",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to check alerts",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking alerts:", error)
      toast({
        title: "Error",
        description: "Failed to check alerts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Button onClick={handleCheck} disabled={isChecking}>
      <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
      {isChecking ? "Scanning..." : "Check for Alerts"}
    </Button>
  )
}
