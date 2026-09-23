"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClasses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select(`
      id,
      grade_level,
      section_name,
      room_number,
      created_at,
      academic_years (
        id,
        name,
        status
      ),
      adviser:employees(
        id,
        people(
          first_name,
          last_name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }

  return data;
}

export async function getAcademicYears() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("academic_years")
    .select("id, name, status")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching academic years:", error);
    return [];
  }

  return data;
}

export async function createClass(data: {
  grade_level: string;
  section_name: string;
  academic_year_id?: string;
  adviser_id?: string;
  room_number?: string;
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

  // Ensure an Academic Year exists
  let ayId = data.academic_year_id;

  if (!ayId) {
    const { data: activeAy } = await supabase
      .from("academic_years")
      .select("id")
      .eq("status", "ACTIVE")
      .limit(1)
      .maybeSingle();

    ayId = activeAy?.id;
  }

  if (!ayId) {
    const { data: firstAy } = await supabase
      .from("academic_years")
      .select("id")
      .limit(1)
      .maybeSingle();

    ayId = firstAy?.id;
  }

  if (!ayId) {
    const { data: newAy, error: ayError } = await supabase
      .from("academic_years")
      .insert([
        {
          school_id: schoolId,
          name: "2025-2026",
          status: "ACTIVE",
          start_date: "2025-06-01",
          end_date: "2026-03-31",
        },
      ])
      .select("id")
      .single();

    if (ayError) {
      console.error("Error creating academic year:", ayError);
      return { success: false, error: `Academic Year creation failed: ${ayError.message}` };
    }

    ayId = newAy?.id;
  }

  if (!ayId) {
    return { success: false, error: "Could not provision an Academic Year." };
  }

  const { error } = await supabase.from("classes").insert([
    {
      school_id: schoolId,
      academic_year_id: ayId,
      grade_level: data.grade_level,
      section_name: data.section_name,
      adviser_id: data.adviser_id || null,
      room_number: data.room_number || null,
    },
  ]);

  if (error) {
    console.error("Error creating class:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/classes");
  return { success: true };
}

export async function deleteClass(classId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("classes").delete().eq("id", classId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/classes");
  return { success: true };
}
