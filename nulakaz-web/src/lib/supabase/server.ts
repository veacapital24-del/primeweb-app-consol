import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for Server Components, Route Handlers, and
// Server Actions. Uses Next's cookies() to read/write auth cookies — required
// for getUser() / getSession() to work end-to-end.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll is called from a Server Component — silently ignore.
            // Cookie refresh happens via middleware instead.
          }
        },
      },
    },
  );
}
