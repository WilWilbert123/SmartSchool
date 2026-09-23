"use client";

import { useState } from "react";
import { Users, BookOpen, FileSpreadsheet, BarChart3, Download, X, CheckCircle } from "lucide-react";
import {
  getEnrollmentReportData,
  getAcademicPerformanceReportData,
  getIdIssuanceReportData,
} from "@/features/reports/report.actions";

export function ReportsView() {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"ENROLLMENT" | "ACADEMIC" | "ID" | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);

  // CSV Exporter Helper
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers for Enrollment Report
  const handleViewEnrollment = async () => {
    setLoadingType("ENROLLMENT_VIEW");
    const data = await getEnrollmentReportData();
    setModalData(data);
    setActiveModal("ENROLLMENT");
    setLoadingType(null);
  };

  const handleExportEnrollment = async () => {
    setLoadingType("ENROLLMENT_EXPORT");
    const data = await getEnrollmentReportData();
    const headers = ["Student Number", "Full Name", "Gender", "Grade Level", "Section", "Status", "Date Enrolled"];
    const rows = data.map((item) => [
      item.studentNumber,
      item.fullName,
      item.gender,
      item.gradeLevel,
      item.section,
      item.status,
      item.createdDate,
    ]);
    downloadCSV(`Enrollment_Report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    setLoadingType(null);
  };

  // Handlers for Academic Performance Report
  const handleViewAcademic = async () => {
    setLoadingType("ACADEMIC_VIEW");
    const data = await getAcademicPerformanceReportData();
    setModalData(data);
    setActiveModal("ACADEMIC");
    setLoadingType(null);
  };

  const handleExportAcademic = async () => {
    setLoadingType("ACADEMIC_EXPORT");
    const data = await getAcademicPerformanceReportData();
    const headers = ["Subject Code", "Subject Name", "Class / Section", "Q1", "Q2", "Q3", "Q4", "Final Grade"];
    const rows = data.map((item) => [
      item.subjectCode,
      item.subjectName,
      item.classSection,
      item.q1,
      item.q2,
      item.q3,
      item.q4,
      item.finalGrade,
    ]);
    downloadCSV(`Academic_Performance_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    setLoadingType(null);
  };

  // Handlers for ID Issuance Report
  const handleViewID = async () => {
    setLoadingType("ID_VIEW");
    const data = await getIdIssuanceReportData();
    setModalData(data);
    setActiveModal("ID");
    setLoadingType(null);
  };

  const handleExportID = async () => {
    setLoadingType("ID_EXPORT");
    const data = await getIdIssuanceReportData();
    const headers = ["Student Number", "Full Name", "LRN Number", "ID Card Status", "Issued Date"];
    const rows = data.map((item) => [
      item.studentNumber,
      item.fullName,
      item.lrnNumber,
      item.idStatus,
      item.issuedAt,
    ]);
    downloadCSV(`ID_Issuance_Log_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    setLoadingType(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Enrollment Report Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Enrollment Report</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Detailed breakdown of student enrollment by grade level, section, and gender for the current academic year.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleViewEnrollment}
              disabled={loadingType === "ENROLLMENT_VIEW"}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {loadingType === "ENROLLMENT_VIEW" ? "Loading..." : "View"}
            </button>
            <button
              onClick={handleExportEnrollment}
              disabled={loadingType === "ENROLLMENT_EXPORT"}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-muted px-4 py-2.5 text-sm font-medium hover:bg-muted/80 transition-colors border text-foreground disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              {loadingType === "ENROLLMENT_EXPORT" ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>

        {/* Academic Performance Report Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Academic Performance</h3>
            <p className="text-sm text-muted-foreground mt-2">
              School-wide grade distributions, top performing classes, and subject average scores.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleViewAcademic}
              disabled={loadingType === "ACADEMIC_VIEW"}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {loadingType === "ACADEMIC_VIEW" ? "Loading..." : "View"}
            </button>
            <button
              onClick={handleExportAcademic}
              disabled={loadingType === "ACADEMIC_EXPORT"}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-muted px-4 py-2.5 text-sm font-medium hover:bg-muted/80 transition-colors border text-foreground disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              {loadingType === "ACADEMIC_EXPORT" ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>

        {/* ID Issuance Log Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">ID Issuance Log</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Complete audit trail of all student ID cards printed, active, revoked, or lost.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleViewID}
              disabled={loadingType === "ID_VIEW"}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {loadingType === "ID_VIEW" ? "Loading..." : "View"}
            </button>
            <button
              onClick={handleExportID}
              disabled={loadingType === "ID_EXPORT"}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-muted px-4 py-2.5 text-sm font-medium hover:bg-muted/80 transition-colors border text-foreground disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              {loadingType === "ID_EXPORT" ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>

      {/* Report View Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-4xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-foreground">
                {activeModal === "ENROLLMENT" && "Live Enrollment Report"}
                {activeModal === "ACADEMIC" && "Live Academic Performance Report"}
                {activeModal === "ID" && "Live ID Issuance Log Report"}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 border rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[11px] font-semibold sticky top-0">
                  <tr>
                    {activeModal === "ENROLLMENT" && (
                      <>
                        <th className="px-4 py-3">Student #</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Gender</th>
                        <th className="px-4 py-3">Grade & Section</th>
                        <th className="px-4 py-3">Status</th>
                      </>
                    )}
                    {activeModal === "ACADEMIC" && (
                      <>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3">Q1</th>
                        <th className="px-4 py-3">Q2</th>
                        <th className="px-4 py-3">Q3</th>
                        <th className="px-4 py-3">Q4</th>
                        <th className="px-4 py-3">Final Grade</th>
                      </>
                    )}
                    {activeModal === "ID" && (
                      <>
                        <th className="px-4 py-3">Student #</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">LRN</th>
                        <th className="px-4 py-3">ID Status</th>
                        <th className="px-4 py-3">Issued Date</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {modalData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No records found in database.
                      </td>
                    </tr>
                  ) : (
                    modalData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        {activeModal === "ENROLLMENT" && (
                          <>
                            <td className="px-4 py-3 font-mono font-medium">{row.studentNumber}</td>
                            <td className="px-4 py-3">{row.fullName}</td>
                            <td className="px-4 py-3">{row.gender}</td>
                            <td className="px-4 py-3">{row.gradeLevel} ({row.section})</td>
                            <td className="px-4 py-3">
                              <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-xs font-semibold">
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                        {activeModal === "ACADEMIC" && (
                          <>
                            <td className="px-4 py-3 font-medium">{row.subjectCode} - {row.subjectName}</td>
                            <td className="px-4 py-3">{row.classSection}</td>
                            <td className="px-4 py-3">{row.q1}</td>
                            <td className="px-4 py-3">{row.q2}</td>
                            <td className="px-4 py-3">{row.q3}</td>
                            <td className="px-4 py-3">{row.q4}</td>
                            <td className="px-4 py-3 font-bold text-primary">{row.finalGrade}</td>
                          </>
                        )}
                        {activeModal === "ID" && (
                          <>
                            <td className="px-4 py-3 font-mono font-medium">{row.studentNumber}</td>
                            <td className="px-4 py-3">{row.fullName}</td>
                            <td className="px-4 py-3 font-mono text-xs">{row.lrnNumber}</td>
                            <td className="px-4 py-3">
                              <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold">
                                {row.idStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{row.issuedAt}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 border transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
