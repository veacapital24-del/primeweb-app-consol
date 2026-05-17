-- Create website_settings table
CREATE TABLE website_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_name TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    data_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS for website_settings
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Website settings are viewable by everyone" ON website_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage website settings" ON website_settings
  FOR ALL USING (is_admin());
