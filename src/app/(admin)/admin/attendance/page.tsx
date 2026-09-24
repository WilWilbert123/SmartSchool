import { getAttendanceLogs } from "@/features/attendance/attendance.actions";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { RecordAttendanceDialog } from "@/components/attendance/record-attendance-dialog";
import { ImportAttendanceDialog } from "@/components/attendance/import-attendance-dialog";
import { CalendarCheck } from "lucide-react";
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
          <ImportAttendanceDialog />
          <RecordAttendanceDialog />
        </div>
      </div>

      <AttendanceTable initialData={attendanceLogs} />
    </div>
  );
}
