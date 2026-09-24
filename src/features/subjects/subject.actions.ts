"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSubjects() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("subjects")
    .select(`
      id,
      code,
      name,
      description,
      credits,
      created_at
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }

  return data;
}

export async function createSubject(data: {
  code: string;
  name: string;
  description?: string;
  credits?: number;
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

  const { data: newSubject, error } = await supabase
    .from("subjects")
    .insert([
      {
        school_id: schoolId,
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || null,
        credits: data.credits ?? 1.0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating subject:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/subjects");
  return { success: true, data: newSubject };
}

export async function deleteSubject(subjectId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId);
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/subjects");
  return { success: true };
}
