import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables:")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "set" : "MISSING")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "set" : "MISSING")
    throw new Error("Supabase environment variables are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
