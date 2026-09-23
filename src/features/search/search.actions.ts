"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  id: string;
  type: "STUDENT" | "TEACHER" | "CLASS" | "SUBJECT";
  title: string;
  subtitle: string;
  url: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const searchPattern = `%${query.trim()}%`;

  const results: SearchResult[] = [];

  // 1. Search Students
  const { data: students } = await supabase
    .from("students")
    .select(`
      id,
      student_number,
      people!inner (
        first_name,
        last_name
      )
    `)
    .or(`student_number.ilike.${searchPattern},people.first_name.ilike.${searchPattern},people.last_name.ilike.${searchPattern}`)
    .limit(5);

  if (students) {
    students.forEach((s: any) => {
      const person = s.people || {};
      results.push({
        id: s.id,
        type: "STUDENT",
        title: `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Student",
        subtitle: `Student #${s.student_number || s.id.slice(0, 8)}`,
        url: `/admin/students`,
      });
    });
  }

  // 2. Search Teachers (Employees)
  const { data: teachers } = await supabase
    .from("employees")
    .select(`
      id,
      employee_number,
      job_title,
      people!inner (
        first_name,
        last_name
      )
    `)
    .or(`employee_number.ilike.${searchPattern},job_title.ilike.${searchPattern},people.first_name.ilike.${searchPattern},people.last_name.ilike.${searchPattern}`)
    .limit(5);

  if (teachers) {
    teachers.forEach((t: any) => {
      const person = t.people || {};
      results.push({
        id: t.id,
        type: "TEACHER",
        title: `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Teacher",
        subtitle: t.job_title || `Teacher #${t.employee_number || t.id.slice(0, 8)}`,
        url: `/admin/teachers`,
      });
    });
  }

  // 3. Search Classes
  const { data: classes } = await supabase
    .from("classes")
    .select(`id, grade_level, section_name`)
    .or(`section_name.ilike.${searchPattern},grade_level.ilike.${searchPattern}`)
    .limit(5);

  if (classes) {
    classes.forEach((c: any) => {
      results.push({
        id: c.id,
        type: "CLASS",
        title: `${c.grade_level?.replace("_", " ")} - ${c.section_name}`,
        subtitle: `Class Section`,
        url: `/admin/classes`,
      });
    });
  }

  // 4. Search Subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select(`id, code, name`)
    .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`)
    .limit(5);

  if (subjects) {
    subjects.forEach((sub: any) => {
      results.push({
        id: sub.id,
        type: "SUBJECT",
        title: `${sub.code} - ${sub.name}`,
        subtitle: `Academic Subject`,
        url: `/admin/subjects`,
      });
    });
  }

  return results;
}
