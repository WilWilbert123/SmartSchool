import { createClient } from "@/lib/supabase/server";
import { BookOpen, GraduationCap, Calendar } from "lucide-react";

export default async function StudentGradesPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the student's ID
  const { data: student } = await supabase
    .from("students")
    .select("id, person_id, people(first_name, last_name)")
    .eq("person_id", (await supabase.from("people").select("id").eq("user_id", user?.id).single()).data?.id)
    .single();

  let enrollments: any[] = [];
  if (student) {
    // Fetch enrollments with class info
    const { data } = await supabase
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
      .eq("student_id", student.id);
    enrollments = data || [];
  }

  // For the demo, we'll fetch grades for all enrollments
  const enrollmentIds = enrollments.map(e => e.id);
  
  let allGrades: any[] = [];
  if (enrollmentIds.length > 0) {
    const { data } = await supabase
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
    allGrades = data || [];
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Report Card</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your academic performance and grades.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="h-[400px] bg-muted/20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Not Enrolled</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            You are not currently enrolled in any classes for this academic year.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {enrollments.map((enrollment) => {
            const classGrades = allGrades.filter(g => g.enrollment_id === enrollment.id);
            const className = `${enrollment.classes?.grade_level.replace('_', ' ')} - ${enrollment.classes?.section_name}`;
            const academicYear = enrollment.classes?.academic_years?.name;

            return (
              <div key={enrollment.id} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b bg-muted/20 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{className}</h3>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar className="mr-1 h-3.5 w-3.5" /> A.Y. {academicYear}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/10 uppercase">
                      <tr>
                        <th className="px-6 py-4 font-medium">Subject</th>
                        <th className="px-6 py-4 font-medium">Teacher</th>
                        <th className="px-4 py-4 font-medium text-center">Q1</th>
                        <th className="px-4 py-4 font-medium text-center">Q2</th>
                        <th className="px-4 py-4 font-medium text-center">Q3</th>
                        <th className="px-4 py-4 font-medium text-center">Q4</th>
                        <th className="px-4 py-4 font-medium text-center">Final</th>
                        <th className="px-6 py-4 font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {classGrades.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                            No grades have been posted for this class yet.
                          </td>
                        </tr>
                      ) : (
                        classGrades.map((grade) => {
                          const subject = grade.class_subjects?.subjects;
                          const teacherPerson = grade.class_subjects?.teacher?.person;
                          const teacherName = teacherPerson 
                            ? `${teacherPerson.last_name}, ${teacherPerson.first_name}` 
                            : 'TBA';

                          return (
                            <tr key={grade.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 font-medium">
                                {subject?.name}
                                <span className="block text-xs text-muted-foreground font-normal">{subject?.code}</span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">{teacherName}</td>
                              <td className="px-4 py-4 text-center">{grade.quarter_1 || '-'}</td>
                              <td className="px-4 py-4 text-center">{grade.quarter_2 || '-'}</td>
                              <td className="px-4 py-4 text-center">{grade.quarter_3 || '-'}</td>
                              <td className="px-4 py-4 text-center">{grade.quarter_4 || '-'}</td>
                              <td className="px-4 py-4 text-center font-bold text-primary">
                                {grade.final_grade || '-'}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground italic text-xs">
                                {grade.remarks || ''}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
