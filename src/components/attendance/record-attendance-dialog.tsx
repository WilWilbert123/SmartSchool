"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, CalendarCheck } from "lucide-react";
import { recordAttendance, getEnrollmentsList } from "@/features/attendance/attendance.actions";

interface RecordAttendanceDialogProps {
  onSuccess?: () => void;
}

export function RecordAttendanceDialog({ onSuccess }: RecordAttendanceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    enrollment_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "PRESENT" as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
    remarks: "",
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoadingEnrollments(true);
      getEnrollmentsList().then((data) => {
        setEnrollments(data);
        setIsLoadingEnrollments(false);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.enrollment_id) {
      setError("Please select a student.");
      return;
    }

    setIsSubmitting(true);
    const res = await recordAttendance(formData);
    setIsSubmitting(false);

    if (res.success) {
      setIsOpen(false);
      setFormData({
        enrollment_id: "",
        date: new Date().toISOString().split("T")[0],
        status: "PRESENT",
        remarks: "",
      });
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Failed to record attendance.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Record Attendance
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border rounded-3xl shadow-xl w-full max-w-md p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold tracking-tight">Record Daily Attendance</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 text-xs font-medium bg-destructive/15 text-destructive rounded-xl border border-destructive/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Select Student & Class *</label>
                {isLoadingEnrollments ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 border rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading students...
                  </div>
                ) : (
                  <select
                    value={formData.enrollment_id}
                    onChange={(e) => setFormData({ ...formData, enrollment_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-1 focus:ring-primary outline-none"
                    required
                  >
                    <option value="" disabled>Select student...</option>
                    {enrollments.map((item) => {
                      const name = `${item.student?.people?.last_name}, ${item.student?.people?.first_name}`;
                      const className = `${item.class?.grade_level?.replace('_', ' ')} - ${item.class?.section_name}`;
                      return (
                        <option key={item.id} value={item.id}>
                          {name} ({item.student?.student_number}) — {className}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Attendance Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-1 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                  <option value="EXCUSED">EXCUSED</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Remarks</label>
                <input
                  type="text"
                  placeholder="Optional notes or excuse reason..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
