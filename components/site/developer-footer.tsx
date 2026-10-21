import Image from "next/image"
import Link from "next/link"

export function DeveloperFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`border-t border-primary/10 bg-background/55 px-4 py-5 backdrop-blur-sm sm:px-6 ${compact ? "mt-4" : "mt-auto"}`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <Image
            src="/images/developer-portrait.jpeg"
            alt="Rajan Kumar Singh, FarmPulse developer"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover object-top shadow-sm"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">Rajan Kumar Singh</p>
            <p className="text-xs text-muted-foreground">FarmPulse developer · NASA Earth observation agriculture</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-end">
          <span>Built for smarter, more resilient farming</span>
          <Link href="/dashboard/developer" className="font-medium text-primary transition-colors hover:text-primary/80">Developer profile</Link>
        </div>
      </div>
    </footer>
  )
}
