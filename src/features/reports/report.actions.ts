"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEnrollmentReportData() {
  const supabase = await createClient();

  // Fetch all students with their people and enrollment info
  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      student_number,
      current_status,
      created_at,
      people (
        first_name,
        last_name,
        gender
      ),
      class_enrollments (
        classes (
          grade_level,
          section_name
        )
      )
    `);

  if (error) {
    console.error("Error fetching enrollment report:", error);
    return [];
  }

  return data.map((student: any) => {
    const person = student.people || {};
    const enrollment = student.class_enrollments?.[0]?.classes || {};

    return {
      studentNumber: student.student_number || "N/A",
      fullName: `${person.first_name || ""} ${person.last_name || ""}`.trim() || "N/A",
      gender: person.gender || "Unspecified",
      status: student.current_status || "ENROLLED",
      gradeLevel: enrollment.grade_level ? enrollment.grade_level.replace("_", " ") : "Unassigned",
      section: enrollment.section_name || "Unassigned",
      createdDate: new Date(student.created_at).toLocaleDateString(),
    };
  });
}

export async function getAcademicPerformanceReportData() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grades")
    .select(`
      id,
      quarter_1,
      quarter_2,
      quarter_3,
      quarter_4,
      final_grade,
      class_subjects (
        subjects (
          code,
          name
        ),
        classes (
          grade_level,
          section_name
        )
      )
    `);

  if (error) {
    console.error("Error fetching academic report:", error);
    return [];
  }

  return data.map((grade: any) => {
    const classSubject = grade.class_subjects || {};
    const subject = classSubject.subjects || {};
    const cls = classSubject.classes || {};

    return {
      subjectCode: subject.code || "N/A",
      subjectName: subject.name || "N/A",
      classSection: cls.grade_level ? `${cls.grade_level.replace("_", " ")} - ${cls.section_name}` : "Unassigned",
      q1: grade.quarter_1 ?? "-",
      q2: grade.quarter_2 ?? "-",
      q3: grade.quarter_3 ?? "-",
      q4: grade.quarter_4 ?? "-",
      finalGrade: grade.final_grade ?? "-",
    };
  });
}

export async function getIdIssuanceReportData() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      student_number,
      current_status,
      created_at,
      people (
        first_name,
        last_name,
        gender
      )
    `);

  if (error) {
    console.error("Error fetching ID issuance report:", error);
    return [];
  }

  return data.map((student: any) => {
    const person = student.people || {};
    return {
      studentNumber: student.student_number || "N/A",
      fullName: `${person.first_name || ""} ${person.last_name || ""}`.trim() || "N/A",
      lrnNumber: "N/A",
      idStatus: student.current_status === "ENROLLED" ? "ACTIVE" : student.current_status || "PENDING",
      issuedAt: new Date(student.created_at).toLocaleDateString(),
    };
  });
}

