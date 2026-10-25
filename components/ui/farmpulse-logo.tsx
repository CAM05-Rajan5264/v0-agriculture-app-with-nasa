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
            {/* Crop rows and rising leaf */}
            <path d="M3 16c4-3 7-3 11-1s7 2 11-1" />
            <path d="M3 20c4-2 8-2 12-1s7 1 10-1" />
            <path d="M12 16c-1-5 1-9 6-12 1 5-1 9-6 12Z" fill="currentColor" stroke="none" />
            <path d="M12 16c2-4 4-8 6-12" strokeWidth="1.5" />
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
