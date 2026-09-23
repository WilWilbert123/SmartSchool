-- Migration for Announcements table

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  audience VARCHAR(50) DEFAULT 'ALL', -- 'ALL', 'STUDENTS', 'TEACHERS', 'PARENTS'
  priority VARCHAR(20) DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
  status VARCHAR(20) DEFAULT 'PUBLISHED', -- 'DRAFT', 'PUBLISHED', 'ARCHIVED'
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view published announcements
CREATE POLICY "Authenticated users can select announcements" 
  ON announcements FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users (Admins / Teachers) to manage announcements
CREATE POLICY "Authenticated users can insert announcements" 
  ON announcements FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update announcements" 
  ON announcements FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete announcements" 
  ON announcements FOR DELETE 
  TO authenticated 
  USING (true);
