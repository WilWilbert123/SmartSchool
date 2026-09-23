"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { studentSchema, type StudentFormInput } from "./student.schema";

export async function getStudents() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      person:people(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching students:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getStudentById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      person:people(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: "Student not found" };
  }

  return { data, error: null };
}

export async function createStudent(data: StudentFormInput) {
  const result = studentSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid student data provided." };
  }

  const supabase = await createClient();
  
  // Need the active user's school ID to associate
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

  // 1. Create person record
  const { data: person, error: personError } = await supabase
    .from('people')
    .insert({
      first_name: data.first_name,
      middle_name: data.middle_name || null,
      last_name: data.last_name,
      suffix: data.suffix || null,
      birth_date: data.birth_date || null,
      gender: data.gender ? data.gender.toUpperCase() : null,
      contact_number: data.contact_number || null,
      address: data.address || null,
    })
    .select('id')
    .single();

  if (personError || !person) {
    console.error("Error creating person:", personError);
    return { error: personError ? `Failed to create person profile: ${personError.message}` : "Failed to create person profile." };
  }

  // 2. Create student record
  const { error: studentError } = await supabase
    .from('students')
    .insert({
      person_id: person.id,
      school_id: schoolId,
      student_number: data.student_number,
      admission_date: data.admission_date,
      current_status: data.current_status,
      guardian_name: data.guardian_name || null,
      guardian_contact: data.guardian_contact || null,
    });

  if (studentError) {
    console.error("Error creating student:", studentError);
    return { error: `Failed to create student record: ${studentError.message}` };
  }

  revalidatePath("/admin/students");
  return { success: true };
}
