"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  Printer,
  Save,
  User,
} from "lucide-react";
import {
  transmuteGrade,
  getDescriptor,
} from "@/utils/deped-eclass-record";
import { getSchoolSettings, updateSchoolSettings, uploadAssetFile } from "@/features/settings/settings.actions";

export interface CoreComponentScore {
  ww: number[];
  pt: number[];
  exST1: number;
  exST2: number;
  exTE: number;
}

export interface CoreHPS {
  wwHPS: number[];
  ptHPS: number[];
  exST1HPS: number;
  exST2HPS: number;
  exTEHPS: number;
}

export function DepEdECRTableCore({ students = [] }: { students?: any[] }) {
  const [activeTab, setActiveTab] = useState<
    "input" | "term1" | "term2" | "term3" | "final" | "helper"
  >("input");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [leftLogo, setLeftLogo] = useState("/deped-seal.png");
  const [rightLogo, setRightLogo] = useState("/deped-logo.svg");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("smartschool_school_settings");
      if (cached) {
        const p = JSON.parse(cached);
        if (p.rightLogoUrl) setRightLogo(p.rightLogoUrl);
        if (p.logoUrl) setLeftLogo(p.logoUrl);
        if (p.schoolName) setSchoolInfo((prev) => ({ ...prev, schoolName: p.schoolName }));
        if (p.principalName) setSchoolInfo((prev) => ({ ...prev, schoolHead: p.principalName }));
      }
    } catch (e) {}

    getSchoolSettings().then((data) => {
      if (data) {
        if (data.right_logo_url) setRightLogo(data.right_logo_url);
        if (data.logo_url) setLeftLogo(data.logo_url);
        if (data.name) setSchoolInfo((prev) => ({ ...prev, schoolName: data.name }));
        if (data.principal_name) setSchoolInfo((prev) => ({ ...prev, schoolHead: data.principal_name || prev.schoolHead }));
      }
    }).catch(() => {});
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "left" | "right") => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (side === "left") setLeftLogo(previewUrl);
      else setRightLogo(previewUrl);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prefix", side === "left" ? "school-logo" : "right-logo");
        const res = await uploadAssetFile(formData);
        if (res.success && res.url) {
          if (side === "left") {
            setLeftLogo(res.url);
            await updateSchoolSettings({ name: schoolInfo.schoolName, logo_url: res.url });
          } else {
            setRightLogo(res.url);
            await updateSchoolSettings({ name: schoolInfo.schoolName, right_logo_url: res.url });
          }
        }
      } catch (err) {}
    }
  };

  // Map only real enrolled students without blank padding
  const mappedStudents =
    students && students.length > 0
      ? students.map((s) => ({
          id: s.student.id,
          name: `${s.student.person.last_name}, ${s.student.person.first_name} ${
            s.student.person.middle_name || ""
          }`.trim(),
          gender: (s.student?.person?.gender?.toLowerCase() === "female" ? "Female" : "Male") as
            | "Male"
            | "Female",
          studentNumber: s.student.student_number || "",
        }))
      : [
          { id: "m-1", name: "Gamis, Wilbert A.", gender: "Male" as const, studentNumber: "2026-0001" },
          { id: "m-2", name: "Dela Cruz, Juan B.", gender: "Male" as const, studentNumber: "2026-0002" },
          { id: "f-1", name: "Santos, Maria C.", gender: "Female" as const, studentNumber: "2026-0003" },
        ];

  const [schoolInfo, setSchoolInfo] = useState({
    region: "0",
    division: "0",
    schoolId: "0",
    schoolName: "0",
    schoolYear: "0",
    schoolHead: "0",
    teacher: "0",
    subject: "0",
    gradeLevel: "0",
    section: "0",
  });

  // HPS (Highest Possible Score) for Written Works (5), Performance Tasks (3), Exams (ST1, ST2, TE)
  const [hps, setHps] = useState<CoreHPS>({
    wwHPS: [20, 20, 20, 20, 20],
    ptHPS: [25, 25, 25],
    exST1HPS: 30,
    exST2HPS: 30,
    exTEHPS: 40,
  });

  const createEmptyScore = (): CoreComponentScore => ({
    ww: [0, 0, 0, 0, 0],
    pt: [0, 0, 0],
    exST1: 0,
    exST2: 0,
    exTE: 0,
  });

  const [scoresData, setScoresData] = useState<
    Record<"term1" | "term2" | "term3", Record<string, CoreComponentScore>>
  >({
    term1: {
      "m-1": { ww: [18, 19, 20, 18, 17], pt: [23, 24, 25], exST1: 28, exST2: 27, exTE: 36 },
      "m-2": { ww: [15, 16, 17, 18, 16], pt: [20, 21, 22], exST1: 24, exST2: 25, exTE: 32 },
      "f-1": { ww: [20, 19, 20, 20, 19], pt: [25, 24, 25], exST1: 29, exST2: 29, exTE: 38 },
    },
    term2: {},
    term3: {},
  });

  const handleScoreChange = (
    term: "term1" | "term2" | "term3",
    studentId: string,
    field: "ww" | "pt" | "exST1" | "exST2" | "exTE",
    index: number | undefined,
    value: number
  ) => {
    setScoresData((prev) => {
      const currentTerm = prev[term] || {};
      const currentStudentScore = currentTerm[studentId] || createEmptyScore();

      let updated = { ...currentStudentScore };
      if (field === "ww" && index !== undefined) {
        const arr = [...currentStudentScore.ww];
        arr[index] = value;
        updated.ww = arr;
      } else if (field === "pt" && index !== undefined) {
        const arr = [...currentStudentScore.pt];
        arr[index] = value;
        updated.pt = arr;
      } else if (field === "exST1" || field === "exST2" || field === "exTE") {
        updated[field] = value;
      }

      return {
        ...prev,
        [term]: {
          ...currentTerm,
          [studentId]: updated,
        },
      };
    });
  };

  // Calculation for Core Academic Subjects: 20% WW, 50% PT, 30% EX
  const calculateTermGrade = (score: CoreComponentScore) => {
    // 1. Written / Oral Works (20%)
    const wwTotal = score.ww.reduce((a, b) => a + b, 0);
    const wwHPSTotal = hps.wwHPS.reduce((a, b) => a + b, 0);
    const wwPS = wwHPSTotal > 0 ? (wwTotal / wwHPSTotal) * 100 : 0;
    const wwWS = wwPS * 0.20;

    // 2. Product / Performance Tasks (50%)
    const ptTotal = score.pt.reduce((a, b) => a + b, 0);
    const ptHPSTotal = hps.ptHPS.reduce((a, b) => a + b, 0);
    const ptPS = ptHPSTotal > 0 ? (ptTotal / ptHPSTotal) * 100 : 0;
    const ptWS = ptPS * 0.50;

    // 3. Examinations (30%)
    const wsST1 = hps.exST1HPS > 0 ? (score.exST1 / hps.exST1HPS) * 30 : 0;
    const wsST2 = hps.exST2HPS > 0 ? (score.exST2 / hps.exST2HPS) * 30 : 0;
    const wsTE = hps.exTEHPS > 0 ? (score.exTE / hps.exTEHPS) * 40 : 0;
    const exPS = wsST1 + wsST2 + wsTE;
    const exWS = exPS * 0.30;

    const initialGrade = Number((wwWS + ptWS + exWS).toFixed(2));
    const transmutedGrade = transmuteGrade(initialGrade);
    const descriptor = getDescriptor(transmutedGrade);

    return {
      wwTotal,
      wwPS,
      wwWS,
      ptTotal,
      ptPS,
      ptWS,
      wsST1,
      wsST2,
      wsTE,
      exPS,
      exWS,
      initialGrade,
      transmutedGrade,
      descriptor,
      remark: transmutedGrade >= 75 ? "PASSED" : "FAILED",
    };
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Tab 1: Input Data Tab
  const renderInputData = () => (
    <div className="w-full font-sans text-sm mt-2">
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
              <div>
                <label className="text-slate-400">SCHOOL HEAD</label>
                <input
                  type="text"
                  value={schoolInfo.schoolHead}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolHead: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-2xl p-4 bg-slate-900 text-white space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
              TEACHER, GRADE LEVEL, SECTION INFORMATION
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400">SECTION</label>
                <input
                  type="text"
                  value={schoolInfo.section}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, section: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg h-8 px-2 mt-1 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right: Learners Registration */}
        <div className="md:col-span-2 border rounded-2xl p-5 bg-card space-y-4">
          <h3 className="text-sm font-bold flex items-center justify-between border-b pb-3">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" /> LEARNERS' NAMES REGISTRATION
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              Registered: {mappedStudents.length} Learners
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Male Students */}
            <div className="space-y-2 border rounded-xl p-3 bg-muted/20">
              <h4 className="font-extrabold text-blue-600 border-b pb-1 uppercase">
                MALE LEARNERS
              </h4>
              {mappedStudents
                .filter((s) => s.gender === "Male")
                .map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2 py-1">
                    <span className="w-5 text-muted-foreground font-mono font-bold">
                      {idx + 1}.
                    </span>
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
              <h4 className="font-extrabold text-pink-600 border-b pb-1 uppercase">
                FEMALE LEARNERS
              </h4>
              {mappedStudents
                .filter((s) => s.gender === "Female")
                .map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2 py-1">
                    <span className="w-5 text-muted-foreground font-mono font-bold">
                      {idx + 1}.
                    </span>
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
  );

  // Term Sheet Renderer matching Image 2
  const renderTermSheet = (termKey: "term1" | "term2" | "term3") => {
    const termTitle =
      termKey === "term1" ? "FIRST TERM" : termKey === "term2" ? "SECOND TERM" : "THIRD TERM";
    const headerTitle =
      termKey === "term1"
        ? "CLASS RECORD - TERM 1"
        : termKey === "term2"
        ? "CLASS RECORD - TERM 2"
        : "CLASS RECORD - TERM 3";

    const termScores = scoresData[termKey] || {};

    return (
      <div className="w-full overflow-x-auto print:overflow-visible">
        <div className="min-w-max print:zoom-fit space-y-0">
          {/* Header Banner matching Image 2 */}
          <div className="p-4 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 border border-black dark:border-slate-700 space-y-4 print:bg-white print:text-black">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer group relative" title="Click to change left logo">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e, "left")}
                  />
                  <img
                    src={leftLogo}
                    alt="Kagawaran ng Edukasyon"
                    className="h-24 w-24 object-contain group-hover:opacity-80 transition-opacity"
                  />
                </label>
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-wider uppercase text-slate-950 dark:text-slate-100">
                  {headerTitle}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer group relative" title="Click to change right logo">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e, "right")}
                  />
                  <img
                    src={rightLogo}
                    alt="DepEd Logo"
                    className="h-20 object-contain group-hover:opacity-80 transition-opacity"
                  />
                </label>
              </div>
            </div>

            {/* Metadata Inputs */}
            <div className="space-y-2 text-xs font-black uppercase pt-1">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-950 dark:text-slate-100 font-black">REGION</span>
                  <input
                    type="text"
                    value={schoolInfo.region}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, region: e.target.value })}
                    className="w-56 border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-950 dark:text-slate-100 font-black">DIVISION</span>
                  <input
                    type="text"
                    value={schoolInfo.division}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, division: e.target.value })}
                    className="w-56 border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-950 dark:text-slate-100 font-black">SCHOOL ID</span>
                  <input
                    type="text"
                    value={schoolInfo.schoolId}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolId: e.target.value })}
                    className="w-36 border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-2 flex-1 max-w-2xl">
                  <span className="text-slate-950 dark:text-slate-100 font-black whitespace-nowrap">
                    SCHOOL NAME
                  </span>
                  <input
                    type="text"
                    value={schoolInfo.schoolName}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                    className="w-full border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-950 dark:text-slate-100 font-black whitespace-nowrap">
                    SCHOOL YEAR
                  </span>
                  <input
                    type="text"
                    value={schoolInfo.schoolYear}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolYear: e.target.value })}
                    className="w-36 border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Solid Dark Blue Divider Bar */}
          <div className="h-4 bg-[#002060] w-full border-t-2 border-b-2 border-black" />

          {/* Main Table Grid matching Image 2 */}
          <table className="w-full text-xs text-center border-collapse border-2 border-black bg-white dark:bg-slate-950">
            <thead>
              {/* Row 1: GRADE LEVEL, TEACHER, SUBJECT */}
              <tr className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold uppercase border-b-2 border-black">
                <th
                  rowSpan={4}
                  className="border-2 border-black p-2 min-w-[200px] max-w-[220px] bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 align-middle"
                >
                  <div className="text-2xl font-black tracking-wider text-slate-950 dark:text-slate-100 uppercase">
                    {termTitle}
                  </div>
                </th>
                <th className="border-2 border-black p-1 text-left bg-[#f2f2f2] text-slate-950 font-black text-[11px] whitespace-nowrap">
                  GRADE LEVEL
                </th>
                <th className="border-2 border-black p-1 font-mono bg-white text-slate-900 font-bold text-center text-xs whitespace-nowrap">
                  {schoolInfo.gradeLevel}
                </th>
                <th
                  rowSpan={2}
                  className="border-2 border-black p-1 text-center bg-[#f2f2f2] text-slate-950 font-black text-[11px] align-middle w-24"
                >
                  TEACHER
                </th>
                <th
                  rowSpan={2}
                  colSpan={9}
                  className="border-2 border-black p-1 text-center bg-white text-slate-900 font-bold align-middle text-xs uppercase"
                >
                  {schoolInfo.teacher}
                </th>
                <th
                  rowSpan={2}
                  className="border-2 border-black p-1 text-center bg-[#f2f2f2] text-slate-950 font-black text-[11px] align-middle w-24"
                >
                  SUBJECT
                </th>
                <th
                  rowSpan={2}
                  colSpan={9}
                  className="border-2 border-black p-1 text-center bg-white text-slate-900 font-bold align-middle text-xs uppercase"
                >
                  {schoolInfo.subject}
                </th>
                <th
                  rowSpan={4}
                  className="border-2 border-black p-1 bg-[#f2f2f2] text-slate-950 font-black align-middle w-14 text-xs leading-tight"
                >
                  Initial<br />Grade
                </th>
                <th
                  rowSpan={4}
                  className="border-2 border-black p-1 bg-[#f2f2f2] text-slate-950 font-black align-middle w-14 text-xs leading-tight"
                >
                  Term<br />Grade
                </th>
                <th
                  rowSpan={4}
                  className="border-2 border-black p-1 bg-[#f2f2f2] text-slate-950 font-black align-middle w-24 text-xs"
                >
                  Descriptor
                </th>
              </tr>

              {/* Row 2: Section Row */}
              <tr className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold uppercase border-b-2 border-black">
                <th className="border-2 border-black p-1 text-left bg-[#f2f2f2] text-slate-950 font-black text-[11px] whitespace-nowrap">
                  SECTION
                </th>
                <th className="border-2 border-black p-1 font-mono bg-white text-slate-900 font-bold text-center text-xs whitespace-nowrap">
                  {schoolInfo.section}
                </th>
              </tr>

              {/* Row 3: Component Categories (20% - 50% - 30%) */}
              <tr className="bg-white dark:bg-slate-900 text-slate-950 font-black uppercase text-[11px] border-b-2 border-black">
                <th
                  colSpan={8}
                  className="border-2 border-black p-1.5 text-center bg-[#f2f2f2] text-slate-950"
                >
                  WRITTEN / ORAL WORKS (WWs)
                </th>
                <th
                  colSpan={6}
                  className="border-2 border-black p-1.5 text-center bg-[#f2f2f2] text-slate-950"
                >
                  PRODUCT / PERFORMANCE TASKS (PTs)
                </th>
                <th
                  colSpan={8}
                  className="border-2 border-black p-1.5 text-center bg-[#f2f2f2] text-slate-950"
                >
                  EXAMINATIONS (EXs)
                </th>
              </tr>

              {/* Row 4: Sub-columns Header Row */}
              <tr className="bg-white dark:bg-slate-900 text-slate-950 text-[10px] font-black text-center border-b-2 border-black">
                {/* WW: 1-5, Total, PS, WS */}
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">1</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">2</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">3</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">4</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">5</th>
                <th className="border-2 border-black p-0.5 bg-white w-9">Total</th>
                <th className="border-2 border-black p-0.5 bg-white w-9">PS</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 font-black w-9">WS</th>

                {/* PT: 1-3, Total, PS, WS */}
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-8">1</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-8">2</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-8">3</th>
                <th className="border-2 border-black p-0.5 bg-white w-9">Total</th>
                <th className="border-2 border-black p-0.5 bg-white w-9">PS</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 font-black w-9">WS</th>

                {/* EX: ST1, ST2, TE, WS ST1, WS ST2, WS TE, PS, WS */}
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-8">ST1</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-8">ST2</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-8">TE</th>
                <th className="border-2 border-black p-0.5 bg-white text-[9px] w-10">WS ST1</th>
                <th className="border-2 border-black p-0.5 bg-white text-[9px] w-10">WS ST2</th>
                <th className="border-2 border-black p-0.5 bg-white text-[9px] w-10">WS TE</th>
                <th className="border-2 border-black p-0.5 bg-white w-9">PS</th>
                <th className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black w-9">WS</th>
              </tr>

              {/* Row 5: Highest Possible Score (HPS) Row matching Image 2 */}
              <tr className="bg-white text-slate-950 font-black text-[10px] text-center border-b-2 border-black">
                <td className="border-2 border-black p-1 text-right text-slate-950 uppercase italic font-black px-2">
                  HIGHEST POSSIBLE SCORE
                </td>

                {/* WW HPS */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <td key={`hps-ww-${i}`} className="border-2 border-black p-0.5 bg-white">
                    <input
                      type="number"
                      value={hps.wwHPS[i] || ""}
                      onChange={(e) => {
                        const arr = [...hps.wwHPS];
                        arr[i] = Number(e.target.value) || 0;
                        setHps({ ...hps, wwHPS: arr });
                      }}
                      className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                    />
                  </td>
                ))}
                <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">
                  {hps.wwHPS.reduce((a, b) => a + b, 0)}
                </td>
                <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
                <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black">20%</td>

                {/* PT HPS (50%) */}
                {[0, 1, 2].map((i) => (
                  <td key={`hps-pt-${i}`} className="border-2 border-black p-0.5 bg-white">
                    <input
                      type="number"
                      value={hps.ptHPS[i] || ""}
                      onChange={(e) => {
                        const arr = [...hps.ptHPS];
                        arr[i] = Number(e.target.value) || 0;
                        setHps({ ...hps, ptHPS: arr });
                      }}
                      className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                    />
                  </td>
                ))}
                <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">
                  {hps.ptHPS.reduce((a, b) => a + b, 0)}
                </td>
                <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
                <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black">50%</td>

                {/* EX HPS (30%) */}
                <td className="border-2 border-black p-0.5 bg-white">
                  <input
                    type="number"
                    value={hps.exST1HPS || ""}
                    onChange={(e) => setHps({ ...hps, exST1HPS: Number(e.target.value) || 0 })}
                    className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                  />
                </td>
                <td className="border-2 border-black p-0.5 bg-white">
                  <input
                    type="number"
                    value={hps.exST2HPS || ""}
                    onChange={(e) => setHps({ ...hps, exST2HPS: Number(e.target.value) || 0 })}
                    className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                  />
                </td>
                <td className="border-2 border-black p-0.5 bg-white">
                  <input
                    type="number"
                    value={hps.exTEHPS || ""}
                    onChange={(e) => setHps({ ...hps, exTEHPS: Number(e.target.value) || 0 })}
                    className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                  />
                </td>
                <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black text-[10px]">30</td>
                <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black text-[10px]">30</td>
                <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black text-[10px]">40</td>
                <td className="border-2 border-black p-0.5 bg-white font-black text-[10px]">100</td>
                <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black text-[10px]">30%</td>

                {/* Initial, Term, Desc HPS blank */}
                <td className="border-2 border-black p-0.5 bg-[#f2f2f2]"></td>
                <td className="border-2 border-black p-0.5 bg-[#f2f2f2]"></td>
                <td className="border-2 border-black p-0.5 bg-[#f2f2f2]"></td>
              </tr>
            </thead>

            <tbody>
              {/* LEARNERS' NAMES Header Row */}
              <tr className="bg-[#002060] text-white font-black text-left text-xs uppercase tracking-wider">
                <td colSpan={26} className="p-1 px-3 border-2 border-black">
                  LEARNERS' NAMES
                </td>
              </tr>

              {/* MALE Divider */}
              <tr className="bg-[#d9d9d9] dark:bg-slate-800 text-slate-950 dark:text-white font-black text-left text-[11px] uppercase border-b-2 border-black">
                <td className="p-1 px-3 border-2 border-black bg-[#bfbfbf] dark:bg-slate-900">
                  MALE
                </td>
                <td colSpan={25} className="border-2 border-black bg-[#d9d9d9] dark:bg-slate-800"></td>
              </tr>
              {mappedStudents
                .filter((s) => s.gender === "Male")
                .map((student, idx) => {
                  const s = termScores[student.id] || createEmptyScore();
                  const calc = calculateTermGrade(s);
                  const inputClass =
                    "w-full h-6 text-center bg-transparent focus:bg-amber-100 dark:focus:bg-amber-900/40 focus:outline-none font-bold text-xs";

                  return (
                    <tr
                      key={student.id}
                      className="h-6 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors border-b border-black text-xs"
                    >
                      <td className="border-2 border-black p-1 text-left whitespace-nowrap bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold px-2">
                        {idx + 1}. {student.name}
                      </td>

                      {/* WW inputs */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <td key={`ww-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                          <input
                            type="number"
                            className={inputClass}
                            value={s.ww[i] || ""}
                            onChange={(e) =>
                              handleScoreChange(termKey, student.id, "ww", i, Number(e.target.value) || 0)
                            }
                          />
                        </td>
                      ))}
                      <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2]">
                        {calc.wwTotal}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.wwPS.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2]">
                        {calc.wwWS.toFixed(2)}
                      </td>

                      {/* PT inputs */}
                      {[0, 1, 2].map((i) => (
                        <td key={`pt-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                          <input
                            type="number"
                            className={inputClass}
                            value={s.pt[i] || ""}
                            onChange={(e) =>
                              handleScoreChange(termKey, student.id, "pt", i, Number(e.target.value) || 0)
                            }
                          />
                        </td>
                      ))}
                      <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2]">
                        {calc.ptTotal}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.ptPS.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2]">
                        {calc.ptWS.toFixed(2)}
                      </td>

                      {/* EX inputs */}
                      <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                        <input
                          type="number"
                          className={inputClass}
                          value={s.exST1 || ""}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "exST1", undefined, Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                        <input
                          type="number"
                          className={inputClass}
                          value={s.exST2 || ""}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "exST2", undefined, Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                        <input
                          type="number"
                          className={inputClass}
                          value={s.exTE || ""}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "exTE", undefined, Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.wsST1.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.wsST2.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.wsTE.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.exPS.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2]">
                        {calc.exWS.toFixed(2)}
                      </td>

                      {/* Grades */}
                      <td className="border-2 border-black p-0 text-center font-bold bg-[#e6e6e6]">
                        {calc.initialGrade.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-black text-sm bg-[#d9d9d9]">
                        {calc.transmutedGrade}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold text-[10px]">
                        {calc.descriptor}
                      </td>
                    </tr>
                  );
                })}

              {/* FEMALE Divider */}
              <tr className="bg-[#d9d9d9] dark:bg-slate-800 text-slate-950 dark:text-white font-black text-left text-[11px] uppercase border-b-2 border-black">
                <td className="p-1 px-3 border-2 border-black bg-[#bfbfbf] dark:bg-slate-900">
                  FEMALE
                </td>
                <td colSpan={25} className="border-2 border-black bg-[#d9d9d9] dark:bg-slate-800"></td>
              </tr>
              {mappedStudents
                .filter((s) => s.gender === "Female")
                .map((student, idx) => {
                  const s = termScores[student.id] || createEmptyScore();
                  const calc = calculateTermGrade(s);
                  const inputClass =
                    "w-full h-6 text-center bg-transparent focus:bg-amber-100 dark:focus:bg-amber-900/40 focus:outline-none font-bold text-xs";

                  return (
                    <tr
                      key={student.id}
                      className="h-6 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors border-b border-black text-xs"
                    >
                      <td className="border-2 border-black p-1 text-left whitespace-nowrap bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold px-2">
                        {idx + 1}. {student.name}
                      </td>

                      {/* WW inputs */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <td key={`ww-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                          <input
                            type="number"
                            className={inputClass}
                            value={s.ww[i] || ""}
                            onChange={(e) =>
                              handleScoreChange(termKey, student.id, "ww", i, Number(e.target.value) || 0)
                            }
                          />
                        </td>
                      ))}
                      <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2]">
                        {calc.wwTotal}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.wwPS.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2]">
                        {calc.wwWS.toFixed(2)}
                      </td>

                      {/* PT inputs */}
                      {[0, 1, 2].map((i) => (
                        <td key={`pt-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                          <input
                            type="number"
                            className={inputClass}
                            value={s.pt[i] || ""}
                            onChange={(e) =>
                              handleScoreChange(termKey, student.id, "pt", i, Number(e.target.value) || 0)
                            }
                          />
                        </td>
                      ))}
                      <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2]">
                        {calc.ptTotal}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.ptPS.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2]">
                        {calc.ptWS.toFixed(2)}
                      </td>

                      {/* EX inputs */}
                      <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                        <input
                          type="number"
                          className={inputClass}
                          value={s.exST1 || ""}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "exST1", undefined, Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                        <input
                          type="number"
                          className={inputClass}
                          value={s.exST2 || ""}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "exST2", undefined, Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
                        <input
                          type="number"
                          className={inputClass}
                          value={s.exTE || ""}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "exTE", undefined, Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.wsST1.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.wsST2.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.wsTE.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2]">
                        {calc.exPS.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2]">
                        {calc.exWS.toFixed(2)}
                      </td>

                      {/* Grades */}
                      <td className="border-2 border-black p-0 text-center font-bold bg-[#e6e6e6]">
                        {calc.initialGrade.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-black text-sm bg-[#d9d9d9]">
                        {calc.transmutedGrade}
                      </td>
                      <td className="border-2 border-black p-0 text-center font-semibold text-[10px]">
                        {calc.descriptor}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Final Grade Summary Tab matching Image 1
  const renderFinalGradeTab = () => (
    <div className="w-full overflow-x-auto print:overflow-visible">
      <div className="min-w-max print:zoom-fit space-y-0">
        {/* DepEd Header matching Image 1 */}
        <div className="p-4 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 border border-black dark:border-slate-700 space-y-4 print:bg-white print:text-black">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer group relative" title="Click to change left logo">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, "left")}
                />
                <img
                  src={leftLogo}
                  alt="Kagawaran ng Edukasyon"
                  className="h-24 w-24 object-contain group-hover:opacity-80 transition-opacity"
                />
              </label>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-wider uppercase text-slate-950 dark:text-slate-100">
                CLASS RECORD - FINAL GRADES
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer group relative" title="Click to change right logo">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, "right")}
                />
                <img
                  src={rightLogo}
                  alt="DepEd Logo"
                  className="h-20 object-contain group-hover:opacity-80 transition-opacity"
                />
              </label>
            </div>
          </div>

          {/* Metadata Inputs */}
          <div className="space-y-2 text-xs font-black uppercase pt-1">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-950 dark:text-slate-100 font-black">REGION</span>
                <input
                  type="text"
                  value={schoolInfo.region}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, region: e.target.value })}
                  className="w-56 border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-950 dark:text-slate-100 font-black">DIVISION</span>
                <input
                  type="text"
                  value={schoolInfo.division}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, division: e.target.value })}
                  className="w-56 border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-950 dark:text-slate-100 font-black">SCHOOL ID</span>
                <input
                  type="text"
                  value={schoolInfo.schoolId}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolId: e.target.value })}
                  className="w-36 border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 flex-1 max-w-2xl">
                <span className="text-slate-950 dark:text-slate-100 font-black whitespace-nowrap">
                  SCHOOL NAME
                </span>
                <input
                  type="text"
                  value={schoolInfo.schoolName}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                  className="w-full border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-950 dark:text-slate-100 font-black whitespace-nowrap">
                  SCHOOL YEAR
                </span>
                <input
                  type="text"
                  value={schoolInfo.schoolYear}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolYear: e.target.value })}
                  className="w-36 border-2 border-black bg-white dark:bg-slate-900 px-3 py-0.5 font-mono text-center text-xs font-bold text-slate-950 dark:text-slate-100 rounded-none shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Solid Dark Blue Divider Bar */}
        <div className="h-4 bg-[#002060] w-full border-t-2 border-b-2 border-black" />

        {/* Final Grades Table matching Image 1 */}
        <table className="w-full text-xs text-center border-collapse border-2 border-black bg-white dark:bg-slate-950">
          <thead>
            {/* Metadata Header Row 1: GRADE LEVEL & SUBJECT */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold uppercase border-b-2 border-black">
              <th className="border-2 border-black p-1 text-left bg-[#f2f2f2] text-slate-950 font-black text-[11px] whitespace-nowrap w-28">
                GRADE LEVEL
              </th>
              <th className="border-2 border-black p-1 font-mono bg-white text-slate-900 font-bold text-center text-xs whitespace-nowrap w-36">
                {schoolInfo.gradeLevel}
              </th>
              <th className="border-2 border-black p-1 text-center bg-[#f2f2f2] text-slate-950 font-black text-[11px] whitespace-nowrap w-24">
                SUBJECT
              </th>
              <th className="border-2 border-black p-1 text-center bg-white text-slate-900 font-bold text-xs uppercase" colSpan={3}>
                {schoolInfo.subject}
              </th>
            </tr>

            {/* Metadata Header Row 2: SECTION & TEACHER */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold uppercase border-b-2 border-black">
              <th className="border-2 border-black p-1 text-left bg-[#f2f2f2] text-slate-950 font-black text-[11px] whitespace-nowrap">
                SECTION
              </th>
              <th className="border-2 border-black p-1 font-mono bg-white text-slate-900 font-bold text-center text-xs whitespace-nowrap">
                {schoolInfo.section}
              </th>
              <th className="border-2 border-black p-1 text-center bg-[#f2f2f2] text-slate-950 font-black text-[11px] whitespace-nowrap">
                TEACHER
              </th>
              <th className="border-2 border-black p-1 text-center bg-white text-slate-900 font-bold text-xs uppercase" colSpan={3}>
                {schoolInfo.teacher}
              </th>
            </tr>

            {/* Column Header Row 1: LEARNERS' NAMES, TERM GRADES banner, FINAL GRADE, DESCRIPTOR, REMARK */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold uppercase border-b-2 border-black text-center text-xs">
              <th rowSpan={2} className="border-2 border-black p-2 min-w-[200px] text-center font-black align-middle">
                LEARNERS' NAMES
              </th>
              <th colSpan={3} className="border-2 border-black p-1.5 font-black bg-[#f2f2f2]">
                TERM GRADES
              </th>
              <th rowSpan={2} className="border-2 border-black p-2 font-black align-middle w-24">
                FINAL GRADE
              </th>
              <th rowSpan={2} className="border-2 border-black p-2 font-black align-middle w-28">
                DESCRIPTOR
              </th>
              <th rowSpan={2} className="border-2 border-black p-2 font-black align-middle w-24">
                REMARK
              </th>
            </tr>

            {/* Column Header Row 2: TERM 1, TERM 2, TERM 3 */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold uppercase border-b-2 border-black text-center text-[11px]">
              <th className="border-2 border-black p-1 font-black bg-white w-24">TERM 1</th>
              <th className="border-2 border-black p-1 font-black bg-white w-24">TERM 2</th>
              <th className="border-2 border-black p-1 font-black bg-white w-24">TERM 3</th>
            </tr>
          </thead>

          <tbody>
            {/* MALE Divider Row */}
            <tr className="bg-[#d9d9d9] dark:bg-slate-800 text-slate-950 dark:text-white font-black text-left text-[11px] uppercase border-b-2 border-black">
              <td className="p-1 px-3 border-2 border-black bg-[#bfbfbf] dark:bg-slate-900">
                MALE
              </td>
              <td colSpan={6} className="border-2 border-black bg-[#d9d9d9] dark:bg-slate-800"></td>
            </tr>

            {mappedStudents
              .filter((s) => s.gender === "Male")
              .map((student, idx) => {
                const t1 = calculateTermGrade(scoresData.term1[student.id] || createEmptyScore()).transmutedGrade;
                const t2 = calculateTermGrade(scoresData.term2[student.id] || createEmptyScore()).transmutedGrade;
                const t3 = calculateTermGrade(scoresData.term3[student.id] || createEmptyScore()).transmutedGrade;

                const validTerms = [t1, t2, t3].filter((g) => g > 0);
                const finalGrade =
                  validTerms.length > 0
                    ? Math.round(validTerms.reduce((a, b) => a + b, 0) / validTerms.length)
                    : 0;
                const descriptor = finalGrade > 0 ? getDescriptor(finalGrade) : "";
                const remark = finalGrade >= 75 ? "PASSED" : finalGrade > 0 ? "FAILED" : "";

                return (
                  <tr
                    key={student.id}
                    className="h-6 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors border-b border-black text-xs"
                  >
                    <td className="border-2 border-black p-1 text-left whitespace-nowrap bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold px-2">
                      {idx + 1}. {student.name}
                    </td>
                    <td className="border-2 border-black p-1 text-center font-bold bg-white">{t1 || ""}</td>
                    <td className="border-2 border-black p-1 text-center font-bold bg-white">{t2 || ""}</td>
                    <td className="border-2 border-black p-1 text-center font-bold bg-white">{t3 || ""}</td>
                    <td className="border-2 border-black p-1 text-center font-black text-sm bg-white">
                      {finalGrade || ""}
                    </td>
                    <td className="border-2 border-black p-1 text-center font-semibold text-[10px] bg-white">
                      {descriptor}
                    </td>
                    <td className="border-2 border-black p-1 text-center font-black text-[10px] bg-white">
                      {remark}
                    </td>
                  </tr>
                );
              })}

            {/* FEMALE Divider Row */}
            <tr className="bg-[#d9d9d9] dark:bg-slate-800 text-slate-950 dark:text-white font-black text-left text-[11px] uppercase border-b-2 border-black">
              <td className="p-1 px-3 border-2 border-black bg-[#bfbfbf] dark:bg-slate-900">
                FEMALE
              </td>
              <td colSpan={6} className="border-2 border-black bg-[#d9d9d9] dark:bg-slate-800"></td>
            </tr>

            {mappedStudents
              .filter((s) => s.gender === "Female")
              .map((student, idx) => {
                const t1 = calculateTermGrade(scoresData.term1[student.id] || createEmptyScore()).transmutedGrade;
                const t2 = calculateTermGrade(scoresData.term2[student.id] || createEmptyScore()).transmutedGrade;
                const t3 = calculateTermGrade(scoresData.term3[student.id] || createEmptyScore()).transmutedGrade;

                const validTerms = [t1, t2, t3].filter((g) => g > 0);
                const finalGrade =
                  validTerms.length > 0
                    ? Math.round(validTerms.reduce((a, b) => a + b, 0) / validTerms.length)
                    : 0;
                const descriptor = finalGrade > 0 ? getDescriptor(finalGrade) : "";
                const remark = finalGrade >= 75 ? "PASSED" : finalGrade > 0 ? "FAILED" : "";

                return (
                  <tr
                    key={student.id}
                    className="h-6 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors border-b border-black text-xs"
                  >
                    <td className="border-2 border-black p-1 text-left whitespace-nowrap bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold px-2">
                      {idx + 1}. {student.name}
                    </td>
                    <td className="border-2 border-black p-1 text-center font-bold bg-white">{t1 || ""}</td>
                    <td className="border-2 border-black p-1 text-center font-bold bg-white">{t2 || ""}</td>
                    <td className="border-2 border-black p-1 text-center font-bold bg-white">{t3 || ""}</td>
                    <td className="border-2 border-black p-1 text-center font-black text-sm bg-white">
                      {finalGrade || ""}
                    </td>
                    <td className="border-2 border-black p-1 text-center font-semibold text-[10px] bg-white">
                      {descriptor}
                    </td>
                    <td className="border-2 border-black p-1 text-center font-black text-[10px] bg-white">
                      {remark}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Helper Tab matching Image 4
  const renderHelperTab = () => {
    const transmutationData = [
      [99.50, 100, 100],
      [98.32, 99.49, 99],
      [97.14, 98.31, 98],
      [95.96, 97.13, 97],
      [94.78, 95.95, 96],
      [93.60, 94.77, 95],
      [92.42, 93.59, 94],
      [91.24, 92.41, 93],
      [90.06, 91.23, 92],
      [88.88, 90.05, 91],
      [87.70, 88.87, 90],
      [86.52, 87.69, 89],
      [85.34, 86.51, 88],
      [84.16, 85.33, 87],
      [82.98, 84.15, 86],
      [81.80, 82.97, 85],
      [80.62, 81.79, 84],
      [79.44, 80.61, 83],
      [78.26, 79.43, 82],
      [77.08, 78.25, 81],
      [75.90, 77.07, 80],
      [74.72, 75.89, 79],
      [73.54, 74.71, 78],
      [72.36, 73.53, 77],
      [71.18, 72.35, 76],
      [70.00, 71.17, 75], // Highlighted Row in green
      [65.34, 69.99, 74],
      [60.67, 65.33, 73],
      [56.01, 60.66, 72],
      [51.34, 56.00, 71],
      [46.67, 51.33, 70],
      [42.01, 46.66, 69],
      [37.34, 42.00, 68],
      [32.68, 37.33, 67],
      [28.01, 32.67, 66],
      [23.35, 28.00, 65],
      [18.68, 23.34, 64],
      [14.01, 18.67, 63],
      [9.35, 14.00, 62],
      [4.68, 9.34, 61],
      [0.00, 4.67, 60],
    ];

    const gradesList = Array.from({ length: 41 }, (_, i) => 100 - i);

    return (
      <div className="w-full bg-white dark:bg-slate-950 p-6 space-y-4 font-sans">
        <div>
          <h1 className="text-4xl font-black text-slate-950 dark:text-slate-100 tracking-tight">
            HELPER
          </h1>
          <h2 className="text-2xl font-black text-red-600 tracking-wide mt-1">
            IMPORTANT / DO NOT DELETE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-2">
          {/* Left Table: TRANSMUTATION TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse border-2 border-black bg-white dark:bg-slate-900">
              <thead>
                <tr>
                  <th
                    colSpan={3}
                    className="bg-[#c00000] text-white font-black text-sm p-1.5 border-2 border-black uppercase tracking-wider"
                  >
                    TRANSMUTATION TABLE
                  </th>
                </tr>
                <tr className="bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-bold border-b-2 border-black">
                  <th className="border-2 border-black p-1 w-1/3">IG (Min.)</th>
                  <th className="border-2 border-black p-1 w-1/3">IG (Max.)</th>
                  <th className="border-2 border-black p-1 w-1/3">Transmuted Grade</th>
                </tr>
              </thead>
              <tbody>
                {transmutationData.map(([min, max, grade], idx) => {
                  const isPassingRow = grade === 75;
                  return (
                    <tr
                      key={idx}
                      className={
                        isPassingRow
                          ? "bg-[#c5e0b4] text-slate-950 font-black border-b border-black"
                          : "hover:bg-slate-50 border-b border-black font-semibold text-slate-950 dark:text-slate-100"
                      }
                    >
                      <td className="border-2 border-black p-0.5 text-center">
                        {min === 0 ? "0" : min.toFixed(min % 1 === 0 ? 0 : 2)}
                      </td>
                      <td className="border-2 border-black p-0.5 text-center">
                        {max === 100 ? "100" : max.toFixed(2)}
                      </td>
                      <td className="border-2 border-black p-0.5 text-center font-bold">
                        {grade}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Table: DESCRIPTOR matching Image 4 */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border-2 border-black bg-white dark:bg-slate-900">
              <thead>
                <tr>
                  <th
                    colSpan={3}
                    className="bg-[#002060] text-white font-black text-sm p-1.5 border-2 border-black text-center uppercase tracking-wider"
                  >
                    DESCRIPTOR
                  </th>
                </tr>
                <tr className="bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-bold border-b-2 border-black text-center">
                  <th className="border-2 border-black p-1 w-28">Numerical Grade</th>
                  <th className="border-2 border-black p-1 w-36">Descriptor</th>
                  <th className="border-2 border-black p-1">General Description</th>
                </tr>
              </thead>
              <tbody>
                {gradesList.map((num) => {
                  let desc = "Emerging";
                  if (num >= 90) desc = "Advancing";
                  else if (num >= 80) desc = "Benchmarking";
                  else if (num >= 75) desc = "Connecting";
                  else if (num >= 65) desc = "Developing";

                  return (
                    <tr
                      key={num}
                      className="border-b border-dotted border-black hover:bg-slate-50 transition-colors"
                    >
                      <td className="border-l-2 border-r border-black border-b border-dotted border-b-black p-0.5 text-center font-bold">
                        {num}
                      </td>
                      <td className="border-r border-black border-b border-dotted border-b-black p-0.5 text-center font-bold">
                        {desc}
                      </td>
                      {num === 100 && (
                        <td
                          rowSpan={11}
                          className="border-r-2 border-black border-b-2 border-b-black p-2 text-center align-middle font-normal text-xs"
                        >
                          Consistently demonstrates skills and understanding that meet or exceed standards with independence, flexibility, and depth.
                        </td>
                      )}
                      {num === 89 && (
                        <td
                          rowSpan={10}
                          className="border-r-2 border-black border-b-2 border-b-black p-2 text-center align-middle font-normal text-xs"
                        >
                          Demonstrates expected grade-level skills and understanding competently and independently.
                        </td>
                      )}
                      {num === 79 && (
                        <td
                          rowSpan={5}
                          className="border-r-2 border-black border-b-2 border-b-black p-2 text-center align-middle font-normal text-xs"
                        >
                          Demonstrates sufficient understanding and application of grade-level standards with occasional
                        </td>
                      )}
                      {num === 74 && (
                        <td
                          rowSpan={10}
                          className="border-r-2 border-black border-b-2 border-b-black p-2 text-center align-middle font-normal text-xs"
                        >
                          Demonstrates partial understanding and inconsistent application of skills, requires targeted support and scaffolding
                        </td>
                      )}
                      {num === 64 && (
                        <td
                          rowSpan={5}
                          className="border-r-2 border-black border-b-2 border-b-black p-2 text-center align-middle font-normal text-xs"
                        >
                          Does not yet demonstrate foundational skills and understanding; requires intensive support.
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border rounded-3xl shadow-sm overflow-hidden flex flex-col space-y-4 p-6 print:p-0 print:border-none print:shadow-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: landscape; margin: 5mm; }
          .print\\:zoom-fit { zoom: 0.45; }
          @-moz-document url-prefix() { .print\\:zoom-fit { transform: scale(0.45); transform-origin: top left; } }
          .no-print { display: none !important; }
        }
      `,
        }}
      />

      {/* DepEd Banner Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">DepEd Electronic Class Record (ECR)</h2>
            <p className="text-xs text-muted-foreground">
              [Grades 2-10] 3-Term E-Class Record (for Science, Math, English, Filipino, Araling Panlipunan) — 20-50-30
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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

      {saveSuccess && (
        <div className="bg-green-100 text-green-800 p-3 rounded-xl text-sm font-medium flex items-center print:hidden">
          <CheckCircle2 className="h-4 w-4 mr-2" /> E-Class Record structure saved successfully!
        </div>
      )}

      {/* Top Tabs Navigation matching user screenshot */}
      <div className="flex items-center gap-1 bg-[#0b1329] dark:bg-[#070d1e] p-1 rounded-full text-[11px] sm:text-xs font-bold text-white overflow-x-auto shadow-sm border border-slate-800/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveTab("input")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "input"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold"
          }`}
        >
          INPUT DATA
        </button>
        <button
          onClick={() => setActiveTab("term1")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term1"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold"
          }`}
        >
          TERM 1
        </button>
        <button
          onClick={() => setActiveTab("term2")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term2"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold"
          }`}
        >
          TERM 2
        </button>
        <button
          onClick={() => setActiveTab("term3")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term3"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold"
          }`}
        >
          TERM 3
        </button>
        <button
          onClick={() => setActiveTab("final")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "final"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold"
          }`}
        >
          SUMMARY / FINAL GRADE
        </button>
        <button
          onClick={() => setActiveTab("helper")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "helper"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold"
          }`}
        >
          HELPER
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-card min-h-[500px]">
        {activeTab === "input" && renderInputData()}

        {/* Term 1 */}
        <div className={activeTab === "term1" ? "block" : "hidden print:block"}>
          {renderTermSheet("term1")}
        </div>

        {/* Term 2 */}
        <div className={activeTab === "term2" ? "block" : "hidden print:block"}>
          {renderTermSheet("term2")}
        </div>

        {/* Term 3 */}
        <div className={activeTab === "term3" ? "block" : "hidden print:block"}>
          {renderTermSheet("term3")}
        </div>

        {activeTab === "final" && renderFinalGradeTab()}
        {activeTab === "helper" && renderHelperTab()}
      </div>
    </div>
  );
}
