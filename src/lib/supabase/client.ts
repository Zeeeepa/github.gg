import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase" // We'll need to generate this type from our schema

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
