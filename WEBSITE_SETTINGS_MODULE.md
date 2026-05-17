# Website Settings Module - Implementation Guide

## Overview
A complete Website Settings Module has been implemented for the Nulakaz Full Application, allowing administrators to manage dynamic website settings through both the backend console and frontend website.

## What Was Implemented

### 1. Backend (NuLakaz Bankend Consol)

#### Database Schema
**File:** `NuLakaz Bankend Consol/supabase/migrations/20260509010000_website_settings.sql`

Created a `website_settings` table with:
- `id` (UUID, Primary Key)
- `setting_name` (TEXT, UNIQUE) - The name/key of the setting
- `setting_value` (TEXT) - The value of the setting
- `data_type` (TEXT) - Type of data (string, number, boolean, json)
- `created_at` & `updated_at` (TIMESTAMP)

**Row Level Security (RLS):**
- Public read access (anyone can view settings)
- Admin-only write access (only admins can create/update/delete)

#### Backend API Functions
**File:** `NuLakaz Bankend Consol/src/lib/supabase.ts`

Added three functions:
- `getWebsiteSettings()` - Fetch all settings
- `updateWebsiteSetting()` - Create or update a setting
- `deleteWebsiteSetting()` - Delete a setting by ID

#### Backend Admin UI
**File:** `NuLakaz Bankend Consol/src/app/(dashboard)/website-settings/page.tsx`

A basic admin page with forms to:
- Add new settings
- Update existing settings
- Delete settings

### 2. Frontend (nulakaz-web)

#### Frontend API Service
**File:** `nulakaz-web/src/lib/settings.ts`

Server-side functions for the frontend:
- `fetchWebsiteSettings()` - Get all settings
- `upsertWebsiteSetting()` - Create or update a setting
- `deleteWebsiteSetting()` - Delete a setting

Includes TypeScript type definition: `WebsiteSetting`

#### Frontend Admin UI
**File:** `nulakaz-web/src/app/admin/settings/page.tsx`

A fully styled admin settings page with:
- Form to add new settings
- List of existing settings with inline editing
- Update and delete buttons for each setting
- Responsive design with Tailwind CSS
- Confirmation dialog for deletions

## How to Use

### 1. Run Database Migration

First, apply the database migration to create the `website_settings` table:

```bash
cd "NuLakaz Bankend Consol"
npx supabase db push
```

Or if using Supabase CLI:
```bash
cd "NuLakaz Bankend Consol"
supabase migration up
```

### 2. Access the Backend Console

Navigate to the backend console settings page:
```
http://localhost:3000/website-settings
```
(Adjust port based on your backend configuration)

### 3. Access the Frontend Admin

Navigate to the frontend admin settings page:
```
http://localhost:3000/admin/settings
```
(Adjust port based on your frontend configuration)

### 4. Managing Settings

**Add a New Setting:**
1. Fill in the "Add New Setting" form
2. Enter a unique setting name (e.g., `site_title`, `contact_email`)
3. Enter the setting value
4. Select the data type
5. Click "Add Setting"

**Update a Setting:**
1. Find the setting in the list
2. Modify the "Setting Value" field
3. Click "Update"

**Delete a Setting:**
1. Find the setting in the list
2. Click "Delete"
3. Confirm the deletion

## Example Settings

Here are some common website settings you might want to add:

| Setting Name | Setting Value | Data Type |
|--------------|---------------|-----------|
| `site_title` | NuLakaz - Online Grocery | string |
| `contact_email` | info@nulakaz.com | string |
| `contact_phone` | +230 5488 9652 | string |
| `free_delivery_threshold` | 1000 | number |
| `maintenance_mode` | false | boolean |
| `featured_categories` | ["milk","fresh-produce","meat"] | json |
| `announcement_banner` | Delivery on next day, Mon-Fri 10am-6pm | string |

## Using Settings in Your Application

To use these settings in your frontend application:

```typescript
import { fetchWebsiteSettings } from "@/lib/settings";

// In a Server Component
export default async function MyPage() {
  const settings = await fetchWebsiteSettings();
  
  // Find a specific setting
  const siteTitle = settings.find(s => s.setting_name === "site_title")?.setting_value;
  
  return <h1>{siteTitle}</h1>;
}
```

Or create a helper function:

```typescript
// lib/get-setting.ts
import { fetchWebsiteSettings } from "./settings";

export async function getSetting(name: string): Promise<string | null> {
  const settings = await fetchWebsiteSettings();
  return settings.find(s => s.setting_name === name)?.setting_value || null;
}

// Usage
const siteTitle = await getSetting("site_title");
```

## Security Notes

1. **RLS Policies:** The table has Row Level Security enabled
   - Anyone can read settings (public data)
   - Only authenticated admins can modify settings
   
2. **Admin Access:** Ensure you have proper authentication checks on the admin routes

3. **Sensitive Data:** Don't store sensitive information (API keys, passwords) in this table. Use environment variables instead.

## Next Steps

Consider these enhancements:

1. **Add Authentication:** Protect the admin routes with proper authentication
2. **Add Validation:** Validate setting values based on data_type
3. **Add Categories:** Group settings by category (General, Contact, Delivery, etc.)
4. **Add Caching:** Cache settings to reduce database queries
5. **Add Audit Log:** Track who changed what and when
6. **Add Import/Export:** Bulk import/export settings as JSON
7. **Add Setting Descriptions:** Help text for each setting

## Troubleshooting

**Migration fails:**
- Ensure Supabase is running
- Check if the table already exists
- Verify database connection settings

**Can't access admin pages:**
- Check if the routes are properly configured
- Verify authentication is set up
- Check console for errors

**Settings not updating:**
- Check browser console for errors
- Verify RLS policies are correct
- Ensure user has admin role

## Files Created/Modified

### Backend
- ✅ `NuLakaz Bankend Consol/supabase/migrations/20260509010000_website_settings.sql`
- ✅ `NuLakaz Bankend Consol/src/lib/supabase.ts` (modified)
- ✅ `NuLakaz Bankend Consol/src/app/(dashboard)/website-settings/page.tsx`

### Frontend
- ✅ `nulakaz-web/src/lib/settings.ts`
- ✅ `nulakaz-web/src/app/admin/settings/page.tsx`

## Support

For issues or questions, refer to:
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Project README files
