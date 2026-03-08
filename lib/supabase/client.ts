import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Client env vars - URL:", url ? "set" : "NOT SET", "KEY:", key ? "set" : "NOT SET")

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables")
    throw new Error("Supabase configuration is missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.")
  }

  return createBrowserClient(url, key)
}
