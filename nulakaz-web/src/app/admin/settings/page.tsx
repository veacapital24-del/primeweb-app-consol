import { fetchWebsiteSettings, upsertWebsiteSetting, deleteWebsiteSetting } from "@/lib/settings";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const settings = await fetchWebsiteSettings();

  async function handleUpsert(formData: FormData) {
    "use server";
    
    const id = formData.get("id") as string | undefined;
    const setting_name = formData.get("setting_name") as string;
    const setting_value = formData.get("setting_value") as string;
    const data_type = formData.get("data_type") as string;

    await upsertWebsiteSetting({
      ...(id && { id }),
      setting_name,
      setting_value,
      data_type,
    });

    revalidatePath("/admin/settings");
    redirect("/admin/settings");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    
    const id = formData.get("id") as string;
    await deleteWebsiteSetting(id);
    
    revalidatePath("/admin/settings");
    redirect("/admin/settings");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Website Settings</h1>

      {/* Add New Setting Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Setting</h2>
        <form action={handleUpsert} className="space-y-4">
          <div>
            <label htmlFor="setting_name" className="block text-sm font-medium text-gray-700 mb-1">
              Setting Name
            </label>
            <input
              type="text"
              id="setting_name"
              name="setting_name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., site_title, contact_email"
            />
          </div>
          <div>
            <label htmlFor="setting_value" className="block text-sm font-medium text-gray-700 mb-1">
              Setting Value
            </label>
            <input
              type="text"
              id="setting_value"
              name="setting_value"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter value"
            />
          </div>
          <div>
            <label htmlFor="data_type" className="block text-sm font-medium text-gray-700 mb-1">
              Data Type
            </label>
            <select
              id="data_type"
              name="data_type"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Setting
          </button>
        </form>
      </div>

      {/* Existing Settings List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Settings</h2>
        {settings.length === 0 ? (
          <p className="text-gray-500">No settings found. Add your first setting above.</p>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                <form action={handleUpsert} className="space-y-3">
                  <input type="hidden" name="id" value={setting.id} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Setting Name
                      </label>
                      <input
                        type="text"
                        name="setting_name"
                        defaultValue={setting.setting_name}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Setting Value
                      </label>
                      <input
                        type="text"
                        name="setting_value"
                        defaultValue={setting.setting_value || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Type
                      </label>
                      <input
                        type="text"
                        name="data_type"
                        defaultValue={setting.data_type}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      formAction={handleDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      onClick={(e) => {
                        const form = e.currentTarget.closest("form");
                        if (form && confirm("Are you sure you want to delete this setting?")) {
                          const deleteForm = document.createElement("form");
                          deleteForm.method = "POST";
                          const idInput = document.createElement("input");
                          idInput.type = "hidden";
                          idInput.name = "id";
                          idInput.value = setting.id;
                          deleteForm.appendChild(idInput);
                          deleteForm.action = form.action;
                          document.body.appendChild(deleteForm);
                          const deleteAction = handleDelete.bind(null);
                          deleteForm.requestSubmit();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
