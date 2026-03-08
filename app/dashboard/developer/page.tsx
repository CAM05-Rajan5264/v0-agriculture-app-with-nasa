"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ReviewForm } from "@/components/developer/review-form"
import { ReviewsList } from "@/components/developer/reviews-list"
import { FarmPulseLogo } from "@/components/ui/farmpulse-logo"
import {
  User,
  Mail,
  Github,
  Linkedin,
  Satellite,
  Cloud,
  Droplets,
  TrendingUp,
  Bell,
  Shield,
  Smartphone,
  Activity,
  Zap,
} from "lucide-react"

interface Review {
  id: string
  user_id: string
  rating: number
  comment: string | null
  user_name: string | null
  created_at: string
}

export default function DeveloperPage() {
  // Demo data - no auth required
  const userId = "demo-user"
  const userEmail = "farmer@example.com"
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      user_id: "user1",
      rating: 5,
      comment: "FarmPulse has transformed my farming operations!",
      user_name: "John Farmer",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      user_id: "user2",
      rating: 4,
      comment: "Great tool for monitoring crop health",
      user_name: "Sarah Agricultural",
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ])
  const existingReview = reviews.find((r) => r.user_id === userId) || null
        setExistingReview(userReview || null)
      }
    }

  const features = [
    {
      icon: Satellite,
      title: "NASA POWER API Integration",
      description: "Real-time satellite data for accurate weather and crop monitoring",
    },
    {
      icon: Cloud,
      title: "Weather Intelligence",
      description: "14-day history and 7-day forecast with detailed metrics",
    },
    {
      icon: Activity,
      title: "Crop Health Analysis",
      description: "NDVI-based vegetation health tracking with recommendations",
    },
    {
      icon: Droplets,
      title: "Smart Irrigation",
      description: "AI-powered irrigation scheduling based on soil and weather data",
    },
    {
      icon: TrendingUp,
      title: "Phenology Tracking",
      description: "Growth stage monitoring with crop guides and sowing calendar",
    },
    {
      icon: Bell,
      title: "Intelligent Alerts",
      description: "Automated notifications for weather, pests, and harvest timing",
    },
    {
      icon: Shield,
      title: "Secure Data",
      description: "Row Level Security ensures your farm data is protected",
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Works seamlessly on desktop, tablet, and mobile devices",
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">About FarmPulse</h1>
          <p className="text-muted-foreground">Learn about the app and meet the developer</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Developer Profile */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Developer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-75 blur" />
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background">
                  <img src="/images/profile-20pic.jpg" alt="Developer Profile" className="h-full w-full object-cover" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">FarmPulse Developer</h3>
              <p className="text-sm text-muted-foreground">Full Stack Developer & Agricultural Tech Enthusiast</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  Next.js
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  React
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  TypeScript
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  Supabase
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  NASA APIs
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="w-full space-y-2 text-left">
                <a
                  href="mailto:developer@farmpulse.app"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  Contact Developer
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                  GitHub Profile
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                </a>
              </div>
            </CardContent>
          </Card>

          {userId && (
            <div className="mt-6">
              <ReviewForm
                userId={userId}
                userName={userEmail?.split("@")[0]}
                existingReview={existingReview}
                onReviewSubmitted={fetchReviews}
              />
            </div>
          )}
        </div>

        {/* App Info & Reviews */}
        <div className="space-y-6 lg:col-span-2">
          {/* App Summary */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FarmPulseLogo size="sm" showText={false} />
                About FarmPulse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong className="text-foreground">FarmPulse</strong> is a comprehensive agricultural management
                platform designed to empower farmers with data-driven insights. By leveraging NASA POWER satellite data,
                FarmPulse provides real-time monitoring of weather conditions, crop health, and soil moisture to help
                farmers make informed decisions.
              </p>
              <p className="text-muted-foreground">
                The app combines advanced satellite imagery analysis with intuitive dashboards, enabling farmers to
                track their farms and crops throughout the growing season. From planting to harvest, FarmPulse delivers
                actionable alerts about potential threats like frost, drought, pests, and optimal harvesting windows.
              </p>
              <p className="text-muted-foreground">
                Whether you are managing a small family farm or overseeing large agricultural operations, FarmPulse
                scales to meet your needs with features like multi-farm support, crop-specific phenology tracking, and
                intelligent irrigation scheduling.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group flex gap-3 rounded-xl border border-border bg-background/50 p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ReviewsList reviews={reviews} />
        </div>
      </div>
    </div>
  )
}
