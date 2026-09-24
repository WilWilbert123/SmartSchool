import { createClient } from "@/lib/supabase/server";
import { GradeTable } from "@/components/grades/grade-table";
import { DepEdECRTable } from "@/components/grades/deped-ecr-table";
import { getClassGrades } from "@/features/grades/grade.actions";
import { BookOpen, Users, AlertCircle } from "lucide-react";

export default async function TeacherGradesPage({
  searchParams,
}: {
  searchParams: { classId?: string; subjectId?: string };
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("person_id", (await supabase.from("people").select("id").eq("user_id", user?.id).single()).data?.id)
    .single();

  let assignedClassSubjects: any[] = [];
  if (employee) {
    const { data } = await supabase
      .from("class_subjects")
      .select(`
        id, 
        class_id, 
        subject_id, 
        classes(id, grade_level, section_name, academic_years(name)),
        subjects(name, code)
      `)
      .eq("teacher_id", employee.id);
    assignedClassSubjects = data || [];
  }

  const uniqueClasses = Array.from(new Map(assignedClassSubjects.map(cs => [cs.class_id, cs.classes])).values());
  const classSubjects = assignedClassSubjects.filter(cs => cs.class_id === searchParams.classId);

  const { classId, subjectId } = searchParams;
  
  let gradeData: any[] = [];
  let currentClassSubjectId = null;
  let gradeError = null;

  if (classId && subjectId) {
    const result = await getClassGrades(classId, subjectId);
    if (result.error) {
      gradeError = result.error;
    } else {
      gradeData = result.data || [];
      currentClassSubjectId = result.classSubjectId;
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">DepEd E-Class Record (ECR) & Grades</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automated DepEd grade calculation, transmuted tables, and item analysis.
        </p>
      </div>

      <DepEdECRTable />
    </div>
  );
}
