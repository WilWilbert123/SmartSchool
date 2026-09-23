-- Fix RLS Policies for Academic Years, Classes, Subjects, and Enrollments

-- Drop overly restrictive JWT role policies if present
DROP POLICY IF EXISTS "Admins have full access to academics" ON academic_years;
DROP POLICY IF EXISTS "Admins have full access to subjects" ON subjects;
DROP POLICY IF EXISTS "Admins have full access to classes" ON classes;
DROP POLICY IF EXISTS "Admins have full access to class_subjects" ON class_subjects;
DROP POLICY IF EXISTS "Admins have full access to class_enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Admins have full access to grades" ON grades;

-- Add permissive RLS policies for all authenticated users
CREATE POLICY "Authenticated users full access to academic_years" ON academic_years FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access to subjects" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access to classes" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access to class_subjects" ON class_subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access to class_enrollments" ON class_enrollments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access to grades" ON grades FOR ALL TO authenticated USING (true) WITH CHECK (true);
