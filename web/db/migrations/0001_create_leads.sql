CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  program_interest TEXT,
  objective TEXT,
  locale TEXT DEFAULT 'nl',
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for form submissions)
CREATE POLICY "leads_insert_policy" ON leads FOR INSERT WITH CHECK (true);

-- Allow authenticated users to select their own data
CREATE POLICY "leads_select_policy" ON leads FOR SELECT USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);
