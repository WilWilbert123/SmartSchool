"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Edit2, BookOpen, AlertCircle } from "lucide-react";
import { deleteClass, createClass } from "@/features/classes/class.actions";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

interface ClassTableProps {
  initialData: any[];
  academicYears: { id: string; name: string; status: string }[];
  teachers: any[];
}

export function ClassTable({ initialData, academicYears, teachers }: ClassTableProps) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [gradeLevel, setGradeLevel] = useState("GRADE_10");
  const [sectionName, setSectionName] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [adviserId, setAdviserId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const filteredData = data.filter((cls) => {
    const sectionName = cls.section_name?.toLowerCase() || "";
    const gradeLevel = cls.grade_level?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return sectionName.includes(search) || gradeLevel.includes(search);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName) return;

    setFormError(null);
    setIsSubmitting(true);
    const res = await createClass({
      grade_level: gradeLevel,
      section_name: sectionName,
      academic_year_id: academicYearId || undefined,
      adviser_id: adviserId || undefined,
      room_number: roomNumber || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsAddModalOpen(false);
      setSectionName("");
      setRoomNumber("");
      setAdviserId("");
      window.location.reload();
    } else {
      setFormError(res.error || "Failed to create class.");
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;

    const res = await deleteClass(isDeleting);
    if (res.success) {
      setData((prev) => prev.filter((c) => c.id !== isDeleting));
    } else {
      alert("Failed to delete class: " + res.error);
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search classes by section or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border h-10 rounded-xl pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm gap-2"
        >
          <Plus className="h-4 w-4" /> Create Class
        </button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Grade & Section</th>
                <th className="px-6 py-4">Academic Year</th>
                <th className="px-6 py-4">Adviser</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No classes found. Click "Create Class" to record a new class section.
                  </td>
                </tr>
              ) : (
                filteredData.map((cls) => (
                  <tr key={cls.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {cls.grade_level?.replace("_", " ")} - {cls.section_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {cls.academic_years?.name || "2025-2026"}
                      </div>
                      <span
                        className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cls.academic_years?.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {cls.academic_years?.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {cls.adviser?.people
                        ? `${cls.adviser.people.first_name} ${cls.adviser.people.last_name}`
                        : "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {cls.room_number ? `Room ${cls.room_number}` : "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setIsDeleting(cls.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded-lg transition-colors"
                        title="Delete Class"
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

      {/* Create Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-foreground">Create New Class Section</h2>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Grade Level *
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="KINDERGARTEN">Kindergarten</option>
                    <option value="GRADE_1">Grade 1</option>
                    <option value="GRADE_2">Grade 2</option>
                    <option value="GRADE_3">Grade 3</option>
                    <option value="GRADE_4">Grade 4</option>
                    <option value="GRADE_5">Grade 5</option>
                    <option value="GRADE_6">Grade 6</option>
                    <option value="GRADE_7">Grade 7</option>
                    <option value="GRADE_8">Grade 8</option>
                    <option value="GRADE_9">Grade 9</option>
                    <option value="GRADE_10">Grade 10</option>
                    <option value="GRADE_11">Grade 11</option>
                    <option value="GRADE_12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Section Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A / St. Jude"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Academic Year
                  </label>
                  <select
                    value={academicYearId}
                    onChange={(e) => setAcademicYearId(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="">Default Active Year</option>
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name} ({ay.status})
                      </option>
                    ))}
                  </select>
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

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Class Adviser
                </label>
                <select
                  value={adviserId}
                  onChange={(e) => setAdviserId(e.target.value)}
                  className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="">Select Adviser...</option>
                  {teachers.map((t) => {
                    const person = t.employees?.people;
                    const name = person ? `${person.first_name} ${person.last_name}` : "Teacher";
                    return (
                      <option key={t.employee_id || t.id} value={t.employee_id || t.id}>
                        {name} ({t.employees?.employee_number || "EMP"})
                      </option>
                    );
                  })}
                </select>
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
                  {isSubmitting ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Class"
        description="Are you sure you want to remove this class section? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}
