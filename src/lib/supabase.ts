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
export function adminClient() {
  return createSupabaseClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function getWebsiteSettings(server?: boolean) {
  const supabase = server ? await serverClient() : browserClient();
  const { data, error } = await supabase.from("website_settings").select("*");
  if (error) {
    console.error("Error fetching website settings:", error);
    return [];
  }
  return data ?? [];
}

export async function updateWebsiteSetting(setting: { id?: string; setting_name: string; setting_value: string | null; data_type: string }, server?: boolean) {
  const supabase = server ? await serverClient() : browserClient();
  const { data, error } = await supabase
    .from("website_settings")
    .upsert(setting, { onConflict: "setting_name" })
    .select();

  if (error) {
    console.error("Error updating website setting:", error);
    return null;
  }
  return data ? data[0] : null;
}

export async function deleteWebsiteSetting(id: string, server?: boolean) {
  const supabase = server ? await serverClient() : browserClient();
  const { error } = await supabase.from("website_settings").delete().eq("id", id);
  if (error) {
    console.error("Error deleting website setting:", error);
    return false;
  }
  return true;
}

