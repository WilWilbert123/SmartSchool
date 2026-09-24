"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SchoolSettings {
  id: string;
  name: string;
  code: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  principal_name: string | null;
  principal_title: string | null;
  principal_signature_url: string | null;
  right_logo_url: string | null;
}

export async function getSchoolSettings(): Promise<SchoolSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("schools")
    .select("id, name, code, email, phone, address, logo_url, right_logo_url, principal_name, principal_title, principal_signature_url")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching school settings:", error);
    return null;
  }

  return data as SchoolSettings;
}

export async function updateSchoolSettings(input: {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  right_logo_url?: string;
  principal_name?: string;
  principal_title?: string;
  principal_signature_url?: string;
}) {
  const supabase = await createClient();

  // Check if a school row exists
  const existing = await getSchoolSettings();

  if (existing) {
    const { error } = await supabase
      .from("schools")
      .update({
        name: input.name,
        code: input.code || null,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
        logo_url: input.logo_url || null,
        right_logo_url: input.right_logo_url || null,
        principal_name: input.principal_name || null,
        principal_title: input.principal_title || null,
        principal_signature_url: input.principal_signature_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating school settings:", error);
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase.from("schools").insert([
      {
        name: input.name,
        code: input.code || null,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
        logo_url: input.logo_url || null,
        right_logo_url: input.right_logo_url || null,
        principal_name: input.principal_name || null,
        principal_title: input.principal_title || null,
        principal_signature_url: input.principal_signature_url || null,
      },
    ]);

    if (error) {
      console.error("Error inserting school settings:", error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/admin/settings");
  return { success: true };
}
