import { getExams } from "@/features/exams/exam.actions";
import { getSubjects } from "@/features/subjects/subject.actions";
import { getClasses } from "@/features/classes/class.actions";
import { ExamTable } from "@/components/exams/exam-table";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const [exams, subjects, classes] = await Promise.all([
    getExams(),
    getSubjects(),
    getClasses(),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Exams & Assessments</h1>
            <p className="text-sm text-muted-foreground">
              Manage examination schedules, room assignments, and passing standards across subjects.
            </p>
          </div>
        </div>
      </div>

      <ExamTable
        initialExams={exams}
        subjects={subjects || []}
        classes={classes || []}
      />
    </div>
  );
}
