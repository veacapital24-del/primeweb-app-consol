import "server-only";
import { createClient } from "@supabase/supabase-js";

// Fail fast when the local Supabase stack isn't reachable. Without this,
// the JS client's underlying fetch hangs indefinitely and a single page
// request pins a Node worker forever, which is what made the dev server
// look "stuck" while Docker was down.
const REQUEST_TIMEOUT_MS = 10_000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

// Public, cookie-free Supabase client for catalog reads (products, categories).
// Kept separate from `server.ts` (which is auth/cookie aware) so build-time
// `generateStaticParams` and other public reads don't accidentally opt the
// route into dynamic rendering by touching `cookies()`.
export function catalogClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchWithTimeout },
    },
  );
}
