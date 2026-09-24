"use client";

import { useState } from "react";
import { Search, CalendarCheck, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { updateAttendance, deleteAttendance } from "@/features/attendance/attendance.actions";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

export function AttendanceTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editStatus, setEditStatus] = useState<"PRESENT" | "ABSENT" | "LATE" | "EXCUSED">("PRESENT");
  const [editRemarks, setEditRemarks] = useState("");
  const [editDate, setEditDate] = useState("");

  const filteredData = data.filter((log) => {
    const studentName = `${log.enrollment?.student?.people?.first_name} ${log.enrollment?.student?.people?.last_name}`.toLowerCase();
    const className = `${log.enrollment?.class?.grade_level} ${log.enrollment?.class?.section_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return studentName.includes(search) || className.includes(search);
  });

  const startEdit = (log: any) => {
    setEditingId(log.id);
    setEditStatus(log.status || "PRESENT");
    setEditRemarks(log.remarks || "");
    const dateStr = log.date ? new Date(log.date).toISOString().split("T")[0] : "";
    setEditDate(dateStr);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (logId: string) => {
    setIsSubmitting(true);
    const res = await updateAttendance(logId, {
      status: editStatus,
      remarks: editRemarks,
      date: editDate || undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      setData((prev) =>
        prev.map((item) => {
          if (item.id === logId) {
            return {
              ...item,
              status: editStatus,
              remarks: editRemarks,
              date: editDate || item.date,
            };
          }
          return item;
        })
      );
      setEditingId(null);
    } else {
      alert("Failed to update attendance: " + res.error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const res = await deleteAttendance(deletingId);
    if (res.success) {
      setData((prev) => prev.filter((item) => item.id !== deletingId));
    } else {
      alert("Failed to delete attendance: " + res.error);
    }
    setDeletingId(null);
  };

  const handleExportReport = () => {
    let csv = "date,student_number,student_name,class,status,remarks\n";
    filteredData.forEach((log) => {
      const dateStr = log.date ? new Date(log.date).toISOString().split("T")[0] : "";
      const studentNum = log.enrollment?.student?.student_number || "";
      const name = `${log.enrollment?.student?.people?.first_name || ""} ${log.enrollment?.student?.people?.last_name || ""}`.trim();
      const className = `${log.enrollment?.class?.grade_level?.replace('_', ' ') || ""} ${log.enrollment?.class?.section_name || ""}`.trim();
      const status = log.status || "";
      const remarks = (log.remarks || "").replace(/"/g, '""');

      csv += `"${dateStr}","${studentNum}","${name}","${className}","${status}","${remarks}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((log) => {
                  const isEditing = editingId === log.id;

                  if (isEditing) {
                    return (
                      <tr key={log.id} className="bg-primary/5">
                        <td className="px-6 py-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <CalendarCheck className="h-4 w-4" />
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="h-8 px-2 border rounded-lg text-xs bg-background"
                          />
                        </td>
                        <td className="px-6 py-3 font-medium text-foreground">
                          {log.enrollment?.student?.people?.first_name} {log.enrollment?.student?.people?.last_name}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground text-xs">
                          {log.enrollment?.class?.grade_level?.replace('_', ' ')} - {log.enrollment?.class?.section_name}
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                            className="h-8 px-2 border rounded-lg text-xs bg-background"
                          >
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                            <option value="LATE">LATE</option>
                            <option value="EXCUSED">EXCUSED</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={editRemarks}
                            onChange={(e) => setEditRemarks(e.target.value)}
                            placeholder="Add remarks..."
                            className="w-full h-8 px-2 border rounded-lg text-xs bg-background"
                          />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => saveEdit(log.id)}
                              disabled={isSubmitting}
                              className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                              title="Save changes"
                            >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                              title="Cancel edit"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
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
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(log)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            title="Edit Attendance"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(log.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                            title="Delete Attendance"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Attendance Record"
        description="Are you sure you want to remove this attendance log? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}

