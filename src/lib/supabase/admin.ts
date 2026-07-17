import { createClient } from '@supabase/supabase-js'

// Note: This client uses the Service Role Key.
// It bypasses Row Level Security (RLS) entirely.
// NEVER use this client in the browser or expose it to the client side.
// Only use it in Server Actions or Route Handlers where administrative privileges are required.

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
