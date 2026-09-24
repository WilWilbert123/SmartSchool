import { getSubjects } from "@/features/subjects/subject.actions";
import { SubjectTable } from "@/components/subjects/subject-table";
import { AddSubjectDialog } from "@/components/subjects/add-subject-dialog";
import { FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      <Breadcrumbs items={[{ label: "Subjects" }]} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage school curriculum and subject offerings.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <AddSubjectDialog />
        </div>
      </div>

      <SubjectTable initialData={subjects} />
    </div>
  );
}
