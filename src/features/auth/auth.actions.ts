"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, LoginInput, studentLoginSchema, StudentLoginInput } from "./auth.schema";
import { revalidatePath } from "next/cache";

export async function loginAction(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid login credentials." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function studentLoginAction(data: StudentLoginInput) {
  const result = studentLoginSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid login credentials." };
  }

  const supabase = await createClient();
  
  // Custom flow for student login:
  // Usually student number isn't an email. In a real system, you'd resolve the 
  // student number to their associated email via a secure edge function or RPC,
  // then auth with it. For this implementation, we assume studentNumber@school.edu 
  // is their actual underlying auth email if they don't have a custom one.
  const authEmail = data.studentNumber.includes("@") 
    ? data.studentNumber 
    : `${data.studentNumber}@student.smartschool.local`;

  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: data.password,
  });

  if (error) {
    return { error: "Invalid student number or password." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}
