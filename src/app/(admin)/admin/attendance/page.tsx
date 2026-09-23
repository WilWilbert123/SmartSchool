import { getAttendanceLogs } from "@/features/attendance/attendance.actions";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { CalendarCheck, Plus, Download } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export default async function AttendancePage() {
  const attendanceLogs = await getAttendanceLogs();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      <Breadcrumbs items={[{ label: "Attendance" }]} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monitor daily student attendance across all classes.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-accent text-foreground transition-colors shadow-sm">
            <Download className="mr-2 h-4 w-4 text-primary" />
            Export Report
          </button>
          <button className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Record Attendance
          </button>
        </div>
      </div>

      <AttendanceTable initialData={attendanceLogs} />
    </div>
  );
}
