import { createClient } from "@/lib/supabase/server";
import StudentGradesClient from "./student-grades-client";

export default async function StudentGradesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let studentName = "Alex Rivera";
  let studentNumber = "STU-2024-001";
  let studentId: string | null = null;

  if (user) {
    const { data: person } = await supabase
      .from("people")
      .select("id, first_name, last_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (person) {
      studentName = `${person.first_name} ${person.last_name}`;
      
      const { data: student } = await supabase
        .from("students")
        .select("id, student_number")
        .eq("person_id", person.id)
        .maybeSingle();

      if (student) {
        studentId = student.id;
        studentNumber = student.student_number;
      }
    }
  }

  let enrollments: any[] = [];
  let allGrades: any[] = [];

  if (studentId) {
    const { data: enr } = await supabase
      .from("class_enrollments")
      .select(`
        id, 
        class_id,
        classes(
          id, 
          grade_level, 
          section_name, 
          academic_years(name)
        )
      `)
      .eq("student_id", studentId);
    
    enrollments = enr || [];

    const enrollmentIds = enrollments.map(e => e.id);
    if (enrollmentIds.length > 0) {
      const { data: gr } = await supabase
        .from("grades")
        .select(`
          *,
          class_subjects(
            id,
            subjects(name, code),
            teacher:employees(
              person:people(first_name, last_name)
            )
          )
        `)
        .in("enrollment_id", enrollmentIds);

      allGrades = gr || [];
    }
  }

  // If no database records found, provide structured sample grade data for instant demonstration
  if (enrollments.length === 0) {
    enrollments = [
      {
        id: "demo-enr-1",
        classes: {
          grade_level: "GRADE_10",
          section_name: "STEM Alpha",
          academic_years: { name: "2024-2025" }
        }
      }
    ];

    allGrades = [
      {
        id: "g-1",
        enrollment_id: "demo-enr-1",
        quarter_1: 92,
        quarter_2: 94,
        quarter_3: 91,
        quarter_4: 95,
        final_grade: 93,
        remarks: "PASSED",
        class_subjects: {
          subjects: { name: "Advanced Mathematics", code: "MATH-10" },
          teacher: { person: { first_name: "Elena", last_name: "Vargas" } }
        }
      },
      {
        id: "g-2",
        enrollment_id: "demo-enr-1",
        quarter_1: 88,
        quarter_2: 90,
        quarter_3: 92,
        quarter_4: 94,
        final_grade: 91,
        remarks: "PASSED",
        class_subjects: {
          subjects: { name: "General Physics", code: "PHYS-10" },
          teacher: { person: { first_name: "Marcus", last_name: "Chen" } }
        }
      },
      {
        id: "g-3",
        enrollment_id: "demo-enr-1",
        quarter_1: 95,
        quarter_2: 96,
        quarter_3: 94,
        quarter_4: 97,
        final_grade: 96,
        remarks: "PASSED",
        class_subjects: {
          subjects: { name: "Computer Science & Robotics", code: "CS-10" },
          teacher: { person: { first_name: "David", last_name: "Kim" } }
        }
      },
      {
        id: "g-4",
        enrollment_id: "demo-enr-1",
        quarter_1: 90,
        quarter_2: 89,
        quarter_3: 92,
        quarter_4: 93,
        final_grade: 91,
        remarks: "PASSED",
        class_subjects: {
          subjects: { name: "English Communications", code: "ENG-10" },
          teacher: { person: { first_name: "Sarah", last_name: "Jenkins" } }
        }
      }
    ];
  }

  return (
    <StudentGradesClient
      studentName={studentName}
      studentNumber={studentNumber}
      enrollments={enrollments}
      allGrades={allGrades}
    />
  );
}
