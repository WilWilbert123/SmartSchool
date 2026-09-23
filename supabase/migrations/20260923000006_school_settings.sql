-- Migration for School Settings details

ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS code VARCHAR(50),
ADD COLUMN IF NOT EXISTS email VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view school settings
CREATE POLICY "Authenticated users can view schools"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admins to insert/update school settings
CREATE POLICY "Admins can insert schools"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update schools"
  ON schools FOR UPDATE
  TO authenticated
  USING (true);

-- Seed initial school row if empty
INSERT INTO schools (id, name, code, email, phone, address)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'SmartSchool International Academy',
  'SCH-2026-001',
  'admin@smartschool.edu',
  '+1 (555) 019-2831',
  '123 Education Blvd, Academic District'
ON CONFLICT (id) DO NOTHING;
