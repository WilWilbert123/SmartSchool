"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { deleteTeacher, createTeacher, updateTeacher } from "@/features/teachers/teacher.actions";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

export function TeacherTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique specializations dynamically
  const availableSpecializations = Array.from(
    new Set(
      data
        .map((t) => t.specialization)
        .filter((s): s is string => Boolean(s && s.trim().length > 0))
    )
  ).sort();

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmployeeNumber, setEditEmployeeNumber] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editEmploymentType, setEditEmploymentType] = useState<any>("FULL_TIME");
  const [editContactNumber, setEditContactNumber] = useState("");

  // Add Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [employmentType, setEmploymentType] = useState<"FULL_TIME" | "PART_TIME" | "CONTRACT" | "SUBSTITUTE">("FULL_TIME");
  const [gender, setGender] = useState("MALE");
  const [contactNumber, setContactNumber] = useState("");

  const filteredData = data.filter((teacher) => {
    const fullName = `${teacher.employees?.people?.first_name || ""} ${teacher.employees?.people?.last_name || ""}`.toLowerCase();
    const empNum = teacher.employees?.employee_number?.toLowerCase() || "";
    const teacherSpec = teacher.specialization || "";
    const teacherType = teacher.employees?.employment_type || "";
    const teacherStatus = teacher.employees?.status || "ACTIVE";

    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || empNum.includes(searchTerm.toLowerCase());
    const matchesSpec = specializationFilter === "ALL" || teacherSpec === specializationFilter;
    const matchesType = typeFilter === "ALL" || teacherType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || teacherStatus === statusFilter;

    return matchesSearch && matchesSpec && matchesType && matchesStatus;
  });

  const startEdit = (teacher: any) => {
    setEditingId(teacher.id);
    setEditFirstName(teacher.employees?.people?.first_name || "");
    setEditLastName(teacher.employees?.people?.last_name || "");
    setEditEmployeeNumber(teacher.employees?.employee_number || "");
    setEditSpecialization(teacher.specialization || "");
    setEditEmploymentType(teacher.employees?.employment_type || "FULL_TIME");
    setEditContactNumber(teacher.employees?.people?.contact_number || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (teacherId: string) => {
    setIsSubmitting(true);
    const res = await updateTeacher(teacherId, {
      first_name: editFirstName,
      last_name: editLastName,
      employee_number: editEmployeeNumber,
      specialization: editSpecialization,
      employment_type: editEmploymentType,
      contact_number: editContactNumber,
    });
    setIsSubmitting(false);

    if (res.success) {
      setData((prev) =>
        prev.map((t) => {
          if (t.id === teacherId) {
            return {
              ...t,
              specialization: editSpecialization,
              employees: {
                ...t.employees,
                employee_number: editEmployeeNumber,
                employment_type: editEmploymentType,
                people: {
                  ...t.employees?.people,
                  first_name: editFirstName,
                  last_name: editLastName,
                  contact_number: editContactNumber,
                },
              },
            };
          }
          return t;
        })
      );
      setEditingId(null);
    } else {
      alert("Failed to update teacher: " + res.error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !employeeNumber) return;

    setIsSubmitting(true);
    const res = await createTeacher({
      first_name: firstName,
      last_name: lastName,
      employee_number: employeeNumber,
      specialization,
      employment_type: employmentType,
      gender,
      contact_number: contactNumber,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsAddModalOpen(false);
      setFirstName("");
      setLastName("");
      setEmployeeNumber("");
      setSpecialization("");
      setContactNumber("");
      window.location.reload();
    } else {
      alert("Failed to create teacher: " + res.error);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;

    const res = await deleteTeacher(isDeleting);
    if (res.success) {
      setData((prev) => prev.filter((t) => t.id !== isDeleting));
    } else {
      alert("Failed to delete teacher: " + res.error);
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border h-10 rounded-xl pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Filter Specialization */}
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="h-10 bg-background border rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Specializations</option>
            {availableSpecializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          {/* Filter Employment Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 bg-background border rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="SUBSTITUTE">Substitute</option>
          </select>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 bg-background border rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {(searchTerm || specializationFilter !== "ALL" || typeFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSpecializationFilter("ALL");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground font-medium underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Add Teacher
        </button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Name & Contact</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No teachers found. Click "Add Teacher" to record a new faculty member.
                  </td>
                </tr>
              ) : (
                filteredData.map((teacher) => {
                  const isEditing = editingId === teacher.id;

                  if (isEditing) {
                    return (
                      <tr key={teacher.id} className="bg-primary/5">
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={editEmployeeNumber}
                            onChange={(e) => setEditEmployeeNumber(e.target.value)}
                            className="w-full h-8 px-2 border rounded-lg text-xs font-mono bg-background"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <div className="space-y-1">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editFirstName}
                                onChange={(e) => setEditFirstName(e.target.value)}
                                placeholder="First"
                                className="w-full h-8 px-2 border rounded-lg text-xs bg-background"
                              />
                              <input
                                type="text"
                                value={editLastName}
                                onChange={(e) => setEditLastName(e.target.value)}
                                placeholder="Last"
                                className="w-full h-8 px-2 border rounded-lg text-xs bg-background"
                              />
                            </div>
                            <input
                              type="text"
                              value={editContactNumber}
                              onChange={(e) => setEditContactNumber(e.target.value)}
                              placeholder="Contact phone"
                              className="w-full h-7 px-2 border rounded-lg text-[11px] bg-background text-muted-foreground"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={editSpecialization}
                            onChange={(e) => setEditSpecialization(e.target.value)}
                            className="w-full h-8 px-2 border rounded-lg text-xs bg-background"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={editEmploymentType}
                            onChange={(e) => setEditEmploymentType(e.target.value)}
                            className="h-8 px-2 border rounded-lg text-xs bg-background"
                          >
                            <option value="FULL_TIME">Full-time</option>
                            <option value="PART_TIME">Part-time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="SUBSTITUTE">Substitute</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                            ACTIVE
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => saveEdit(teacher.id)}
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
                    <tr key={teacher.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-foreground">
                        {teacher.employees?.employee_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">
                          {teacher.employees?.people?.first_name} {teacher.employees?.people?.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {teacher.employees?.people?.contact_number || "No contact info"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {teacher.specialization || "General"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600">
                          {teacher.employees?.employment_type?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            teacher.employees?.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {teacher.employees?.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(teacher)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            title="Edit Teacher"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setIsDeleting(teacher.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                            title="Delete Teacher"
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

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-foreground">Add New Teacher</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Santos"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-101"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as any)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="SUBSTITUTE">Substitute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Subject Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Science"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0192"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
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
                  {isSubmitting ? "Saving..." : "Save Teacher"}
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
        title="Delete Teacher"
        description="Are you sure you want to remove this teacher? This action cannot be undone and will remove them from all assigned classes."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}

