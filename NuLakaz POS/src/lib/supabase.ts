import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type CookieEntry = { name: string; value: string; options?: CookieOptions }

export function browserClient() {
  return createBrowserClient(url, anon)
}

export async function serverClient() {
  const store = await cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (entries: CookieEntry[]) => {
        for (const { name, value, options } of entries) {
          try { store.set(name, value, options) } catch { /* read-only context */ }
        }
      },
    },
  })
}

// Service-role client — only use in server actions / route handlers, never imported
// into a client component. Bypasses RLS.
export function adminClient() {
  return createSupabaseClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
