-- Academics and Grades Migration

-- ENUMS
CREATE TYPE academic_status AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');
CREATE TYPE grade_level AS ENUM ('KINDERGARTEN', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12');

-- ACADEMIC YEARS
CREATE TABLE academic_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL, -- e.g. "2023-2024"
  status academic_status NOT NULL DEFAULT 'UPCOMING',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SUBJECTS
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  credits DECIMAL(4,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CLASSES / SECTIONS
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  grade_level grade_level NOT NULL,
  section_name VARCHAR(50) NOT NULL,
  adviser_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  room_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CLASS SUBJECTS (Which subjects are taught in which class and by whom)
CREATE TABLE class_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, subject_id)
);

-- CLASS ENROLLMENTS (Which students are in which class)
CREATE TABLE class_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'ENROLLED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, student_id)
);

-- GRADES
CREATE TABLE grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES class_enrollments(id) ON DELETE CASCADE,
  class_subject_id UUID NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
  quarter_1 DECIMAL(5,2),
  quarter_2 DECIMAL(5,2),
  quarter_3 DECIMAL(5,2),
  quarter_4 DECIMAL(5,2),
  final_grade DECIMAL(5,2),
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(enrollment_id, class_subject_id)
);

-- RLS POLICIES

-- Enable RLS
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to academics" ON academic_years FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY "Admins have full access to subjects" ON subjects FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY "Admins have full access to classes" ON classes FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY "Admins have full access to class_subjects" ON class_subjects FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY "Admins have full access to class_enrollments" ON class_enrollments FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY "Admins have full access to grades" ON grades FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Teachers can view academics
CREATE POLICY "Teachers view academics" ON academic_years FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'TEACHER');
CREATE POLICY "Teachers view subjects" ON subjects FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'TEACHER');
CREATE POLICY "Teachers view classes" ON classes FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'TEACHER');
CREATE POLICY "Teachers view class_enrollments" ON class_enrollments FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'TEACHER');

-- Teachers can manage grades for their assigned subjects
CREATE POLICY "Teachers view class_subjects" ON class_subjects FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'TEACHER');

CREATE POLICY "Teachers view grades" ON grades FOR SELECT TO authenticated USING (
  auth.jwt() ->> 'role' = 'TEACHER'
);

CREATE POLICY "Teachers manage their own grades" ON grades FOR ALL TO authenticated USING (
  auth.jwt() ->> 'role' = 'TEACHER' AND 
  EXISTS (
    SELECT 1 FROM class_subjects cs
    WHERE cs.id = grades.class_subject_id
    AND cs.teacher_id = (SELECT e.id FROM employees e WHERE e.user_id = auth.uid())
  )
);

-- Students can view their own academics and grades
CREATE POLICY "Students view academics" ON academic_years FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'STUDENT');
CREATE POLICY "Students view subjects" ON subjects FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'STUDENT');
CREATE POLICY "Students view classes" ON classes FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'STUDENT');
CREATE POLICY "Students view class_subjects" ON class_subjects FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'STUDENT');

CREATE POLICY "Students view their enrollments" ON class_enrollments FOR SELECT TO authenticated USING (
  auth.jwt() ->> 'role' = 'STUDENT' AND
  student_id = (SELECT s.id FROM students s WHERE s.user_id = auth.uid())
);

CREATE POLICY "Students view their grades" ON grades FOR SELECT TO authenticated USING (
  auth.jwt() ->> 'role' = 'STUDENT' AND
  EXISTS (
    SELECT 1 FROM class_enrollments ce
    WHERE ce.id = grades.enrollment_id
    AND ce.student_id = (SELECT s.id FROM students s WHERE s.user_id = auth.uid())
  )
);
