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
