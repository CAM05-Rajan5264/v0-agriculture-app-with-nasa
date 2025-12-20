import { cn } from "@/lib/utils"

interface FarmPulseLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function FarmPulseLogo({ className, size = "md", showText = true }: FarmPulseLogoProps) {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-lg" },
    md: { icon: "h-9 w-9", text: "text-xl" },
    lg: { icon: "h-11 w-11", text: "text-2xl" },
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative", sizes[size].icon)}>
        <div className="absolute inset-0 rounded-xl bg-primary/15 animate-pulse-glow" />
        {/* Icon container with gradient */}
        <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
          {/* Stylized plant/pulse icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[55%] w-[55%] text-primary-foreground"
          >
            {/* Heartbeat line */}
            <path d="M3 12h4l2-4 4 8 2-4h6" />
            {/* Small leaf accent */}
            <path d="M17 8c0-2-1.5-3-3-3s-3 1-3 3" strokeWidth="2" />
          </svg>
        </div>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-foreground", sizes[size].text)}>
          Farm<span className="text-primary">Pulse</span>
        </span>
      )}
    </div>
  )
}
