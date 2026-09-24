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
      profile_photo_url: data.profile_photo_url || null,
      student_signature_url: data.student_signature_url || null,
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
      lrn: data.lrn || null,
      grade_level: data.grade_level || null,
      section_name: data.section_name || null,
      school_year: data.school_year || "2025-2026",
      admission_date: data.admission_date,
      current_status: data.current_status,
      guardian_name: data.guardian_name || null,
      guardian_relationship: data.guardian_relationship || null,
      guardian_contact: data.guardian_contact || null,
      blood_type: data.blood_type || null,
    });

  if (studentError) {
    console.error("Error creating student:", studentError);
    return { error: `Failed to create student record: ${studentError.message}` };
  }

  revalidatePath("/admin/students");
  return { success: true };
}

export async function updateStudent(id: string, data: Partial<StudentFormInput>) {
  const supabase = await createClient();

  const { data: student, error: fetchErr } = await supabase
    .from("students")
    .select("person_id")
    .eq("id", id)
    .single();

  if (fetchErr || !student) {
    return { success: false, error: "Student not found." };
  }

  // Update person if name/contact changed
  if (data.first_name || data.last_name || data.contact_number || data.gender) {
    const personUpdate: any = {};
    if (data.first_name) personUpdate.first_name = data.first_name;
    if (data.last_name) personUpdate.last_name = data.last_name;
    if (data.middle_name !== undefined) personUpdate.middle_name = data.middle_name || null;
    if (data.contact_number !== undefined) personUpdate.contact_number = data.contact_number || null;
    if (data.gender) personUpdate.gender = data.gender.toUpperCase();

    const { error: pErr } = await supabase
      .from("people")
      .update(personUpdate)
      .eq("id", student.person_id);

    if (pErr) {
      return { success: false, error: pErr.message };
    }
  }

  // Update student table
  const studentUpdate: any = {};
  if (data.student_number) studentUpdate.student_number = data.student_number;
  if (data.current_status) studentUpdate.current_status = data.current_status;
  if (data.admission_date) studentUpdate.admission_date = data.admission_date;

  if (Object.keys(studentUpdate).length > 0) {
    const { error: sErr } = await supabase
      .from("students")
      .update(studentUpdate)
      .eq("id", id);

    if (sErr) {
      return { success: false, error: sErr.message };
    }
  }

  revalidatePath("/admin/students");
  return { success: true };
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/students");
  return { success: true };
}

