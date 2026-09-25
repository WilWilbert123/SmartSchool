"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  Printer,
  Save,
  BookOpen,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  Info,
  Calendar,
  Building,
  GraduationCap,
} from "lucide-react";
import {
  transmuteGrade,
  getDescriptor,
} from "@/utils/deped-eclass-record";
import { getSchoolSettings, updateSchoolSettings, uploadAssetFile } from "@/features/settings/settings.actions";

export interface SSHSComponentScore {
  ww: number[];
  pt: number[];
  st1: number;
  st2: number;
  te: number;
}

export interface SSHSHPS {
  wwHPS: number[];
  ptHPS: number[];
  st1HPS: number;
  st2HPS: number;
  teHPS: number;
}

// Subject Weights Configurations according to DepEd Order 15, s. 2026 for Strengthened Senior High School (SSHS)
export interface SubjectWeightConfig {
  name: string;
  category: "CORE" | "ACADEMIC" | "TECH-PRO";
  wwWeight: number; // e.g. 0.20
  ptWeight: number; // e.g. 0.50
  exWeight: number; // e.g. 0.30
  st1SubWeight: number; // e.g. 0.30 of EXs
  st2SubWeight: number; // e.g. 0.30 of EXs
  teSubWeight: number; // e.g. 0.40 of EXs
  isExamOnly?: boolean; // For Field Exposure, ST1/ST2 are omitted, TE is 100% of EXs
}

export const SSHS_SUBJECT_CONFIGS: Record<string, SubjectWeightConfig> = {
  core: {
    name: "Core Subjects",
    category: "CORE",
    wwWeight: 0.20,
    ptWeight: 0.50,
    exWeight: 0.30,
    st1SubWeight: 0.30,
    st2SubWeight: 0.30,
    teSubWeight: 0.40,
  },
  academic_general: {
    name: "Academic Electives (All Other Electives)",
    category: "ACADEMIC",
    wwWeight: 0.20,
    ptWeight: 0.50,
    exWeight: 0.30,
    st1SubWeight: 0.30,
    st2SubWeight: 0.30,
    teSubWeight: 0.40,
  },
  academic_research: {
    name: "Research and Design and Innovation",
    category: "ACADEMIC",
    wwWeight: 0.20,
    ptWeight: 0.80,
    exWeight: 0.00,
    st1SubWeight: 0.00,
    st2SubWeight: 0.00,
    teSubWeight: 0.00,
  },
  academic_arts_sports: {
    name: "Arts, Sports, Health and Wellness",
    category: "ACADEMIC",
    wwWeight: 0.20,
    ptWeight: 0.60,
    exWeight: 0.20,
    st1SubWeight: 0.30,
    st2SubWeight: 0.30,
    teSubWeight: 0.40,
  },
  academic_field: {
    name: "Field Experience",
    category: "ACADEMIC",
    wwWeight: 0.15,
    ptWeight: 0.70,
    exWeight: 0.15,
    st1SubWeight: 0.00,
    st2SubWeight: 0.00,
    teSubWeight: 1.00, // TE carries full weight
    isExamOnly: true,
  },
  techpro_general: {
    name: "Tech-Pro Electives (All Other Electives)",
    category: "TECH-PRO",
    wwWeight: 0.15,
    ptWeight: 0.60,
    exWeight: 0.25,
    st1SubWeight: 0.30,
    st2SubWeight: 0.30,
    teSubWeight: 0.40,
  },
  techpro_immersion: {
    name: "Work Immersion",
    category: "TECH-PRO",
    wwWeight: 0.20,
    ptWeight: 0.80,
    exWeight: 0.00,
    st1SubWeight: 0.00,
    st2SubWeight: 0.00,
    teSubWeight: 0.00,
  },
};

export function DepEdECRTableSSHS({ students = [] }: { students?: any[] }) {
  const [activeTab, setActiveTab] = useState<
    "instructions" | "input" | "term1" | "term2" | "term3" | "final" | "helper"
  >("term1");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedWeightKey, setSelectedWeightKey] = useState<string>("core");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL");

  const [leftLogo, setLeftLogo] = useState("/deped-seal.png");
  const [rightLogo, setRightLogo] = useState("/deped-logo.png");

  // Load school settings from database / localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem("smartschool_school_settings");
      if (cached) {
        const p = JSON.parse(cached);
        if (p.rightLogoUrl) setRightLogo(p.rightLogoUrl);
        if (p.logoUrl) setLeftLogo(p.logoUrl);
        if (p.schoolName) setSchoolInfo((prev) => ({ ...prev, schoolName: p.schoolName }));
        if (p.principalName) setSchoolInfo((prev) => ({ ...prev, principal: p.principalName }));
      }
    } catch (e) {}

    getSchoolSettings()
      .then((data) => {
        if (data) {
          if (data.right_logo_url) setRightLogo(data.right_logo_url);
          if (data.logo_url) setLeftLogo(data.logo_url);
          if (data.name) setSchoolInfo((prev) => ({ ...prev, schoolName: data.name || prev.schoolName }));
          if (data.principal_name) setSchoolInfo((prev) => ({ ...prev, principal: data.principal_name || prev.principal }));
        }
      })
      .catch(() => {});
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

  // Map enrolled students without excessive blank spaces
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
          lrn: s.student.student_number || "",
        }))
      : [
          { id: "m-1", name: "Gamis, Wilbert A.", gender: "Male" as const, lrn: "109283746501" },
          { id: "m-2", name: "Dela Cruz, Juan B.", gender: "Male" as const, lrn: "109283746502" },
          { id: "m-3", name: "Reyes, Mateo V.", gender: "Male" as const, lrn: "109283746503" },
          { id: "f-1", name: "Santos, Maria C.", gender: "Female" as const, lrn: "109283746504" },
          { id: "f-2", name: "Aquino, Corazon D.", gender: "Female" as const, lrn: "109283746505" },
        ];

  // School and Class Metadata matching Image 2
  const [schoolInfo, setSchoolInfo] = useState({
    region: "REGION IV-A (CALABARZON)",
    division: "CAVITE",
    schoolId: "301234",
    schoolName: "SmartSchool Senior High School",
    schoolYear: "2026 - 2027",
    teacher: "Prof. Wilbert Gamis",
    gradeLevel: "11",
    section: "STEM-A",
    subjectCategory: "CORE",
    cluster: "STEM",
    subject: "PAG-AARAL NG KABATAYAN AT LIPUNANG PILIPINO",
    otherElective: "",
    noTermsTaught: "3",
    unitsPerTerm: "1.0",
    unitsPerYear: "3.0",
    termBlocks: "Term 1-3",
    principal: "Dr. Maria Santos",
  });

  const currentWeightConfig = SSHS_SUBJECT_CONFIGS[selectedWeightKey] || SSHS_SUBJECT_CONFIGS.core;

  // Highest Possible Scores for WW (10), PT (10), ST1, ST2, TE
  const [hps, setHps] = useState<SSHSHPS>({
    wwHPS: [20, 20, 20, 20, 20, 0, 0, 0, 0, 0],
    ptHPS: [25, 25, 25, 25, 0, 0, 0, 0, 0, 0],
    st1HPS: 30,
    st2HPS: 30,
    teHPS: 50,
  });

  const createEmptyScore = (): SSHSComponentScore => ({
    ww: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    pt: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    st1: 0,
    st2: 0,
    te: 0,
  });

  // Default mock scores for 3 terms
  const [scoresData, setScoresData] = useState<
    Record<"term1" | "term2" | "term3", Record<string, SSHSComponentScore>>
  >({
    term1: {
      "m-1": { ww: [18, 19, 20, 19, 18, 0, 0, 0, 0, 0], pt: [24, 25, 24, 23, 0, 0, 0, 0, 0, 0], st1: 28, st2: 29, te: 46 },
      "m-2": { ww: [15, 16, 17, 16, 15, 0, 0, 0, 0, 0], pt: [20, 21, 22, 20, 0, 0, 0, 0, 0, 0], st1: 24, st2: 23, te: 38 },
      "m-3": { ww: [17, 18, 17, 18, 19, 0, 0, 0, 0, 0], pt: [23, 22, 23, 24, 0, 0, 0, 0, 0, 0], st1: 26, st2: 27, te: 43 },
      "f-1": { ww: [20, 20, 19, 20, 20, 0, 0, 0, 0, 0], pt: [25, 25, 25, 24, 0, 0, 0, 0, 0, 0], st1: 30, st2: 29, te: 48 },
      "f-2": { ww: [16, 17, 18, 17, 16, 0, 0, 0, 0, 0], pt: [22, 23, 21, 22, 0, 0, 0, 0, 0, 0], st1: 25, st2: 26, te: 40 },
    },
    term2: {
      "m-1": { ww: [19, 19, 20, 18, 19, 0, 0, 0, 0, 0], pt: [25, 24, 25, 24, 0, 0, 0, 0, 0, 0], st1: 29, st2: 28, te: 47 },
      "m-2": { ww: [16, 17, 16, 17, 16, 0, 0, 0, 0, 0], pt: [21, 22, 20, 21, 0, 0, 0, 0, 0, 0], st1: 23, st2: 24, te: 39 },
      "m-3": { ww: [18, 18, 19, 17, 18, 0, 0, 0, 0, 0], pt: [22, 24, 23, 23, 0, 0, 0, 0, 0, 0], st1: 27, st2: 26, te: 44 },
      "f-1": { ww: [20, 19, 20, 20, 20, 0, 0, 0, 0, 0], pt: [25, 25, 24, 25, 0, 0, 0, 0, 0, 0], st1: 29, st2: 30, te: 49 },
      "f-2": { ww: [17, 18, 17, 18, 17, 0, 0, 0, 0, 0], pt: [23, 22, 23, 22, 0, 0, 0, 0, 0, 0], st1: 26, st2: 25, te: 41 },
    },
    term3: {
      "m-1": { ww: [19, 20, 20, 19, 20, 0, 0, 0, 0, 0], pt: [25, 25, 24, 25, 0, 0, 0, 0, 0, 0], st1: 29, st2: 29, te: 48 },
      "m-2": { ww: [17, 16, 17, 18, 17, 0, 0, 0, 0, 0], pt: [22, 21, 23, 22, 0, 0, 0, 0, 0, 0], st1: 25, st2: 25, te: 41 },
      "m-3": { ww: [18, 19, 18, 19, 18, 0, 0, 0, 0, 0], pt: [24, 23, 24, 24, 0, 0, 0, 0, 0, 0], st1: 27, st2: 28, te: 45 },
      "f-1": { ww: [20, 20, 20, 20, 20, 0, 0, 0, 0, 0], pt: [25, 25, 25, 25, 0, 0, 0, 0, 0, 0], st1: 30, st2: 30, te: 50 },
      "f-2": { ww: [18, 17, 18, 18, 17, 0, 0, 0, 0, 0], pt: [23, 23, 24, 23, 0, 0, 0, 0, 0, 0], st1: 27, st2: 26, te: 42 },
    },
  });

  const handleScoreChange = (
    term: "term1" | "term2" | "term3",
    studentId: string,
    field: "ww" | "pt" | "st1" | "st2" | "te",
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
      } else if (field === "st1" || field === "st2" || field === "te") {
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

  // Calculation for Strengthened Senior High School (SSHS) pursuant to DepEd Order 15, s. 2026
  const computeStudentTerm = (score: SSHSComponentScore) => {
    const config = currentWeightConfig;

    // 1. Written / Oral Works (WWs)
    const wwTotal = score.ww.reduce((a, b) => a + (b || 0), 0);
    const wwHPSTotal = hps.wwHPS.reduce((a, b) => a + (b || 0), 0);
    const wwPS = wwHPSTotal > 0 ? (wwTotal / wwHPSTotal) * 100 : 0;
    const wwWS = wwPS * config.wwWeight;

    // 2. Product / Performance Tasks (PTs)
    const ptTotal = score.pt.reduce((a, b) => a + (b || 0), 0);
    const ptHPSTotal = hps.ptHPS.reduce((a, b) => a + (b || 0), 0);
    const ptPS = ptHPSTotal > 0 ? (ptTotal / ptHPSTotal) * 100 : 0;
    const ptWS = ptPS * config.ptWeight;

    // 3. Examinations (EXs) - ST1, ST2, TE
    let wsST1 = 0;
    let wsST2 = 0;
    let wsTE = 0;
    let exPS = 0;
    let exWS = 0;

    if (config.exWeight > 0) {
      if (config.isExamOnly) {
        // Field Exposure: only Term Exam (TE) carries full weight
        wsST1 = 0;
        wsST2 = 0;
        wsTE = hps.teHPS > 0 ? (score.te / hps.teHPS) * 100 : 0;
        exPS = wsTE;
        exWS = exPS * config.exWeight;
      } else {
        // Standard EX component: ST1 (30%), ST2 (30%), TE (40%)
        wsST1 = hps.st1HPS > 0 ? (score.st1 / hps.st1HPS) * (config.st1SubWeight * 100) : 0;
        wsST2 = hps.st2HPS > 0 ? (score.st2 / hps.st2HPS) * (config.st2SubWeight * 100) : 0;
        wsTE = hps.teHPS > 0 ? (score.te / hps.teHPS) * (config.teSubWeight * 100) : 0;
        exPS = wsST1 + wsST2 + wsTE;
        exWS = exPS * config.exWeight;
      }
    }

    const initialGrade = Number((wwWS + ptWS + exWS).toFixed(2));
    const transmutedGrade = transmuteGrade(initialGrade);
    const descriptor = getDescriptor(transmutedGrade);

    return {
      wwTotal,
      wwHPSTotal,
      wwPS,
      wwWS,
      ptTotal,
      ptHPSTotal,
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

  // Helper filter
  const filterList = (list: typeof mappedStudents) => {
    if (genderFilter === "ALL") return list;
    return list.filter((s) => s.gender.toUpperCase() === genderFilter);
  };

  // -------------------------------------------------------------
  // TAB 1: INSTRUCTIONS (matching Image 1)
  // -------------------------------------------------------------
  const renderInstructionsTab = () => (
    <div className="w-full font-sans text-xs space-y-6 pt-4 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="border-b-2 border-red-600 pb-3">
        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide block">
          Exclusively for Strengthened SHS Curriculum Implementers
        </span>
        <h2 className="text-xl font-black text-red-700 tracking-tight">
          Instructions: Accomplishing the Electronic Class Record (ECR) for SSHS
        </h2>
      </div>

      {/* Step 1 */}
      <div className="border-2 border-red-500 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white font-black text-sm px-2.5 py-0.5 rounded">1</span>
          <h3 className="font-extrabold text-sm text-foreground">
            Input the correct data for the following sections. Any details entered here are used throughout the e-Class Record.
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border">
            <h4 className="font-bold text-blue-700 dark:text-blue-400 uppercase">SCHOOL INFO & TEACHER INFO</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Select the Region & Division where the school is located.</li>
              <li>Enter the six (6) digit School ID and School Name.</li>
              <li>School Year 2026 - 2027 is pre-filled.</li>
              <li>Teacher's Name, Section Name, and Grade Level (11 or 12 only).</li>
            </ul>
          </div>
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border">
            <h4 className="font-bold text-blue-700 dark:text-blue-400 uppercase">STRENGTHENED SHS & LEARNERS</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Select Subject Category: <strong>ACADEMIC</strong>, <strong>TECH-PRO</strong>, or <strong>CORE</strong>.</li>
              <li>Select Cluster and Subject from the standardized curriculum tracks.</li>
              <li>No. of Terms taught: 1 or 3 terms, with Units per term & year.</li>
              <li>Learners' Names: Enter LRN and Full Names segregated by Male and Female.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="border-2 border-red-500 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white font-black text-sm px-2.5 py-0.5 rounded">2</span>
          <h3 className="font-extrabold text-sm text-foreground">
            Input the raw scores per Summative Assessment component to compute for the term grades and final grades.
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200">
            <div className="font-bold text-blue-800 dark:text-blue-300">Written / Oral Works (WWs)</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Supports up to 10 summative written activities with custom Highest Possible Scores (HPS).
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
            <div className="font-bold text-amber-800 dark:text-amber-300">Product / Performance Tasks (PTs)</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Hands-on outputs, authentic presentations, laboratory tasks, and practical demonstrations (up to 10 tasks).
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
            <div className="font-bold text-emerald-800 dark:text-emerald-300">Examinations (EXs)</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Summative Test 1 (ST1: 30%), Summative Test 2 (ST2: 30%), and Term Examination (TE: 40%).
            </p>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="border-2 border-red-500 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white font-black text-sm px-2.5 py-0.5 rounded">3</span>
          <h3 className="font-extrabold text-sm text-foreground">
            Review final grades. The computation of final grades depends on the selected subject and grade level.
          </h3>
        </div>

        {/* Weights Table and Note */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          <div className="lg:col-span-2 space-y-2">
            <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
              Weight of the Components for Strengthened Senior High School (SSHS)
            </h4>
            <div className="border rounded-lg overflow-hidden border-slate-700">
              <table className="w-full text-[11px] text-center border-collapse">
                <thead>
                  <tr className="bg-black text-white font-bold">
                    <th className="p-2 text-left">Subject Area</th>
                    <th className="p-2 border-l border-slate-700">WWs</th>
                    <th className="p-2 border-l border-slate-700">PTs</th>
                    <th className="p-2 border-l border-slate-700">EXs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="bg-blue-50/50 dark:bg-slate-800/40 font-bold">
                    <td className="p-2 text-left">Core Subjects</td>
                    <td className="p-2">20%</td>
                    <td className="p-2">50%</td>
                    <td className="p-2">30%</td>
                  </tr>
                  <tr className="font-semibold">
                    <td className="p-2 text-left pl-4 text-muted-foreground" colSpan={4}>
                      Academic Electives:
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-left pl-6">All Other Electives</td>
                    <td className="p-1.5">20%</td>
                    <td className="p-1.5">50%</td>
                    <td className="p-1.5">30%</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-left pl-6">Research and Design and Innovation</td>
                    <td className="p-1.5">20%</td>
                    <td className="p-1.5">80%</td>
                    <td className="p-1.5 text-muted-foreground">—</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-left pl-6">Arts, Sports, Health and Wellness</td>
                    <td className="p-1.5">20%</td>
                    <td className="p-1.5">60%</td>
                    <td className="p-1.5">20%</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-left pl-6">Field Experience</td>
                    <td className="p-1.5">15%</td>
                    <td className="p-1.5">70%</td>
                    <td className="p-1.5 font-bold text-blue-600">*15%</td>
                  </tr>
                  <tr className="font-semibold">
                    <td className="p-2 text-left pl-4 text-muted-foreground" colSpan={4}>
                      Tech-Pro Electives:
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-left pl-6">All Other Electives</td>
                    <td className="p-1.5">15%</td>
                    <td className="p-1.5">60%</td>
                    <td className="p-1.5">25%</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-left pl-6">Work Immersion</td>
                    <td className="p-1.5">20%</td>
                    <td className="p-1.5">80%</td>
                    <td className="p-1.5 text-muted-foreground">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note Box */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded-lg text-[11px] text-emerald-900 dark:text-emerald-200">
              <strong>NOTE:</strong> *Given the applied and performance-based nature of SHS Field Exposure, Arts Apprenticeship, Creative Production, and Innovation, the ST/TE component shall consist solely of a Term Examination (TE), with no Summative Tests (STs), and will carry the full weight.
            </div>
          </div>

          {/* Acronyms & Transmutation Preview */}
          <div className="space-y-3">
            <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800/40 text-[11px] space-y-1.5">
              <h4 className="font-bold text-center border-b pb-1">ACRONYMS</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div><strong>EX:</strong> Examinations</div>
                <div><strong>TG:</strong> Term Grade</div>
                <div><strong>IG:</strong> Initial Grade</div>
                <div><strong>WS:</strong> Weighted Score</div>
                <div><strong>PS:</strong> Percentage Score</div>
                <div><strong>WW:</strong> Written Works</div>
                <div><strong>PT:</strong> Performance Tasks</div>
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 text-[11px] space-y-1">
              <h5 className="font-bold text-blue-900 dark:text-blue-300">How the Grade is Computed:</h5>
              <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                <li>Percentage Score (PS) = (Raw Score ÷ HPS) × 100</li>
                <li>Weighted Score (WS) = PS × Component Weight</li>
                <li>Initial Grade (IG) = Total of WW WS + PT WS + EX WS</li>
                <li>Transmuted Term Grade (TG) via Adjusted Table</li>
                <li>Final Grade = Average of Term Grades (1 to 3)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="border-2 border-red-500 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-3">
        <span className="bg-red-600 text-white font-black text-sm px-2.5 py-0.5 rounded">4</span>
        <p className="font-bold text-xs text-foreground">
          Print only the appropriate sheets for reporting purposes and ensure that learner data is handled in compliance with data privacy policies.
        </p>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // TAB 2: INPUT DATA SHEET (matching Image 2)
  // -------------------------------------------------------------
  const renderInputDataTab = () => (
    <div className="w-full font-sans text-xs space-y-6 pt-2">
      {/* Top Header Banner matching Image 2 */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <img src={leftLogo} alt="Seal" className="h-14 w-14 object-contain" />
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide block">
              Exclusively for Strengthened SHS Curriculum Implementers
            </span>
            <h1 className="text-lg font-black text-[#15479E] tracking-tight">
              Input Data Sheet for Electronic-Class Record (ECR)
            </h1>
            <p className="text-[11px] text-muted-foreground italic">
              Pursuant to DepEd Order 15, series of 2026
            </p>
          </div>
        </div>
        <img src={rightLogo} alt="DepEd Logo" className="h-12 object-contain" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): School Info & Config */}
        <div className="lg:col-span-5 space-y-4">
          {/* SCHOOL INFO BOX */}
          <div className="border border-[#15479E] rounded-lg overflow-hidden shadow-sm">
            <div className="bg-[#15479E] text-white px-3 py-1.5 font-extrabold text-xs uppercase tracking-wide">
              SCHOOL INFO
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 space-y-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">REGION :</span>
                <input
                  type="text"
                  value={schoolInfo.region}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, region: e.target.value })}
                  className="col-span-2 border rounded px-2 h-7 font-medium bg-background"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">DIVISION :</span>
                <input
                  type="text"
                  value={schoolInfo.division}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, division: e.target.value })}
                  className="col-span-2 border rounded px-2 h-7 font-medium bg-background"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">SCHOOL ID :</span>
                <input
                  type="text"
                  value={schoolInfo.schoolId}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolId: e.target.value })}
                  className="col-span-2 border rounded px-2 h-7 font-mono font-bold bg-background"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">SCHOOL NAME :</span>
                <input
                  type="text"
                  value={schoolInfo.schoolName}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                  className="col-span-2 border rounded px-2 h-7 font-semibold bg-background"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">SCHOOL YEAR :</span>
                <input
                  type="text"
                  value={schoolInfo.schoolYear}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolYear: e.target.value })}
                  className="col-span-2 border rounded px-2 h-7 font-bold bg-background text-blue-700 dark:text-blue-400"
                />
              </div>
            </div>
          </div>

          {/* TEACHER & SUBJECT AREA INFO */}
          <div className="border border-[#15479E] rounded-lg overflow-hidden shadow-sm">
            <div className="bg-[#15479E] text-white px-3 py-1.5 font-extrabold text-xs uppercase tracking-wide">
              TEACHER, GRADE LEVEL, AND SUBJECT AREA INFO
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 space-y-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">TEACHER :</span>
                <input
                  type="text"
                  value={schoolInfo.teacher}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, teacher: e.target.value })}
                  className="col-span-2 border rounded px-2 h-7 font-medium bg-background"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">GRADE LEVEL :</span>
                <div className="col-span-2 flex items-center gap-2">
                  <select
                    value={schoolInfo.gradeLevel}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, gradeLevel: e.target.value })}
                    className="border rounded px-2 h-7 font-bold bg-background text-xs"
                  >
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground italic">* Accepts 11 or 12 only.</span>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">SECTION NAME :</span>
                <input
                  type="text"
                  value={schoolInfo.section}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, section: e.target.value })}
                  className="col-span-2 border rounded px-2 h-7 font-semibold bg-background"
                />
              </div>

              {/* STRENGTHENED SHS FIELDS */}
              <div className="pt-2 border-t mt-2 space-y-2">
                <div className="grid grid-cols-3 items-center gap-2">
                  <span className="text-[11px] font-bold text-[#15479E]">SUBJECT CATEGORY :</span>
                  <select
                    value={schoolInfo.subjectCategory}
                    onChange={(e) => {
                      const cat = e.target.value as "CORE" | "ACADEMIC" | "TECH-PRO";
                      setSchoolInfo({ ...schoolInfo, subjectCategory: cat });
                      if (cat === "CORE") setSelectedWeightKey("core");
                      else if (cat === "ACADEMIC") setSelectedWeightKey("academic_general");
                      else setSelectedWeightKey("techpro_general");
                    }}
                    className="col-span-2 border rounded px-2 h-7 font-bold bg-background text-xs"
                  >
                    <option value="CORE">CORE</option>
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="TECH-PRO">TECH-PRO</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 items-center gap-2">
                  <span className="text-[11px] font-bold text-[#15479E]">SUBJECT PRESET :</span>
                  <select
                    value={selectedWeightKey}
                    onChange={(e) => setSelectedWeightKey(e.target.value)}
                    className="col-span-2 border rounded px-2 h-7 font-semibold bg-background text-xs"
                  >
                    <option value="core">Core Subjects (20% WW / 50% PT / 30% EX)</option>
                    <option value="academic_general">Academic Electives (20% WW / 50% PT / 30% EX)</option>
                    <option value="academic_research">Research & Innovation (20% WW / 80% PT / 0% EX)</option>
                    <option value="academic_arts_sports">Arts, Sports & Wellness (20% WW / 60% PT / 20% EX)</option>
                    <option value="academic_field">Field Experience (15% WW / 70% PT / 15% TE)</option>
                    <option value="techpro_general">Tech-Pro Electives (15% WW / 60% PT / 25% EX)</option>
                    <option value="techpro_immersion">Work Immersion (20% WW / 80% PT / 0% EX)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground">CLUSTER :</span>
                  <input
                    type="text"
                    value={schoolInfo.cluster}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, cluster: e.target.value })}
                    className="col-span-2 border rounded px-2 h-7 font-medium bg-background"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground">SUBJECT :</span>
                  <input
                    type="text"
                    value={schoolInfo.subject}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, subject: e.target.value })}
                    className="col-span-2 border rounded px-2 h-7 font-bold text-blue-700 dark:text-blue-300 bg-background"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground">OTHER ELECTIVE :</span>
                  <input
                    type="text"
                    placeholder="Enter special elective name if any..."
                    value={schoolInfo.otherElective}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, otherElective: e.target.value })}
                    className="col-span-2 border rounded px-2 h-7 text-xs bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COMPONENT WEIGHTS BOX */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/60 p-3 space-y-2">
            <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 border-b pb-1">
              ACTIVE COMPONENT WEIGHTS
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center py-0.5">
                <span>Written / Oral Works (WWs):</span>
                <span className="font-extrabold text-blue-700 dark:text-blue-400">
                  {(currentWeightConfig.wwWeight * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Performance Tasks (PTs):</span>
                <span className="font-extrabold text-amber-700 dark:text-amber-400">
                  {(currentWeightConfig.ptWeight * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Examinations (EXs):</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {(currentWeightConfig.exWeight * 100).toFixed(0)}%
                </span>
              </div>
              {currentWeightConfig.exWeight > 0 && (
                <div className="pl-3 border-l-2 border-emerald-400 space-y-0.5 text-[10px] text-muted-foreground">
                  <div>Summative Test 1: {(currentWeightConfig.st1SubWeight * 100).toFixed(0)}%</div>
                  <div>Summative Test 2: {(currentWeightConfig.st2SubWeight * 100).toFixed(0)}%</div>
                  <div>Term Exam: {(currentWeightConfig.teSubWeight * 100).toFixed(0)}%</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): LEARNERS' NAMES matching Image 2 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[#15479E] rounded-lg overflow-hidden shadow-sm">
            <div className="bg-[#15479E] text-white px-4 py-2 font-extrabold text-xs uppercase tracking-wide flex justify-between items-center">
              <span>LEARNERS' NAMES</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                Total: {mappedStudents.length} Students
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 space-y-6">
              {/* Male Learners */}
              <div className="space-y-2">
                <div className="bg-[#15479E]/10 border border-[#15479E]/30 px-3 py-1 font-bold text-xs text-[#15479E] uppercase rounded flex justify-between">
                  <span>MALE LEARNERS</span>
                  <span className="text-[11px] font-mono">
                    {mappedStudents.filter((s) => s.gender === "Male").length}
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-muted-foreground border-b">
                      <tr>
                        <th className="w-10 p-2 text-center">#</th>
                        <th className="w-32 p-2 text-left">LRN</th>
                        <th className="p-2 text-left">NAME (Last, First Middle)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {mappedStudents
                        .filter((s) => s.gender === "Male")
                        .map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2 text-center font-mono font-bold text-muted-foreground">
                              {idx + 1}
                            </td>
                            <td className="p-2 font-mono">{s.lrn}</td>
                            <td className="p-2 font-semibold text-foreground">{s.name}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Female Learners */}
              <div className="space-y-2">
                <div className="bg-pink-500/10 border border-pink-500/30 px-3 py-1 font-bold text-xs text-pink-700 dark:text-pink-400 uppercase rounded flex justify-between">
                  <span>FEMALE LEARNERS</span>
                  <span className="text-[11px] font-mono">
                    {mappedStudents.filter((s) => s.gender === "Female").length}
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-muted-foreground border-b">
                      <tr>
                        <th className="w-10 p-2 text-center">#</th>
                        <th className="w-32 p-2 text-left">LRN</th>
                        <th className="p-2 text-left">NAME (Last, First Middle)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {mappedStudents
                        .filter((s) => s.gender === "Female")
                        .map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2 text-center font-mono font-bold text-muted-foreground">
                              {idx + 1}
                            </td>
                            <td className="p-2 font-mono">{s.lrn}</td>
                            <td className="p-2 font-semibold text-foreground">{s.name}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // TAB 3, 4, 5: TERM SHEETS (FIRST, SECOND, THIRD TERM - Image 3)
  // -------------------------------------------------------------
  const renderTermSheet = (termKey: "term1" | "term2" | "term3") => {
    const termTitle =
      termKey === "term1" ? "FIRST TERM" : termKey === "term2" ? "SECOND TERM" : "THIRD TERM";

    const termScores = scoresData[termKey] || {};

    const maleStudents = filterList(mappedStudents.filter((s) => s.gender === "Male"));
    const femaleStudents = filterList(mappedStudents.filter((s) => s.gender === "Female"));

    return (
      <div className="w-full overflow-x-auto print:overflow-visible">
        <div className="min-w-[1300px] space-y-0 text-xs">
          {/* Header Banner matching Image 3 */}
          <div className="p-4 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 border border-black dark:border-slate-700 space-y-3 print:bg-white print:text-black">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer group relative" title="Click to upload Left Logo">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e, "left")}
                  />
                  <img
                    src={leftLogo}
                    alt="Kagawaran ng Edukasyon"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/deped-seal.png";
                    }}
                    className="h-16 w-16 object-contain group-hover:opacity-80 transition-opacity"
                  />
                </label>
              </div>

              <div className="text-center space-y-0.5">
                <h2 className="text-base font-black tracking-tight uppercase">
                  Strengthened Senior High School Class Record
                </h2>
                <p className="text-[11px] italic text-muted-foreground font-serif">
                  (Pursuant to DepEd Order 15, series of 2026)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer group relative" title="Click to upload Right Logo">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e, "right")}
                  />
                  <img
                    src={rightLogo}
                    alt="DepEd Logo"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/deped-logo.png";
                    }}
                    className="h-14 w-24 object-contain group-hover:opacity-80 transition-opacity"
                  />
                </label>
              </div>
            </div>

            {/* School Meta Grid matching Image 3 */}
            <div className="border border-black dark:border-slate-600 text-[11px] grid grid-cols-12 divide-x divide-black dark:divide-slate-600">
              <div className="col-span-4 p-1.5 space-y-1">
                <div className="flex">
                  <span className="w-20 font-bold">REGION:</span>
                  <span className="font-semibold">{schoolInfo.region}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">SCHOOL NAME:</span>
                  <span className="font-semibold">{schoolInfo.schoolName}</span>
                </div>
              </div>
              <div className="col-span-4 p-1.5 space-y-1">
                <div className="flex">
                  <span className="w-20 font-bold">DIVISION:</span>
                  <span className="font-semibold">{schoolInfo.division}</span>
                </div>
              </div>
              <div className="col-span-4 p-1.5 space-y-1">
                <div className="flex">
                  <span className="w-24 font-bold">SCHOOL ID:</span>
                  <span className="font-mono font-bold">{schoolInfo.schoolId}</span>
                </div>
                <div className="flex">
                  <span className="w-24 font-bold">SCHOOL YEAR:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">{schoolInfo.schoolYear}</span>
                </div>
              </div>
            </div>

            {/* Class Meta Grid */}
            <div className="border border-black dark:border-slate-600 text-[11px] grid grid-cols-12 divide-x divide-black dark:divide-slate-600">
              <div className="col-span-2 p-1.5">
                <span className="font-bold">GRADE LEVEL:</span>{" "}
                <span className="font-semibold">{schoolInfo.gradeLevel}</span>
              </div>
              <div className="col-span-2 p-1.5">
                <span className="font-bold">SECTION:</span>{" "}
                <span className="font-semibold">{schoolInfo.section}</span>
              </div>
              <div className="col-span-4 p-1.5">
                <span className="font-bold text-blue-700 dark:text-blue-400">SUBJECT:</span>{" "}
                <span className="font-extrabold uppercase text-blue-800 dark:text-blue-300">
                  {schoolInfo.subject}
                </span>
              </div>
              <div className="col-span-4 p-1.5">
                <span className="font-bold">UNITS:</span> / TERM:{" "}
                <span className="font-mono font-bold mr-3">{schoolInfo.unitsPerTerm}</span> / YEAR:{" "}
                <span className="font-mono font-bold">{schoolInfo.unitsPerYear}</span>
              </div>
            </div>

            <div className="border border-black dark:border-slate-600 text-[11px] grid grid-cols-12 divide-x divide-black dark:divide-slate-600">
              <div className="col-span-6 p-1.5">
                <span className="font-bold">TEACHER:</span>{" "}
                <span className="font-semibold">{schoolInfo.teacher}</span>
              </div>
              <div className="col-span-6 p-1.5">
                <span className="font-bold">CLUSTER:</span>{" "}
                <span className="font-semibold">{schoolInfo.cluster}</span>
              </div>
            </div>
          </div>

          {/* MAIN SPREADSHEET TABLE matching Image 3 */}
          <div className="border-x border-b border-black dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-center border-collapse text-[11px]">
              <thead>
                {/* Master Component Headers */}
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-black text-slate-900 dark:text-slate-100 font-extrabold">
                  <th rowSpan={2} className="p-2 border-r border-black w-24 bg-white dark:bg-slate-900 text-sm font-black text-center text-[#15479E]">
                    {termTitle}
                  </th>
                  <th colSpan={13} className="p-1 border-r border-black bg-blue-100 dark:bg-blue-950/60 uppercase">
                    WRITTEN / ORAL WORKS (WWs) — {(currentWeightConfig.wwWeight * 100).toFixed(0)}%
                  </th>
                  <th colSpan={13} className="p-1 border-r border-black bg-amber-100 dark:bg-amber-950/60 uppercase">
                    PRODUCT / PERFORMANCE TASKS (PTs) — {(currentWeightConfig.ptWeight * 100).toFixed(0)}%
                  </th>
                  <th colSpan={8} className="p-1 border-r border-black bg-emerald-100 dark:bg-emerald-950/60 uppercase">
                    EXAMINATIONS (EXs) — {(currentWeightConfig.exWeight * 100).toFixed(0)}%
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-black w-14 bg-slate-200 dark:bg-slate-800 text-[10px] leading-tight">
                    INITIAL<br />GRADE
                  </th>
                  <th rowSpan={2} className="p-1 w-14 bg-blue-600 text-white font-black text-[10px] leading-tight">
                    TERM<br />GRADE
                  </th>
                </tr>

                {/* Sub-column Headers */}
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-black font-bold text-[10px]">
                  {/* WW 1..10, Total, PS, WS */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <th key={`ww-head-${num}`} className="w-7 border-r border-slate-300 dark:border-slate-700 py-1">
                      {num}
                    </th>
                  ))}
                  <th className="w-10 border-r border-black font-extrabold bg-blue-50/50 dark:bg-blue-900/20">TOTAL</th>
                  <th className="w-9 border-r border-slate-300 font-extrabold">PS</th>
                  <th className="w-9 border-r border-black font-extrabold bg-blue-100/50 text-blue-900 dark:text-blue-300">WS</th>

                  {/* PT 1..10, Total, PS, WS */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <th key={`pt-head-${num}`} className="w-7 border-r border-slate-300 dark:border-slate-700 py-1">
                      {num}
                    </th>
                  ))}
                  <th className="w-10 border-r border-black font-extrabold bg-amber-50/50 dark:bg-amber-900/20">TOTAL</th>
                  <th className="w-9 border-r border-slate-300 font-extrabold">PS</th>
                  <th className="w-9 border-r border-black font-extrabold bg-amber-100/50 text-amber-900 dark:text-amber-300">WS</th>

                  {/* Examinations: ST1, ST2, TE, WS ST1, WS ST2, WS TE, PS, WS */}
                  <th className="w-8 border-r border-slate-300">ST 1</th>
                  <th className="w-8 border-r border-slate-300">ST 2</th>
                  <th className="w-8 border-r border-slate-300 font-bold">TE</th>
                  <th className="w-10 border-r border-slate-300 text-[9px]">WS ST1</th>
                  <th className="w-10 border-r border-slate-300 text-[9px]">WS ST2</th>
                  <th className="w-10 border-r border-slate-300 text-[9px]">WS TE</th>
                  <th className="w-9 border-r border-slate-300 font-extrabold">PS</th>
                  <th className="w-9 border-r border-black font-extrabold bg-emerald-100/50 text-emerald-900 dark:text-emerald-300">WS</th>
                </tr>

                {/* HIGHEST POSSIBLE SCORE (HPS) ROW */}
                <tr className="bg-slate-200 dark:bg-slate-800 font-bold border-b-2 border-black text-[10px]">
                  <td className="p-1 border-r border-black text-left pl-2 italic font-black uppercase">
                    HIGHEST POSSIBLE SCORE
                  </td>
                  {/* WW HPS */}
                  {hps.wwHPS.map((val, idx) => (
                    <td key={`hps-ww-${idx}`} className="border-r border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        value={val || ""}
                        onChange={(e) => {
                          const updated = [...hps.wwHPS];
                          updated[idx] = Number(e.target.value) || 0;
                          setHps({ ...hps, wwHPS: updated });
                        }}
                        className="w-full text-center bg-transparent h-6 focus:bg-white focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="border-r border-black bg-blue-100/40 font-extrabold">
                    {hps.wwHPS.reduce((a, b) => a + b, 0)}
                  </td>
                  <td className="border-r border-slate-300 font-bold">100</td>
                  <td className="border-r border-black font-bold text-blue-700">
                    {(currentWeightConfig.wwWeight * 100).toFixed(0)}
                  </td>

                  {/* PT HPS */}
                  {hps.ptHPS.map((val, idx) => (
                    <td key={`hps-pt-${idx}`} className="border-r border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        value={val || ""}
                        onChange={(e) => {
                          const updated = [...hps.ptHPS];
                          updated[idx] = Number(e.target.value) || 0;
                          setHps({ ...hps, ptHPS: updated });
                        }}
                        className="w-full text-center bg-transparent h-6 focus:bg-white focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="border-r border-black bg-amber-100/40 font-extrabold">
                    {hps.ptHPS.reduce((a, b) => a + b, 0)}
                  </td>
                  <td className="border-r border-slate-300 font-bold">100</td>
                  <td className="border-r border-black font-bold text-amber-700">
                    {(currentWeightConfig.ptWeight * 100).toFixed(0)}
                  </td>

                  {/* EX HPS */}
                  <td className="border-r border-slate-300">
                    <input
                      type="number"
                      min="0"
                      value={hps.st1HPS || ""}
                      onChange={(e) => setHps({ ...hps, st1HPS: Number(e.target.value) || 0 })}
                      className="w-full text-center bg-transparent h-6 font-semibold"
                    />
                  </td>
                  <td className="border-r border-slate-300">
                    <input
                      type="number"
                      min="0"
                      value={hps.st2HPS || ""}
                      onChange={(e) => setHps({ ...hps, st2HPS: Number(e.target.value) || 0 })}
                      className="w-full text-center bg-transparent h-6 font-semibold"
                    />
                  </td>
                  <td className="border-r border-slate-300">
                    <input
                      type="number"
                      min="0"
                      value={hps.teHPS || ""}
                      onChange={(e) => setHps({ ...hps, teHPS: Number(e.target.value) || 0 })}
                      className="w-full text-center bg-transparent h-6 font-bold"
                    />
                  </td>
                  <td className="border-r border-slate-300 text-[9px] font-bold">
                    {(currentWeightConfig.st1SubWeight * 100).toFixed(0)}
                  </td>
                  <td className="border-r border-slate-300 text-[9px] font-bold">
                    {(currentWeightConfig.st2SubWeight * 100).toFixed(0)}
                  </td>
                  <td className="border-r border-slate-300 text-[9px] font-bold">
                    {(currentWeightConfig.teSubWeight * 100).toFixed(0)}
                  </td>
                  <td className="border-r border-slate-300 font-bold">100</td>
                  <td className="border-r border-black font-bold text-emerald-700">
                    {(currentWeightConfig.exWeight * 100).toFixed(0)}
                  </td>
                  <td className="border-r border-black font-bold">100</td>
                  <td className="font-black bg-blue-700 text-white">100</td>
                </tr>
              </thead>

              <tbody>
                {/* MALE SECTION HEADER */}
                <tr className="bg-black text-white font-extrabold text-[11px] text-left">
                  <td colSpan={37} className="p-1.5 pl-3">
                    MALE ({maleStudents.length})
                  </td>
                </tr>

                {/* MALE STUDENTS */}
                {maleStudents.map((student, idx) => {
                  const score = termScores[student.id] || createEmptyScore();
                  const calc = computeStudentTerm(score);

                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-200 dark:border-slate-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 ${
                        idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      <td className="p-1 border-r border-black text-left pl-2 whitespace-nowrap font-medium flex items-center gap-1.5">
                        <span className="w-5 text-muted-foreground font-mono text-[10px]">{idx + 1}.</span>
                        <span className="font-semibold text-foreground">{student.name}</span>
                      </td>

                      {/* WW Scores */}
                      {score.ww.map((val, wIdx) => (
                        <td key={`ww-${student.id}-${wIdx}`} className="border-r border-slate-200 dark:border-slate-800 p-0">
                          <input
                            type="number"
                            min="0"
                            value={val === 0 ? "" : val}
                            onChange={(e) =>
                              handleScoreChange(termKey, student.id, "ww", wIdx, Number(e.target.value) || 0)
                            }
                            className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="border-r border-black font-bold bg-blue-50/40 dark:bg-blue-950/20">
                        {calc.wwTotal}
                      </td>
                      <td className="border-r border-slate-300 font-semibold">{calc.wwPS.toFixed(2)}</td>
                      <td className="border-r border-black font-bold text-blue-700 dark:text-blue-400 bg-blue-100/30">
                        {calc.wwWS.toFixed(2)}
                      </td>

                      {/* PT Scores */}
                      {score.pt.map((val, pIdx) => (
                        <td key={`pt-${student.id}-${pIdx}`} className="border-r border-slate-200 dark:border-slate-800 p-0">
                          <input
                            type="number"
                            min="0"
                            value={val === 0 ? "" : val}
                            onChange={(e) =>
                              handleScoreChange(termKey, student.id, "pt", pIdx, Number(e.target.value) || 0)
                            }
                            className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="border-r border-black font-bold bg-amber-50/40 dark:bg-amber-950/20">
                        {calc.ptTotal}
                      </td>
                      <td className="border-r border-slate-300 font-semibold">{calc.ptPS.toFixed(2)}</td>
                      <td className="border-r border-black font-bold text-amber-700 dark:text-amber-400 bg-amber-100/30">
                        {calc.ptWS.toFixed(2)}
                      </td>

                      {/* EX Scores */}
                      <td className="border-r border-slate-200 dark:border-slate-800 p-0">
                        <input
                          type="number"
                          min="0"
                          value={score.st1 === 0 ? "" : score.st1}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "st1", undefined, Number(e.target.value) || 0)
                          }
                          className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="border-r border-slate-200 dark:border-slate-800 p-0">
                        <input
                          type="number"
                          min="0"
                          value={score.st2 === 0 ? "" : score.st2}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "st2", undefined, Number(e.target.value) || 0)
                          }
                          className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="border-r border-slate-200 dark:border-slate-800 p-0">
                        <input
                          type="number"
                          min="0"
                          value={score.te === 0 ? "" : score.te}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "te", undefined, Number(e.target.value) || 0)
                          }
                          className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none font-bold"
                        />
                      </td>
                      <td className="border-r border-slate-300 font-mono text-[10px]">{calc.wsST1.toFixed(1)}</td>
                      <td className="border-r border-slate-300 font-mono text-[10px]">{calc.wsST2.toFixed(1)}</td>
                      <td className="border-r border-slate-300 font-mono text-[10px]">{calc.wsTE.toFixed(1)}</td>
                      <td className="border-r border-slate-300 font-semibold">{calc.exPS.toFixed(2)}</td>
                      <td className="border-r border-black font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/30">
                        {calc.exWS.toFixed(2)}
                      </td>

                      {/* Initial & Transmuted Term Grade */}
                      <td className="border-r border-black font-bold bg-slate-100 dark:bg-slate-800">
                        {calc.initialGrade.toFixed(2)}
                      </td>
                      <td
                        className={`font-black text-xs ${
                          calc.transmutedGrade >= 75
                            ? "bg-blue-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {calc.transmutedGrade}
                      </td>
                    </tr>
                  );
                })}

                {/* FEMALE SECTION HEADER */}
                <tr className="bg-black text-white font-extrabold text-[11px] text-left">
                  <td colSpan={37} className="p-1.5 pl-3">
                    FEMALE ({femaleStudents.length})
                  </td>
                </tr>

                {/* FEMALE STUDENTS */}
                {femaleStudents.map((student, idx) => {
                  const score = termScores[student.id] || createEmptyScore();
                  const calc = computeStudentTerm(score);

                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-200 dark:border-slate-800 hover:bg-pink-50/40 dark:hover:bg-pink-950/20 ${
                        idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      <td className="p-1 border-r border-black text-left pl-2 whitespace-nowrap font-medium flex items-center gap-1.5">
                        <span className="w-5 text-muted-foreground font-mono text-[10px]">{idx + 1}.</span>
                        <span className="font-semibold text-foreground">{student.name}</span>
                      </td>

                      {/* WW Scores */}
                      {score.ww.map((val, wIdx) => (
                        <td key={`ww-f-${student.id}-${wIdx}`} className="border-r border-slate-200 dark:border-slate-800 p-0">
                          <input
                            type="number"
                            min="0"
                            value={val === 0 ? "" : val}
                            onChange={(e) =>
                              handleScoreChange(termKey, student.id, "ww", wIdx, Number(e.target.value) || 0)
                            }
                            className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="border-r border-black font-bold bg-blue-50/40 dark:bg-blue-950/20">
                        {calc.wwTotal}
                      </td>
                      <td className="border-r border-slate-300 font-semibold">{calc.wwPS.toFixed(2)}</td>
                      <td className="border-r border-black font-bold text-blue-700 dark:text-blue-400 bg-blue-100/30">
                        {calc.wwWS.toFixed(2)}
                      </td>

                      {/* PT Scores */}
                      {score.pt.map((val, pIdx) => (
                        <td key={`pt-f-${student.id}-${pIdx}`} className="border-r border-slate-200 dark:border-slate-800 p-0">
                          <input
                            type="number"
                            min="0"
                            value={val === 0 ? "" : val}
                            onChange={(e) =>
                              handleScoreChange(termKey, student.id, "pt", pIdx, Number(e.target.value) || 0)
                            }
                            className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="border-r border-black font-bold bg-amber-50/40 dark:bg-amber-950/20">
                        {calc.ptTotal}
                      </td>
                      <td className="border-r border-slate-300 font-semibold">{calc.ptPS.toFixed(2)}</td>
                      <td className="border-r border-black font-bold text-amber-700 dark:text-amber-400 bg-amber-100/30">
                        {calc.ptWS.toFixed(2)}
                      </td>

                      {/* EX Scores */}
                      <td className="border-r border-slate-200 dark:border-slate-800 p-0">
                        <input
                          type="number"
                          min="0"
                          value={score.st1 === 0 ? "" : score.st1}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "st1", undefined, Number(e.target.value) || 0)
                          }
                          className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="border-r border-slate-200 dark:border-slate-800 p-0">
                        <input
                          type="number"
                          min="0"
                          value={score.st2 === 0 ? "" : score.st2}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "st2", undefined, Number(e.target.value) || 0)
                          }
                          className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="border-r border-slate-200 dark:border-slate-800 p-0">
                        <input
                          type="number"
                          min="0"
                          value={score.te === 0 ? "" : score.te}
                          onChange={(e) =>
                            handleScoreChange(termKey, student.id, "te", undefined, Number(e.target.value) || 0)
                          }
                          className="w-full text-center bg-transparent h-7 focus:bg-white focus:outline-none font-bold"
                        />
                      </td>
                      <td className="border-r border-slate-300 font-mono text-[10px]">{calc.wsST1.toFixed(1)}</td>
                      <td className="border-r border-slate-300 font-mono text-[10px]">{calc.wsST2.toFixed(1)}</td>
                      <td className="border-r border-slate-300 font-mono text-[10px]">{calc.wsTE.toFixed(1)}</td>
                      <td className="border-r border-slate-300 font-semibold">{calc.exPS.toFixed(2)}</td>
                      <td className="border-r border-black font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/30">
                        {calc.exWS.toFixed(2)}
                      </td>

                      {/* Initial & Transmuted Term Grade */}
                      <td className="border-r border-black font-bold bg-slate-100 dark:bg-slate-800">
                        {calc.initialGrade.toFixed(2)}
                      </td>
                      <td
                        className={`font-black text-xs ${
                          calc.transmutedGrade >= 75
                            ? "bg-blue-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {calc.transmutedGrade}
                      </td>
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

  // -------------------------------------------------------------
  // TAB 6: FINAL GRADES SHEET (matching Image 4)
  // -------------------------------------------------------------
  const renderFinalGradesTab = () => {
    const maleStudents = filterList(mappedStudents.filter((s) => s.gender === "Male"));
    const femaleStudents = filterList(mappedStudents.filter((s) => s.gender === "Female"));

    return (
      <div className="w-full overflow-x-auto print:overflow-visible space-y-4">
        <div className="min-w-[1000px] space-y-3 text-xs">
          {/* Header Banner matching Image 4 */}
          <div className="p-4 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 border border-black dark:border-slate-700 space-y-3 print:bg-white print:text-black">
            <div className="flex items-center justify-between px-2">
              <img src={leftLogo} alt="Seal" className="h-16 w-16 object-contain" />
              <div className="text-center space-y-0.5">
                <h1 className="text-xl font-black tracking-tight text-[#15479E] uppercase">
                  FINAL GRADES
                </h1>
                <h2 className="text-sm font-bold tracking-tight uppercase">
                  Strengthened Senior High School Class Record
                </h2>
                <p className="text-[10px] italic text-muted-foreground font-serif">
                  (Pursuant to DepEd Order 15, series of 2026)
                </p>
              </div>
              <img src={rightLogo} alt="DepEd Logo" className="h-14 w-24 object-contain" />
            </div>

            {/* School Meta Grid */}
            <div className="border border-black dark:border-slate-600 text-[11px] grid grid-cols-12 divide-x divide-black dark:divide-slate-600">
              <div className="col-span-4 p-1.5 space-y-1">
                <div className="flex">
                  <span className="w-20 font-bold">REGION:</span>
                  <span className="font-semibold">{schoolInfo.region}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">SCHOOL NAME:</span>
                  <span className="font-semibold">{schoolInfo.schoolName}</span>
                </div>
              </div>
              <div className="col-span-4 p-1.5 space-y-1">
                <div className="flex">
                  <span className="w-20 font-bold">DIVISION:</span>
                  <span className="font-semibold">{schoolInfo.division}</span>
                </div>
              </div>
              <div className="col-span-4 p-1.5 space-y-1">
                <div className="flex">
                  <span className="w-24 font-bold">SCHOOL ID:</span>
                  <span className="font-mono font-bold">{schoolInfo.schoolId}</span>
                </div>
                <div className="flex">
                  <span className="w-24 font-bold">SCHOOL YEAR:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">{schoolInfo.schoolYear}</span>
                </div>
              </div>
            </div>

            {/* Class Meta Grid matching Image 4 */}
            <div className="border border-black dark:border-slate-600 text-[11px] grid grid-cols-12 divide-x divide-black dark:divide-slate-600">
              <div className="col-span-5 p-1.5 space-y-1">
                <div className="flex">
                  <span className="w-28 font-bold">GRADE LEVEL:</span>
                  <span className="font-semibold">{schoolInfo.gradeLevel}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-bold">SECTION:</span>
                  <span className="font-semibold">{schoolInfo.section}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-bold">TEACHER:</span>
                  <span className="font-semibold">{schoolInfo.teacher}</span>
                </div>
              </div>

              <div className="col-span-7 p-1.5 space-y-1">
                <div className="flex">
                  <span className="w-24 font-bold text-blue-700 dark:text-blue-400">SUBJECT :</span>
                  <span className="font-extrabold uppercase text-blue-800 dark:text-blue-300">
                    {schoolInfo.subject}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-24 font-bold">CLUSTER :</span>
                  <span className="font-semibold">{schoolInfo.cluster}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-300 dark:border-slate-700 text-[10px]">
                  <div>
                    <span className="font-bold block">NO. OF TERMS</span>
                    <span className="font-mono">{schoolInfo.noTermsTaught}</span>
                  </div>
                  <div>
                    <span className="font-bold block">TERM BLOCKS</span>
                    <span className="font-mono">{schoolInfo.termBlocks}</span>
                  </div>
                  <div>
                    <span className="font-bold block">UNITS PER TERM</span>
                    <span className="font-mono">{schoolInfo.unitsPerTerm}</span>
                  </div>
                  <div>
                    <span className="font-bold block">TOTAL UNITS EARNED</span>
                    <span className="font-mono font-bold text-blue-600">{schoolInfo.unitsPerYear}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FINAL GRADES TABLE matching Image 4 */}
          <div className="border border-black dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-center border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-black font-extrabold text-slate-900 dark:text-slate-100">
                  <th rowSpan={2} className="p-2 border-r border-black w-12 text-center">
                    #
                  </th>
                  <th rowSpan={2} className="p-2 border-r border-black text-left w-64">
                    LEARNERS' NAMES
                  </th>
                  <th colSpan={3} className="p-1 border-r border-black bg-blue-50 dark:bg-blue-950/40 uppercase">
                    TERM GRADES
                  </th>
                  <th rowSpan={2} className="p-2 border-r border-black w-24 bg-blue-100/60 font-black text-blue-900 dark:text-blue-200">
                    FINAL GRADE
                  </th>
                  <th rowSpan={2} className="p-2 border-r border-black w-36">
                    DESCRIPTOR
                  </th>
                  <th rowSpan={2} className="p-2 w-28">
                    REMARK
                  </th>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-black font-bold text-[10px]">
                  <th className="p-1 border-r border-black w-24">FIRST TERM</th>
                  <th className="p-1 border-r border-black w-24">SECOND TERM</th>
                  <th className="p-1 border-r border-black w-24">THIRD TERM</th>
                </tr>
              </thead>

              <tbody>
                {/* MALE HEADER */}
                <tr className="bg-black text-white font-extrabold text-[11px] text-left">
                  <td colSpan={8} className="p-1.5 pl-3">
                    MALE ({maleStudents.length})
                  </td>
                </tr>

                {maleStudents.map((student, idx) => {
                  const t1 = computeStudentTerm(scoresData.term1[student.id] || createEmptyScore()).transmutedGrade;
                  const t2 = computeStudentTerm(scoresData.term2[student.id] || createEmptyScore()).transmutedGrade;
                  const t3 = computeStudentTerm(scoresData.term3[student.id] || createEmptyScore()).transmutedGrade;
                  const finalAvg = Math.round((t1 + t2 + t3) / 3);
                  const descriptor = getDescriptor(finalAvg);
                  const remark = finalAvg >= 75 ? "PASSED" : "FAILED";

                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                        idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      <td className="p-2 border-r border-black font-mono font-bold text-muted-foreground text-center">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-black text-left font-semibold text-foreground">
                        {student.name}
                      </td>
                      <td className="p-2 border-r border-black font-mono font-bold">{t1}</td>
                      <td className="p-2 border-r border-black font-mono font-bold">{t2}</td>
                      <td className="p-2 border-r border-black font-mono font-bold">{t3}</td>
                      <td className="p-2 border-r border-black font-mono font-black text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300">
                        {finalAvg}
                      </td>
                      <td className="p-2 border-r border-black font-medium">{descriptor}</td>
                      <td className="p-2 font-black">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            remark === "PASSED"
                              ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                          }`}
                        >
                          {remark}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* FEMALE HEADER */}
                <tr className="bg-black text-white font-extrabold text-[11px] text-left">
                  <td colSpan={8} className="p-1.5 pl-3">
                    FEMALE ({femaleStudents.length})
                  </td>
                </tr>

                {femaleStudents.map((student, idx) => {
                  const t1 = computeStudentTerm(scoresData.term1[student.id] || createEmptyScore()).transmutedGrade;
                  const t2 = computeStudentTerm(scoresData.term2[student.id] || createEmptyScore()).transmutedGrade;
                  const t3 = computeStudentTerm(scoresData.term3[student.id] || createEmptyScore()).transmutedGrade;
                  const finalAvg = Math.round((t1 + t2 + t3) / 3);
                  const descriptor = getDescriptor(finalAvg);
                  const remark = finalAvg >= 75 ? "PASSED" : "FAILED";

                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                        idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      <td className="p-2 border-r border-black font-mono font-bold text-muted-foreground text-center">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-black text-left font-semibold text-foreground">
                        {student.name}
                      </td>
                      <td className="p-2 border-r border-black font-mono font-bold">{t1}</td>
                      <td className="p-2 border-r border-black font-mono font-bold">{t2}</td>
                      <td className="p-2 border-r border-black font-mono font-bold">{t3}</td>
                      <td className="p-2 border-r border-black font-mono font-black text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300">
                        {finalAvg}
                      </td>
                      <td className="p-2 border-r border-black font-medium">{descriptor}</td>
                      <td className="p-2 font-black">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            remark === "PASSED"
                              ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                          }`}
                        >
                          {remark}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DESCRIPTORS LEGEND TABLE matching Image 4 */}
          <div className="border border-black dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg overflow-hidden mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-black font-bold">
                  <th className="p-2 border-r border-slate-300 w-36">Numerical Grade</th>
                  <th className="p-2 border-r border-slate-300 w-44">Descriptor</th>
                  <th className="p-2">General Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold">90 – 100</td>
                  <td className="p-2 font-bold text-blue-700 dark:text-blue-400">Advancing</td>
                  <td className="p-2 text-muted-foreground">
                    Consistently demonstrates skills and understanding that meet or exceed standards with independence, flexibility and depth.
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold">80 – 89</td>
                  <td className="p-2 font-bold text-emerald-700 dark:text-emerald-400">Benchmarking</td>
                  <td className="p-2 text-muted-foreground">
                    Demonstrates expected grade-level skills and understanding completely and independently.
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold">75 – 79</td>
                  <td className="p-2 font-bold text-cyan-700 dark:text-cyan-400">Connecting</td>
                  <td className="p-2 text-muted-foreground">
                    Demonstrates sufficient understanding and application of grade-level standards with occasional guidance/support.
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 bg-amber-50/30">
                  <td className="p-2 font-mono font-bold text-amber-700">65 – 74</td>
                  <td className="p-2 font-bold text-amber-700">Developing</td>
                  <td className="p-2 text-muted-foreground">
                    Demonstrates partial understanding and inconsistent application of skills; requires targeted support and scaffolding.
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 bg-red-50/30">
                  <td className="p-2 font-mono font-bold text-red-700">60 – 64</td>
                  <td className="p-2 font-bold text-red-700">Emerging</td>
                  <td className="p-2 text-muted-foreground">
                    Does not yet demonstrate foundational skills and understanding; requires extensive support.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 7: HELPER & ADJUSTED TRANSMUTATION TABLE
  // -------------------------------------------------------------
  const renderHelperTab = () => {
    const tableData = [
      { min: "98.60", max: "100.00", grade: 100, min2: "74.72", max2: "75.89", grade2: 79 },
      { min: "98.22", max: "98.59", grade: 99, min2: "73.54", max2: "74.71", grade2: 78 },
      { min: "97.14", max: "98.21", grade: 98, min2: "72.36", max2: "73.53", grade2: 77 },
      { min: "95.96", max: "97.13", grade: 97, min2: "71.18", max2: "72.35", grade2: 76 },
      { min: "94.78", max: "95.95", grade: 96, min2: "70.00", max2: "71.17", grade2: 75 },
      { min: "93.60", max: "94.77", grade: 95, min2: "65.34", max2: "69.99", grade2: 74 },
      { min: "92.42", max: "93.59", grade: 94, min2: "60.67", max2: "65.33", grade2: 73 },
      { min: "91.24", max: "92.41", grade: 93, min2: "56.01", max2: "60.66", grade2: 72 },
      { min: "90.06", max: "91.23", grade: 92, min2: "51.34", max2: "56.00", grade2: 71 },
      { min: "88.88", max: "90.05", grade: 91, min2: "46.67", max2: "51.33", grade2: 70 },
      { min: "87.70", max: "88.87", grade: 90, min2: "42.01", max2: "46.66", grade2: 69 },
      { min: "86.52", max: "87.69", grade: 89, min2: "37.34", max2: "42.00", grade2: 68 },
      { min: "85.34", max: "86.51", grade: 88, min2: "32.68", max2: "37.33", grade2: 67 },
      { min: "84.16", max: "85.33", grade: 87, min2: "28.01", max2: "32.67", grade2: 66 },
      { min: "82.98", max: "84.15", grade: 86, min2: "23.35", max2: "28.00", grade2: 65 },
      { min: "81.80", max: "82.97", grade: 85, min2: "18.68", max2: "23.34", grade2: 64 },
      { min: "80.62", max: "81.79", grade: 84, min2: "14.01", max2: "18.67", grade2: 63 },
      { min: "79.44", max: "80.61", grade: 83, min2: "9.35", max2: "14.00", grade2: 62 },
      { min: "78.26", max: "79.43", grade: 82, min2: "4.68", max2: "9.34", grade2: 61 },
      { min: "77.08", max: "78.25", grade: 81, min2: "0.00", max2: "4.67", grade2: 60 },
      { min: "75.90", max: "77.07", grade: 80, min2: "—", max2: "—", grade2: 0 },
    ];

    return (
      <div className="w-full font-sans text-xs space-y-6 pt-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-base font-black tracking-tight text-[#15479E] uppercase">
              Adjusted Transmutation Table
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Reference: DepEd Order No. 8, s. 2015 and DepEd Order No. 15, s. 2026
            </p>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full">
            Passing Threshold: 70.00 → 75
          </span>
        </div>

        <div className="border border-black dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-black text-white font-extrabold text-[11px]">
                <th colSpan={2} className="p-2 border-r border-slate-700">Initial Grade</th>
                <th rowSpan={2} className="p-2 border-r border-slate-700 w-24 bg-blue-700">Transmuted Grade</th>
                <th colSpan={2} className="p-2 border-r border-slate-700">Initial Grade</th>
                <th rowSpan={2} className="p-2 w-24 bg-blue-700">Transmuted Grade</th>
              </tr>
              <tr className="bg-slate-800 text-slate-200 font-bold text-[10px] border-b border-black">
                <th className="p-1 border-r border-slate-700 w-24">Min</th>
                <th className="p-1 border-r border-slate-700 w-24">Max</th>
                <th className="p-1 border-r border-slate-700 w-24">Min</th>
                <th className="p-1 border-r border-slate-700 w-24">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
              {tableData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/40"}>
                  <td className="p-1.5 border-r border-slate-300">{row.min}</td>
                  <td className="p-1.5 border-r border-slate-300">{row.max}</td>
                  <td className="p-1.5 border-r border-black font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30">
                    {row.grade}
                  </td>
                  <td className="p-1.5 border-r border-slate-300">{row.min2}</td>
                  <td className="p-1.5 border-r border-slate-300">{row.max2}</td>
                  <td className="p-1.5 font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30">
                    {row.grade2 > 0 ? row.grade2 : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              SSHS Electronic Class Record (ECR) SY 2026-2027
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full">
                DO 15, s. 2026
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Strengthened Senior High School Class Record • 3-Term System (Grades 11 & 12)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs font-semibold">
            <span className="text-muted-foreground px-1.5 text-[11px]">Filter:</span>
            {(["ALL", "MALE", "FEMALE"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setGenderFilter(filter)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  genderFilter === filter
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-background hover:bg-muted transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Print Sheet
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-sm"
          >
            {saveSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saveSuccess ? "Saved!" : "Save ECR"}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-100 text-green-800 p-3 rounded-xl text-xs font-medium flex items-center print:hidden shadow-sm">
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
          SSHS E-Class Record structure saved successfully to database!
        </div>
      )}

      {/* Sheet Tabs Bar matching DepEd Excel layout */}
      <div className="flex items-center gap-1 bg-[#0b1329] dark:bg-[#070d1e] p-1.5 rounded-full text-xs font-bold text-white overflow-x-auto shadow-sm border border-slate-800 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden print:hidden">
        <button
          onClick={() => setActiveTab("instructions")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide flex items-center gap-1.5 ${
            activeTab === "instructions"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Info className="h-3.5 w-3.5" /> INSTRUCTIONS
        </button>
        <button
          onClick={() => setActiveTab("input")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide flex items-center gap-1.5 ${
            activeTab === "input"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" /> INPUT DATA
        </button>
        <button
          onClick={() => setActiveTab("term1")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term1"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          TERM 1
        </button>
        <button
          onClick={() => setActiveTab("term2")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term2"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          TERM 2
        </button>
        <button
          onClick={() => setActiveTab("term3")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term3"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          TERM 3
        </button>
        <button
          onClick={() => setActiveTab("final")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide flex items-center gap-1.5 ${
            activeTab === "final"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Award className="h-3.5 w-3.5" /> FINAL GRADES
        </button>
        <button
          onClick={() => setActiveTab("helper")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide flex items-center gap-1.5 ${
            activeTab === "helper"
              ? "bg-[#1d63ff] text-white font-black shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" /> TRANSMUTATION TABLE
        </button>
      </div>

      {/* Active Tab View */}
      <div className="bg-card min-h-[500px]">
        {activeTab === "instructions" && renderInstructionsTab()}
        {activeTab === "input" && renderInputDataTab()}

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

        {activeTab === "final" && renderFinalGradesTab()}
        {activeTab === "helper" && renderHelperTab()}
      </div>
    </div>
  );
}
