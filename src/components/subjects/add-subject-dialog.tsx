"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createSubject } from "@/features/subjects/subject.actions";

interface AddSubjectDialogProps {
  onSuccess?: (newSubject: any) => void;
}

export function AddSubjectDialog({ onSuccess }: AddSubjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    credits: 1.0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.code.trim() || !formData.name.trim()) {
      setError("Subject Code and Name are required.");
      return;
    }

    setIsSubmitting(true);
    const result = await createSubject({
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      credits: Number(formData.credits) || 1.0,
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsOpen(false);
      setFormData({ code: "", name: "", description: "", credits: 1.0 });
      if (onSuccess && result.data) {
        onSuccess(result.data);
      }
    } else {
      setError(result.error || "Failed to create subject.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Subject
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border rounded-3xl shadow-xl w-full max-w-md p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold tracking-tight">Add New Subject</h2>
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
                <label className="text-xs font-semibold">Subject Code *</label>
                <input
                  type="text"
                  placeholder="e.g. EPP-TLE-7"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-1 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Technology and Livelihood Education"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-1 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Description</label>
                <textarea
                  placeholder="Optional details or description of subject scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Credits / Units</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
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
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
