import { getWebsiteSettings, updateWebsiteSetting, deleteWebsiteSetting } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function WebsiteSettingsPage() {
  const settings = await getWebsiteSettings(true);

  async function handleUpdate(formData: FormData) {
    "use server";
    const id = formData.get("id") as string | undefined;
    const setting_name = formData.get("setting_name") as string;
    const setting_value = formData.get("setting_value") as string;
    const data_type = formData.get("data_type") as string;

    await updateWebsiteSetting({ id, setting_name, setting_value, data_type }, true);
    redirect("/website-settings");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteWebsiteSetting(id, true);
    redirect("/website-settings");
  }

  return (
    <div>
      <h1>Website Settings</h1>
      <form action={handleUpdate}>
        <input type="hidden" name="id" />
        <input type="text" name="setting_name" placeholder="Setting Name" required />
        <input type="text" name="setting_value" placeholder="Setting Value" />
        <input type="text" name="data_type" placeholder="Data Type" required />
        <button type="submit">Add New Setting</button>
      </form>

      <h2>Existing Settings</h2>
      <ul>
        {settings.map((setting: any) => (
          <li key={setting.id}>
            <form action={handleUpdate}>
              <input type="hidden" name="id" value={setting.id} />
              <input type="text" name="setting_name" value={setting.setting_name} readOnly />
              <input type="text" name="setting_value" defaultValue={setting.setting_value} />
              <input type="text" name="data_type" value={setting.data_type} readOnly />
              <button type="submit">Update</button>
            </form>
            <form action={handleDelete}>
              <input type="hidden" name="id" value={setting.id} />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}