"use client";

import { useState } from "react";
import { Search, Trash2, Edit2, BookOpen } from "lucide-react";
import { deleteSubject } from "@/features/subjects/subject.actions";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

export function SubjectTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredData = data.filter((subject) => {
    const code = subject.code?.toLowerCase() || "";
    const name = subject.name?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return code.includes(search) || name.includes(search);
  });

  const handleDelete = async () => {
    if (!isDeleting) return;
    
    const res = await deleteSubject(isDeleting);
    if (res.success) {
      setData((prev) => prev.filter((s) => s.id !== isDeleting));
    } else {
      alert("Failed to delete subject: " + res.error);
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search subjects by code or name..."
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
                <th className="px-6 py-4">Subject Code</th>
                <th className="px-6 py-4">Subject Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Credits</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filteredData.map((subject) => (
                  <tr key={subject.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {subject.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                      {subject.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                        {subject.credits} Credits
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-primary p-2 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setIsDeleting(subject.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded-lg transition-colors"
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

      <ConfirmDialog 
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This will remove it from all class assignments and grade records. This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}
