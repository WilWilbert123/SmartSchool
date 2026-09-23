"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Calendar, Clock, MapPin, BookOpen, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Exam } from "@/features/exams/exam.types";
import { createExam, deleteExam, updateExamStatus } from "@/features/exams/exam.actions";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

interface ExamTableProps {
  initialExams: Exam[];
  subjects: { id: string; name: string; code: string }[];
  classes: { id: string; grade_level: string; section_name: string }[];
}

export function ExamTable({ initialExams, subjects, classes }: ExamTableProps) {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [passingMarks, setPassingMarks] = useState("50");
  const [roomNumber, setRoomNumber] = useState("");

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subjects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subjects?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.room_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || exam.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !examDate) return;

    setIsSubmitting(true);
    const res = await createExam({
      title,
      subject_id: subjectId || undefined,
      class_id: classId || undefined,
      exam_date: examDate,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      total_marks: Number(totalMarks) || 100,
      passing_marks: Number(passingMarks) || 50,
      room_number: roomNumber || undefined,
      status: "SCHEDULED",
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsAddModalOpen(false);
      // Reset form
      setTitle("");
      setSubjectId("");
      setClassId("");
      setExamDate("");
      setStartTime("");
      setEndTime("");
      setTotalMarks("100");
      setPassingMarks("50");
      setRoomNumber("");
      // Optimistically reload or window location refresh
      window.location.reload();
    } else {
      alert("Failed to create exam: " + res.error);
    }
  };

  const handleStatusChange = async (id: string, status: Exam["status"]) => {
    const res = await updateExamStatus(id, status);
    if (res.success) {
      setExams((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } else {
      alert("Failed to update status: " + res.error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteExam(deletingId);
    if (res.success) {
      setExams((prev) => prev.filter((item) => item.id !== deletingId));
    } else {
      alert("Failed to delete exam: " + res.error);
    }
    setDeletingId(null);
  };

  const getStatusBadge = (status: Exam["status"]) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ONGOING":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border h-10 rounded-xl pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Schedule Exam
        </button>
      </div>

      {/* Exam Table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Exam Title</th>
                <th className="px-6 py-4">Subject & Class</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Marks & Room</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No exams found. Click "Schedule Exam" to add one.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{exam.title}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {exam.subjects ? `${exam.subjects.code} - ${exam.subjects.name}` : "General"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {exam.classes ? `${exam.classes.grade_level.replace('_', ' ')} (${exam.classes.section_name})` : "All Classes"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(exam.exam_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      {(exam.start_time || exam.end_time) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {exam.start_time?.slice(0, 5)} - {exam.end_time?.slice(0, 5)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-foreground">
                        Marks: {exam.passing_marks} / {exam.total_marks}
                      </div>
                      {exam.room_number && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" /> Room {exam.room_number}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={exam.status}
                        onChange={(e) => handleStatusChange(exam.id, e.target.value as Exam["status"])}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${getStatusBadge(
                          exam.status
                        )}`}
                      >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="ONGOING">ONGOING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeletingId(exam.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded-lg transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Exam Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-foreground">Schedule New Exam</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Physics Assessment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Class / Section
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="">Select Class...</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.grade_level.replace('_', ' ')} ({cls.section_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Exam"
        description="Are you sure you want to delete this exam schedule? This action cannot be undone."
      />
    </div>
  );
}
