import { Gamepad2, Sparkles } from "lucide-react"

export default function GamePage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-emerald-900/10 bg-white/70 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800"><Gamepad2 className="size-3.5" /> Farm learning zone</div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Farm Learning Game</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Explore this interactive farming experience, then return to FarmPulse to plan crops, monitor fields, and act on live signals.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-800"><Sparkles className="size-4" /> Learn through play</div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-emerald-900/15 bg-[#162d20] p-2 shadow-xl sm:p-4">
        <div className="flex min-h-[635px] w-full items-center justify-center overflow-auto rounded-2xl bg-black">
          <iframe src="https://www.gameflare.com/embed/golden-farm/" title="Farm Learning interactive game" width="900" height="635" scrolling="no" className="h-[635px] w-full max-w-[900px] border-0" allowFullScreen />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">The game is provided by GameFlare and loads in a secure embedded frame.</p>
    </section>
  )
}
