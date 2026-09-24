"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { studentSchema, type StudentFormInput } from "@/features/students/student.schema";
import { createStudent } from "@/features/students/student.actions";

interface StudentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StudentForm({ onSuccess, onCancel }: StudentFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      current_status: 'ENROLLED',
      admission_date: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = async (data: StudentFormInput) => {
    setServerError(null);
    const result = await createStudent(data);
    
    if (result.error) {
      setServerError(result.error);
    } else if (result.success) {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
      {serverError && (
        <div className="p-3 text-xs font-medium bg-destructive/15 text-destructive rounded-xl border border-destructive/20">
          {serverError}
        </div>
      )}
      
      {/* 1. Personal Information */}
      <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
        <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider border-b border-border/60 pb-2">
          1. Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">First Name *</label>
            <input
              {...register("first_name")}
              placeholder="First Name"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            {errors.first_name && <p className="text-[11px] text-destructive mt-0.5 font-medium">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Middle Name</label>
            <input
              {...register("middle_name")}
              placeholder="Middle Name"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Last Name *</label>
            <input
              {...register("last_name")}
              placeholder="Last Name"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            {errors.last_name && <p className="text-[11px] text-destructive mt-0.5 font-medium">{errors.last_name.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Gender</label>
            <select
              {...register("gender")}
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="">Select Gender...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Academic & ID Information */}
      <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
        <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider border-b border-border/60 pb-2">
          2. Academic & ID Information
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Student Number *</label>
            <input
              {...register("student_number")}
              placeholder="2026-0001"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs font-mono font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            {errors.student_number && <p className="text-[11px] text-destructive mt-0.5 font-medium">{errors.student_number.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">LRN Number</label>
            <input
              {...register("lrn")}
              placeholder="12-digit LRN"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Grade Level</label>
            <input
              {...register("grade_level")}
              placeholder="e.g. Grade 10"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Section Name</label>
            <input
              {...register("section_name")}
              placeholder="e.g. Emerald"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">School Year</label>
            <input
              {...register("school_year")}
              placeholder="2025-2026"
              defaultValue="2025-2026"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Admission Date *</label>
            <input
              {...register("admission_date")}
              type="date"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            {errors.admission_date && <p className="text-[11px] text-destructive mt-0.5 font-medium">{errors.admission_date.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Status</label>
            <select
              {...register("current_status")}
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="ENROLLED">Enrolled</option>
              <option value="ALUMNI">Alumni</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Guardian & Emergency Information */}
      <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
        <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider border-b border-border/60 pb-2">
          3. Guardian & Emergency Details (Back ID)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-foreground mb-1 block">Parent / Guardian Name</label>
            <input
              {...register("guardian_name")}
              placeholder="Full Name of Guardian"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Relationship</label>
            <input
              {...register("guardian_relationship")}
              placeholder="Mother, Father, etc."
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Blood Type</label>
            <select
              {...register("blood_type")}
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="">Blood Type...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Emergency Contact Phone</label>
            <input
              {...register("guardian_contact")}
              placeholder="+63 9XX XXX XXXX"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-foreground mb-1 block">Home Address</label>
            <input
              {...register("address")}
              placeholder="House No., Street, Barangay, City/Municipality"
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-input bg-background px-5 text-xs font-semibold hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-6 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : null}
          Save Student
        </button>
      </div>
    </form>
  );
}
