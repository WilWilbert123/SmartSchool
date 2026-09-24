-- DepEd E-Class Record (ECR) for EPP-TLE & Trimester / 2-Term System

CREATE TABLE IF NOT EXISTS public.deped_class_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_subject_id UUID REFERENCES public.class_subjects(id) ON DELETE CASCADE,
  grade_level grade_level NOT NULL,
  section VARCHAR(50) NOT NULL,
  school_year VARCHAR(20) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.deped_student_term_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES public.deped_class_records(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  term INT CHECK (term IN (1, 2)),
  ww_scores JSONB DEFAULT '[]'::jsonb,
  ww_hps JSONB DEFAULT '[]'::jsonb,
  pt_scores JSONB DEFAULT '[]'::jsonb,
  pt_hps JSONB DEFAULT '[]'::jsonb,
  exam_scores JSONB DEFAULT '[]'::jsonb,
  exam_hps JSONB DEFAULT '[]'::jsonb,
  initial_grade DECIMAL(5,2),
  transmuted_grade INT,
  descriptor VARCHAR(50),
  remark VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(record_id, student_id, term)
);

-- RLS Policies
ALTER TABLE public.deped_class_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deped_student_term_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view deped_class_records" ON public.deped_class_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users manage deped_class_records" ON public.deped_class_records FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users view deped_student_term_grades" ON public.deped_student_term_grades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users manage deped_student_term_grades" ON public.deped_student_term_grades FOR ALL TO authenticated USING (true);
