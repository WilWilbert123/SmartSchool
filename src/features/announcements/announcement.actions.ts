"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Announcement, CreateAnnouncementInput } from "./announcement.types";

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  return data as Announcement[];
}

export async function createAnnouncement(input: CreateAnnouncementInput) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("announcements")
    .insert([
      {
        title: input.title,
        content: input.content,
        audience: input.audience || "ALL",
        priority: input.priority || "NORMAL",
        status: input.status || "PUBLISHED",
        author_id: userData?.user?.id || null,
      },
    ]);

  if (error) {
    console.error("Error creating announcement:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function updateAnnouncementStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating announcement status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/announcements");
  return { success: true };
}
