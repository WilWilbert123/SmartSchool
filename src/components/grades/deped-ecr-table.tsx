"use client";

import React, { useState } from "react";
import { Save, Download, Printer, FileSpreadsheet, CheckCircle2, Award, Info, HelpCircle, User } from "lucide-react";
import { calculateTermGrade, calculateFinalGrade3Terms, calculateItemAnalysis, transmuteGrade, getDescriptor, computeStudentTerm } from "@/utils/deped-eclass-record";
import { exportFullECRToExcel } from "@/utils/export-ecr-excel";
// Removed direct XLSX import

interface StudentRecord {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE";
  studentNumber: string;
}

const MOCK_STUDENTS: StudentRecord[] = [
  { id: "1", name: "Dela Cruz, Juan", gender: "MALE", studentNumber: "2026-0001" },
  { id: "2", name: "Santos, Pedro", gender: "MALE", studentNumber: "2026-0002" },
  { id: "3", name: "Reyes, Mateo", gender: "MALE", studentNumber: "2026-0003" },
  { id: "4", name: "Alvarez, Maria", gender: "FEMALE", studentNumber: "2026-0004" },
  { id: "5", name: "Garcia, Ana", gender: "FEMALE", studentNumber: "2026-0005" },
];

export function DepEdECRTable() {
  const [activeTab, setActiveTab] = useState<"input" | "term1" | "term2" | "term3" | "final" | "helper">("input");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [leftLogo, setLeftLogo] = useState("/deped-seal.png");
  const [rightLogo, setRightLogo] = useState("/deped-logo.png");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "left" | "right") => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      if (side === "left") setLeftLogo(url);
      else setRightLogo(url);
    }
  };

  // School & Class Information (INPUT DATA tab state)
  const [schoolInfo, setSchoolInfo] = useState({
    region: "REGION IV-A CALABARZON",
    division: "CAVITE",
    schoolId: "11111111",
    schoolName: "SmartSchool International Academy",
    schoolYear: "2025-2026",
    schoolHead: "Dr. Maria Santos, PhD",
    teacher: "Ricardo Santos",
    subject: "EPP / Technology and Livelihood Education",
    gradeLevel: "GRADE 10",
    section: "Section A - Emerald",
  });

  // Highest Possible Scores (HPS)
  const [wwHPS, setWwHPS] = useState<number[]>([20, 20, 20, 20, 20]);
  const [ptHPS, setPtHPS] = useState<number[]>([50, 50, 50]);
  const [examHPS, setExamHPS] = useState<number[]>([30, 30, 40]);

  // Scores State per term & student
  const [term1Scores, setTerm1Scores] = useState<Record<string, { ww: number[]; pt: number[]; ex: number[] }>>({
    "1": { ww: [18, 17, 19, 20, 18], pt: [45, 48, 46], ex: [27, 26, 36] },
    "2": { ww: [15, 14, 16, 18, 15], pt: [40, 42, 41], ex: [24, 25, 32] },
    "3": { ww: [19, 20, 20, 19, 20], pt: [49, 50, 48], ex: [29, 28, 38] },
    "4": { ww: [17, 18, 18, 19, 17], pt: [44, 46, 45], ex: [26, 27, 35] },
    "5": { ww: [16, 15, 17, 16, 18], pt: [42, 43, 44], ex: [25, 24, 34] },
  });

  const [term2Scores, setTerm2Scores] = useState<Record<string, { ww: number[]; pt: number[]; ex: number[] }>>({
    "1": { ww: [19, 18, 20, 19, 19], pt: [47, 49, 48], ex: [28, 27, 37] },
    "2": { ww: [16, 15, 17, 16, 16], pt: [41, 43, 42], ex: [25, 24, 33] },
    "3": { ww: [20, 20, 19, 20, 20], pt: [50, 49, 50], ex: [30, 29, 39] },
    "4": { ww: [18, 19, 17, 18, 19], pt: [46, 45, 47], ex: [27, 28, 36] },
    "5": { ww: [17, 16, 18, 17, 17], pt: [43, 44, 45], ex: [26, 25, 35] },
  });

  const [term3Scores, setTerm3Scores] = useState<Record<string, { ww: number[]; pt: number[]; ex: number[] }>>({
    "1": { ww: [20, 19, 19, 20, 20], pt: [48, 50, 49], ex: [29, 28, 38] },
    "2": { ww: [17, 16, 18, 17, 18], pt: [43, 44, 43], ex: [26, 25, 34] },
    "3": { ww: [20, 20, 20, 20, 20], pt: [50, 50, 50], ex: [30, 30, 40] },
    "4": { ww: [19, 18, 19, 19, 18], pt: [47, 46, 48], ex: [28, 27, 37] },
    "5": { ww: [18, 17, 18, 18, 19], pt: [44, 45, 46], ex: [27, 26, 36] },
  });

  const handleScoreChange = (
    term: "term1" | "term2" | "term3",
    studentId: string,
    category: "ww" | "pt" | "ex",
    index: number,
    value: string
  ) => {
    const num = Math.max(0, Number(value) || 0);
    const setScores = term === "term1" ? setTerm1Scores : term === "term2" ? setTerm2Scores : setTerm3Scores;

    setScores((prev) => {
      const current = prev[studentId] || { ww: [0, 0, 0, 0, 0], pt: [0, 0, 0], ex: [0, 0, 0] };
      const updatedCategory = [...current[category]];
      updatedCategory[index] = num;
      return {
        ...prev,
        [studentId]: {
          ...current,
          [category]: updatedCategory,
        },
      };
    });
  };

  const computeStudentTerm = (studentId: string, term: "term1" | "term2" | "term3") => {
    const scores = (term === "term1" ? term1Scores : term === "term2" ? term2Scores : term3Scores)[studentId] || {
      ww: [0, 0, 0, 0, 0],
      pt: [0, 0, 0],
      ex: [0, 0, 0],
    };

    return calculateTermGrade({
      writtenWorks: scores.ww,
      writtenWorksHPS: wwHPS,
      performanceTasks: scores.pt,
      performanceTasksHPS: ptHPS,
      examScores: scores.ex,
      examHPS: examHPS,
    });
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    await exportFullECRToExcel(
      schoolInfo,
      MOCK_STUDENTS,
      term1Scores,
      term2Scores,
      term3Scores,
      wwHPS,
      ptHPS,
      examHPS
    );
  };

  return (
    <div className="bg-card border rounded-3xl shadow-sm overflow-hidden flex flex-col space-y-4 p-6 print:p-0 print:border-none print:shadow-none">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 5mm; }
          .print\\:zoom-fit {
             zoom: 0.52;
          }
          @-moz-document url-prefix() {
             .print\\:zoom-fit {
                transform: scale(0.52);
                transform-origin: top left;
             }
          }
        }
      `}} />
      {/* DepEd Banner Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">DepEd Input Data Sheet for E-Class Record</h2>
            <p className="text-xs text-muted-foreground">
              Official DepEd Electronic Class Record (ECR) for EPP / TLE (Grades 2-10)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border bg-background hover:bg-muted transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border bg-background hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4 text-slate-600" /> Print
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            {saveSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saveSuccess ? "Saved!" : "Save ECR"}
          </button>
        </div>
      </div>

      {/* Tabs Navigation matching user screenshot */}
      <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl text-xs font-bold text-white overflow-x-auto">
        <button
          onClick={() => setActiveTab("input")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "input" ? "bg-blue-600 text-white shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          INPUT DATA
        </button>
        <button
          onClick={() => setActiveTab("term1")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "term1" ? "bg-amber-500 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          TERM 1
        </button>
        <button
          onClick={() => setActiveTab("term2")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "term2" ? "bg-amber-500 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          TERM 2
        </button>
        <button
          onClick={() => setActiveTab("term3")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "term3" ? "bg-yellow-400 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          TERM 3
        </button>
        <button
          onClick={() => setActiveTab("final")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "final" ? "bg-emerald-600 text-white shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          FINAL GRADES
        </button>
        <button
          onClick={() => setActiveTab("helper")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "helper" ? "bg-red-600 text-white shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          HELPER
        </button>
      </div>

      {/* Tab 1: INPUT DATA */}
      <div className={`${activeTab === "input" ? "block" : "hidden print:block"} print:page-break-after-always print:mb-8`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Left Column: School & Teacher Info */}
          <div className="space-y-6">
            <div className="border rounded-2xl p-4 bg-slate-900 text-white space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                SCHOOL INFORMATION
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400">REGION</label>
                  <input
                    type="text"
                    value={schoolInfo.region}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, region: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">DIVISION</label>
                  <input
                    type="text"
                    value={schoolInfo.division}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, division: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">SCHOOL ID</label>
                  <input
                    type="text"
                    value={schoolInfo.schoolId}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">SCHOOL NAME</label>
                  <input
                    type="text"
                    value={schoolInfo.schoolName}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">SCHOOL YEAR</label>
                  <input
                    type="text"
                    value={schoolInfo.schoolYear}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolYear: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-2xl p-4 bg-slate-900 text-white space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                TEACHER & CLASS SECTION
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400">SUBJECT TEACHER</label>
                  <input
                    type="text"
                    value={schoolInfo.teacher}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, teacher: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">SUBJECT</label>
                  <input
                    type="text"
                    value={schoolInfo.subject}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">GRADE LEVEL</label>
                  <input
                    type="text"
                    value={schoolInfo.gradeLevel}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, gradeLevel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">SECTION</label>
                  <input
                    type="text"
                    value={schoolInfo.section}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, section: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle & Right Column: Learners' Names */}
          <div className="md:col-span-2 border rounded-2xl p-5 bg-card space-y-4">
            <h3 className="text-sm font-bold flex items-center justify-between border-b pb-3">
              <span className="flex items-center gap-2"><User className="h-4 w-4 text-blue-600" /> LEARNERS' NAMES REGISTRATION</span>
              <span className="text-xs text-muted-foreground font-normal">Registered: {MOCK_STUDENTS.length} Learners</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Male Students */}
              <div className="space-y-2 border rounded-xl p-3 bg-muted/20">
                <h4 className="font-extrabold text-blue-600 border-b pb-1 uppercase">MALE LEARNERS</h4>
                {MOCK_STUDENTS.filter(s => s.gender === "MALE").map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2 py-1">
                    <span className="w-5 text-muted-foreground font-mono font-bold">{idx + 1}.</span>
                    <input
                      type="text"
                      value={s.name}
                      readOnly
                      className="w-full h-8 px-2 rounded border bg-background font-medium"
                    />
                  </div>
                ))}
              </div>

              {/* Female Students */}
              <div className="space-y-2 border rounded-xl p-3 bg-muted/20">
                <h4 className="font-extrabold text-pink-600 border-b pb-1 uppercase">FEMALE LEARNERS</h4>
                {MOCK_STUDENTS.filter(s => s.gender === "FEMALE").map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2 py-1">
                    <span className="w-5 text-muted-foreground font-mono font-bold">{idx + 1}.</span>
                    <input
                      type="text"
                      value={s.name}
                      readOnly
                      className="w-full h-8 px-2 rounded border bg-background font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs 2, 3, 4: TERM 1, TERM 2, TERM 3 Records */}
      {(["term1", "term2", "term3"] as const).map(termKey => (
        <div key={termKey} className={`${activeTab === termKey ? "block" : "hidden print:block"} overflow-x-auto print:overflow-visible border rounded-2xl print:border-none print:shadow-none print:break-inside-avoid print:break-after-page print:mb-8`}>
          <div className="min-w-max print:zoom-fit">
            {/* Official DepEd Header Banner inside the table container */}
            <div className="p-4 bg-card text-card-foreground border-b border-border space-y-4 print:bg-white print:text-black">
            {/* Top row with Logos and Class Record Title */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer group relative" title="Click to change left logo">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'left')} />
                  <img src={leftLogo} alt="Left Logo" className="h-28 w-28 object-contain dark:brightness-200 print:brightness-100 group-hover:opacity-80 transition-opacity" />
                </label>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-wider uppercase text-foreground print:text-slate-900">
                  CLASS RECORD - {termKey === "term1" ? "TERM 1" : termKey === "term2" ? "TERM 2" : "THIRD TERM"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer group relative" title="Click to change right logo">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'right')} />
                  <img src={rightLogo} alt="Right Logo" className="h-24 object-contain dark:brightness-150 print:brightness-100 group-hover:opacity-80 transition-opacity" />
                </label>
              </div>
            </div>

            {/* Middle row: Metadata inputs grid with spreadsheet cell boxes matching DepEd template */}
            <div className="space-y-2 text-xs font-extrabold uppercase pt-1">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-black">REGION</span>
                  <input
                    type="text"
                    value={schoolInfo.region}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, region: e.target.value })}
                    className="w-56 border border-slate-900 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-foreground rounded-none shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-black">DIVISION</span>
                  <input
                    type="text"
                    value={schoolInfo.division}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, division: e.target.value })}
                    className="w-56 border border-slate-900 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-foreground rounded-none shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-black">SCHOOL ID</span>
                  <input
                    type="text"
                    value={schoolInfo.schoolId}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolId: e.target.value })}
                    className="w-36 border border-slate-900 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-foreground rounded-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 flex-1 max-w-2xl">
                  <span className="text-foreground font-black whitespace-nowrap">SCHOOL NAME</span>
                  <input
                    type="text"
                    value={schoolInfo.schoolName}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                    className="w-full border border-slate-900 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 px-3 py-0.5 text-center text-xs font-bold text-foreground rounded-none shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-black whitespace-nowrap">SCHOOL YEAR</span>
                  <input
                    type="text"
                    value={schoolInfo.schoolYear}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolYear: e.target.value })}
                    className="w-36 border border-slate-900 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-foreground rounded-none shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Solid Dark Blue Divider Bar */}
          <div className="h-4 bg-[#002060] dark:bg-[#001030] w-full border-t-2 border-b-2 border-slate-900 dark:border-slate-700" />

          <table className="w-full text-xs text-center border-collapse border border-slate-900 dark:border-slate-700 border-2">
            <thead>
              {/* Row 1: Term Title, Grade Level, Teacher, Subject & Final Grade Totals */}
              <tr className="bg-card text-foreground font-bold text-xs uppercase border-b-2 border-slate-900 dark:border-slate-700">
                <th rowSpan={3} className="border-2 border-slate-900 dark:border-slate-700 p-2 min-w-[200px] max-w-[220px] bg-slate-100 dark:bg-slate-900 text-slate-950 dark:text-slate-100 align-middle">
                  <div className="text-2xl font-black tracking-wider text-slate-950 dark:text-slate-100 uppercase">
                    {termKey === "term1" ? "FIRST TERM" : termKey === "term2" ? "SECOND TERM" : "THIRD TERM"}
                  </div>
                </th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-left bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100 font-black text-[11px] whitespace-nowrap">GRADE LEVEL</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1.5 font-mono bg-card text-foreground font-bold text-center text-xs whitespace-nowrap">{schoolInfo.gradeLevel}</th>
                <th rowSpan={2} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-center w-24 bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100 font-black text-[11px] align-middle">TEACHER</th>
                <th rowSpan={2} colSpan={9} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-center bg-card text-foreground font-bold align-middle text-xs uppercase">{schoolInfo.teacher}</th>
                <th rowSpan={2} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-center w-24 bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100 font-black text-[11px] align-middle">SUBJECT</th>
                <th rowSpan={2} colSpan={9} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-center bg-card text-foreground font-bold align-middle text-xs uppercase">{schoolInfo.subject}</th>
                <th rowSpan={5} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100 font-black align-middle w-16 text-xs leading-tight">Initial<br/>Grade</th>
                <th rowSpan={5} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100 font-black align-middle w-16 text-xs leading-tight">Term<br/>Grade</th>
                <th rowSpan={5} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100 font-black align-middle w-24 text-xs">Descriptor</th>
              </tr>

              {/* Row 2: Section Row */}
              <tr className="bg-card text-foreground font-bold text-xs uppercase border-b-2 border-slate-900 dark:border-slate-700">
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-left bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100 font-black text-[11px] whitespace-nowrap">SECTION</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1.5 font-mono bg-card text-foreground font-bold text-center text-xs whitespace-nowrap">{schoolInfo.section}</th>
              </tr>

              {/* Row 3: Component Categories Banner Row */}
              <tr className="bg-card text-foreground font-black uppercase text-[11px] border-b-2 border-slate-900 dark:border-slate-700">
                <th colSpan={8} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-center bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100">
                  WRITTEN / ORAL WORKS (WWs)
                </th>
                <th colSpan={6} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-center bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100">
                  PRODUCT / PERFORMANCE TASKS (PTs)
                </th>
                <th colSpan={8} className="border-2 border-slate-900 dark:border-slate-700 p-1.5 text-center bg-[#f2f2f2] dark:bg-slate-800 text-slate-950 dark:text-slate-100">
                  EXAMINATIONS (EXs)
                </th>
              </tr>

              {/* Row 4: Sub-columns Header Row */}
              <tr className="bg-card text-foreground text-[10px] font-black text-center border-b-2 border-slate-900 dark:border-slate-700">
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#f2f2f2] dark:bg-slate-900"></th>
                {/* WW items 1-5 */}
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-7">1</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-7">2</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-7">3</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-7">4</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-7">5</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-extrabold w-9">Total</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-extrabold w-9">PS</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-black w-9">WS</th>

                {/* PT items 1-3 */}
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-8">1</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-8">2</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-8">3</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-extrabold w-9">Total</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-extrabold w-9">PS</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-black w-9">WS</th>

                {/* EX items */}
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-8">ST1</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-8">ST2</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-[#d9e1f2] dark:bg-blue-950 text-slate-950 dark:text-blue-200 font-extrabold w-8">TE</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-extrabold text-[9px] w-10">WS ST1</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-extrabold text-[9px] w-10">WS ST2</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-extrabold text-[9px] w-10">WS TE</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-extrabold w-9">PS</th>
                <th className="border-2 border-slate-900 dark:border-slate-700 p-1 bg-card text-foreground font-black w-9">WS</th>
              </tr>

              {/* Row 5: Highest Possible Score (HPS) Row */}
              <tr className="bg-card text-foreground font-black text-[10px] text-center border-b-2 border-slate-900 dark:border-slate-700">
                <td className="border-2 border-slate-900 dark:border-slate-700 p-1 text-right text-foreground uppercase italic font-black">HIGHEST POSSIBLE SCORE</td>
                {/* WW HPS */}
                {wwHPS.map((val, idx) => (
                  <td key={`hps-ww-${idx}`} className="border-2 border-slate-900 dark:border-slate-700 p-0.5 bg-card">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => {
                        const newHPS = [...wwHPS];
                        newHPS[idx] = Number(e.target.value) || 0;
                        setWwHPS(newHPS);
                      }}
                      className="w-7 h-5 text-center border-none bg-transparent text-foreground font-semibold text-[10px]"
                    />
                  </td>
                ))}
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono bg-card text-foreground font-bold">100</td>
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono font-bold bg-card text-foreground">100</td>
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-black bg-card text-foreground">20%</td>

                {/* PT HPS */}
                {ptHPS.map((val, idx) => (
                  <td key={`hps-pt-${idx}`} className="border-2 border-slate-900 dark:border-slate-700 p-0.5 bg-card">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => {
                        const newHPS = [...ptHPS];
                        newHPS[idx] = Number(e.target.value) || 0;
                        setPtHPS(newHPS);
                      }}
                      className="w-8 h-5 text-center border-none bg-transparent text-foreground font-semibold text-[10px]"
                    />
                  </td>
                ))}
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono bg-card text-foreground font-bold">100</td>
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono font-bold bg-card text-foreground">100</td>
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-black bg-card text-foreground">60%</td>

                {/* EX HPS */}
                {examHPS.map((val, idx) => (
                  <td key={`hps-ex-${idx}`} className="border-2 border-slate-900 dark:border-slate-700 p-0.5 bg-card">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => {
                        const newHPS = [...examHPS];
                        newHPS[idx] = Number(e.target.value) || 0;
                        setExamHPS(newHPS);
                      }}
                      className="w-8 h-5 text-center border-none bg-transparent text-foreground font-semibold text-[10px]"
                    />
                  </td>
                ))}
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono text-[9px] text-foreground font-bold bg-card">30</td>
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono text-[9px] text-foreground font-bold bg-card">30</td>
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono text-[9px] text-foreground font-bold bg-card">40</td>
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono font-bold bg-card text-foreground">100</td>
                <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-black bg-card text-foreground">20%</td>
              </tr>

              {/* Row 6: Solid Dark Blue Header Row for LEARNERS' NAMES */}
              <tr className="bg-[#002060] dark:bg-[#001030] text-white font-black text-xs uppercase tracking-wider text-left border-b-2 border-slate-900 dark:border-slate-700">
                <th colSpan={26} className="p-2 pl-3">
                  LEARNERS' NAMES
                </th>
              </tr>
            </thead>
            <tbody>
              {(["MALE", "FEMALE"] as const).map((genderGroup) => {
                const studentsInGroup = MOCK_STUDENTS.filter((s) => s.gender === genderGroup);
                if (studentsInGroup.length === 0) return null;

                return (
                  <React.Fragment key={genderGroup}>
                    {/* Gender Divider Row */}
                    <tr className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase text-[11px] border-b-2 border-slate-900 dark:border-slate-700">
                      <td className="border-2 border-slate-900 dark:border-slate-700 p-1 px-2 text-left bg-slate-300 dark:bg-slate-900">
                        {genderGroup}
                      </td>
                      <td colSpan={25} className="border-2 border-slate-900 dark:border-slate-700 bg-slate-200 dark:bg-slate-800"></td>
                    </tr>

                    {studentsInGroup.map((student, idx) => {
                      const termCalc = computeStudentTerm(student.id, termKey);
                      const currentScores = (
                        termKey === "term1" ? term1Scores : termKey === "term2" ? term2Scores : term3Scores
                      )[student.id] || { ww: [0, 0, 0, 0, 0], pt: [0, 0, 0], ex: [0, 0, 0] };

                      return (
                        <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-1 px-2 text-left font-semibold text-[11px] text-foreground bg-card whitespace-nowrap">
                            {idx + 1}. {student.name}
                          </td>
                          {/* WW inputs */}
                          {currentScores.ww.map((score, i) => (
                            <td key={`ww-${i}`} className="border-2 border-slate-900 dark:border-slate-700 p-1">
                              <input
                                type="number"
                                value={score}
                                onChange={(e) => handleScoreChange(termKey, student.id, "ww", i, e.target.value)}
                                className="w-10 h-7 text-center rounded-none border border-transparent bg-transparent text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-blue-500 print:border-none print:bg-transparent font-medium"
                              />
                            </td>
                          ))}
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-1 font-bold text-foreground bg-card">{currentScores.ww.reduce((a, b) => a + b, 0)}</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-1 text-muted-foreground font-mono">{termCalc.wwPS}%</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-1 font-bold text-foreground dark:text-slate-200 bg-[#f2f2f2] dark:bg-slate-800/50 font-mono">{termCalc.wwWS}</td>

                          {/* PT inputs */}
                          {currentScores.pt.map((score, i) => (
                            <td key={`pt-${i}`} className="border-2 border-slate-900 dark:border-slate-700 p-1">
                              <input
                                type="number"
                                value={score}
                                onChange={(e) => handleScoreChange(termKey, student.id, "pt", i, e.target.value)}
                                className="w-10 h-7 text-center rounded-none border border-transparent bg-transparent text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-emerald-500 print:border-none print:bg-transparent font-medium"
                              />
                            </td>
                          ))}
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-1 font-bold text-foreground bg-card">{currentScores.pt.reduce((a, b) => a + b, 0)}</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-1 text-muted-foreground font-mono">{termCalc.ptPS}%</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-1 font-bold text-foreground dark:text-slate-200 bg-[#f2f2f2] dark:bg-slate-800/50 font-mono">{termCalc.ptWS}</td>

                          {/* EX inputs */}
                          {currentScores.ex.map((score, i) => (
                            <td key={`ex-${i}`} className="border-2 border-slate-900 dark:border-slate-700 p-0.5">
                              <input
                                type="number"
                                value={score}
                                onChange={(e) => handleScoreChange(termKey, student.id, "ex", i, e.target.value)}
                                className="w-8 h-6 text-center rounded-none border border-transparent bg-transparent text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-amber-500 print:border-none print:bg-transparent text-[11px] font-medium"
                              />
                            </td>
                          ))}
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono text-[10px] text-muted-foreground">
                            {Number(((currentScores.ex[0] / (examHPS[0] || 30)) * 100 * 0.05).toFixed(1))}
                          </td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono text-[10px] text-muted-foreground">
                            {Number(((currentScores.ex[1] / (examHPS[1] || 30)) * 100 * 0.05).toFixed(1))}
                          </td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-mono text-[10px] text-muted-foreground">
                            {Number(((currentScores.ex[2] / (examHPS[2] || 40)) * 100 * 0.10).toFixed(1))}
                          </td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 text-muted-foreground font-mono">{termCalc.exPS}%</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-bold text-foreground dark:text-slate-200 bg-[#f2f2f2] dark:bg-slate-800/50 font-mono">{termCalc.exWS}</td>

                          {/* Totals & Transmuted */}
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-semibold font-mono text-[11px] text-foreground bg-[#d9e1f2] dark:bg-blue-950">{termCalc.initialGrade}</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-0.5 font-black text-foreground dark:text-white bg-[#d9e1f2] dark:bg-blue-950 text-[11px] font-mono">
                            {termCalc.transmutedGrade}
                          </td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-1 text-[11px] font-medium text-foreground">{termCalc.descriptor}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      ))}

      {/* Tab 5: FINAL GRADES SUMMARY */}
      <div className={`${activeTab === "final" ? "block" : "hidden print:block"} overflow-x-auto print:overflow-visible border rounded-2xl print:border-none print:shadow-none print:break-inside-avoid print:break-before-page print:mt-8`}>
        <div className="min-w-max print:zoom-fit">
          {/* Header Card in Print View */}
          <div className="hidden print:flex items-center justify-between p-4 border-b bg-white text-black">
            <div className="flex items-center gap-3">
              <img src="/deped-seal.svg" alt="DepEd Seal" className="h-14 w-14 object-contain" />
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase">CLASS RECORD - FINAL GRADES</h1>
                <p className="text-xs text-slate-600 font-semibold">{schoolInfo.schoolName} ({schoolInfo.schoolYear})</p>
              </div>
            </div>
            <div className="text-right text-xs space-y-0.5 font-medium">
              <div><strong>Region:</strong> {schoolInfo.region} | <strong>Division:</strong> {schoolInfo.division}</div>
              <div><strong>Subject:</strong> {schoolInfo.subject} | <strong>Teacher:</strong> {schoolInfo.teacher}</div>
              <div><strong>Grade & Section:</strong> {schoolInfo.gradeLevel} - {schoolInfo.section}</div>
            </div>
            <img src="/deped-logo.svg" alt="DepEd Logo" className="h-12 object-contain" />
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-900 font-bold uppercase text-[11px]">
              <tr>
                <th className="border p-3">Learners' Names</th>
                <th className="border p-3 text-center">Gender</th>
                <th className="border p-3 text-center">Term 1</th>
                <th className="border p-3 text-center">Term 2</th>
                <th className="border p-3 text-center">Term 3</th>
                <th className="border p-3 text-center bg-blue-600 text-white font-black text-sm">Final Grade</th>
                <th className="border p-3 text-center">Descriptor</th>
                <th className="border p-3 text-center">Remark</th>
              </tr>
            </thead>
            <tbody>
              {(["MALE", "FEMALE"] as const).map((genderGroup) => {
                const studentsInGroup = MOCK_STUDENTS.filter((s) => s.gender === genderGroup);
                if (studentsInGroup.length === 0) return null;

                return (
                  <React.Fragment key={genderGroup}>
                    {/* Gender Divider Row */}
                    <tr className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase text-[11px] border-b-2 border-slate-900 dark:border-slate-700">
                      <td className="border-2 border-slate-900 dark:border-slate-700 p-2 px-3 text-left bg-slate-300 dark:bg-slate-900">
                        {genderGroup}
                      </td>
                      <td colSpan={7} className="border-2 border-slate-900 dark:border-slate-700 bg-slate-200 dark:bg-slate-800"></td>
                    </tr>

                    {studentsInGroup.map((student, idx) => {
                      const t1 = computeStudentTerm(student.id, "term1").transmutedGrade;
                      const t2 = computeStudentTerm(student.id, "term2").transmutedGrade;
                      const t3 = computeStudentTerm(student.id, "term3").transmutedGrade;
                      const final = calculateFinalGrade3Terms(t1, t2, t3);

                      return (
                        <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-2 font-semibold bg-card">
                            {idx + 1}. {student.name}
                          </td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-2 text-center font-medium text-slate-500">{student.gender}</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-2 text-center font-bold text-slate-700 dark:text-slate-300">{t1}</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-2 text-center font-bold text-slate-700 dark:text-slate-300">{t2}</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-2 text-center font-bold text-slate-700 dark:text-slate-300">{t3}</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-2 text-center font-black text-base text-blue-600 bg-blue-50/50 dark:bg-blue-950/30">
                            {final.finalGrade}
                          </td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-2 text-center font-semibold">{final.descriptor}</td>
                          <td className="border-2 border-slate-900 dark:border-slate-700 p-2 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                final.remark === "PASSED"
                                  ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20"
                                  : "bg-red-500/15 text-red-600 border border-red-500/20"
                              }`}
                            >
                              {final.remark}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tab 6: HELPER (Official Transmutation Table & Descriptors) */}
      <div className={`${activeTab === "helper" ? "block" : "hidden print:block"} space-y-6 py-2 print:break-before-page print:mt-8`}>
          <div className="p-4 bg-red-600 text-white rounded-2xl flex items-center justify-between shadow-md print:border-none print:shadow-none">
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">HELPER</h3>
              <p className="text-xs font-bold text-red-100 uppercase tracking-widest mt-0.5">
                IMPORTANT / DO NOT DELETE — DepEd Order No. 8, s. 2015 Official Reference Table
              </p>
            </div>
            <div className="bg-white/20 text-white font-mono text-xs px-3 py-1.5 rounded-xl font-bold backdrop-blur-sm">
              Official DepEd Matrix
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            {/* 1. Transmutation Table (Left Column) */}
            <div className="lg:col-span-6 border rounded-2xl p-4 bg-card shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-foreground flex items-center">
                  <Award className="mr-2 h-4 w-4 text-primary" />
                  TRANSMUTATION TABLE
                </h4>
                <span className="text-[11px] font-semibold text-muted-foreground">Initial Grade (IG) → Transmuted Grade</span>
              </div>
              <div className="max-h-[580px] overflow-y-auto pr-1 border rounded-xl">
                <table className="w-full text-center border-collapse text-xs">
                  <thead className="bg-red-600 text-white font-bold sticky top-0 z-10">
                    <tr>
                      <th className="border-r border-red-500 p-2">IG (Min.)</th>
                      <th className="border-r border-red-500 p-2">IG (Max.)</th>
                      <th className="p-2 bg-red-700 font-extrabold">Transmuted Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    <tr className="bg-primary/5 font-bold"><td className="p-1.5 border-r">99.50</td><td className="p-1.5 border-r">100.00</td><td className="p-1.5 text-primary font-bold">100</td></tr>
                    <tr><td className="p-1.5 border-r">98.32</td><td className="p-1.5 border-r">99.49</td><td className="p-1.5 font-bold">99</td></tr>
                    <tr><td className="p-1.5 border-r">97.14</td><td className="p-1.5 border-r">98.31</td><td className="p-1.5 font-bold">98</td></tr>
                    <tr><td className="p-1.5 border-r">95.96</td><td className="p-1.5 border-r">97.13</td><td className="p-1.5 font-bold">97</td></tr>
                    <tr><td className="p-1.5 border-r">94.78</td><td className="p-1.5 border-r">95.95</td><td className="p-1.5 font-bold">96</td></tr>
                    <tr><td className="p-1.5 border-r">93.60</td><td className="p-1.5 border-r">94.77</td><td className="p-1.5 font-bold">95</td></tr>
                    <tr><td className="p-1.5 border-r">92.42</td><td className="p-1.5 border-r">93.59</td><td className="p-1.5 font-bold">94</td></tr>
                    <tr><td className="p-1.5 border-r">91.24</td><td className="p-1.5 border-r">92.41</td><td className="p-1.5 font-bold">93</td></tr>
                    <tr><td className="p-1.5 border-r">90.06</td><td className="p-1.5 border-r">91.23</td><td className="p-1.5 font-bold">92</td></tr>
                    <tr><td className="p-1.5 border-r">88.88</td><td className="p-1.5 border-r">90.05</td><td className="p-1.5 font-bold">91</td></tr>
                    <tr><td className="p-1.5 border-r">87.70</td><td className="p-1.5 border-r">88.87</td><td className="p-1.5 font-bold">90</td></tr>
                    <tr><td className="p-1.5 border-r">86.52</td><td className="p-1.5 border-r">87.69</td><td className="p-1.5 font-bold">89</td></tr>
                    <tr><td className="p-1.5 border-r">85.34</td><td className="p-1.5 border-r">86.51</td><td className="p-1.5 font-bold">88</td></tr>
                    <tr><td className="p-1.5 border-r">84.16</td><td className="p-1.5 border-r">85.33</td><td className="p-1.5 font-bold">87</td></tr>
                    <tr><td className="p-1.5 border-r">82.98</td><td className="p-1.5 border-r">84.15</td><td className="p-1.5 font-bold">86</td></tr>
                    <tr><td className="p-1.5 border-r">81.80</td><td className="p-1.5 border-r">82.97</td><td className="p-1.5 font-bold">85</td></tr>
                    <tr><td className="p-1.5 border-r">80.62</td><td className="p-1.5 border-r">81.79</td><td className="p-1.5 font-bold">84</td></tr>
                    <tr><td className="p-1.5 border-r">79.44</td><td className="p-1.5 border-r">80.61</td><td className="p-1.5 font-bold">83</td></tr>
                    <tr><td className="p-1.5 border-r">78.26</td><td className="p-1.5 border-r">79.43</td><td className="p-1.5 font-bold">82</td></tr>
                    <tr><td className="p-1.5 border-r">77.08</td><td className="p-1.5 border-r">78.25</td><td className="p-1.5 font-bold">81</td></tr>
                    <tr><td className="p-1.5 border-r">75.90</td><td className="p-1.5 border-r">77.07</td><td className="p-1.5 font-bold">80</td></tr>
                    <tr><td className="p-1.5 border-r">74.72</td><td className="p-1.5 border-r">75.89</td><td className="p-1.5 font-bold">79</td></tr>
                    <tr><td className="p-1.5 border-r">73.54</td><td className="p-1.5 border-r">74.71</td><td className="p-1.5 font-bold">78</td></tr>
                    <tr><td className="p-1.5 border-r">72.36</td><td className="p-1.5 border-r">73.53</td><td className="p-1.5 font-bold">77</td></tr>
                    <tr><td className="p-1.5 border-r">71.18</td><td className="p-1.5 border-r">72.35</td><td className="p-1.5 font-bold">76</td></tr>
                    <tr className="bg-emerald-500/10 font-bold border-y-2 border-emerald-500">
                      <td className="p-1.5 border-r text-emerald-600">70.00</td>
                      <td className="p-1.5 border-r text-emerald-600">71.17</td>
                      <td className="p-1.5 text-emerald-600 font-extrabold">75 (Passing Threshold)</td>
                    </tr>
                    <tr><td className="p-1.5 border-r">65.34</td><td className="p-1.5 border-r">69.99</td><td className="p-1.5 font-bold">74</td></tr>
                    <tr><td className="p-1.5 border-r">60.67</td><td className="p-1.5 border-r">65.33</td><td className="p-1.5 font-bold">73</td></tr>
                    <tr><td className="p-1.5 border-r">56.01</td><td className="p-1.5 border-r">60.66</td><td className="p-1.5 font-bold">72</td></tr>
                    <tr><td className="p-1.5 border-r">51.34</td><td className="p-1.5 border-r">56.00</td><td className="p-1.5 font-bold">71</td></tr>
                    <tr><td className="p-1.5 border-r">46.67</td><td className="p-1.5 border-r">51.33</td><td className="p-1.5 font-bold">70</td></tr>
                    <tr><td className="p-1.5 border-r">42.01</td><td className="p-1.5 border-r">46.66</td><td className="p-1.5 font-bold">69</td></tr>
                    <tr><td className="p-1.5 border-r">37.34</td><td className="p-1.5 border-r">42.00</td><td className="p-1.5 font-bold">68</td></tr>
                    <tr><td className="p-1.5 border-r">32.68</td><td className="p-1.5 border-r">37.33</td><td className="p-1.5 font-bold">67</td></tr>
                    <tr><td className="p-1.5 border-r">28.01</td><td className="p-1.5 border-r">32.67</td><td className="p-1.5 font-bold">66</td></tr>
                    <tr><td className="p-1.5 border-r">23.35</td><td className="p-1.5 border-r">28.00</td><td className="p-1.5 font-bold">65</td></tr>
                    <tr><td className="p-1.5 border-r">18.68</td><td className="p-1.5 border-r">23.34</td><td className="p-1.5 font-bold">64</td></tr>
                    <tr><td className="p-1.5 border-r">14.01</td><td className="p-1.5 border-r">18.67</td><td className="p-1.5 font-bold">63</td></tr>
                    <tr><td className="p-1.5 border-r">9.35</td><td className="p-1.5 border-r">14.00</td><td className="p-1.5 font-bold">62</td></tr>
                    <tr><td className="p-1.5 border-r">4.68</td><td className="p-1.5 border-r">9.34</td><td className="p-1.5 font-bold">61</td></tr>
                    <tr className="bg-red-500/10 font-bold text-red-600">
                      <td className="p-1.5 border-r">0.00</td>
                      <td className="p-1.5 border-r">4.67</td>
                      <td className="p-1.5 font-extrabold">60</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Descriptors Reference Table (Right Column) */}
            <div className="lg:col-span-6 border rounded-2xl p-4 bg-card shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-foreground flex items-center">
                  <Info className="mr-2 h-4 w-4 text-blue-600" />
                  DESCRIPTOR REFERENCE TABLE
                </h4>
                <span className="text-[11px] font-semibold text-muted-foreground">DepEd Interpretation Matrix</span>
              </div>

              <div className="overflow-x-auto border rounded-xl max-h-[580px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-blue-900 text-white font-bold sticky top-0 z-10">
                    <tr>
                      <th className="border-r border-blue-800 p-2 text-center w-28">Numerical Grade</th>
                      <th className="border-r border-blue-800 p-2 w-32">Descriptor</th>
                      <th className="p-2">General Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    <tr className="bg-blue-50/50 dark:bg-blue-950/30 font-bold border-b-2 border-blue-200 dark:border-blue-800">
                      <td className="p-2 text-center text-blue-700 dark:text-blue-400 font-extrabold">90 - 100</td>
                      <td className="p-2 text-blue-700 dark:text-blue-400 font-extrabold">Advancing</td>
                      <td className="p-2 text-muted-foreground font-sans leading-snug">
                        Consistently demonstrates skills and understanding that meet or exceed standards with independence, flexibility, and depth.
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/50 dark:bg-emerald-950/30 font-bold border-b-2 border-emerald-200 dark:border-emerald-800">
                      <td className="p-2 text-center text-emerald-700 dark:text-emerald-400 font-extrabold">80 - 89</td>
                      <td className="p-2 text-emerald-700 dark:text-emerald-400 font-extrabold">Benchmarking</td>
                      <td className="p-2 text-muted-foreground font-sans leading-snug">
                        Demonstrates expected grade-level skills and understanding competently and independently.
                      </td>
                    </tr>
                    <tr className="bg-amber-50/50 dark:bg-amber-950/30 font-bold border-b-2 border-amber-200 dark:border-amber-800">
                      <td className="p-2 text-center text-amber-700 dark:text-amber-400 font-extrabold">75 - 79</td>
                      <td className="p-2 text-amber-700 dark:text-amber-400 font-extrabold">Connecting</td>
                      <td className="p-2 text-muted-foreground font-sans leading-snug">
                        Demonstrates sufficient understanding and application of grade-level standards with support.
                      </td>
                    </tr>
                    <tr className="bg-purple-50/50 dark:bg-purple-950/30 font-bold border-b-2 border-purple-200 dark:border-purple-800">
                      <td className="p-2 text-center text-purple-700 dark:text-purple-400 font-extrabold">65 - 74</td>
                      <td className="p-2 text-purple-700 dark:text-purple-400 font-extrabold">Developing</td>
                      <td className="p-2 text-muted-foreground font-sans leading-snug">
                        Demonstrates partial understanding and inconsistent application of skills, requires targeted support and scaffolding.
                      </td>
                    </tr>
                    <tr className="bg-red-50/50 dark:bg-red-950/30 font-bold border-b-2 border-red-200 dark:border-red-800">
                      <td className="p-2 text-center text-red-700 dark:text-red-400 font-extrabold">60 - 64</td>
                      <td className="p-2 text-red-700 dark:text-red-400 font-extrabold">Emerging</td>
                      <td className="p-2 text-muted-foreground font-sans leading-snug">
                        Does not yet demonstrate foundational skills and understanding; requires intensive support.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

