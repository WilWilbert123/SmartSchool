"use client";

import { useState, useRef } from "react";
import { Upload, FileDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { bulkImportAttendance } from "@/features/attendance/attendance.actions";

export function ImportAttendanceDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ importedCount?: number; errors?: string[]; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate standardized template CSV file
  const handleGenerateTemplate = () => {
    const csvContent = "date,student_number,status,remarks\n2026-09-24,2026-0001,PRESENT,On time\n2026-09-24,2026-0002,ABSENT,Sick leave\n2026-09-24,2026-0003,LATE,Traffic delay\n2026-09-24,2026-0004,EXCUSED,Official event\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "smartschool_attendance_format_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length <= 1) {
          setResult({ error: "The selected CSV file is empty or missing data rows." });
          setIsUploading(false);
          return;
        }

        const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
        const dateIdx = headers.indexOf("date");
        const studentNumIdx = headers.indexOf("student_number");
        const statusIdx = headers.indexOf("status");
        const remarksIdx = headers.indexOf("remarks");

        if (dateIdx === -1 || studentNumIdx === -1 || statusIdx === -1) {
          setResult({
            error: "Invalid CSV format! Please use the 'Generate Template' button to ensure column headers match exactly (date, student_number, status, remarks).",
          });
          setIsUploading(false);
          return;
        }

        const parsedRecords: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",").map((c) => c.trim());
          if (row.length <= 1) continue;

          const date = row[dateIdx];
          const student_number = row[studentNumIdx];
          const status = row[statusIdx]?.toUpperCase() as any;
          const remarks = remarksIdx !== -1 ? row[remarksIdx] : "";

          if (date && student_number && ["PRESENT", "ABSENT", "LATE", "EXCUSED"].includes(status)) {
            parsedRecords.push({ date, student_number, status, remarks });
          }
        }

        if (parsedRecords.length === 0) {
          setResult({ error: "No valid rows found in file. Ensure status is PRESENT, ABSENT, LATE, or EXCUSED." });
          setIsUploading(false);
          return;
        }

        const res = await bulkImportAttendance(parsedRecords);
        setResult(res);
      } catch (err: any) {
        setResult({ error: err.message || "Failed to parse CSV file." });
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-accent text-foreground transition-colors shadow-sm"
      >
        <Upload className="mr-2 h-4 w-4 text-blue-600" />
        Import Attendance
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border rounded-3xl shadow-xl w-full max-w-lg p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold tracking-tight">Import Attendance Records</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Template Generator Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-blue-600">Standardized CSV Template</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Download the official format to avoid CSV import errors.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
              >
                <FileDown className="h-3.5 w-3.5" />
                Generate Format
              </button>
            </div>

            {/* Dropzone Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Click to select CSV File</p>
              <p className="text-xs text-muted-foreground">Supported format: .csv</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {isUploading && (
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground p-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Processing CSV File...
              </div>
            )}

            {result && (
              <div className="space-y-3 pt-2">
                {result.error && (
                  <div className="p-3 text-xs font-medium bg-destructive/15 text-destructive rounded-xl border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{result.error}</span>
                  </div>
                )}

                {result.importedCount !== undefined && (
                  <div className="p-3 text-xs font-medium bg-emerald-500/15 text-emerald-600 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Successfully imported {result.importedCount} attendance records!</span>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto p-3 text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-500/20 space-y-1">
                    <p className="font-bold">Import Warnings:</p>
                    {result.errors.map((err, idx) => (
                      <p key={idx}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
