"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTeachers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .select(`
      id,
      specialization,
      created_at,
      updated_at,
      employee_id,
      employees (
        employee_number,
        employment_type,
        status,
        people (
          first_name,
          last_name,
          contact_number,
          gender
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }

  return data;
}

export async function createTeacher(data: {
  first_name: string;
  last_name: string;
  employee_number: string;
  specialization?: string;
  employment_type?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "SUBSTITUTE";
  gender?: string;
  contact_number?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: userProfile } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", user.id)
    .maybeSingle();

  let schoolId = userProfile?.school_id;

  if (!schoolId) {
    const { data: school } = await supabase.from("schools").select("id").limit(1).maybeSingle();
    schoolId = school?.id;
  }

  if (!schoolId) {
    const { data: newSchool } = await supabase
      .from("schools")
      .insert([{ name: "SmartSchool International Academy" }])
      .select("id")
      .single();
    schoolId = newSchool?.id || "00000000-0000-0000-0000-000000000001";
  }

  // 1. Insert person
  const { data: person, error: personError } = await supabase
    .from("people")
    .insert({
      first_name: data.first_name,
      last_name: data.last_name,
      gender: data.gender ? data.gender.toUpperCase() : null,
      contact_number: data.contact_number || null,
    })
    .select("id")
    .single();

  if (personError || !person) {
    console.error("Error creating person for teacher:", personError);
    return { success: false, error: personError?.message || "Failed to create person record." };
  }

  // 2. Insert employee
  const { data: employee, error: empError } = await supabase
    .from("employees")
    .insert({
      person_id: person.id,
      school_id: schoolId,
      employee_number: data.employee_number,
      employment_type: data.employment_type || "FULL_TIME",
      status: "ACTIVE",
    })
    .select("id")
    .single();

  if (empError || !employee) {
    console.error("Error creating employee for teacher:", empError);
    return { success: false, error: empError?.message || "Failed to create employee record." };
  }

  // 3. Insert teacher
  const { error: teacherError } = await supabase.from("teachers").insert({
    employee_id: employee.id,
    specialization: data.specialization || null,
  });

  if (teacherError) {
    console.error("Error creating teacher:", teacherError);
    return { success: false, error: teacherError.message };
  }

  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function deleteTeacher(teacherId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("teachers")
    .delete()
    .eq("id", teacherId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function updateTeacher(
  teacherId: string,
  data: {
    first_name?: string;
    last_name?: string;
    employee_number?: string;
    specialization?: string;
    employment_type?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "SUBSTITUTE";
    gender?: string;
    contact_number?: string;
    status?: string;
  }
) {
  const supabase = await createClient();

  const { data: teacher, error: fetchErr } = await supabase
    .from("teachers")
    .select(`
      id,
      employee_id,
      employees (
        id,
        person_id
      )
    `)
    .eq("id", teacherId)
    .single();

  if (fetchErr || !teacher || !teacher.employees) {
    return { success: false, error: "Teacher record not found." };
  }

  const employeeId = teacher.employee_id;
  const personId = (teacher.employees as any).person_id;

  // 1. Update person
  if (data.first_name || data.last_name || data.contact_number || data.gender) {
    const personUpdate: any = {};
    if (data.first_name) personUpdate.first_name = data.first_name;
    if (data.last_name) personUpdate.last_name = data.last_name;
    if (data.contact_number !== undefined) personUpdate.contact_number = data.contact_number || null;
    if (data.gender) personUpdate.gender = data.gender.toUpperCase();

    const { error: pErr } = await supabase.from("people").update(personUpdate).eq("id", personId);
    if (pErr) return { success: false, error: pErr.message };
  }

  // 2. Update employee
  if (data.employee_number || data.employment_type || data.status) {
    const empUpdate: any = {};
    if (data.employee_number) empUpdate.employee_number = data.employee_number;
    if (data.employment_type) empUpdate.employment_type = data.employment_type;
    if (data.status) empUpdate.status = data.status;

    const { error: eErr } = await supabase.from("employees").update(empUpdate).eq("id", employeeId);
    if (eErr) return { success: false, error: eErr.message };
  }

  // 3. Update teacher specialization
  if (data.specialization !== undefined) {
    const { error: tErr } = await supabase
      .from("teachers")
      .update({ specialization: data.specialization || null })
      .eq("id", teacherId);
    if (tErr) return { success: false, error: tErr.message };
  }

  revalidatePath("/admin/teachers");
  return { success: true };
}

