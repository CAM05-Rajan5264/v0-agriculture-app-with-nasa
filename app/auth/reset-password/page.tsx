"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { FarmPulseLogo } from "@/components/ui/farmpulse-logo"
import { Leaf, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidLink, setIsValidLink] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "fair" | "good" | "strong">("weak")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user has valid reset session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          setIsValidLink(false)
        }
      } catch {
        setIsValidLink(false)
      }
    }

    checkSession()
  }, [supabase.auth])

  const calculatePasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return "weak"
    if (pwd.length < 8) return "fair"
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 10) return "strong"
    return "good"
  }

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password))
  }, [password])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
      setPassword("")
      setConfirmPassword("")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak":
        return "bg-red-500"
      case "fair":
        return "bg-orange-500"
      case "good":
        return "bg-yellow-500"
      case "strong":
        return "bg-green-500"
      default:
        return "bg-gray-300"
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
            Create a Strong Password
          </h1>
          <p className="text-muted-foreground text-center max-w-md text-lg leading-relaxed">
            Choose a secure password to protect your farm data and operations.
          </p>

          {/* Password tips */}
          <div className="mt-12 space-y-3 w-full max-w-sm">
            {[
              "At least 6 characters",
              "Mix uppercase & lowercase",
              "Include numbers or symbols",
              "Avoid personal information",
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {tip}
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

            {!isValidLink ? (
              <Card className="border-border/50 shadow-xl shadow-primary/5">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-destructive">Invalid Link</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    This reset link has expired or is invalid
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Password reset links expire after 24 hours for security.
                    </p>
                    <Button asChild className="w-full h-11 text-base font-semibold">
                      <Link href="/auth/forgot-password">Request New Link</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-11 text-base font-semibold">
                      <Link href="/auth/login">Back to Login</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : success ? (
              <Card className="border-border/50 shadow-xl shadow-primary/5">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">Password Reset</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your password has been successfully updated
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Redirecting to login page in a moment...
                    </p>
                    <Button asChild className="w-full h-11 text-base font-semibold">
                      <Link href="/auth/login">Go to Login</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 shadow-xl shadow-primary/5">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-foreground">Set New Password</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enter a secure password for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleResetPassword}>
                    <div className="flex flex-col gap-5">
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-foreground font-medium">
                          New Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter strong password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20"
                        />
                        {password && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${getStrengthColor(passwordStrength)} transition-all`}
                                  style={{
                                    width: {
                                      weak: "25%",
                                      fair: "50%",
                                      good: "75%",
                                      strong: "100%",
                                    }[passwordStrength],
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-muted-foreground capitalize">{passwordStrength}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Re-enter password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11 bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      {error && (
                        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                        disabled={isLoading || password.length < 6}
                      >
                        {isLoading ? "Resetting..." : "Reset Password"}
                      </Button>

                      <div className="text-center text-sm text-muted-foreground">
                        <Link href="/auth/login" className="text-primary font-medium hover:underline underline-offset-4">
                          Back to Login
                        </Link>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

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
