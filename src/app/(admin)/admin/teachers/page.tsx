import { getTeachers } from "@/features/teachers/teacher.actions";
import { TeacherTable } from "@/components/teachers/teacher-table";
import { GraduationCap } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 pb-12">
      <Breadcrumbs items={[{ label: "Teachers" }]} />

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage teaching personnel, specializations, and assignments.
          </p>
        </div>
      </div>

      <TeacherTable initialData={teachers || []} />
    </div>
  );
}
