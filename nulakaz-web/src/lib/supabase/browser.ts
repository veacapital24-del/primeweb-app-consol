"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Singleton via the @supabase/ssr helper —
// reads cookies the same way the server client writes them, so auth state
// stays consistent across SSR and CSR.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
