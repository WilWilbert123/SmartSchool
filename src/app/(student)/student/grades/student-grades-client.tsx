"use client";

import { Printer, Download, BookOpen, Calendar, GraduationCap, Award, FileText, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface StudentGradesClientProps {
  studentName: string;
  studentNumber: string;
  enrollments: any[];
  allGrades: any[];
}

export default function StudentGradesClient({
  studentName,
  studentNumber,
  enrollments,
  allGrades,
}: StudentGradesClientProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in-slow">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            My Official Report Card & Academic Records
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            View your complete quarterly grades, final averages, teacher remarks, and export official PDF transcripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "font-bold flex items-center gap-2 shadow-sm"
            )}
          >
            <Printer className="h-4 w-4" />
            Export / Print PDF Report Card
          </button>
        </div>
      </div>

      {/* Official PDF Document Layout (Printable) */}
      <div className="bg-card border rounded-3xl p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Printable Official School Header */}
        <div className="border-b pb-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground font-bold">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
              SmartSchool International Academy
            </h2>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Office of the Registrar • Official Student Academic Report Card
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            VERIFIED OFFICIAL RECORD
          </div>
        </div>

        {/* Student Metadata Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 border p-4 rounded-2xl text-xs">
          <div>
            <span className="text-muted-foreground uppercase tracking-wider font-semibold block text-[10px]">Student Name</span>
            <span className="font-bold text-sm text-foreground block">{studentName}</span>
          </div>
          <div>
            <span className="text-muted-foreground uppercase tracking-wider font-semibold block text-[10px]">Student Number</span>
            <span className="font-mono font-bold text-sm text-primary block">{studentNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground uppercase tracking-wider font-semibold block text-[10px]">Academic Year</span>
            <span className="font-semibold text-xs text-foreground block">
              {enrollments[0]?.classes?.academic_years?.name || "2024-2025"}
            </span>
          </div>
        </div>

        {/* Grade Tables per Class Enrollment */}
        {enrollments.length === 0 ? (
          <div className="h-[300px] bg-muted/10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8">
            <GraduationCap className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold">No Enrolled Classes Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              You are currently not registered under an active class enrollment for this academic period.
            </p>
          </div>
        ) : (
          enrollments.map((enrollment) => {
            const classGrades = allGrades.filter(g => g.enrollment_id === enrollment.id);
            const className = `${enrollment.classes?.grade_level.replace('_', ' ')} - ${enrollment.classes?.section_name}`;

            // Calculate class average
            const finals = classGrades.map(g => Number(g.final_grade)).filter(n => !isNaN(n) && n > 0);
            const gwa = finals.length > 0 
              ? (finals.reduce((a, b) => a + b, 0) / finals.length).toFixed(2)
              : null;

            return (
              <div key={enrollment.id} className="border rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 bg-muted/40 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{className}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                      <Calendar className="h-3 w-3" /> A.Y. {enrollment.classes?.academic_years?.name || "2024-2025"}
                    </p>
                  </div>
                  {gwa && (
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Class GWA</span>
                      <span className="text-base font-black text-primary font-mono">{gwa}</span>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="text-[11px] text-muted-foreground bg-muted/20 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Subject</th>
                        <th className="px-4 py-3 font-semibold">Instructor</th>
                        <th className="px-3 py-3 font-semibold text-center">Q1</th>
                        <th className="px-3 py-3 font-semibold text-center">Q2</th>
                        <th className="px-3 py-3 font-semibold text-center">Q3</th>
                        <th className="px-3 py-3 font-semibold text-center">Q4</th>
                        <th className="px-3 py-3 font-semibold text-center">Final Grade</th>
                        <th className="px-4 py-3 font-semibold">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {classGrades.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                            No subject grades posted yet for this class period.
                          </td>
                        </tr>
                      ) : (
                        classGrades.map((grade) => {
                          const subject = grade.class_subjects?.subjects;
                          const teacherPerson = grade.class_subjects?.teacher?.person;
                          const teacherName = teacherPerson 
                            ? `${teacherPerson.last_name}, ${teacherPerson.first_name}` 
                            : "TBA";

                          const finalVal = Number(grade.final_grade);
                          const isPassed = !isNaN(finalVal) && finalVal >= 75;

                          return (
                            <tr key={grade.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-bold text-foreground">
                                {subject?.name || "Academic Subject"}
                                <span className="block text-[10px] text-muted-foreground font-mono font-normal">
                                  {subject?.code || "SUBJ-101"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{teacherName}</td>
                              <td className="px-3 py-3 text-center font-mono">{grade.quarter_1 || "-"}</td>
                              <td className="px-3 py-3 text-center font-mono">{grade.quarter_2 || "-"}</td>
                              <td className="px-3 py-3 text-center font-mono">{grade.quarter_3 || "-"}</td>
                              <td className="px-3 py-3 text-center font-mono">{grade.quarter_4 || "-"}</td>
                              <td className="px-3 py-3 text-center font-mono font-bold text-primary text-sm">
                                {grade.final_grade || "-"}
                              </td>
                              <td className="px-4 py-3">
                                {grade.final_grade ? (
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono",
                                    isPassed ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                  )}>
                                    {grade.remarks || (isPassed ? "PASSED" : "NEEDS IMPROVEMENT")}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-[10px] italic">In Progress</span>
                                )}
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
          })
        )}

        {/* Official Grading Legend & Registrar Signature Footer */}
        <div className="pt-8 border-t grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-muted-foreground">
          <div className="space-y-1">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">Grading Legend</span>
            <p className="text-[11px]">90 - 100: Outstanding • 85 - 89: Very Satisfactory • 80 - 84: Satisfactory • 75 - 79: Fairly Satisfactory • Below 75: Did Not Meet Expectations</p>
          </div>

          <div className="text-center sm:text-right space-y-8 pt-4 sm:pt-0">
            <div>
              <div className="border-b border-foreground/40 w-48 ml-auto mb-1"></div>
              <span className="font-bold text-foreground block">School Registrar Signature</span>
              <span className="text-[10px] text-muted-foreground block">SmartSchool Official Seal & Certification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
