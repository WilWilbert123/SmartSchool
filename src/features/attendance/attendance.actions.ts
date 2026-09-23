"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAttendanceLogs() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("attendance")
    .select(`
      id,
      date,
      status,
      remarks,
      created_at,
      enrollment:class_enrollments(
        student:students(
          student_number,
          people(
            first_name,
            last_name
          )
        ),
        class:classes(
          grade_level,
          section_name
        )
      )
    `)
    .order("date", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }

  return data;
}
