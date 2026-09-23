"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { studentImportRowSchema, type StudentImportRow } from "./import.schema";
import type { Gender } from "@/features/students/student.types";

export async function processStudentBulkImport(rows: unknown[]) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: userProfile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .maybeSingle();

  let schoolId = userProfile?.school_id;

  if (!schoolId) {
    const { data: school } = await supabase.from('schools').select('id').limit(1).maybeSingle();
    schoolId = school?.id;
  }

  if (!schoolId) {
    const { data: newSchool } = await supabase
      .from('schools')
      .insert([{ name: 'SmartSchool International Academy' }])
      .select('id')
      .single();
    schoolId = newSchool?.id || '00000000-0000-0000-0000-000000000001';
  }

  const successRows: StudentImportRow[] = [];
  const errors: { row: number; error: string }[] = [];

  // Validate all rows first
  rows.forEach((row, index) => {
    const result = studentImportRowSchema.safeParse(row);
    if (result.success) {
      successRows.push(result.data);
    } else {
      errors.push({
        row: index + 2, // Excel rows usually start at 2 (1 is header)
        error: result.error.errors.map(e => e.message).join(", ")
      });
    }
  });

  if (successRows.length === 0) {
    return { error: "No valid rows found to import.", details: errors };
  }

  // To prevent partial failure in a real app, you would use a Postgres function (RPC)
  // that takes an array of JSON objects, parses them, and inserts them inside a transaction.
  // For this scaffold, we will simulate the bulk insert via RPC or loop.
  // Since we don't have the RPC written yet in the migrations, we'll loop safely on the server.
  
  let successfulInserts = 0;

  for (const row of successRows) {
    const { data: person, error: personError } = await supabase
      .from('people')
      .insert({
        first_name: row.first_name,
        last_name: row.last_name,
        middle_name: row.middle_name,
        gender: row.gender as Gender,
      })
      .select('id')
      .single();

    if (personError || !person) {
      continue; // Skip this one on error
    }

    const { error: studentError } = await supabase
      .from('students')
      .insert({
        person_id: person.id,
        school_id: schoolId,
        student_number: row.student_number,
        admission_date: row.admission_date,
      });

    if (!studentError) {
      successfulInserts++;
    }
  }

  revalidatePath("/admin/students");

  return {
    success: true,
    message: `Successfully imported ${successfulInserts} out of ${rows.length} students.`,
    errors: errors
  };
}
