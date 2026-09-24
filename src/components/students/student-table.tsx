"use client";

import { useState } from "react";
import { Search, Filter, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import type { Student } from "@/features/students/student.types";
import { updateStudent, deleteStudent } from "@/features/students/student.actions";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

interface StudentTableProps {
  students: Student[];
}

export function StudentTable({ students: initialStudents }: StudentTableProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Form State
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editStudentNumber, setEditStudentNumber] = useState("");
  const [editStatus, setEditStatus] = useState("ENROLLED");
  const [editAdmissionDate, setEditAdmissionDate] = useState("");

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [gradeFilter, setGradeFilter] = useState<string>("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");

  const filteredStudents = students.filter((s) => {
    // 1. Text Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName =
        s.student_number.toLowerCase().includes(term) ||
        s.person?.first_name?.toLowerCase().includes(term) ||
        s.person?.last_name?.toLowerCase().includes(term);
      if (!matchName) return false;
    }

    // 2. Status Filter
    if (statusFilter !== "ALL" && s.current_status !== statusFilter) {
      return false;
    }

    return true;
  });

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditFirstName(student.person?.first_name || "");
    setEditLastName(student.person?.last_name || "");
    setEditStudentNumber(student.student_number || "");
    setEditStatus(student.current_status || "ENROLLED");
    setEditAdmissionDate(student.admission_date || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    setIsSaving(true);
    const res = await updateStudent(id, {
      first_name: editFirstName,
      last_name: editLastName,
      student_number: editStudentNumber,
      current_status: editStatus as any,
      admission_date: editAdmissionDate,
    });
    setIsSaving(false);

    if (res.success) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            return {
              ...s,
              student_number: editStudentNumber,
              current_status: editStatus as any,
              admission_date: editAdmissionDate,
              person: {
                ...s.person,
                first_name: editFirstName,
                last_name: editLastName,
              } as any,
            };
          }
          return s;
        })
      );
      setEditingId(null);
    } else {
      alert("Failed to update student: " + res.error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const res = await deleteStudent(deletingId);
    if (res.success) {
      setStudents((prev) => prev.filter((s) => s.id !== deletingId));
    } else {
      alert("Failed to delete student: " + res.error);
    }
    setDeletingId(null);
  };

  const handleExportCSV = () => {
    let csv = "student_number,first_name,last_name,status,admission_date\n";
    filteredStudents.forEach((s) => {
      csv += `"${s.student_number}","${s.person?.first_name || ""}","${s.person?.last_name || ""}","${s.current_status}","${s.admission_date || ""}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `students_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ENROLLED">ENROLLED</option>
            <option value="GRADUATED">GRADUATED</option>
            <option value="TRANSFERRED">TRANSFERRED</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          {/* Grade Level Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Grade Levels</option>
            <option value="GRADE_7">Grade 7</option>
            <option value="GRADE_8">Grade 8</option>
            <option value="GRADE_9">Grade 9</option>
            <option value="GRADE_10">Grade 10</option>
            <option value="GRADE_11">Grade 11</option>
            <option value="GRADE_12">Grade 12</option>
          </select>

          {/* Course / Track Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Courses / Tracks</option>
            <option value="STEM">STEM (Academic)</option>
            <option value="ABM">ABM (Academic)</option>
            <option value="HUMSS">HUMSS (Academic)</option>
            <option value="TVL_ICT">TVL - ICT</option>
            <option value="TVL_HE">TVL - Home Economics</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center rounded-xl text-xs font-semibold h-10 px-4 border border-input bg-background hover:bg-accent text-foreground transition-colors"
          >
            <Filter className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Export CSV
          </button>
        </div>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
            <tr>
              <th className="px-6 py-4 font-medium">Student Name</th>
              <th className="px-6 py-4 font-medium">ID Number</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Admission Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isEditing = editingId === student.id;

                if (isEditing) {
                  return (
                    <tr key={student.id} className="bg-primary/5">
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full h-8 px-2 border rounded-lg text-xs bg-background"
                          />
                          <input
                            type="text"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full h-8 px-2 border rounded-lg text-xs bg-background"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={editStudentNumber}
                          onChange={(e) => setEditStudentNumber(e.target.value)}
                          className="w-full h-8 px-2 border rounded-lg text-xs font-mono bg-background"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="h-8 px-2 border rounded-lg text-xs bg-background"
                        >
                          <option value="ENROLLED">ENROLLED</option>
                          <option value="GRADUATED">GRADUATED</option>
                          <option value="TRANSFERRED">TRANSFERRED</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="date"
                          value={editAdmissionDate}
                          onChange={(e) => setEditAdmissionDate(e.target.value)}
                          className="h-8 px-2 border rounded-lg text-xs bg-background"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveEdit(student.id)}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                            title="Save changes"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
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
                  <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {student.person?.first_name} {student.person?.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-medium text-foreground">
                      {student.student_number}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                        {student.current_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {student.admission_date || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(student)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(student.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                          title="Delete Student"
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
      
      {filteredStudents.length > 0 && (
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing {filteredStudents.length} students</div>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1 border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors">
              Previous
            </button>
            <button disabled className="px-3 py-1 border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        description="Are you sure you want to delete this student record? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}

