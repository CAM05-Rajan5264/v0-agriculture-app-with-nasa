"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function loginUser(email: string, password: string) {
  console.log("[v0] Server action: Logging in user", email)

  try {
    // Validate inputs
    if (!email || !password) {
      const errorMessage = "Email and password are required"
      console.error("[v0] Validation error:", errorMessage)
      return { success: false, message: errorMessage }
    }

    console.log("[v0] Creating Supabase server client...")
    let supabase
    try {
      supabase = await createClient()
    } catch (clientError) {
      const errorMessage = clientError instanceof Error ? clientError.message : "Failed to initialize Supabase client"
      console.error("[v0] Supabase client initialization error:", errorMessage)
      return { success: false, message: `Configuration error: ${errorMessage}` }
    }

    console.log("[v0] Supabase server client created, calling signInWithPassword")

    let data
    let error
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      data = result.data
      error = result.error
    } catch (authError) {
      const errorMessage = authError instanceof Error ? authError.message : "Authentication service error"
      console.error("[v0] Supabase auth exception:", errorMessage)
      
      // Check if it's a service unavailability error (5xx)
      if (errorMessage.includes("521") || errorMessage.includes("502") || errorMessage.includes("503") || errorMessage.includes("Web server is down")) {
        return { 
          success: false, 
          message: "Authentication service is temporarily unavailable. Please try again in a few moments." 
        }
      }
      
      return { 
        success: false, 
        message: errorMessage 
      }
    }

    if (error) {
      const errorMessage = error?.message || "Login failed"
      console.error("[v0] Supabase auth error:", errorMessage)

      if (errorMessage.includes("521") || errorMessage.includes("502") || errorMessage.includes("503") || errorMessage.includes("Web server is down")) {
        return {
          success: false,
          message: "Authentication service is temporarily unavailable. Please try again in a few moments.",
        }
      }

      if (error.code === "email_not_confirmed") {
        return { success: false, message: "Please confirm your email address before signing in." }
      }

      if (error.code === "invalid_credentials") {
        return { success: false, message: "Invalid email or password." }
      }

      if (error.status === 429 || error.code === "over_request_rate_limit") {
        return { success: false, message: "Too many attempts. Please wait a moment and try again." }
      }

      return { success: false, message: "Something went wrong. Please try again." }
    }

    if (!data?.session) {
      const errorMessage = "Login failed. No session created."
      console.error("[v0]", errorMessage)
      return { success: false, message: errorMessage }
    }

    console.log("[v0] User logged in successfully")
    redirect("/dashboard")
  } catch (error: unknown) {
    // Next.js uses a thrown internal error to complete redirect(). Do not turn it into a login error.
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error
    }

    let message = "An error occurred during login"
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === "string") {
      message = error
    }
    console.error("[v0] Login exception:", message)
    return { success: false, message }
  }
}

export async function requestPasswordReset(email: string) {
  console.log("[v0] Server action: Requesting password reset for", email)

  try {
    const supabase = await createClient()

    console.log("[v0] Supabase client created, calling resetPasswordForEmail")

    let error
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
      })
      error = result.error
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Service error"
      console.error("[v0] Password reset service error:", errorMessage)
      
      if (errorMessage.includes("521") || errorMessage.includes("502") || errorMessage.includes("503") || errorMessage.includes("Web server is down")) {
        return { 
          success: false, 
          message: "Password reset service is temporarily unavailable. Please try again in a few moments." 
        }
      }
      return { success: false, message: errorMessage }
    }

    if (error) {
      const errorMessage = error?.message || "Failed to send password reset email"
      console.error("[v0] Password reset error:", errorMessage)
      
      if (errorMessage.includes("521") || errorMessage.includes("502") || errorMessage.includes("503")) {
        return { 
          success: false, 
          message: "Password reset service is temporarily unavailable. Please try again in a few moments." 
        }
      }
      return { success: false, message: errorMessage }
    }

    console.log("[v0] Password reset email sent successfully")
    return { success: true, message: "Password reset email sent successfully" }
  } catch (error: unknown) {
    let message = "Failed to send password reset email"
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === "string") {
      message = error
    }
    console.error("[v0] Password reset failed:", message)
    
    if (message.includes("521") || message.includes("502") || message.includes("503")) {
      return { 
        success: false, 
        message: "Password reset service is temporarily unavailable. Please try again in a few moments." 
      }
    }
    return { success: false, message }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  console.log("[v0] Server action: Resetting password with token")

  try {
    const supabase = await createClient()

    console.log("[v0] Updating user password with token")

    let error
    try {
      const result = await supabase.auth.updateUser({
        password: newPassword,
      })
      error = result.error
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Service error"
      console.error("[v0] Password update service error:", errorMessage)
      
      if (errorMessage.includes("521") || errorMessage.includes("502") || errorMessage.includes("503") || errorMessage.includes("Web server is down")) {
        return { 
          success: false, 
          message: "Password service is temporarily unavailable. Please try again in a few moments." 
        }
      }
      return { success: false, message: errorMessage }
    }

    if (error) {
      const errorMessage = error?.message || "Failed to reset password"
      console.error("[v0] Password update error:", errorMessage)
      
      if (errorMessage.includes("521") || errorMessage.includes("502") || errorMessage.includes("503")) {
        return { 
          success: false, 
          message: "Password service is temporarily unavailable. Please try again in a few moments." 
        }
      }
      return { success: false, message: errorMessage }
    }

    console.log("[v0] Password updated successfully")
    return { success: true, message: "Password updated successfully" }
  } catch (error: unknown) {
    let message = "Failed to reset password"
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === "string") {
      message = error
    }
    console.error("[v0] Password reset failed:", message)
    
    if (message.includes("521") || message.includes("502") || message.includes("503")) {
      return { 
        success: false, 
        message: "Password service is temporarily unavailable. Please try again in a few moments." 
      }
    }
    return { success: false, message }
  }
}
