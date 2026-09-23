"use client";

import { useState } from "react";
import { Search, CalendarCheck } from "lucide-react";
import { format } from "date-fns";

export function AttendanceTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((log) => {
    const studentName = `${log.enrollment?.student?.people?.first_name} ${log.enrollment?.student?.people?.last_name}`.toLowerCase();
    const className = `${log.enrollment?.class?.grade_level} ${log.enrollment?.class?.section_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return studentName.includes(search) || className.includes(search);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500/10 text-emerald-600';
      case 'ABSENT': return 'bg-destructive/10 text-destructive';
      case 'LATE': return 'bg-orange-500/10 text-orange-600';
      case 'EXCUSED': return 'bg-blue-500/10 text-blue-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by student or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border h-10 rounded-xl pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <CalendarCheck className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {format(new Date(log.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {log.enrollment?.student?.people?.first_name} {log.enrollment?.student?.people?.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.enrollment?.student?.student_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {log.enrollment?.class?.grade_level?.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.enrollment?.class?.section_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                      {log.remarks || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
