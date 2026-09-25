"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

function getSupabaseClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

async function uploadBase64ToStorage(base64Data: string | undefined | null, prefix: string): Promise<string | null | undefined> {
  if (!base64Data) return base64Data;
  if (!base64Data.startsWith("data:image/")) return base64Data;

  try {
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }

    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === "svg+xml" ? "svg" : rawExt.includes("png") ? "png" : rawExt.includes("jpeg") || rawExt.includes("jpg") ? "jpg" : rawExt.includes("webp") ? "webp" : "png";
    const buffer = Buffer.from(matches[2], "base64");
    const fileName = `${prefix}-${Date.now()}.${ext}`;
    const supabase = getSupabaseClient();

    if (!supabase) return base64Data;

    try {
      await supabase.storage.createBucket("id-assets", { public: true });
    } catch {}

    const { error: uploadError } = await supabase.storage
      .from("id-assets")
      .upload(fileName, buffer, {
        contentType: `image/${ext === "svg" ? "svg+xml" : ext}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload failed, keeping base64 fallback:", uploadError);
      return base64Data;
    }

    const { data: publicUrlData } = supabase.storage
      .from("id-assets")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl || base64Data;
  } catch (err) {
    console.error("Error in uploadBase64ToStorage:", err);
    return base64Data;
  }
}

export async function uploadAssetFile(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    const prefix = (formData.get("prefix") as string) || "asset";
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${prefix}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: "Storage client unavailable" };
    }

    try {
      await supabase.storage.createBucket("id-assets", { public: true });
    } catch {}

    const { error: uploadError } = await supabase.storage
      .from("id-assets")
      .upload(fileName, buffer, {
        contentType: file.type || "image/png",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("id-assets")
      .getPublicUrl(fileName);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to upload asset" };
  }
}

export async function getSchoolSettings(): Promise<SchoolSettings | null> {
  const adminClient = getSupabaseClient();
  const supabase = adminClient || (await createClient());

  const { data, error } = await supabase
    .from("schools")
    .select("id, name, code, email, phone, address, logo_url, right_logo_url, principal_name, principal_title, principal_signature_url")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

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
  const adminClient = getSupabaseClient();
  const supabase = adminClient || (await createClient());

  // Check if any logo or signature is a base64 data string, and auto-upload to storage
  const [logoUrl, rightLogoUrl, principalSigUrl] = await Promise.all([
    uploadBase64ToStorage(input.logo_url, "school-logo"),
    uploadBase64ToStorage(input.right_logo_url, "right-logo"),
    uploadBase64ToStorage(input.principal_signature_url, "principal-sig"),
  ]);

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
        logo_url: logoUrl || null,
        right_logo_url: rightLogoUrl || null,
        principal_name: input.principal_name || null,
        principal_title: input.principal_title || null,
        principal_signature_url: principalSigUrl || null,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000");

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
        logo_url: logoUrl || null,
        right_logo_url: rightLogoUrl || null,
        principal_name: input.principal_name || null,
        principal_title: input.principal_title || null,
        principal_signature_url: principalSigUrl || null,
      },
    ]);

    if (error) {
      console.error("Error inserting school settings:", error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/id-cards");
  return { success: true, right_logo_url: rightLogoUrl, logo_url: logoUrl };
}
