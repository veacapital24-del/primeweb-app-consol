import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parseMaintenanceValue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return false;
}

// Optional hard override for emergencies.
// Accepted truthy values: true, 1, yes, on
// Accepted falsy values: false, 0, no, off
function getEnvMaintenanceOverride(): boolean | null {
  const raw = process.env.MAINTENANCE_MODE ?? process.env.NEXT_PUBLIC_MAINTENANCE_MODE;
  if (!raw) return null;

  const value = raw.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(value)) return true;
  if (["false", "0", "no", "off"].includes(value)) return false;
  return null;
}

// Centralized maintenance-mode read for storefront rendering.
// If settings cannot be read, default to "off" to avoid accidental outages.
export async function getMaintenanceMode(): Promise<boolean> {
  const envOverride = getEnvMaintenanceOverride();
  if (envOverride !== null) return envOverride;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("website_settings")
      .select("setting_value")
      .eq("setting_name", "maintenance_mode")
      .maybeSingle();

    if (error) {
      console.error("Error reading maintenance_mode", error);
      return false;
    }

    return parseMaintenanceValue(data?.setting_value);
  } catch (error) {
    console.error("Unexpected maintenance_mode read error", error);
    return false;
  }
}
