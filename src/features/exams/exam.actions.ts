"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CreateExamInput, Exam } from "./exam.types";

export async function getExams(): Promise<Exam[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .select(`
      *,
      subjects (
        code,
        name
      ),
      classes (
        grade_level,
        section_name
      )
    `)
    .order("exam_date", { ascending: true });

  if (error) {
    console.error("Error fetching exams:", error);
    return [];
  }

  return data as Exam[];
}

export async function createExam(input: CreateExamInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exams")
    .insert([
      {
        title: input.title,
        subject_id: input.subject_id || null,
        class_id: input.class_id || null,
        exam_date: input.exam_date,
        start_time: input.start_time || null,
        end_time: input.end_time || null,
        total_marks: input.total_marks || 100,
        passing_marks: input.passing_marks || 50,
        status: input.status || "SCHEDULED",
        room_number: input.room_number || null,
      },
    ]);

  if (error) {
    console.error("Error creating exam:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/exams");
  return { success: true };
}

export async function updateExamStatus(id: string, status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exams")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating exam status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/exams");
  return { success: true };
}

export async function deleteExam(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("exams").delete().eq("id", id);

  if (error) {
    console.error("Error deleting exam:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/exams");
  return { success: true };
}
