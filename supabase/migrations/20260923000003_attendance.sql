-- Phase 3: Attendance Schema

CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES class_enrollments(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'PRESENT',
  remarks TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(enrollment_id, date)
);

-- RLS Policies
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to attendance" ON attendance FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Teachers can view and manage attendance for their classes
CREATE POLICY "Teachers view attendance" ON attendance FOR SELECT TO authenticated USING (
  auth.jwt() ->> 'role' = 'TEACHER'
);

CREATE POLICY "Teachers manage attendance" ON attendance FOR ALL TO authenticated USING (
  auth.jwt() ->> 'role' = 'TEACHER' AND 
  EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE ce.id = attendance.enrollment_id
    AND c.adviser_id = (SELECT e.id FROM employees e WHERE e.user_id = auth.uid())
  )
);

-- Students view their own attendance
CREATE POLICY "Students view their attendance" ON attendance FOR SELECT TO authenticated USING (
  auth.jwt() ->> 'role' = 'STUDENT' AND
  EXISTS (
    SELECT 1 FROM class_enrollments ce
    WHERE ce.id = attendance.enrollment_id
    AND ce.student_id = (SELECT s.id FROM students s WHERE s.user_id = auth.uid())
  )
);
