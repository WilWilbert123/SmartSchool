"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import type { Student } from "@/features/students/student.types";

interface StudentTableProps {
  students: Student[];
}

export function StudentTable({ students }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.student_number.toLowerCase().includes(term) ||
      s.person?.first_name.toLowerCase().includes(term) ||
      s.person?.last_name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <button className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-accent text-foreground hover:text-accent-foreground transition-colors">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
            <tr>
              <th className="px-6 py-4 font-medium">Student</th>
              <th className="px-6 py-4 font-medium">ID Number</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Admission</th>
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
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {student.person?.first_name} {student.person?.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{student.student_number}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                      {student.current_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {student.admission_date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center rounded-lg h-8 w-8 text-muted-foreground hover:bg-muted transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
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
    </div>
  );
}
