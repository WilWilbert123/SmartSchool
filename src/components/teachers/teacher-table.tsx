"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import { deleteTeacher, createTeacher } from "@/features/teachers/teacher.actions";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

export function TeacherTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
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
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || empNum.includes(search);
  });

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search teachers by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border h-10 rounded-xl pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm gap-2"
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
                <th className="px-6 py-4">Name</th>
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
                filteredData.map((teacher) => (
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
                      <button
                        onClick={() => setIsDeleting(teacher.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded-lg transition-colors"
                        title="Delete Teacher"
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
