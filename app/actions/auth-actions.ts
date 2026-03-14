"use server"

import { createClient } from "@/lib/supabase/server"

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
