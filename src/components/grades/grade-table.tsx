"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { saveGrades } from "@/features/grades/grade.actions";
import type { GradeEntryInput } from "@/features/grades/grade.schema";

interface GradeTableProps {
  classSubjectId: string;
  data: any[]; // Merged enrollments with grades
}

export function GradeTable({ classSubjectId, data }: GradeTableProps) {
  const [grades, setGrades] = useState<Record<string, Partial<GradeEntryInput>>>(() => {
    const initial: Record<string, Partial<GradeEntryInput>> = {};
    data.forEach(item => {
      if (item.grades) {
        initial[item.enrollment_id] = item.grades;
      }
    });
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGradeChange = (enrollmentId: string, field: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    
    setGrades(prev => {
      const current = prev[enrollmentId] || {};
      const updated = { ...current, [field]: numValue };
      
      // Auto-calculate final grade if all 4 quarters are present
      if (updated.quarter_1 && updated.quarter_2 && updated.quarter_3 && updated.quarter_4) {
        updated.final_grade = Number(((updated.quarter_1 + updated.quarter_2 + updated.quarter_3 + updated.quarter_4) / 4).toFixed(2));
      }

      return { ...prev, [enrollmentId]: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const entries: GradeEntryInput[] = Object.entries(grades).map(([enrollmentId, gradeData]) => ({
      enrollment_id: enrollmentId,
      class_subject_id: classSubjectId,
      ...gradeData
    }));

    const response = await saveGrades(classSubjectId, entries);
    
    setIsSaving(false);
    if (response.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert(response.error);
    }
  };

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b flex items-center justify-between bg-muted/20">
        <h3 className="font-semibold">Student Grades</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (saveSuccess ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />)}
          {saveSuccess ? "Saved!" : "Save Grades"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/40 uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Student Name</th>
              <th className="px-4 py-4 font-medium text-center">Q1</th>
              <th className="px-4 py-4 font-medium text-center">Q2</th>
              <th className="px-4 py-4 font-medium text-center">Q3</th>
              <th className="px-4 py-4 font-medium text-center">Q4</th>
              <th className="px-4 py-4 font-medium text-center">Final</th>
              <th className="px-6 py-4 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No students enrolled in this class.
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const person = item.student?.person;
                const name = `${person?.last_name}, ${person?.first_name}`;
                const grade = grades[item.enrollment_id] || {};

                return (
                  <tr key={item.enrollment_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium">
                      {name}
                      <div className="text-xs text-muted-foreground font-normal">{item.student?.student_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0" max="100"
                        value={grade.quarter_1 || ""}
                        onChange={(e) => handleGradeChange(item.enrollment_id, 'quarter_1', e.target.value)}
                        className="w-16 h-8 text-center rounded border bg-background focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0" max="100"
                        value={grade.quarter_2 || ""}
                        onChange={(e) => handleGradeChange(item.enrollment_id, 'quarter_2', e.target.value)}
                        className="w-16 h-8 text-center rounded border bg-background focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0" max="100"
                        value={grade.quarter_3 || ""}
                        onChange={(e) => handleGradeChange(item.enrollment_id, 'quarter_3', e.target.value)}
                        className="w-16 h-8 text-center rounded border bg-background focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0" max="100"
                        value={grade.quarter_4 || ""}
                        onChange={(e) => handleGradeChange(item.enrollment_id, 'quarter_4', e.target.value)}
                        className="w-16 h-8 text-center rounded border bg-background focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0" max="100"
                        value={grade.final_grade || ""}
                        readOnly
                        className="w-16 h-8 text-center rounded border-transparent bg-muted font-bold focus:outline-none"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={grade.remarks || ""}
                        onChange={(e) => handleGradeChange(item.enrollment_id, 'remarks', e.target.value)}
                        placeholder="Optional remarks"
                        className="w-full h-8 px-2 rounded border bg-background focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      />
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
}
