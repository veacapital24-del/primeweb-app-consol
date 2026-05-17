import "server-only";
import { createSupabaseServerClient } from "./supabase/server";

export type WebsiteSetting = {
  id: string;
  setting_name: string;
  setting_value: string | null;
  data_type: string;
  created_at?: string;
  updated_at?: string;
};

export async function fetchWebsiteSettings(): Promise<WebsiteSetting[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("website_settings").select("*");
  if (error) {
    console.error("Error fetching website settings", error);
    return [];
  }
  return data ?? [];
}

export async function upsertWebsiteSetting(setting: {
  id?: string;
  setting_name: string;
  setting_value: string | null;
  data_type: string;
}): Promise<WebsiteSetting | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("website_settings")
    .upsert(setting, { onConflict: "setting_name" })
    .select()
    .single();

  if (error) {
    console.error("Error upserting website setting", error);
    return null;
  }
  return data;
}

export async function deleteWebsiteSetting(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("website_settings").delete().eq("id", id);
  if (error) {
    console.error("Error deleting website setting", error);
    return false;
  }
  return true;
}
