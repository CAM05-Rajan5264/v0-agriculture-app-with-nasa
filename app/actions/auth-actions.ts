"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function loginUser(email: string, password: string) {
  console.log("[v0] Server action: Logging in user", email)

  try {
    const supabase = await createClient()

    console.log("[v0] Supabase server client created, calling signInWithPassword")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] Login error:", error.message)
      return { success: false, message: error.message }
    }

    if (!data.session) {
      console.error("[v0] No session created after login")
      return { success: false, message: "Login failed. No session created." }
    }

    console.log("[v0] User logged in successfully")
    return { success: true, message: "Login successful" }
  } catch (error: unknown) {
    console.error("[v0] Login failed:", error)
    const message = error instanceof Error ? error.message : "An error occurred during login"
    return { success: false, message }
  }
}

export async function requestPasswordReset(email: string) {
  console.log("[v0] Server action: Requesting password reset for", email)

  try {
    const supabase = await createClient()

    console.log("[v0] Supabase client created, calling resetPasswordForEmail")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
    })

    if (error) {
      console.error("[v0] Password reset error:", error)
      throw error
    }

    console.log("[v0] Password reset email sent successfully")
    return { success: true, message: "Password reset email sent successfully" }
  } catch (error: unknown) {
    console.error("[v0] Password reset failed:", error)
    const message = error instanceof Error ? error.message : "Failed to send password reset email"
    return { success: false, message }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  console.log("[v0] Server action: Resetting password with token")

  try {
    const supabase = await createClient()

    console.log("[v0] Updating user password with token")

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("[v0] Password update error:", error)
      throw error
    }

    console.log("[v0] Password updated successfully")
    return { success: true, message: "Password updated successfully" }
  } catch (error: unknown) {
    console.error("[v0] Password reset failed:", error)
    const message = error instanceof Error ? error.message : "Failed to reset password"
    return { success: false, message }
  }
}
