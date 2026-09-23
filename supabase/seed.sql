-- Initial Seed Data for SmartSchool

-- 1. Create a demo school
INSERT INTO schools (id, name, logo_url) 
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'SmartSchool Academy', 
  '/icons/school-logo.png'
) ON CONFLICT DO NOTHING;

-- 2. Insert Base Roles
INSERT INTO roles (name, description) VALUES
  ('SUPERADMIN', 'System wide super administrator'),
  ('ADMIN', 'School administrator'),
  ('TEACHER', 'Teaching personnel'),
  ('NON_TEACHING', 'Non-teaching staff'),
  ('STUDENT', 'Enrolled student')
ON CONFLICT DO NOTHING;

-- 3. Insert Base Permissions
INSERT INTO permissions (name, description) VALUES
  ('students.view', 'View students'),
  ('students.create', 'Create students'),
  ('students.update', 'Update students'),
  ('students.archive', 'Archive students'),
  ('grades.view', 'View grades'),
  ('grades.submit', 'Submit grades'),
  ('grades.approve', 'Approve grades')
ON CONFLICT DO NOTHING;

-- Note: A real deployment would link users to these roles and permissions.
-- We do not seed actual auth.users passwords here for security reasons.
