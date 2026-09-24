-- Comprehensive Mock Data Seed Script for SmartSchool

-- 1. Ensure School exists
INSERT INTO public.schools (id, name, logo_url) 
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'SmartSchool International Academy', 
  '/icons/school-logo.png'
) ON CONFLICT (id) DO NOTHING;

-- 2. Academic Year
INSERT INTO public.academic_years (id, school_id, name, status, start_date, end_date)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '2025-2026',
  'ACTIVE',
  '2025-08-01',
  '2026-06-30'
) ON CONFLICT (id) DO NOTHING;

-- 3. Teacher Person & Employee Record
INSERT INTO public.people (id, first_name, last_name, middle_name, gender, contact_number)
VALUES (
  '22222222-2222-2222-2222-222222222221',
  'Ricardo',
  'Santos',
  'M.',
  'MALE',
  '+63 917 123 4567'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.employees (id, person_id, school_id, employee_number, employment_type, status)
VALUES (
  '33333333-3333-3333-3333-333333333331',
  '22222222-2222-2222-2222-222222222221',
  '11111111-1111-1111-1111-111111111111',
  'EMP-2026-001',
  'FULL_TIME',
  'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.teachers (id, employee_id, specialization)
VALUES (
  '44444444-4444-4444-4444-444444444441',
  '33333333-3333-3333-3333-333333333331',
  'EPP / Technology and Livelihood Education'
) ON CONFLICT (id) DO NOTHING;

-- 4. Class / Section (GRADE 10 - Section A)
INSERT INTO public.classes (id, school_id, academic_year_id, grade_level, section_name, adviser_id, room_number)
VALUES (
  '55555555-5555-5555-5555-555555555551',
  '11111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'GRADE_10',
  'Section A - Emerald',
  '33333333-3333-3333-3333-333333333331',
  'Room 301'
) ON CONFLICT (id) DO NOTHING;

-- 5. Subjects
INSERT INTO public.subjects (id, school_id, code, name, description, credits)
VALUES
  ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', 'EPP-TLE-10', 'Technology & Livelihood Education 10', 'Practical skills, computer systems, and entrepreneurship', 1.0),
  ('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', 'ENG-10', 'English 10', 'World Literature and Advanced Composition', 1.0),
  ('66666666-6666-6666-6666-666666666663', '11111111-1111-1111-1111-111111111111', 'MATH-10', 'Mathematics 10', 'Sequences, Polynomials, and Statistics', 1.0)
ON CONFLICT (id) DO NOTHING;

-- 6. Class Subject Assignment
INSERT INTO public.class_subjects (id, class_id, subject_id, teacher_id)
VALUES (
  '77777777-7777-7777-7777-777777777771',
  '55555555-5555-5555-5555-555555555551',
  '66666666-6666-6666-6666-666666666661',
  '33333333-3333-3333-3333-333333333331'
) ON CONFLICT (id) DO NOTHING;

-- 7. Three Students (Wilbert Gamis, Juan Dela Cruz, Maria Santos)
INSERT INTO public.people (id, first_name, last_name, middle_name, gender, contact_number)
VALUES
  ('88888888-8888-8888-8888-888888888881', 'Wilbert', 'Gamis', 'A.', 'MALE', '+63 918 000 0001'),
  ('88888888-8888-8888-8888-888888888882', 'Juan', 'Dela Cruz', 'B.', 'MALE', '+63 918 000 0002'),
  ('88888888-8888-8888-8888-888888888883', 'Maria', 'Santos', 'C.', 'FEMALE', '+63 918 000 0003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.students (id, person_id, school_id, student_number, current_status)
VALUES
  ('99999999-9999-9999-9999-999999999991', '88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', '2026-0001', 'ENROLLED'),
  ('99999999-9999-9999-9999-999999999992', '88888888-8888-8888-8888-888888888882', '11111111-1111-1111-1111-111111111111', '2026-0002', 'ENROLLED'),
  ('99999999-9999-9999-9999-999999999993', '88888888-8888-8888-8888-888888888883', '11111111-1111-1111-1111-111111111111', '2026-0003', 'ENROLLED')
ON CONFLICT (id) DO NOTHING;

-- 8. Class Enrollments
INSERT INTO public.class_enrollments (id, class_id, student_id, status)
VALUES
  ('90000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555551', '99999999-9999-9999-9999-999999999991', 'ENROLLED'),
  ('90000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555551', '99999999-9999-9999-9999-999999999992', 'ENROLLED'),
  ('90000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555551', '99999999-9999-9999-9999-999999999993', 'ENROLLED')
ON CONFLICT (id) DO NOTHING;

-- 9. Student Grades
INSERT INTO public.grades (id, enrollment_id, class_subject_id, quarter_1, quarter_2, quarter_3, quarter_4, final_grade, remarks)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777771', 92.00, 94.00, 90.00, 95.00, 92.75, 'PASSED - Outstanding Performance'),
  ('c0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777771', 88.00, 90.00, 86.00, 91.00, 88.75, 'PASSED - Good Performance'),
  ('c0000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777771', 95.00, 96.00, 94.00, 97.00, 95.50, 'PASSED - With Honors')
ON CONFLICT (id) DO NOTHING;

-- 10. Attendance Records
INSERT INTO public.attendance (id, enrollment_id, date, status, remarks)
VALUES
  ('d0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', CURRENT_DATE, 'PRESENT', 'On time'),
  ('d0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', CURRENT_DATE, 'ABSENT', 'Excused - Family Emergency'),
  ('d0000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000003', CURRENT_DATE, 'LATE', 'Traffic delay')
ON CONFLICT (id) DO NOTHING;

-- 11. DepEd E-Class Records
INSERT INTO public.deped_class_records (id, school_id, class_subject_id, grade_level, section, school_year)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777771',
  'GRADE_10',
  'Section A - Emerald',
  '2025-2026'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.deped_student_term_grades (id, record_id, student_id, term, ww_scores, ww_hps, pt_scores, pt_hps, exam_scores, exam_hps, initial_grade, transmuted_grade, descriptor, remark)
VALUES
  ('f0000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999991', 1, '[18, 19, 20, 19, 18]'::jsonb, '[20, 20, 20, 20, 20]'::jsonb, '[48, 50, 47]'::jsonb, '[50, 50, 50]'::jsonb, '[28, 29, 38]'::jsonb, '[30, 30, 40]'::jsonb, 94.20, 95, 'Advancing', 'PASSED'),
  ('f0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999992', 1, '[16, 17, 18, 16, 17]'::jsonb, '[20, 20, 20, 20, 20]'::jsonb, '[42, 44, 43]'::jsonb, '[50, 50, 50]'::jsonb, '[25, 26, 34]'::jsonb, '[30, 30, 40]'::jsonb, 86.40, 89, 'Benchmarking', 'PASSED'),
  ('f0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999993', 1, '[20, 20, 19, 20, 20]'::jsonb, '[20, 20, 20, 20, 20]'::jsonb, '[50, 49, 50]'::jsonb, '[50, 50, 50]'::jsonb, '[30, 29, 39]'::jsonb, '[30, 30, 40]'::jsonb, 98.10, 99, 'Advancing', 'PASSED')
ON CONFLICT (id) DO NOTHING;
