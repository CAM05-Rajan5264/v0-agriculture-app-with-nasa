"use client"

import type React from "react"
import { useState } from "react"
import { requestPasswordReset } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { FarmPulseLogo } from "@/components/ui/farmpulse-logo"
import { Leaf, CheckCircle, ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Submitting password reset request for:", email)
      const result = await requestPasswordReset(email)

      if (!result.success) {
        throw new Error(result.message)
      }

      console.log("[v0] Password reset email sent successfully")
      setSuccess(true)
      setEmail("")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email"
      console.error("[v0] Password reset error:", errorMessage)
      setError(errorMessage)
    } finally {
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
            Recover Your Access
          </h1>
          <p className="text-muted-foreground text-center max-w-md text-lg leading-relaxed">
            We'll send you instructions to reset your password and get back to managing your farm.
          </p>

          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
            {["Secure Process", "Instant Email", "Easy Reset", "Quick Return"].map((feature) => (
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
                <CardTitle className="text-2xl font-bold text-foreground">Reset Password</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your email to receive reset instructions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {success ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        We've sent password reset instructions to <span className="font-medium text-foreground">{email}</span>
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-xs text-blue-900 dark:text-blue-300">
                        <span className="font-semibold">Tip:</span> Check your spam folder if you don't see the email.
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                      The link will expire in 24 hours for security.
                    </p>

                    <Button asChild className="w-full h-11 text-base font-semibold">
                      <Link href="/auth/login" className="flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <div className="flex flex-col gap-5">
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-foreground font-medium">
                          Email Address
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

                      {error && (
                        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </Button>

                      <div className="text-center text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link href="/auth/login" className="text-primary font-medium hover:underline underline-offset-4">
                          Sign in
                        </Link>
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="relative">
                <Image
                  src="/images/developer-portrait.jpeg"
                  alt="Rajan Kumar Singh, FarmPulse developer"
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
