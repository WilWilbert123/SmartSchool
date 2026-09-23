"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { gradeEntrySchema, type GradeEntryInput } from "./grade.schema";

export async function getClassGrades(classId: string, subjectId: string) {
  const supabase = await createClient();

  // First, get the class_subject_id
  const { data: classSubject } = await supabase
    .from('class_subjects')
    .select('id')
    .eq('class_id', classId)
    .eq('subject_id', subjectId)
    .single();

  if (!classSubject) return { data: null, error: "Class subject mapping not found" };

  // Then get all enrollments for this class
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      id,
      student:students(
        id,
        student_number,
        person:people(first_name, last_name, middle_name)
      )
    `)
    .eq('class_id', classId);

  if (!enrollments) return { data: [], error: null };

  // Get existing grades
  const { data: grades } = await supabase
    .from('grades')
    .select('*')
    .eq('class_subject_id', classSubject.id);

  const gradeMap = new Map(grades?.map(g => [g.enrollment_id, g]) || []);

  const mergedData = enrollments.map(enrollment => ({
    enrollment_id: enrollment.id,
    student: enrollment.student,
    grades: gradeMap.get(enrollment.id) || null
  }));

  return { data: mergedData, error: null, classSubjectId: classSubject.id };
}

export async function saveGrades(classSubjectId: string, entries: GradeEntryInput[]) {
  const supabase = await createClient();

  const validEntries = [];
  for (const entry of entries) {
    const result = gradeEntrySchema.safeParse(entry);
    if (result.success) {
      validEntries.push({
        ...result.data,
        class_subject_id: classSubjectId,
        updated_at: new Date().toISOString()
      });
    }
  }

  if (validEntries.length === 0) return { error: "No valid grade entries" };

  const { error } = await supabase
    .from('grades')
    .upsert(validEntries, { onConflict: 'enrollment_id,class_subject_id' });

  if (error) {
    console.error("Error saving grades:", error);
    return { error: "Failed to save grades" };
  }

  revalidatePath("/admin/grades");
  revalidatePath("/teacher/grades");
  
  return { success: true };
}
