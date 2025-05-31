import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase" // We'll need to generate this type

export function createSupabaseServerClient(cookieStore?: ReturnType<typeof cookies>) {
  const store = cookieStore || cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // For server components, you might use the service role key for elevated privileges if needed, but anon key is fine for user-context operations.
    // For operations requiring admin/service privileges (like bypassing RLS for internal tasks),
    // you'd typically use a separate client initialized with SUPABASE_SERVICE_ROLE_KEY.
    // This client is for user-session-aware operations.
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          store.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          store.set({ name, value: "", ...options })
        },
      },
    },
  )
}

export function createSupabaseServiceRoleClient() {
  // This client should ONLY be used in server-side environments where elevated privileges are necessary
  // (e.g., backend scripts, cron jobs, specific API routes that perform admin tasks).
  // Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. This client requires it for elevated privileges.")
  }
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      // Important: Disable auto-refreshing session for service role client
      // as it doesn't operate in a user context.
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
