import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase admin client with service role privileges.
 * This client bypasses Row Level Security (RLS) policies and should only be used server-side.
 *
 * IMPORTANT: Never expose the service role key to the client or use this in client-side code.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
        "Please add it to your Vercel environment settings or .env.local file.",
    )
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "This key is required for admin operations like deleting users. " +
        "Please add it to your Vercel environment settings (NOT .env.local as it should never be exposed to the client).",
    )
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
