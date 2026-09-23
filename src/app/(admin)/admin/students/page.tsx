import { Plus, Search, Filter, Download, Upload, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getStudents } from "@/features/students/student.actions";
import { AddStudentDialog } from "@/components/students/add-student-dialog";
import { StudentTable } from "@/components/students/student-table";

export default async function AdminStudentsPage() {
  const { data: students, error } = await getStudents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all students in your school
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/students/import" className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-accent text-foreground hover:text-accent-foreground shadow-sm transition-colors">
            <Download className="mr-2 h-4 w-4 text-primary" />
            Import
          </Link>
          <button className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-accent text-foreground hover:text-accent-foreground shadow-sm transition-colors opacity-50 cursor-not-allowed" title="Export coming soon">
            <Upload className="mr-2 h-4 w-4 text-primary" />
            Export
          </button>
          
          <AddStudentDialog />
        </div>
      </div>

      <div className="mt-8">
        <StudentTable students={students || []} />
      </div>
    </div>
  );
}
