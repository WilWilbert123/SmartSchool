import { createClient } from "@/lib/supabase/server";
import { GradeTable } from "@/components/grades/grade-table";
import { getClassGrades } from "@/features/grades/grade.actions";
import { BookOpen, Users, AlertCircle } from "lucide-react";

export default async function AdminGradesPage({
  searchParams,
}: {
  searchParams: { classId?: string; subjectId?: string };
}) {
  const supabase = await createClient();

  // Fetch all classes for the selector
  const { data: classes } = await supabase
    .from("classes")
    .select("id, grade_level, section_name, academic_years(name)");

  // Fetch subjects for the selected class
  let classSubjects: any[] = [];
  if (searchParams.classId) {
    const { data: cSubjects } = await supabase
      .from("class_subjects")
      .select("id, subject_id, subjects(name, code)")
      .eq("class_id", searchParams.classId);
    classSubjects = cSubjects || [];
  }

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
        <h1 className="text-2xl font-bold tracking-tight">Grades Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage student grades across all classes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center mb-4">
              <Users className="mr-2 h-4 w-4" /> Select Class
            </h3>
            
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Class / Section</label>
                <select 
                  name="classId" 
                  defaultValue={classId || ""}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>Select a class...</option>
                  {classes?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.grade_level.replace('_', ' ')} - {c.section_name} ({c.academic_years?.name || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {classId && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Subject</label>
                  <select 
                    name="subjectId" 
                    defaultValue={subjectId || ""}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="" disabled>Select a subject...</option>
                    {classSubjects.map((cs: any) => (
                      <option key={cs.subject_id} value={cs.subject_id}>
                        {cs.subjects?.name} ({cs.subjects?.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
                disabled={!classId}
              >
                Load Grades
              </button>
            </form>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          {!classId || !subjectId ? (
            <div className="h-[400px] bg-muted/20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No Class Selected</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Please select a class and subject from the sidebar to view and manage student grades.
              </p>
            </div>
          ) : gradeError ? (
            <div className="p-4 rounded-xl border bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">{gradeError}</p>
            </div>
          ) : (
            <GradeTable classSubjectId={currentClassSubjectId!} data={gradeData} />
          )}
        </div>
      </div>
    </div>
  );
}
