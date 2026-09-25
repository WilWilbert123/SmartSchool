import { createClient } from "@/lib/supabase/server";
import { GradeTable } from "@/components/grades/grade-table";
import { DepEdECRTable } from "@/components/grades/deped-ecr-table";
import { getClassGrades } from "@/features/grades/grade.actions";
import { BookOpen, Users, AlertCircle, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminGradesPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectId?: string; view?: string }>;
}) {
  const params = await searchParams;
  const { classId, subjectId, view } = params;

  const supabase = await createClient();

  // Fetch all classes for the selector
  const { data: classes } = await supabase
    .from("classes")
    .select("id, grade_level, section_name, academic_years(name)");

  // Fetch subjects for the selected class
  let classSubjects: any[] = [];
  if (classId) {
    const { data: cSubjects } = await supabase
      .from("class_subjects")
      .select("id, subject_id, subjects(name, code)")
      .eq("class_id", classId);
    classSubjects = cSubjects || [];
  }
  
  let gradeData: any[] = [];
  let currentClassSubjectId = null;
  let gradeError = null;

  if (classId) {
    const result = await getClassGrades(classId, subjectId);
    if (result.error) {
      gradeError = result.error;
    } else {
      gradeData = result.data || [];
      currentClassSubjectId = result.classSubjectId;
    }
  }

  const isECRView = view === "ecr";

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grades & DepEd E-Class Record</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage student quarterly grades, DepEd E-Class records (Input Data, Term 1-3), and final grade computations.
          </p>
        </div>
      </div>

      {/* Top 1-Line Filter Bar */}
      <div className="bg-card border rounded-2xl p-3.5 sm:p-4 shadow-sm print:hidden">
        <form method="GET" action="/admin/grades" className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3.5">
          <div className="flex items-center gap-2 pr-2 text-sm font-semibold whitespace-nowrap text-foreground lg:border-r border-border/60 pb-1 lg:pb-2.5">
            <Users className="h-4 w-4 text-primary" />
            <span>Select Class & Mode</span>
          </div>

          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Record Sheet View</label>
            <select 
              name="view" 
              defaultValue={view || "ecr"}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="ecr">DepEd E-Class Record (Input Data, Term 1-3, Final)</option>
              <option value="standard">Standard Quarterly Summary (Q1-Q4)</option>
            </select>
          </div>

          <div className="flex-1 min-w-[220px] space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Class / Section</label>
            <select 
              name="classId" 
              defaultValue={classId || (classes && classes[0]?.id) || "55555555-5555-5555-5555-555555555551"}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>Select a class...</option>
              {classes && classes.length > 0 ? (
                classes.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.grade_level?.replace('_', ' ')} - {c.section_name} ({c.academic_years?.name || '2025-2026'})
                  </option>
                ))
              ) : (
                <option value="55555555-5555-5555-5555-555555555551">GRADE 10 - Section A - Emerald (2025-2026)</option>
              )}
            </select>
          </div>

          <div className="flex-1 min-w-[180px] space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Subject (Optional)</label>
            <select 
              name="subjectId" 
              defaultValue={subjectId || ""}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Subjects</option>
              {classSubjects.map((cs: any) => (
                <option key={cs.subject_id} value={cs.subject_id}>
                  {cs.subjects?.name} ({cs.subjects?.code})
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="h-10 px-5 inline-flex items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap self-stretch lg:self-end"
          >
            Load Sheet Data
          </button>
        </form>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="w-full print:w-full">
        {isECRView || !classId ? (
          <DepEdECRTable subjectName={classSubjects.find((cs: any) => cs.subject_id === subjectId)?.subjects?.name} students={gradeData} />
        ) : gradeError ? (
          <div className="p-4 rounded-xl border bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{gradeError}</p>
          </div>
        ) : (
          <GradeTable classSubjectId={currentClassSubjectId || "cs-default"} data={gradeData} />
        )}
      </div>
    </div>
  );
}

