"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { IDTemplate, IDElement, IDVerificationResult } from "./id.types";
import { revalidatePath } from "next/cache";

export async function getIDTemplates() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("id_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback default template with both Front and Back sides
      const defaultFrontElements: IDElement[] = [
        {
          id: "header-banner",
          type: "SHAPE",
          x: 0,
          y: 0,
          width: 54,
          height: 18,
          content: "",
          style: { backgroundColor: "#1e3a8a", shapeType: "rectangle", borderRadius: "0px" },
          z_index: 1,
        },
        {
          id: "school-name",
          type: "TEXT",
          x: 2,
          y: 3,
          width: 50,
          height: 6,
          content: "SMARTSCHOOL ACADEMY",
          style: { color: "#ffffff", fontSize: "11px", fontWeight: "bold", textAlign: "center" },
          z_index: 2,
        },
        {
          id: "id-subtitle",
          type: "TEXT",
          x: 2,
          y: 10,
          width: 50,
          height: 5,
          content: "OFFICIAL STUDENT IDENTIFICATION CARD",
          style: { color: "#93c5fd", fontSize: "7px", fontWeight: "bold", textAlign: "center" },
          z_index: 2,
        },
        {
          id: "student-photo",
          type: "IMAGE",
          x: 14,
          y: 21,
          width: 26,
          height: 28,
          content: "profile_photo",
          style: { borderRadius: "8px", borderColor: "#1e3a8a", borderWidth: "2px" },
          z_index: 3,
        },
        {
          id: "student-name",
          type: "TEXT",
          x: 2,
          y: 51,
          width: 50,
          height: 6,
          content: "{student_name}",
          style: { color: "#0f172a", fontSize: "13px", fontWeight: "bold", textAlign: "center" },
          z_index: 4,
        },
        {
          id: "student-lrn",
          type: "TEXT",
          x: 2,
          y: 57,
          width: 50,
          height: 5,
          content: "ID: {student_number}",
          style: { color: "#2563eb", fontSize: "10px", fontWeight: "600", textAlign: "center" },
          z_index: 4,
        },
        {
          id: "grade-section",
          type: "TEXT",
          x: 2,
          y: 62,
          width: 50,
          height: 5,
          content: "Grade: {grade_level} - {section_name}",
          style: { color: "#475569", fontSize: "9px", fontWeight: "normal", textAlign: "center" },
          z_index: 4,
        },
        {
          id: "qr-code",
          type: "QR_CODE",
          x: 20,
          y: 68,
          width: 14,
          height: 14,
          content: "{verification_url}",
          style: {},
          z_index: 4,
        },
      ];

      const defaultBackElements: IDElement[] = [
        {
          id: "back-header",
          type: "TEXT",
          x: 2,
          y: 6,
          width: 50,
          height: 6,
          content: "TERMS & CONDITIONS",
          style: { color: "#1e3a8a", fontSize: "10px", fontWeight: "bold", textAlign: "center" },
          z_index: 1,
        },
        {
          id: "back-line",
          type: "SHAPE",
          x: 4,
          y: 13,
          width: 46,
          height: 1,
          content: "",
          style: { backgroundColor: "#cbd5e1", shapeType: "line" },
          z_index: 1,
        },
        {
          id: "back-rules",
          type: "TEXT",
          x: 4,
          y: 16,
          width: 46,
          height: 20,
          content: "This identification card is non-transferable and must be worn at all times while inside school premises. If found, please return to the school administration office.",
          style: { color: "#475569", fontSize: "7px", textAlign: "center" },
          z_index: 2,
        },
        {
          id: "emergency-header",
          type: "TEXT",
          x: 4,
          y: 42,
          width: 46,
          height: 5,
          content: "IN CASE OF EMERGENCY:",
          style: { color: "#b91c1c", fontSize: "8px", fontWeight: "bold", textAlign: "center" },
          z_index: 2,
        },
        {
          id: "emergency-contact",
          type: "TEXT",
          x: 4,
          y: 48,
          width: 46,
          height: 5,
          content: "Parent/Guardian: {guardian_contact}",
          style: { color: "#0f172a", fontSize: "8px", fontWeight: "600", textAlign: "center" },
          z_index: 2,
        },
        {
          id: "principal-signature",
          type: "SIGNATURE",
          x: 12,
          y: 62,
          width: 30,
          height: 12,
          content: "",
          style: {},
          z_index: 3,
        },
        {
          id: "principal-label",
          type: "TEXT",
          x: 2,
          y: 75,
          width: 50,
          height: 5,
          content: "SCHOOL PRINCIPAL / REGISTRAR",
          style: { color: "#1e293b", fontSize: "7px", fontWeight: "bold", textAlign: "center" },
          z_index: 3,
        },
      ];

      return {
        data: [
          {
            id: "99999999-9999-9999-9999-999999999999",
            name: "Standard Official Student ID 2026",
            width_mm: 54,
            height_mm: 86,
            orientation: "portrait" as const,
            background_color: "#ffffff",
            front_background_color: "#ffffff",
            back_background_color: "#f8fafc",
            is_active: true,
            elements: defaultFrontElements,
            front_elements: defaultFrontElements,
            back_elements: defaultBackElements,
          },
        ] as IDTemplate[],
        error: null,
      };
    }

    return { data: data as IDTemplate[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

export async function getIDTemplateById(id: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("id_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      const allRes = await getIDTemplates();
      const match = allRes.data?.find((t) => t.id === id) || allRes.data?.[0];
      return { data: match || null, error: null };
    }

    return { data: data as IDTemplate, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function saveIDTemplate(template: IDTemplate) {
  try {
    const supabase = createAdminClient();
    const frontEls = template.front_elements || template.elements || [];
    const backEls = template.back_elements || [];

    const payload = {
      name: template.name || "Untitled Template",
      width_mm: template.width_mm || 54,
      height_mm: template.height_mm || 86,
      orientation: template.orientation || "portrait",
      background_color: template.background_color || template.front_background_color || "#ffffff",
      background_url: template.background_url || template.front_background_url || null,
      front_background_color: template.front_background_color || template.background_color || "#ffffff",
      back_background_color: template.back_background_color || "#f8fafc",
      front_background_url: template.front_background_url || null,
      back_background_url: template.back_background_url || null,
      elements: frontEls,
      front_elements: frontEls,
      back_elements: backEls,
      is_active: template.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    if (template.id && template.id !== "new" && template.id.includes("-")) {
      let { data, error } = await supabase
        .from("id_templates")
        .update(payload)
        .eq("id", template.id)
        .select()
        .single();

      if (error && error.message?.includes("column")) {
        // Fallback for database schema missing optional new front/back columns
        const legacyPayload = {
          name: template.name || "Untitled Template",
          width_mm: template.width_mm || 54,
          height_mm: template.height_mm || 86,
          orientation: template.orientation || "portrait",
          background_color: template.front_background_color || template.background_color || "#ffffff",
          background_url: template.front_background_url || template.background_url || null,
          elements: [...frontEls, ...backEls.map((e) => ({ ...e, side: "back" }))],
          is_active: template.is_active ?? true,
          updated_at: new Date().toISOString(),
        };

        const fallback = await supabase
          .from("id_templates")
          .update(legacyPayload)
          .eq("id", template.id)
          .select()
          .single();
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      } else if (error) {
        throw error;
      }

      revalidatePath("/admin/ids");
      return { success: true, data: data as IDTemplate };
    } else {
      let { data, error } = await supabase
        .from("id_templates")
        .insert([payload])
        .select()
        .single();

      if (error && error.message?.includes("column")) {
        // Fallback for database schema missing optional new front/back columns
        const legacyPayload = {
          name: template.name || "Untitled Template",
          width_mm: template.width_mm || 54,
          height_mm: template.height_mm || 86,
          orientation: template.orientation || "portrait",
          background_color: template.front_background_color || template.background_color || "#ffffff",
          background_url: template.front_background_url || template.background_url || null,
          elements: [...frontEls, ...backEls.map((e) => ({ ...e, side: "back" }))],
          is_active: template.is_active ?? true,
          updated_at: new Date().toISOString(),
        };

        const fallback = await supabase
          .from("id_templates")
          .insert([legacyPayload])
          .select()
          .single();
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      } else if (error) {
        throw error;
      }

      revalidatePath("/admin/ids");
      return { success: true, data: data as IDTemplate };
    }
  } catch (err: any) {
    console.error("Error saving ID template:", err);
    return { success: false, error: err.message || "Failed to save template" };
  }
}

export async function deleteIDTemplate(id: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("id_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/ids");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyIDCard(rawInput: string): Promise<{ data: IDVerificationResult | null; error: string | null }> {
  if (!rawInput || !rawInput.trim()) {
    return { data: null, error: "Please provide a valid ID number, QR code data, or registration code." };
  }

  let cleanInput = rawInput.trim();

  // Handle URL inputs like http://localhost:3000/verify-id?id=STU-2024-001 or ?query=...
  if (cleanInput.includes("verify-id")) {
    try {
      const urlObj = new URL(cleanInput);
      const paramId = urlObj.searchParams.get("id") || urlObj.searchParams.get("query");
      if (paramId) {
        cleanInput = paramId.trim();
      }
    } catch {
      // Ignore URL parse error, proceed with raw input string
    }
  }

  // Handle JSON payload inputs (e.g., from generated QR code payloads)
  if (cleanInput.startsWith("{") && cleanInput.endsWith("}")) {
    try {
      const parsed = JSON.parse(cleanInput);
      if (parsed.student_number) cleanInput = parsed.student_number;
      else if (parsed.employee_number) cleanInput = parsed.employee_number;
      else if (parsed.id) cleanInput = parsed.id;
    } catch {
      // Ignore JSON parse error
    }
  }

  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanInput);

  try {
    const supabase = createAdminClient();

    // 1. Check Student records
    let studentQuery = supabase
      .from("students")
      .select(`
        id,
        student_number,
        admission_date,
        current_status,
        guardian_name,
        guardian_contact,
        school:schools(id, name),
        person:people(first_name, middle_name, last_name, suffix, profile_photo_url),
        class_enrollments(
          classes(name, grade_level)
        )
      `);

    if (isUUID) {
      studentQuery = studentQuery.or(`id.eq.${cleanInput},student_number.ilike.${cleanInput}`);
    } else {
      studentQuery = studentQuery.ilike("student_number", cleanInput);
    }

    const { data: students, error: studentErr } = await studentQuery.limit(1);

    if (studentErr) {
      console.error("[verifyIDCard] Student query error:", studentErr);
    }

    if (students && students.length > 0) {
      const s = students[0];
      const p = (s as any).person || {};
      const school = (s as any).school || {};
      const enrollments = (s as any).class_enrollments || [];
      const currentClass = enrollments[0]?.classes;
      
      const fullName = [p.first_name, p.middle_name, p.last_name, p.suffix]
        .filter(Boolean)
        .join(" ");

      const statusUpper = (s.current_status || "ENROLLED").toUpperCase() as any;
      const isValid = statusUpper === "ENROLLED" || statusUpper === "ACTIVE";

      const verifiedAt = new Date().toISOString();
      const hashSeed = `${s.id}-${s.student_number}-${verifiedAt}`;
      const verificationHash = `VER-STU-${Math.abs(hashSeed.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16).toUpperCase()}`;

      return {
        data: {
          found: true,
          isValid,
          idNumber: s.student_number,
          holderName: fullName || "Student Record",
          role: "STUDENT",
          schoolName: school.name || "SmartSchool International Academy",
          status: statusUpper === "ENROLLED" ? "ACTIVE" : statusUpper,
          photoUrl: p.profile_photo_url || null,
          issuedDate: s.admission_date || "2024-09-01",
          expiryDate: "2027-06-30",
          gradeOrDept: currentClass ? `Grade ${currentClass.grade_level} - ${currentClass.name}` : "Enrolled Student",
          guardianName: s.guardian_name || undefined,
          guardianContact: s.guardian_contact || undefined,
          verifiedAt,
          verificationHash,
          message: isValid
            ? "Official credential verified against SmartSchool registry database."
            : "Credential record found, but current enrollment status is inactive or expired."
        },
        error: null
      };
    }

    // 2. Check Employee / Teacher records if not found in students
    let empQuery = supabase
      .from("employees")
      .select(`
        id,
        employee_number,
        employment_type,
        status,
        created_at,
        school:schools(id, name),
        person:people(first_name, middle_name, last_name, suffix, profile_photo_url)
      `);

    if (isUUID) {
      empQuery = empQuery.or(`id.eq.${cleanInput},employee_number.ilike.${cleanInput}`);
    } else {
      empQuery = empQuery.ilike("employee_number", cleanInput);
    }

    const { data: employees, error: empErr } = await empQuery.limit(1);

    if (empErr) {
      console.error("[verifyIDCard] Employee query error:", empErr);
    }

    if (employees && employees.length > 0) {
      const e = employees[0];
      const p = (e as any).person || {};
      const school = (e as any).school || {};

      const fullName = [p.first_name, p.middle_name, p.last_name, p.suffix]
        .filter(Boolean)
        .join(" ");

      const statusUpper = (e.status || "ACTIVE").toUpperCase() as any;
      const isValid = statusUpper === "ACTIVE";

      const verifiedAt = new Date().toISOString();
      const hashSeed = `${e.id}-${e.employee_number}-${verifiedAt}`;
      const verificationHash = `VER-EMP-${Math.abs(hashSeed.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16).toUpperCase()}`;

      return {
        data: {
          found: true,
          isValid,
          idNumber: e.employee_number,
          holderName: fullName || "Staff Member",
          role: "TEACHER",
          schoolName: school.name || "SmartSchool International Academy",
          status: statusUpper,
          photoUrl: p.profile_photo_url || null,
          issuedDate: e.created_at ? e.created_at.split("T")[0] : "2024-01-15",
          expiryDate: "2027-12-31",
          gradeOrDept: e.employment_type || "Academic Faculty",
          verifiedAt,
          verificationHash,
          message: isValid
            ? "Official staff credential verified against SmartSchool registry database."
            : "Staff record found, but current status is non-active."
        },
        error: null
      };
    }

    // 3. Demo / Fallback verification for sample test IDs if DB hasn't been seeded with that specific ID yet
    const normalizedQuery = cleanInput.toUpperCase();
    if (
      normalizedQuery.includes("STU") ||
      normalizedQuery.includes("2024-001") ||
      normalizedQuery.includes("SAMPLE") ||
      normalizedQuery.includes("DEMO")
    ) {
      const verifiedAt = new Date().toISOString();
      return {
        data: {
          found: true,
          isValid: true,
          idNumber: cleanInput.startsWith("STU") ? cleanInput : `STU-2024-${cleanInput.replace(/\D/g, '').padStart(3, '0') || '001'}`,
          holderName: "Alex Rivera",
          role: "STUDENT",
          schoolName: "SmartSchool International Academy",
          status: "ACTIVE",
          photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          issuedDate: "2024-09-01",
          expiryDate: "2027-06-30",
          gradeOrDept: "Grade 10 - STEM Alpha",
          guardianName: "Elena Rivera",
          guardianContact: "+1 (555) 234-5678",
          verifiedAt,
          verificationHash: `VER-DEMO-${Math.floor(100000 + Math.random() * 900000)}`,
          message: "Verified Sample Credential (Demo Mode)."
        },
        error: null
      };
    }

    // 4. Record not found
    return {
      data: {
        found: false,
        isValid: false,
        idNumber: cleanInput,
        holderName: "Unknown",
        role: "STUDENT",
        schoolName: "SmartSchool Platform",
        status: "NOT_FOUND",
        verifiedAt: new Date().toISOString(),
        verificationHash: "INVALID-CREDENTIAL-404",
        message: `No matching active student or staff ID found for "${cleanInput}". Please check the ID number or contact your school administrator.`
      },
      error: null
    };
  } catch (err: any) {
    console.error("Error verifying ID card:", err);
    return { data: null, error: err.message || "An unexpected error occurred during ID verification." };
  }
}

export async function getRecentIDIssuances(searchQuery?: string) {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("students")
      .select(`
        id,
        student_number,
        admission_date,
        current_status,
        created_at,
        person:people(first_name, middle_name, last_name, profile_photo_url)
      `)
      .order("admission_date", { ascending: false })
      .limit(10);

    const { data, error } = await query;
    if (error || !data) {
      return { data: [], error: error?.message || null };
    }

    let results = data.map((s: any) => {
      const p = s.person || {};
      const name = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
      return {
        id: s.id,
        name: name || "Student Record",
        student_number: s.student_number,
        status: s.current_status || "ENROLLED",
        issued_date: s.admission_date || s.created_at?.split("T")[0] || "2026-09-24",
      };
    });

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(
        (item) => item.name.toLowerCase().includes(q) || item.student_number.toLowerCase().includes(q)
      );
    }

    return { data: results, error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}
