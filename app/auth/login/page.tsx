"use client"

import type React from "react"

import { loginUser } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { FarmPulseLogo } from "@/components/ui/farmpulse-logo"
import Image from "next/image"
import { Leaf, PlayCircle } from "lucide-react"

const DEMO_EMAIL = "demo@farmpulse.app"
const DEMO_PASSWORD = "FarmPulseDemo2026!"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Submitting login for:", email)
      
      if (!email || !password) {
        setError("Email and password are required")
        setIsLoading(false)
        return
      }

      const result = await loginUser(email, password)
      
      console.log("[v0] Login result:", { success: result?.success })

      if (!result?.success) {
        const errorMsg = result?.message || "Login failed"
        console.error("[v0] Login failed:", errorMsg)
        setError(errorMsg)
        setIsLoading(false)
        return
      }

      console.log("[v0] Login successful, redirecting to dashboard")
      window.location.assign("/dashboard")
    } catch (error: unknown) {
      let errorMessage = "An error occurred during login"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      console.error("[v0] Login error:", errorMessage)
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-primary/15 blur-2xl" />
        </div>

        {/* Decorative leaves */}
        <div className="absolute top-10 right-10 text-primary/20">
          <Leaf className="w-32 h-32 rotate-45" />
        </div>
        <div className="absolute bottom-20 left-10 text-primary/15">
          <Leaf className="w-24 h-24 -rotate-12" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <FarmPulseLogo size="lg" className="mb-8" />
          <h1 className="text-3xl font-bold text-foreground text-center mb-4 text-balance">
            Smart Farming Starts Here
          </h1>
          <p className="text-muted-foreground text-center max-w-md text-lg leading-relaxed">
            Monitor crop health, track weather patterns, and optimize irrigation with NASA satellite data.
          </p>

          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
            {["Real-time Weather", "Crop Health NDVI", "Smart Irrigation", "Growth Tracking"].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            {/* Mobile logo */}
            <div className="flex items-center justify-center lg:hidden">
              <FarmPulseLogo size="lg" />
            </div>

            <Card className="border-border/50 shadow-xl shadow-primary/5">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-foreground">Welcome back</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in to monitor your farm&apos;s vital signs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-foreground font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="farmer@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-foreground font-medium">
                          Password
                        </Label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-primary font-medium hover:underline underline-offset-4"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Demo access</p>
                          <p className="text-xs text-muted-foreground">Explore FarmPulse with sample farm data</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => {
                            setEmail(DEMO_EMAIL)
                            setPassword(DEMO_PASSWORD)
                            setError(null)
                          }}
                        >
                          <PlayCircle className="h-4 w-4" aria-hidden="true" />
                          Use demo
                        </Button>
                      </div>
                      <p className="mt-2 font-mono text-[11px] text-muted-foreground">{DEMO_EMAIL} · {DEMO_PASSWORD}</p>
                    </div>
                  </div>
                  <div className="mt-5 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/sign-up" className="text-primary font-medium hover:underline underline-offset-4">
                      Sign up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="relative">
                <Image
                  src="/images/profile-20pic.jpg"
                  alt="Developer"
                  width={36}
                  height={36}
                  className="rounded-full ring-2 ring-primary/20"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
              </div>
              <div className="text-xs text-muted-foreground">
                <span>Developed by </span>
                <Link
                  href="/dashboard/developer"
                  className="text-foreground font-medium hover:text-primary transition-colors"
                >
                  Rajan Kumar Singh
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
