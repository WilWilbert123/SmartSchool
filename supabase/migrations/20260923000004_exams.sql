-- Migration for Exams Schedule table

CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID,
  title VARCHAR(150) NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_marks DECIMAL(5,2) DEFAULT 100.00,
  passing_marks DECIMAL(5,2) DEFAULT 50.00,
  status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'
  room_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view exams
CREATE POLICY "Authenticated users can select exams" 
  ON exams FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users (Admins / Teachers) to manage exams
CREATE POLICY "Authenticated users can insert exams" 
  ON exams FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update exams" 
  ON exams FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete exams" 
  ON exams FOR DELETE 
  TO authenticated 
  USING (true);
