import { getClasses, getAcademicYears } from "@/features/classes/class.actions";
import { getTeachers } from "@/features/teachers/teacher.actions";
import { ClassTable } from "@/components/classes/class-table";
import { BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const [classes, academicYears, teachers] = await Promise.all([
    getClasses(),
    getAcademicYears(),
    getTeachers(),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 pb-12">
      <Breadcrumbs items={[{ label: "Classes" }]} />

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes & Sections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage class sections, grade levels, academic years, and advisers.
          </p>
        </div>
      </div>

      <ClassTable
        initialData={classes || []}
        academicYears={academicYears || []}
        teachers={teachers || []}
      />
    </div>
  );
}
