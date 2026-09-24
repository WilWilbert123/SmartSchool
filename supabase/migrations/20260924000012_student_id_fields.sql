-- Migration: Add missing ID Card fields to students, people, and schools tables

-- 1. Add fields to people table (profile photo & signature)
ALTER TABLE public.people
ADD COLUMN IF NOT EXISTS student_signature_url TEXT;

-- 2. Add fields to students table (LRN, grade, section, guardian details, blood type)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS lrn TEXT,
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS section_name TEXT,
ADD COLUMN IF NOT EXISTS school_year TEXT,
ADD COLUMN IF NOT EXISTS guardian_relationship TEXT,
ADD COLUMN IF NOT EXISTS blood_type TEXT;

-- 3. Add fields to schools table (principal signature & school details)
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS principal_name TEXT DEFAULT 'Dr. Maria Santos',
ADD COLUMN IF NOT EXISTS principal_title TEXT DEFAULT 'School Principal',
ADD COLUMN IF NOT EXISTS principal_signature_url TEXT,
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- 4. Add dual-side background & element columns to id_templates table
ALTER TABLE public.id_templates
ADD COLUMN IF NOT EXISTS front_background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS back_background_color TEXT DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS front_background_url TEXT,
ADD COLUMN IF NOT EXISTS back_background_url TEXT,
ADD COLUMN IF NOT EXISTS front_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS back_elements JSONB NOT NULL DEFAULT '[]'::jsonb;
