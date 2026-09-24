"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StudentForm } from "@/components/forms/student-form";

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors" />
      }>
        <Plus className="mr-2 h-4 w-4" />
        Add Student
      </DialogTrigger>
      <DialogContent className="!sm:max-w-4xl !max-w-4xl w-[92vw] sm:w-[85vw] max-h-[85vh] overflow-y-auto p-6 sm:p-7 rounded-3xl shadow-2xl">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">Add New Student</DialogTitle>
        </DialogHeader>
        <StudentForm onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
