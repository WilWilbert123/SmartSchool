"use server";

import { createClient } from "@/lib/supabase/server";

// Mock implementation since we don't have the id_templates tables in our schema yet
export async function getIDTemplates() {
  // In a real app:
  // const supabase = await createClient();
  // return await supabase.from('id_templates').select('*');

  return {
    data: [
      {
        id: "tpl-1",
        school_id: "default",
        name: "Standard Student ID 2024",
        width_mm: 54,
        height_mm: 86,
        is_active: true,
        elements: []
      }
    ],
    error: null
  };
}
