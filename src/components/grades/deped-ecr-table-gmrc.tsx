"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Save,
  User,
} from "lucide-react";
import {
  calculateValuesEdTermGrade,
  calculateFinalGrade3Terms,
  transmuteGrade,
  getDescriptor,
  ValuesEdScores,
} from "@/utils/deped-eclass-record";
import { getSchoolSettings, updateSchoolSettings, uploadAssetFile } from "@/features/settings/settings.actions";

// Mock Data structure for Values Education
export const MOCK_STUDENTS = [
  { id: "m-1", name: "Dela Cruz, Juan M.", gender: "Male" as const },
  { id: "m-2", name: "Reyes, Mateo P.", gender: "Male" as const },
  { id: "f-1", name: "Santos, Maria C.", gender: "Female" as const },
];

export function DepEdECRTableGMRC({ students = [] }: { students?: any[] }) {
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
  const mappedStudents = (students && students.length > 0)
    ? students.map((s) => ({
        id: s.student.id,
        name: `${s.student.person.last_name}, ${s.student.person.first_name} ${
          s.student.person.middle_name || ""
        }`.trim(),
        gender: (s.student?.person?.gender?.toLowerCase() === "female" ? "Female" : "Male") as "Male" | "Female",
        studentNumber: s.student.student_number || "",
      }))
    : MOCK_STUDENTS;

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

  // HPS State
  const [hps, setHps] = useState<ValuesEdScores>({
    wwCognitive: [],
    wwCognitiveHPS: [20, 20, 20, 20, 20],
    wwAffective: [],
    wwAffectiveHPS: [20, 20, 20, 20, 20],
    ptCognitive: [],
    ptCognitiveHPS: [20, 20, 20],
    ptAffective: [],
    ptAffectiveHPS: [20, 20, 20],
    ptBehavioral: [],
    ptBehavioralHPS: [20, 20, 20],
    exST1: 0,
    exST1HPS: 30,
    exST2: 0,
    exST2HPS: 30,
    exTE: 0,
    exTEHPS: 40,
  });

  // Term Scores
  const createEmptyScores = (): ValuesEdScores => ({
    wwCognitive: [0, 0, 0, 0, 0],
    wwCognitiveHPS: hps.wwCognitiveHPS,
    wwAffective: [0, 0, 0, 0, 0],
    wwAffectiveHPS: hps.wwAffectiveHPS,
    ptCognitive: [0, 0, 0],
    ptCognitiveHPS: hps.ptCognitiveHPS,
    ptAffective: [0, 0, 0],
    ptAffectiveHPS: hps.ptAffectiveHPS,
    ptBehavioral: [0, 0, 0],
    ptBehavioralHPS: hps.ptBehavioralHPS,
    exST1: 0,
    exST1HPS: hps.exST1HPS,
    exST2: 0,
    exST2HPS: hps.exST2HPS,
    exTE: 0,
    exTEHPS: hps.exTEHPS,
  });

  const [term1Scores, setTerm1Scores] = useState<Record<string, ValuesEdScores>>({
    "m-1": {
      wwCognitive: [18, 19, 20, 18, 17],
      wwCognitiveHPS: hps.wwCognitiveHPS,
      wwAffective: [20, 20, 19, 19, 18],
      wwAffectiveHPS: hps.wwAffectiveHPS,
      ptCognitive: [18, 19, 20],
      ptCognitiveHPS: hps.ptCognitiveHPS,
      ptAffective: [20, 20, 20],
      ptAffectiveHPS: hps.ptAffectiveHPS,
      ptBehavioral: [19, 20, 19],
      ptBehavioralHPS: hps.ptBehavioralHPS,
      exST1: 27,
      exST1HPS: hps.exST1HPS,
      exST2: 28,
      exST2HPS: hps.exST2HPS,
      exTE: 35,
      exTEHPS: hps.exTEHPS,
    },
  });
  const [term2Scores, setTerm2Scores] = useState<Record<string, ValuesEdScores>>({});
  const [term3Scores, setTerm3Scores] = useState<Record<string, ValuesEdScores>>({});

  const handleScoreChange = (
    termKey: string,
    studentId: string,
    category: keyof ValuesEdScores,
    index: number | undefined,
    value: number
  ) => {
    const setScores =
      termKey === "term1"
        ? setTerm1Scores
        : termKey === "term2"
        ? setTerm2Scores
        : setTerm3Scores;

    setScores((prev) => {
      const studentScores = prev[studentId] || createEmptyScores();
      if (Array.isArray(studentScores[category]) && index !== undefined) {
        const newArr = [...(studentScores[category] as number[])];
        newArr[index] = value;
        return { ...prev, [studentId]: { ...studentScores, [category]: newArr } };
      } else {
        return { ...prev, [studentId]: { ...studentScores, [category]: value } };
      }
    });
  };

  const handleHpsChange = (category: keyof ValuesEdScores, index: number, value: number) => {
    setHps((prev) => {
      if (Array.isArray(prev[category])) {
        const newArr = [...(prev[category] as number[])];
        newArr[index] = value;
        return { ...prev, [category]: newArr };
      }
      return { ...prev, [category]: value };
    });
  };

  const computeStudentValuesEdTerm = (studentId: string, term: "term1" | "term2" | "term3") => {
    const scoresMap =
      term === "term1" ? term1Scores : term === "term2" ? term2Scores : term3Scores;
    const scores = scoresMap[studentId] || createEmptyScores();
    return calculateValuesEdTermGrade({
      ...scores,
      wwCognitiveHPS: hps.wwCognitiveHPS,
      wwAffectiveHPS: hps.wwAffectiveHPS,
      ptCognitiveHPS: hps.ptCognitiveHPS,
      ptAffectiveHPS: hps.ptAffectiveHPS,
      ptBehavioralHPS: hps.ptBehavioralHPS,
      exST1HPS: hps.exST1HPS,
      exST2HPS: hps.exST2HPS,
      exTEHPS: hps.exTEHPS,
    });
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

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
        <div className="md:col-span-2 border rounded-2xl p-5 bg-card space-y-4 shadow-sm">
          <h3 className="text-sm font-bold flex items-center justify-between border-b pb-3 text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" /> LEARNERS' NAMES REGISTRATION
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              Registered: {mappedStudents.filter((s) => s.name).length} Learners
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
                      placeholder={`Male Learner ${idx + 1}`}
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
                      placeholder={`Female Learner ${idx + 1}`}
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

  const renderStudentRow = (
    student: (typeof mappedStudents)[0],
    idx: number,
    termKey: "term1" | "term2" | "term3"
  ) => {
    const sId = student.id;
    const scoresMap =
      termKey === "term1" ? term1Scores : termKey === "term2" ? term2Scores : term3Scores;
    const scores = scoresMap[sId] || createEmptyScores();

    const gradeData = calculateValuesEdTermGrade({
      ...scores,
      wwCognitiveHPS: hps.wwCognitiveHPS,
      wwAffectiveHPS: hps.wwAffectiveHPS,
      ptCognitiveHPS: hps.ptCognitiveHPS,
      ptAffectiveHPS: hps.ptAffectiveHPS,
      ptBehavioralHPS: hps.ptBehavioralHPS,
      exST1HPS: hps.exST1HPS,
      exST2HPS: hps.exST2HPS,
      exTEHPS: hps.exTEHPS,
    });

    const isStudentActive = Boolean(student.name && student.name.trim() !== "");
    const inputClass = `w-full h-6 text-center bg-transparent focus:bg-amber-100 dark:focus:bg-amber-900/40 focus:outline-none font-bold text-xs ${
      !isStudentActive ? "opacity-30 cursor-not-allowed" : ""
    }`;

    return (
      <tr
        key={sId}
        className="h-6 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors border-b border-black text-xs"
      >
        {/* Student Column */}
        <td className="border-2 border-black p-1 text-left whitespace-nowrap bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold px-2">
          {idx}. {student.name}
        </td>

        {/* WW Cognitive: 1-5 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <td key={`ww-c-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
            <input
              type="number"
              className={inputClass}
              value={scores.wwCognitive[i] || ""}
              onChange={(e) =>
                handleScoreChange(termKey, sId, "wwCognitive", i, Number(e.target.value) || 0)
              }
              disabled={!isStudentActive}
            />
          </td>
        ))}
        <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.wwCogTotal : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.wwCogPS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2] text-slate-950">
          {isStudentActive ? gradeData.wwCogWS.toFixed(2) : ""}
        </td>

        {/* WW Affective: 1-5 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <td key={`ww-a-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
            <input
              type="number"
              className={inputClass}
              value={scores.wwAffective[i] || ""}
              onChange={(e) =>
                handleScoreChange(termKey, sId, "wwAffective", i, Number(e.target.value) || 0)
              }
              disabled={!isStudentActive}
            />
          </td>
        ))}
        <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.wwAffTotal : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.wwAffPS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2] text-slate-950">
          {isStudentActive ? gradeData.wwAffWS.toFixed(2) : ""}
        </td>

        {/* PT Cognitive: 1-3 */}
        {[0, 1, 2].map((i) => (
          <td key={`pt-c-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
            <input
              type="number"
              className={inputClass}
              value={scores.ptCognitive[i] || ""}
              onChange={(e) =>
                handleScoreChange(termKey, sId, "ptCognitive", i, Number(e.target.value) || 0)
              }
              disabled={!isStudentActive}
            />
          </td>
        ))}
        <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.ptCogTotal : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.ptCogPS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2] text-slate-950">
          {isStudentActive ? gradeData.ptCogWS.toFixed(2) : ""}
        </td>

        {/* PT Affective: 1-3 */}
        {[0, 1, 2].map((i) => (
          <td key={`pt-a-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
            <input
              type="number"
              className={inputClass}
              value={scores.ptAffective[i] || ""}
              onChange={(e) =>
                handleScoreChange(termKey, sId, "ptAffective", i, Number(e.target.value) || 0)
              }
              disabled={!isStudentActive}
            />
          </td>
        ))}
        <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.ptAffTotal : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.ptAffPS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2] text-slate-950">
          {isStudentActive ? gradeData.ptAffWS.toFixed(2) : ""}
        </td>

        {/* PT Behavioral: 1-3 */}
        {[0, 1, 2].map((i) => (
          <td key={`pt-b-${i}`} className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
            <input
              type="number"
              className={inputClass}
              value={scores.ptBehavioral[i] || ""}
              onChange={(e) =>
                handleScoreChange(termKey, sId, "ptBehavioral", i, Number(e.target.value) || 0)
              }
              disabled={!isStudentActive}
            />
          </td>
        ))}
        <td className="border-2 border-black p-0 text-center font-bold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.ptBehTotal : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.ptBehPS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2] text-slate-950">
          {isStudentActive ? gradeData.ptBehWS.toFixed(2) : ""}
        </td>

        {/* EX: ST1, ST2, TE */}
        <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
          <input
            type="number"
            className={inputClass}
            value={scores.exST1 || ""}
            onChange={(e) =>
              handleScoreChange(termKey, sId, "exST1", undefined, Number(e.target.value) || 0)
            }
            disabled={!isStudentActive}
          />
        </td>
        <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
          <input
            type="number"
            className={inputClass}
            value={scores.exST2 || ""}
            onChange={(e) =>
              handleScoreChange(termKey, sId, "exST2", undefined, Number(e.target.value) || 0)
            }
            disabled={!isStudentActive}
          />
        </td>
        <td className="border-2 border-black p-0 text-center bg-white dark:bg-slate-900">
          <input
            type="number"
            className={inputClass}
            value={scores.exTE || ""}
            onChange={(e) =>
              handleScoreChange(termKey, sId, "exTE", undefined, Number(e.target.value) || 0)
            }
            disabled={!isStudentActive}
          />
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.exST1_WS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.exST2_WS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.exTE_WS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-[#f2f2f2] text-slate-900">
          {isStudentActive ? gradeData.exPS.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-black bg-[#d9e1f2] text-slate-950">
          {isStudentActive ? gradeData.exWS.toFixed(2) : ""}
        </td>

        {/* Grades */}
        <td className="border-2 border-black p-0 text-center font-bold bg-[#e6e6e6] text-slate-900">
          {isStudentActive ? gradeData.initialGrade.toFixed(2) : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-black text-sm bg-[#d9d9d9] text-slate-950">
          {isStudentActive ? gradeData.transmutedGrade : ""}
        </td>
        <td className="border-2 border-black p-0 text-center font-semibold bg-white dark:bg-slate-900 text-[10px] text-slate-900 dark:text-slate-100">
          {isStudentActive ? gradeData.descriptor : ""}
        </td>
      </tr>
    );
  };

  const renderTermTable = (termKey: "term1" | "term2" | "term3") => (
    <div className="w-full overflow-x-auto print:overflow-visible">
      <div className="min-w-max print:zoom-fit space-y-0">
        {/* Official DepEd Header Banner matching the user image & TLE 100% */}
        <div className="p-4 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 border border-black dark:border-slate-700 space-y-4 print:bg-white print:text-black">
          {/* Top row with Logos and Class Record Title */}
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
                CLASS RECORD
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

          {/* Middle row: Metadata inputs grid with spreadsheet cell boxes matching DepEd template */}
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

        {/* Solid Dark Blue Divider Bar matching user image */}
        <div className="h-4 bg-[#002060] w-full border-t-2 border-b-2 border-black" />

        {/* Main Grid Table */}
        <table className="w-full text-xs text-center border-collapse border-2 border-black bg-white dark:bg-slate-950">
          <thead>
            {/* Row 1: Term Title, Grade Level, Teacher, Subject & Final Grade Totals */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold uppercase border-b-2 border-black">
              <th
                rowSpan={5}
                className="border-2 border-black p-2 min-w-[200px] max-w-[220px] bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 align-middle"
              >
                <div className="text-2xl font-black tracking-wider text-slate-950 dark:text-slate-100 uppercase">
                  {termKey === "term1"
                    ? "FIRST TERM"
                    : termKey === "term2"
                    ? "SECOND TERM"
                    : "THIRD TERM"}
                </div>
              </th>
              <th className="border-2 border-black p-1 text-left bg-[#f2f2f2] text-slate-950 font-black text-[11px] whitespace-nowrap" colSpan={2}>
                GRADE LEVEL
              </th>
              <th className="border-2 border-black p-1 font-mono bg-white text-slate-900 font-bold text-center text-xs whitespace-nowrap" colSpan={4}>
                {schoolInfo.gradeLevel}
              </th>
              <th
                rowSpan={2}
                colSpan={2}
                className="border-2 border-black p-1 text-center bg-[#f2f2f2] text-slate-950 font-black text-[11px] align-middle"
              >
                TEACHER
              </th>
              <th
                rowSpan={2}
                colSpan={14}
                className="border-2 border-black p-1 text-center bg-white text-slate-900 font-bold align-middle text-xs uppercase"
              >
                {schoolInfo.teacher}
              </th>
              <th
                rowSpan={2}
                colSpan={2}
                className="border-2 border-black p-1 text-center bg-[#f2f2f2] text-slate-950 font-black text-[11px] align-middle"
              >
                SUBJECT
              </th>
              <th
                rowSpan={2}
                colSpan={18}
                className="border-2 border-black p-1 text-center bg-white text-slate-900 font-bold align-middle text-xs uppercase"
              >
                {schoolInfo.subject}
              </th>
              <th
                rowSpan={5}
                className="border-2 border-black p-1 bg-[#f2f2f2] text-slate-950 font-black align-middle w-14 text-xs leading-tight"
              >
                Initial<br />Grade
              </th>
              <th
                rowSpan={5}
                className="border-2 border-black p-1 bg-[#f2f2f2] text-slate-950 font-black align-middle w-14 text-xs leading-tight"
              >
                Term<br />Grade
              </th>
              <th
                rowSpan={5}
                className="border-2 border-black p-1 bg-[#f2f2f2] text-slate-950 font-black align-middle w-24 text-xs"
              >
                Descriptor
              </th>
            </tr>

            {/* Row 2: Section Row */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold uppercase border-b-2 border-black">
              <th className="border-2 border-black p-1 text-left bg-[#f2f2f2] text-slate-950 font-black text-[11px] whitespace-nowrap" colSpan={2}>
                SECTION
              </th>
              <th className="border-2 border-black p-1 font-mono bg-white text-slate-900 font-bold text-center text-xs whitespace-nowrap" colSpan={4}>
                {schoolInfo.section}
              </th>
            </tr>

            {/* Row 3: Component Categories Banner Row (20% - 50% - 30%) */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 font-black uppercase text-[11px] border-b-2 border-black">
              <th
                colSpan={16}
                className="border-2 border-black p-1.5 text-center bg-[#f2f2f2] text-slate-950"
              >
                WRITTEN / ORAL WORKS (WWs) - 20%
              </th>
              <th
                colSpan={18}
                className="border-2 border-black p-1.5 text-center bg-[#f2f2f2] text-slate-950"
              >
                PRODUCT / PERFORMANCE TASKS (PTs) - 50%
              </th>
              <th
                colSpan={8}
                className="border-2 border-black p-1.5 text-center bg-[#f2f2f2] text-slate-950"
              >
                EXAMINATIONS (EXs) - 30%
              </th>
            </tr>

            {/* Row 4: Domain Sub-headers Row */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 text-[10px] font-black text-center border-b-2 border-black">
              <th colSpan={8} className="border-2 border-black p-1 bg-[#d9e1f2] text-slate-950 uppercase">
                COGNITIVE DOMAIN
              </th>
              <th colSpan={8} className="border-2 border-black p-1 bg-[#d9e1f2] text-slate-950 uppercase">
                AFFECTIVE DOMAIN
              </th>
              <th colSpan={6} className="border-2 border-black p-1 bg-[#d9e1f2] text-slate-950 uppercase">
                COGNITIVE DOMAIN
              </th>
              <th colSpan={6} className="border-2 border-black p-1 bg-[#d9e1f2] text-slate-950 uppercase">
                AFFECTIVE DOMAIN
              </th>
              <th colSpan={6} className="border-2 border-black p-1 bg-[#d9e1f2] text-slate-950 uppercase">
                BEHAVIORAL DOMAIN
              </th>
              <th className="border-2 border-black p-1 bg-[#d9e1f2] text-slate-950 font-extrabold w-8">ST1</th>
              <th className="border-2 border-black p-1 bg-[#d9e1f2] text-slate-950 font-extrabold w-8">ST2</th>
              <th className="border-2 border-black p-1 bg-[#d9e1f2] text-slate-950 font-extrabold w-8">TE</th>
              <th className="border-2 border-black p-1 bg-white text-slate-950 font-extrabold text-[9px] w-10">WS ST1</th>
              <th className="border-2 border-black p-1 bg-white text-slate-950 font-extrabold text-[9px] w-10">WS ST2</th>
              <th className="border-2 border-black p-1 bg-white text-slate-950 font-extrabold text-[9px] w-10">WS TE</th>
              <th className="border-2 border-black p-1 bg-white text-slate-950 font-extrabold w-9">PS</th>
              <th className="border-2 border-black p-1 bg-white text-slate-950 font-black w-9">WS</th>
            </tr>

            {/* Row 5: Sub-columns Header Row */}
            <tr className="bg-white dark:bg-slate-900 text-slate-950 text-[10px] font-black text-center border-b-2 border-black">
              {/* WW Cog: 1-5, Total, PS, WS */}
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">1</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">2</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">3</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">4</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">5</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">Total</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">PS</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 font-black w-9">WS</th>

              {/* WW Aff: 1-5, Total, PS, WS */}
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">1</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">2</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">3</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">4</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">5</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">Total</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">PS</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 font-black w-9">WS</th>

              {/* PT Cog: 1-3, Total, PS, WS */}
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">1</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">2</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">3</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">Total</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">PS</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 font-black w-9">WS</th>

              {/* PT Aff: 1-3, Total, PS, WS */}
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">1</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">2</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">3</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">Total</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">PS</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 font-black w-9">WS</th>

              {/* PT Beh: 1-3, Total, PS, WS */}
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">1</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">2</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] w-7">3</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">Total</th>
              <th className="border-2 border-black p-0.5 bg-white w-9">PS</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 font-black w-9">WS</th>

              {/* EX under weights: 30, 30, 40, 100, 30% */}
              <th className="border-2 border-black p-0.5 bg-white text-muted-foreground">-</th>
              <th className="border-2 border-black p-0.5 bg-white text-muted-foreground">-</th>
              <th className="border-2 border-black p-0.5 bg-white text-muted-foreground">-</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 text-[10px]">30</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 text-[10px]">30</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 text-[10px]">40</th>
              <th className="border-2 border-black p-0.5 bg-white text-slate-950 text-[10px]">100</th>
              <th className="border-2 border-black p-0.5 bg-[#d9e1f2] text-slate-950 font-black text-[10px]">30%</th>
            </tr>

            {/* Row 6: Highest Possible Score (HPS) Row */}
            <tr className="bg-white text-slate-950 font-black text-[10px] text-center border-b-2 border-black">
              <td className="border-2 border-black p-1 text-right text-slate-950 uppercase italic font-black px-2">
                HIGHEST POSSIBLE SCORE
              </td>

              {/* WW Cog HPS */}
              {[0, 1, 2, 3, 4].map((i) => (
                <td key={`hps-wwc-${i}`} className="border-2 border-black p-0.5 bg-white">
                  <input
                    type="number"
                    value={hps.wwCognitiveHPS[i] || ""}
                    onChange={(e) =>
                      handleHpsChange("wwCognitiveHPS", i, Number(e.target.value) || 0)
                    }
                    className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                  />
                </td>
              ))}
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black">10%</td>

              {/* WW Aff HPS */}
              {[0, 1, 2, 3, 4].map((i) => (
                <td key={`hps-wwa-${i}`} className="border-2 border-black p-0.5 bg-white">
                  <input
                    type="number"
                    value={hps.wwAffectiveHPS[i] || ""}
                    onChange={(e) =>
                      handleHpsChange("wwAffectiveHPS", i, Number(e.target.value) || 0)
                    }
                    className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                  />
                </td>
              ))}
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black">10%</td>

              {/* PT Cog HPS */}
              {[0, 1, 2].map((i) => (
                <td key={`hps-ptc-${i}`} className="border-2 border-black p-0.5 bg-white">
                  <input
                    type="number"
                    value={hps.ptCognitiveHPS[i] || ""}
                    onChange={(e) =>
                      handleHpsChange("ptCognitiveHPS", i, Number(e.target.value) || 0)
                    }
                    className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                  />
                </td>
              ))}
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">60</td>
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black">10%</td>

              {/* PT Aff HPS */}
              {[0, 1, 2].map((i) => (
                <td key={`hps-pta-${i}`} className="border-2 border-black p-0.5 bg-white">
                  <input
                    type="number"
                    value={hps.ptAffectiveHPS[i] || ""}
                    onChange={(e) =>
                      handleHpsChange("ptAffectiveHPS", i, Number(e.target.value) || 0)
                    }
                    className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                  />
                </td>
              ))}
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">60</td>
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black">10%</td>

              {/* PT Beh HPS */}
              {[0, 1, 2].map((i) => (
                <td key={`hps-ptb-${i}`} className="border-2 border-black p-0.5 bg-white">
                  <input
                    type="number"
                    value={hps.ptBehavioralHPS[i] || ""}
                    onChange={(e) =>
                      handleHpsChange("ptBehavioralHPS", i, Number(e.target.value) || 0)
                    }
                    className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                  />
                </td>
              ))}
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">60</td>
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2] font-black">100</td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black">30%</td>

              {/* EX HPS */}
              <td className="border-2 border-black p-0.5 bg-white">
                <input
                  type="number"
                  value={hps.exST1HPS || ""}
                  onChange={(e) =>
                    setHps({ ...hps, exST1HPS: Number(e.target.value) || 0 })
                  }
                  className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                />
              </td>
              <td className="border-2 border-black p-0.5 bg-white">
                <input
                  type="number"
                  value={hps.exST2HPS || ""}
                  onChange={(e) =>
                    setHps({ ...hps, exST2HPS: Number(e.target.value) || 0 })
                  }
                  className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                />
              </td>
              <td className="border-2 border-black p-0.5 bg-white">
                <input
                  type="number"
                  value={hps.exTEHPS || ""}
                  onChange={(e) =>
                    setHps({ ...hps, exTEHPS: Number(e.target.value) || 0 })
                  }
                  className="w-7 h-5 text-center border-none bg-transparent text-slate-950 font-bold text-[10px]"
                />
              </td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black text-[10px]">30</td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black text-[10px]">30</td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black text-[10px]">40</td>
              <td className="border-2 border-black p-0.5 bg-white font-black text-[10px]">100</td>
              <td className="border-2 border-black p-0.5 bg-[#d9e1f2] font-black text-[10px]">30%</td>

              {/* Initial / Term / Desc HPS blank */}
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2]"></td>
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2]"></td>
              <td className="border-2 border-black p-0.5 bg-[#f2f2f2]"></td>
            </tr>
          </thead>

          <tbody>
            {/* LEARNERS' NAMES Header Row */}
            <tr className="bg-[#002060] text-white font-black text-left text-xs uppercase tracking-wider">
              <td colSpan={46} className="p-1 px-3 border-2 border-black">
                LEARNERS' NAMES
              </td>
            </tr>

            {/* MALE Divider */}
            <tr className="bg-[#d9d9d9] dark:bg-slate-800 text-slate-950 dark:text-white font-black text-left text-[11px] uppercase border-b-2 border-black">
              <td className="p-1 px-3 border-2 border-black bg-[#bfbfbf] dark:bg-slate-900">
                MALE
              </td>
              <td colSpan={45} className="border-2 border-black bg-[#d9d9d9] dark:bg-slate-800"></td>
            </tr>
            {mappedStudents
              .filter((s) => s.gender === "Male")
              .map((student, i) => renderStudentRow(student, i + 1, termKey))}

            {/* FEMALE Divider */}
            <tr className="bg-[#d9d9d9] dark:bg-slate-800 text-slate-950 dark:text-white font-black text-left text-[11px] uppercase border-b-2 border-black">
              <td className="p-1 px-3 border-2 border-black bg-[#bfbfbf] dark:bg-slate-900">
                FEMALE
              </td>
              <td colSpan={45} className="border-2 border-black bg-[#d9d9d9] dark:bg-slate-800"></td>
            </tr>
            {mappedStudents
              .filter((s) => s.gender === "Female")
              .map((student, i) => renderStudentRow(student, i + 1, termKey))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFinalGradeTab = () => (
    <div className="overflow-x-auto print:overflow-visible border rounded-2xl print:border-none print:shadow-none print:break-inside-avoid print:break-after-page">
      <div className="min-w-max print:zoom-fit p-4 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 space-y-4">
        {/* DepEd Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <img src={leftLogo} alt="Left Logo" className="h-16 w-16 object-contain" />
            <div>
              <h3 className="text-lg font-black tracking-wide uppercase">
                SUMMARY OF QUARTERLY / TERM GRADES
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                Official Final Rating Sheet - Values Education (Grades 2-10)
              </p>
            </div>
          </div>
          <div className="text-right text-xs space-y-0.5 font-medium">
            <div>
              <strong>Region:</strong> {schoolInfo.region} | <strong>Division:</strong>{" "}
              {schoolInfo.division}
            </div>
            <div>
              <strong>Subject:</strong> {schoolInfo.subject} | <strong>Teacher:</strong>{" "}
              {schoolInfo.teacher}
            </div>
            <div>
              <strong>Grade & Section:</strong> {schoolInfo.gradeLevel} - {schoolInfo.section}
            </div>
          </div>
          <img src={rightLogo} alt="DepEd Logo" className="h-12 object-contain" />
        </div>

        <table className="w-full text-xs text-left border-collapse border-2 border-black">
          <thead className="bg-[#f2f2f2] dark:bg-slate-900 font-bold uppercase text-[11px] border-b-2 border-black">
            <tr>
              <th className="border-2 border-black p-2.5">Learners' Names</th>
              <th className="border-2 border-black p-2.5 text-center">Gender</th>
              <th className="border-2 border-black p-2.5 text-center">Term 1</th>
              <th className="border-2 border-black p-2.5 text-center">Term 2</th>
              <th className="border-2 border-black p-2.5 text-center">Term 3</th>
              <th className="border-2 border-black p-2.5 text-center bg-blue-600 text-white font-black text-sm">
                Final Grade
              </th>
              <th className="border-2 border-black p-2.5 text-center">Descriptor</th>
              <th className="border-2 border-black p-2.5 text-center">Remark</th>
            </tr>
          </thead>
          <tbody>
            {(["Male", "Female"] as const).map((genderGroup) => {
              const studentsInGroup = mappedStudents.filter(
                (s) => s.gender === genderGroup && s.name.trim() !== ""
              );
              if (studentsInGroup.length === 0) return null;

              return (
                <React.Fragment key={genderGroup}>
                  {/* Gender Divider Row */}
                  <tr className="bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-black uppercase text-[11px] border-b-2 border-black">
                    <td className="border-2 border-black p-2 px-3 text-left bg-slate-300 dark:bg-slate-900">
                      {genderGroup.toUpperCase()}
                    </td>
                    <td
                      colSpan={7}
                      className="border-2 border-black bg-slate-200 dark:bg-slate-800"
                    ></td>
                  </tr>

                  {studentsInGroup.map((student, idx) => {
                    const t1 = computeStudentValuesEdTerm(student.id, "term1").transmutedGrade;
                    const t2 = computeStudentValuesEdTerm(student.id, "term2").transmutedGrade;
                    const t3 = computeStudentValuesEdTerm(student.id, "term3").transmutedGrade;
                    const final = calculateFinalGrade3Terms(t1, t2, t3);

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors border-b border-black"
                      >
                        <td className="border-2 border-black p-2 font-bold bg-white dark:bg-slate-900">
                          {idx + 1}. {student.name}
                        </td>
                        <td className="border-2 border-black p-2 text-center font-medium text-slate-500 uppercase">
                          {student.gender}
                        </td>
                        <td className="border-2 border-black p-2 text-center font-bold text-slate-700 dark:text-slate-300">
                          {t1 || "-"}
                        </td>
                        <td className="border-2 border-black p-2 text-center font-bold text-slate-700 dark:text-slate-300">
                          {t2 || "-"}
                        </td>
                        <td className="border-2 border-black p-2 text-center font-bold text-slate-700 dark:text-slate-300">
                          {t3 || "-"}
                        </td>
                        <td className="border-2 border-black p-2 text-center font-black text-base text-blue-600 bg-blue-50/50 dark:bg-blue-950/30">
                          {final.finalGrade || "-"}
                        </td>
                        <td className="border-2 border-black p-2 text-center font-semibold">
                          {final.descriptor || "-"}
                        </td>
                        <td className="border-2 border-black p-2 text-center">
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
  );

  const renderHelperTab = () => (
    <div className="space-y-6 py-2 print:break-before-page print:mt-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-sans">
        {/* Transmutation Table */}
        <div className="lg:col-span-6 border rounded-2xl p-4 bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-sm text-foreground flex items-center">
              <Award className="mr-2 h-4 w-4 text-primary" />
              TRANSMUTATION TABLE
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Initial Grade (IG) → Transmuted Grade
            </span>
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
              <tbody>
                {[
                  [99.5, 100, 100],
                  [98.32, 99.49, 99],
                  [97.14, 98.31, 98],
                  [95.96, 97.13, 97],
                  [94.78, 95.95, 96],
                  [93.6, 94.77, 95],
                  [92.42, 93.59, 94],
                  [91.24, 92.41, 93],
                  [90.06, 91.23, 92],
                  [88.88, 90.05, 91],
                  [87.7, 88.87, 90],
                  [86.52, 87.69, 89],
                  [85.34, 86.51, 88],
                  [84.16, 85.33, 87],
                  [82.98, 84.15, 86],
                  [81.8, 82.97, 85],
                  [80.62, 81.79, 84],
                  [79.44, 80.61, 83],
                  [78.26, 79.43, 82],
                  [77.08, 78.25, 81],
                  [75.9, 77.07, 80],
                  [74.72, 75.89, 79],
                  [73.54, 74.71, 78],
                  [72.36, 73.53, 77],
                  [71.18, 72.35, 76],
                  [70.0, 71.17, 75],
                  [65.34, 69.99, 74],
                  [60.67, 65.33, 73],
                  [56.01, 60.66, 72],
                  [51.34, 56.0, 71],
                  [46.67, 51.33, 70],
                  [42.01, 46.66, 69],
                  [37.34, 42.0, 68],
                  [32.68, 37.33, 67],
                  [28.01, 32.67, 66],
                  [23.35, 28.0, 65],
                  [18.68, 23.34, 64],
                  [14.01, 18.67, 63],
                  [9.35, 14.0, 62],
                  [4.68, 9.34, 61],
                  [0, 4.67, 60],
                ].map(([min, max, grade], i) => (
                  <tr
                    key={i}
                    className={
                      grade === 75
                        ? "bg-[#c5e0b4] font-bold"
                        : i % 2 === 0
                        ? "bg-white font-bold"
                        : "bg-[#f2f2f2] font-bold"
                    }
                  >
                    <td className="border border-black p-0.5">{min.toFixed(2)}</td>
                    <td className="border border-black p-0.5">
                      {max === 100 ? "100" : max.toFixed(2)}
                    </td>
                    <td className="border border-black p-0.5">{grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Descriptor Table */}
        <div className="lg:col-span-6 border rounded-2xl p-4 bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-sm text-foreground flex items-center">
              <Award className="mr-2 h-4 w-4 text-blue-600" />
              DESCRIPTOR & RATING SCALE
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Official DepEd Matrix
            </span>
          </div>
          <table className="w-full border-collapse border border-black text-center text-xs">
            <thead>
              <tr>
                <th colSpan={3} className="bg-[#0052cc] text-white p-1 border border-black">
                  DESCRIPTOR
                </th>
              </tr>
              <tr className="bg-white">
                <th className="border border-black p-1">Numerical Grade</th>
                <th className="border border-black p-1">Descriptor</th>
                <th className="border border-black p-1">General Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold">
                <td className="border border-black p-1 align-top">90-100</td>
                <td className="border border-black p-1 align-top text-blue-600">Advanced</td>
                <td className="border border-black p-1 font-normal text-left px-4 align-middle">
                  Demonstrates exemplary understanding and applies skills beyond grade-level expectations independently.
                </td>
              </tr>
              <tr className="font-bold">
                <td className="border border-black p-1 align-top">85-89</td>
                <td className="border border-black p-1 align-top text-emerald-600">Proficient</td>
                <td className="border border-black p-1 font-normal text-left px-4 align-middle">
                  Demonstrates expected grade-level skills and understanding competently and independently.
                </td>
              </tr>
              <tr className="font-bold">
                <td className="border border-black p-1 align-top">80-84</td>
                <td className="border border-black p-1 align-top text-amber-600">Approaching Proficiency</td>
                <td className="border border-black p-1 font-normal text-left px-4 align-middle">
                  Demonstrates sufficient understanding and application of grade-level standards with scaffolding.
                </td>
              </tr>
              <tr className="font-bold">
                <td className="border border-black p-1 align-top">75-79</td>
                <td className="border border-black p-1 align-top text-orange-600">Developing</td>
                <td className="border border-black p-1 font-normal text-left px-4 align-middle">
                  Demonstrates partial understanding and inconsistent application of skills, requires targeted support and scaffolding.
                </td>
              </tr>
              <tr className="font-bold">
                <td className="border border-black p-1 align-top">Below 75</td>
                <td className="border border-black p-1 align-top text-red-600">Beginning</td>
                <td className="border border-black p-1 font-normal text-left px-4 align-middle">
                  Does not yet demonstrate foundational skills and understanding; requires intensive support.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
              Official DepEd Electronic Class Record for Values Education / GMRC (Grades 2-10) — 20-50-30 Matrix
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

      {/* Tabs Navigation matching user screenshot */}
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
      <div className="bg-card">
        {activeTab === "input" && renderInputData()}

        {(["term1", "term2", "term3"] as const).map((termKey) => (
          <div
            key={termKey}
            className={`${
              activeTab === termKey ? "block" : "hidden print:block"
            } print:break-after-page`}
          >
            {renderTermTable(termKey)}
          </div>
        ))}

        {activeTab === "final" && renderFinalGradeTab()}
        {activeTab === "helper" && renderHelperTab()}
      </div>
    </div>
  );
}
