import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FarmPulseLogo } from "@/components/ui/farmpulse-logo"
import { Activity, Cloud, Droplets, TrendingUp, Bell, ArrowRight, Satellite, BarChart3, Zap } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Activity,
      title: "Crop Health Monitoring",
      description: "Track vegetation health using NDVI analysis from satellite imagery",
    },
    {
      icon: Cloud,
      title: "Weather Intelligence",
      description: "Real-time weather data from NASA POWER for accurate farm planning",
    },
    {
      icon: Droplets,
      title: "Smart Irrigation",
      description: "Optimize water usage with soil moisture and evapotranspiration data",
    },
    {
      icon: TrendingUp,
      title: "Phenology Tracking",
      description: "Monitor crop growth stages and get timely action recommendations",
    },
    {
      icon: Bell,
      title: "Intelligent Alerts",
      description: "Receive alerts for frost warnings, drought conditions, and crop stress",
    },
    {
      icon: BarChart3,
      title: "Data Analytics",
      description: "Comprehensive dashboards with historical trends and insights",
    },
  ]

  const stats = [
    { value: "14+", label: "Days Weather History" },
    { value: "7", label: "Days Forecast" },
    { value: "24/7", label: "Real-time Monitoring" },
    { value: "NASA", label: "Powered Data" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <FarmPulseLogo />
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="shadow-lg shadow-primary/25">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          </div>

          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Satellite className="h-4 w-4" />
                Powered by NASA POWER API
              </div>

              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
                Your Farm&apos;s
                <span className="relative mx-3 text-primary">
                  Vital Signs
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path
                      d="M0 4h40l10-3 10 6 10-6 10 3h120"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                at Your Fingertips
              </h1>

              <div className="farmpulse-demo-video mt-10 mb-10">
                <div className="farmpulse-demo-video__header">
                  <span>FarmPulse smart farming video</span>
                </div>
                <iframe
                  title="FarmPulse Smart Farming video"
                  src="https://video.pictory.ai/embed/20261113134407166a23a32fde17848fa813e9af84288432c/20261114084840907E8fpBwZrCrbcbUM?mode=player&autoplay=1&loop=1&muted=1"
                  className="farmpulse-demo-video__frame"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="eager"
                />
              </div>

              <p className="mt-8 text-lg text-muted-foreground text-pretty md:text-xl">
                Monitor crop health, track weather patterns, and optimize irrigation using real-time NASA satellite
                data. Make data-driven decisions to maximize your yield.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="h-12 px-8 shadow-lg shadow-primary/25">
                  <Link href="/auth/sign-up">
                    Start Monitoring
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 bg-transparent">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm"
                >
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Features
              </div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Everything you need for smart farming</h2>
              <p className="mt-4 text-muted-foreground">
                Comprehensive agricultural intelligence powered by NASA satellite data
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center shadow-2xl shadow-primary/25">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[url('/abstract-grid-pattern.png')] opacity-10" />
              <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">Ready to optimize your farm?</h2>
                <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                  Join thousands of farmers using satellite data to improve crop yields and reduce resource waste.
                </p>
                <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 shadow-lg" asChild>
                  <Link href="/auth/sign-up">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <FarmPulseLogo size="sm" />
            <div className="flex items-center gap-4">
              <img
                src="/images/developer-portrait.jpeg"
                alt="Rajan Kumar Singh"
                className="h-14 w-14 rounded-full border-2 border-primary/20 object-cover object-top shadow-sm"
              />
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>Powered by NASA POWER API - Satellite data for smarter agriculture</p>
                <p className="text-xs">Developed by Rajan Kumar Singh</p>
                <p className="text-xs">A community initiative for NASA Space Apps Challenge 2026.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
