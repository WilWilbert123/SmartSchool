"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  Printer,
  Save,
  User,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  FileText,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getSchoolSettings, updateSchoolSettings, uploadAssetFile } from "@/features/settings/settings.actions";

// -------------------------------------------------------------
// Kindergarten Competencies Data (Official DepEd Kindergarten CG)
// -------------------------------------------------------------

export interface KinderDomain {
  id: string;
  title: string;
  competencies: { id: number; text: string; sub?: string }[];
}

export const KINDER_DOMAINS: KinderDomain[] = [
  {
    id: "domain1",
    title: "I. Sensory Perceptual and Motor Development",
    competencies: [
      { id: 1, text: "Identifies external body parts and their functions" },
      { id: 2, text: "Identifies ways to care for and protects one's body" },
      { id: 3, text: "Demonstrates gross motor skills (locomotor, non-locomotor)" },
      { id: 4, text: "Moves body parts as directed" },
      { id: 5, text: "Demonstrates fine motor skills (tearing, cutting, rolling, molding with playdough)" },
    ],
  },
  {
    id: "domain2",
    title: "II. Socio-Emotional Development",
    competencies: [
      { id: 1, text: "Identifies and expresses feelings in appropriate ways" },
      { id: 2, text: "Recognizes and respects feelings of others" },
      { id: 3, text: "Expresses needs and preferences" },
      { id: 4, text: "Behaves appropriately in different situations" },
      { id: 5, text: "Participates in classroom routines and activities" },
      { id: 6, text: "Follows classroom and school rules" },
      { id: 7, text: "Fulfills classroom responsibilities" },
    ],
  },
  {
    id: "domain3",
    title: "III. Cognitive Development",
    competencies: [
      { id: 1, text: "Identifies attributes of objects (color, shape, size)" },
      { id: 2, text: "Matches objects based on attributes" },
      { id: 3, text: "Describes objects based on attributes (shape, color, taste, texture)" },
      { id: 4, text: "Classifies objects by a single attribute (color, shape, size)" },
      { id: 5, text: "Reclassifies objects according to multiple attributes" },
      { id: 6, text: "Arranges objects according to specific attributes" },
      { id: 7, text: "Recognizes, extends and creates patterns using concrete objects" },
      { id: 8, text: "Measures size, length, capacity and mass of objects using non-standard measuring tools" },
      { id: 9, text: "Identifies position of objects (in, on, over, under, top, bottom)" },
      { id: 10, text: "Compares quantities of objects (more/less)" },
      { id: 11, text: "Counts with one-to-one correspondence" },
      { id: 12, text: "Recognizes numerals" },
      { id: 13, text: "Matches numerals to objects" },
      { id: 14, text: "Adds and subtracts using concrete objects" },
      { id: 15, text: "Recognizes clock as measure of time (hours and minutes)" },
      { id: 16, text: "Shows awareness and care for the natural and physical environment" },
      { id: 17, text: "Talks about participation in cultural and religious activities" },
      { id: 18, text: "Shows awareness of the importance of caring for the natural and physical environment through simple practices" },
      { id: 19, text: "Predicts outcomes in familiar stories read aloud in class" },
      { id: 20, text: "Suggests solutions to problems in class activities and stories read aloud in class" },
    ],
  },
  {
    id: "domain4",
    title: "IV. Language, Literacy, and Communication Development",
    competencies: [
      { id: 1, sub: "A. Listening and Viewing", text: "Identifies familiar environmental sound" },
      { id: 2, sub: "A. Listening and Viewing", text: "Recalls what happens first, middle and end in a story" },
      { id: 3, sub: "A. Listening and Viewing", text: "Retells story in sequence" },
      { id: 4, sub: "A. Listening and Viewing", text: "Follows 1-2 step instructions" },
      { id: 5, sub: "B. Sight Word Recognition", text: "Recognizes non-decodable words in and out of context automatically" },
      { id: 6, sub: "B. Sight Word Recognition", text: "Recognizes sight words" },
      { id: 7, sub: "C. Speaking", text: "Identifies first and last name" },
      { id: 8, sub: "C. Speaking", text: "Identifies classmates, teachers, family member" },
      { id: 9, sub: "C. Speaking", text: "Identifies familiar objects at home, in school and in the community" },
      { id: 10, sub: "C. Speaking", text: "Uses polite greetings and courteous expressions in varied situations" },
      { id: 11, sub: "C. Speaking", text: "Retells personal experiences to story events" },
      { id: 12, sub: "C. Speaking", text: "Expresses ideas and feelings using phrases and simple sentences" },
      { id: 13, sub: "D. Reading - Phonological/Phonemic Awareness", text: "Orally segment sounds (Syllable)" },
      { id: 14, sub: "Letter Knowledge", text: "Identifies uppercase letters" },
      { id: 15, sub: "Letter Knowledge", text: "Identifies lowercase letters" },
      { id: 16, sub: "Letter Knowledge", text: "Matches upper and lowercase letters" },
      { id: 17, sub: "Letter Sound Relationship", text: "Identifies letter sounds" },
      { id: 18, sub: "Letter Sound Relationship", text: "Matches letters and their corresponding sounds" },
      { id: 19, sub: "E. Comprehension", text: "Uses a variety of strategies to gain meaning of leveled texts" },
      { id: 20, sub: "E. Comprehension", text: "Uses print and illustrations to make meaning" },
      { id: 21, sub: "F. Concepts of Print", text: "Demonstrates book handling skills" },
      { id: 22, sub: "F. Concepts of Print", text: "Distinguishes between letters, words, and sentences" },
      { id: 23, sub: "F. Concepts of Print", text: "Demonstrates awareness of print (left to right and top to bottom)" },
      { id: 24, sub: "G. Writing", text: "Traces/draws/copies shapes, designs, pictures" },
      { id: 25, sub: "G. Writing", text: "Traces/copies/writes name, words" },
      { id: 26, sub: "G. Writing", text: "Writes uppercase and lowercase letters" },
      { id: 27, sub: "G. Writing", text: "Spells sight words" },
      { id: 28, sub: "G. Writing", text: "Spells simple words phonetically" },
    ],
  },
];

// Months exactly as arranged in DepEd Kinder Attendance / Finals Sheet (Image 2)
export const ATTENDANCE_MONTHS = [
  { term: "Term 1", code: "JUN", name: "June", days: 20 },
  { term: "Term 1", code: "JUL", name: "July", days: 20 },
  { term: "Term 1", code: "AUG", name: "August", days: 20 },
  { term: "Term 1", code: "SEP", name: "September (T1)", days: 10 },
  { term: "Term 2", code: "SEP", name: "September (T2)", days: 10 },
  { term: "Term 2", code: "OCT", name: "October", days: 20 },
  { term: "Term 2", code: "NOV", name: "November", days: 20 },
  { term: "Term 2", code: "DEC", name: "December", days: 20 },
  { term: "Term 3", code: "JAN", name: "January", days: 18 },
  { term: "Term 3", code: "FEB", name: "February", days: 18 },
  { term: "Term 3", code: "MAR", name: "March", days: 20 },
  { term: "Term 3", code: "APR", name: "April", days: 5 },
];

export type RatingValue = "BG" | "DV" | "CO" | "";

export interface KinderStudent {
  id: string;
  name: string;
  gender: "Male" | "Female";
  lrn: string;
  birthdate?: string;
  ageYears?: number;
  ageMonths?: number;
}

// Exact names & mock data from DepEd ECR screenshots (Image 2)
const DEFAULT_MOCK_KINDER_STUDENTS: KinderStudent[] = [
  { id: "k-1", name: "Pallerina, Dexter B.", gender: "Male", lrn: "104856260001", birthdate: "2020-03-15", ageYears: 5, ageMonths: 8 },
  { id: "k-2", name: "Perez, Jim L.", gender: "Male", lrn: "104856260002", birthdate: "2020-05-22", ageYears: 5, ageMonths: 6 },
  { id: "k-3", name: "Silverio, Arden C.", gender: "Male", lrn: "104856260003", birthdate: "2020-07-10", ageYears: 5, ageMonths: 4 },
  { id: "k-4", name: "Cruz, Daryhlla A.", gender: "Female", lrn: "104856260004", birthdate: "2020-02-18", ageYears: 5, ageMonths: 9 },
  { id: "k-5", name: "Salgado, Yanina C.", gender: "Female", lrn: "104856260005", birthdate: "2020-08-30", ageYears: 5, ageMonths: 3 },
  { id: "k-6", name: "Torres, Johann A.", gender: "Female", lrn: "104856260006", birthdate: "2020-09-14", ageYears: 5, ageMonths: 2 },
];

export function DepEdECRTableKinder({ students = [] }: { students?: any[] }) {
  const [activeTab, setActiveTab] = useState<
    "input" | "term1" | "term2" | "term3" | "finals" | "sf9"
  >("input");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("k-1");

  const [leftLogo, setLeftLogo] = useState("/deped-seal.png");
  const [rightLogo, setRightLogo] = useState("/deped-logo.svg");

  // School Information state (defaults matching DepEd screenshot)
  const [schoolInfo, setSchoolInfo] = useState({
    region: "Region III",
    division: "BULACAN",
    cityMunicipality: "STA. MARIA",
    district: "STA. MARIA EAST",
    schoolId: "123456",
    schoolName: "Fortunato F. Halili National Agricultural School",
    schoolYear: "2026-2027",
    schoolHead: "Dr. Maria Santos",
    adviser: "Teacher Clarita Reyes",
    gradeLevel: "K",
    section: "A",
  });

  // Map enrolled students or fallback to Kinder default
  const mappedStudents: KinderStudent[] =
    students && students.length > 0
      ? students.map((s, idx) => ({
          id: s.student?.id || `k-${idx + 1}`,
          name: `${s.student?.person?.last_name || ""}, ${s.student?.person?.first_name || ""} ${s.student?.person?.middle_name || ""}`.trim() || `Learner ${idx + 1}`,
          gender: s.student?.person?.gender?.toLowerCase() === "female" ? "Female" : "Male",
          lrn: s.student?.student_number || `10485626000${idx + 1}`,
          birthdate: s.student?.person?.birth_date || "2020-05-15",
          ageYears: 5,
          ageMonths: 6,
        }))
      : DEFAULT_MOCK_KINDER_STUDENTS;

  // Student comments per term
  const [comments, setComments] = useState<Record<string, { t1: string; t2: string; t3: string }>>({
    "k-1": {
      t1: "Dexter shows active curiosity in group play and identifies body parts and colors with ease.",
      t2: "Developing fine motor skills; can cut lines neatly and participates enthusiastically in circle time.",
      t3: "Consistent in socio-emotional self-regulation and demonstrates phonemic awareness.",
    },
    "k-4": {
      t1: "Daryhlla is observant and communicates her feelings politely with teachers and peers.",
      t2: "Consistent in recognizing uppercase and lowercase letters and counting objects up to 10.",
      t3: "Excellent progress in letter-sound recognition and writing her name independently.",
    },
  });

  // Initial attendance values matching Image 2
  const INITIAL_ATTENDANCE_MAP: Record<string, number[]> = {
    "k-1": [20, 20, 20, 10, 10, 19, 19, 16, 15, 18, 17, 5],
    "k-2": [20, 19, 20, 10, 10, 20, 20, 18, 18, 18, 20, 2],
    "k-3": [20, 20, 20, 10, 10, 19, 18, 15, 16, 18, 20, 5],
    "k-4": [15, 20, 20, 10, 10, 17, 20, 20, 16, 18, 20, 2],
    "k-5": [20, 19, 20, 10, 10, 20, 20, 20, 16, 18, 20, 5],
    "k-6": [18, 20, 20, 10, 10, 20, 19, 20, 18, 18, 20, 3],
  };

  // Attendance state: studentId -> monthIndex -> { present: number, absent: number }
  const [attendance, setAttendance] = useState<Record<string, Record<number, { present: number; absent: number }>>>(() => {
    const initial: Record<string, Record<number, { present: number; absent: number }>> = {};
    for (const student of mappedStudents) {
      initial[student.id] = {};
      const preset = INITIAL_ATTENDANCE_MAP[student.id];
      ATTENDANCE_MONTHS.forEach((m, idx) => {
        const pres = preset ? preset[idx] : m.days;
        initial[student.id][idx] = { present: pres, absent: m.days - pres };
      });
    }
    return initial;
  });

  // Ratings state: studentId -> term ("term1"|"term2"|"term3") -> competencyKey (`${domainId}-${compIdx}`) -> RatingValue
  const [ratings, setRatings] = useState<Record<string, Record<string, Record<string, RatingValue>>>>(() => {
    const initial: Record<string, Record<string, Record<string, RatingValue>>> = {};
    for (const student of mappedStudents) {
      initial[student.id] = { term1: {}, term2: {}, term3: {} };
      KINDER_DOMAINS.forEach((domain) => {
        domain.competencies.forEach((comp) => {
          const key = `${domain.id}-${comp.id}`;
          initial[student.id].term1[key] = "DV";
          initial[student.id].term2[key] = "CO";
          initial[student.id].term3[key] = "CO";
        });
      });
    }
    return initial;
  });

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

    getSchoolSettings()
      .then((data) => {
        if (data) {
          if (data.right_logo_url) setRightLogo(data.right_logo_url);
          if (data.logo_url) setLeftLogo(data.logo_url);
          if (data.name) setSchoolInfo((prev) => ({ ...prev, schoolName: data.name }));
          if (data.principal_name) setSchoolInfo((prev) => ({ ...prev, schoolHead: data.principal_name || prev.schoolHead }));
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

  const handleRatingChange = (
    studentId: string,
    term: "term1" | "term2" | "term3",
    domainId: string,
    compId: number,
    value: RatingValue
  ) => {
    const key = `${domainId}-${compId}`;
    setRatings((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [term]: {
          ...(prev[studentId]?.[term] || {}),
          [key]: value,
        },
      },
    }));
  };

  const cycleRating = (studentId: string, term: "term1" | "term2" | "term3", domainId: string, compId: number) => {
    const key = `${domainId}-${compId}`;
    const current = ratings[studentId]?.[term]?.[key] || "";
    let next: RatingValue = "BG";
    if (current === "BG") next = "DV";
    else if (current === "DV") next = "CO";
    else if (current === "CO") next = "";
    handleRatingChange(studentId, term, domainId, compId, next);
  };

  const handleBulkSetTerm = (term: "term1" | "term2" | "term3", value: RatingValue) => {
    setRatings((prev) => {
      const copy = { ...prev };
      mappedStudents.forEach((st) => {
        copy[st.id] = { ...(copy[st.id] || {}) };
        copy[st.id][term] = { ...(copy[st.id][term] || {}) };
        KINDER_DOMAINS.forEach((d) => {
          d.competencies.forEach((c) => {
            copy[st.id][term][`${d.id}-${c.id}`] = value;
          });
        });
      });
      return copy;
    });
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currentStudent = mappedStudents.find((s) => s.id === selectedStudentId) || mappedStudents[0];

  const calculateStudentAttendanceTotal = (studentId: string) => {
    let totalPresent = 0;
    let totalAbsent = 0;
    const stAtt = attendance[studentId] || {};
    ATTENDANCE_MONTHS.forEach((_, idx) => {
      totalPresent += stAtt[idx]?.present ?? 0;
      totalAbsent += stAtt[idx]?.absent ?? 0;
    });
    return { totalPresent, totalAbsent };
  };

  return (
    <div className="bg-card border rounded-3xl shadow-sm overflow-hidden flex flex-col space-y-4 p-6 print:p-0 print:border-none print:shadow-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: landscape; margin: 6mm; }
          .print\\:zoom-fit { zoom: 0.62; }
          .print\\:page-break-after { page-break-after: always; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          @-moz-document url-prefix() {
             .print\\:zoom-fit { transform: scale(0.62); transform-origin: top left; }
          }
        }
      `,
        }}
      />

      {/* Main Action Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4 gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Kindergarten Electronic Class Record (ECR) with SF9</h2>
            <p className="text-xs text-muted-foreground">
              Official DepEd Kindergarten Progress Report Card & 3-Term Developmental Assessment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border bg-background hover:bg-muted transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4 text-slate-600" /> Print Sheet
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
          >
            {saveSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saveSuccess ? "Saved!" : "Save Record"}
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-1 bg-[#0b1329] dark:bg-[#070d1e] p-1.5 rounded-full text-[11px] sm:text-xs font-bold text-white overflow-x-auto shadow-sm border border-slate-800/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden print:hidden">
        <button
          onClick={() => setActiveTab("input")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "input" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          INPUT DATA
        </button>
        <button
          onClick={() => setActiveTab("term1")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term1" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          CLASS SUMMARY - FIRST
        </button>
        <button
          onClick={() => setActiveTab("term2")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term2" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          CLASS SUMMARY - SECOND
        </button>
        <button
          onClick={() => setActiveTab("term3")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "term3" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          CLASS SUMMARY - THIRD
        </button>
        <button
          onClick={() => setActiveTab("finals")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "finals" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          CLASS RECORD - FINALS
        </button>
        <button
          onClick={() => setActiveTab("sf9")}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap uppercase tracking-wide ${
            activeTab === "sf9" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          SF9 REPORT CARD (FRONT & BACK)
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: INPUT DATA */}
      {/* ------------------------------------------------------------- */}
      <div className={`${activeTab === "input" ? "block" : "hidden"} space-y-6 print:block`}>
        {/* DepEd Banner Header */}
        <div className="flex items-center justify-between border-b pb-4 px-2">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer group relative" title="Click to change Left Logo">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "left")} />
              <img src={leftLogo || "/deped-seal.png"} alt="Left Seal" className="h-20 w-20 object-contain group-hover:opacity-80 transition-opacity" />
            </label>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
              Input Data Sheet for Electronic-Class Record (ECR) for Class Adviser
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">Kindergarten Department of Education Standard</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer group relative" title="Click to change Right Logo">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "right")} />
              <img src={rightLogo || "/deped-logo.svg"} alt="Right Logo" className="h-16 w-24 object-contain group-hover:opacity-80 transition-opacity" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: School Information & Teacher Info */}
          <div className="md:col-span-4 space-y-6">
            {/* Box 1: School Information */}
            <div className="border rounded-2xl p-4 bg-card shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b pb-2">
                SCHOOL INFORMATION
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground">REGION :</label>
                  <input
                    type="text"
                    value={schoolInfo.region}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, region: e.target.value })}
                    className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">DIVISION :</label>
                  <input
                    type="text"
                    value={schoolInfo.division}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, division: e.target.value })}
                    className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">CITY / MUNICIPALITY :</label>
                  <input
                    type="text"
                    value={schoolInfo.cityMunicipality}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, cityMunicipality: e.target.value })}
                    className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">DISTRICT :</label>
                  <input
                    type="text"
                    value={schoolInfo.district}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, district: e.target.value })}
                    className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium"
                  />
                </div>
                <div className="pt-2 border-t space-y-2">
                  <div>
                    <label className="font-bold text-muted-foreground">SCHOOL ID :</label>
                    <input
                      type="text"
                      value={schoolInfo.schoolId}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolId: e.target.value })}
                      className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground">SCHOOL NAME :</label>
                    <input
                      type="text"
                      value={schoolInfo.schoolName}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                      className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground">SCHOOL YEAR :</label>
                    <input
                      type="text"
                      value={schoolInfo.schoolYear}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolYear: e.target.value })}
                      className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground">SCHOOL HEAD :</label>
                    <input
                      type="text"
                      value={schoolInfo.schoolHead}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolHead: e.target.value })}
                      className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Teacher, Grade Level, Section Information */}
            <div className="border rounded-2xl p-4 bg-card shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b pb-2">
                TEACHER, GRADE LEVEL, SECTION INFORMATION
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground">ADVISER :</label>
                  <input
                    type="text"
                    value={schoolInfo.adviser}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, adviser: e.target.value })}
                    className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">GRADE LEVEL :</label>
                  <input
                    type="text"
                    value={schoolInfo.gradeLevel}
                    readOnly
                    className="w-full mt-0.5 h-8 px-2 rounded border bg-muted/40 text-xs font-semibold text-muted-foreground"
                  />
                  <span className="text-[10px] text-amber-600 italic block mt-0.5">(Accepts Kinder only)</span>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">SECTION :</label>
                  <input
                    type="text"
                    value={schoolInfo.section}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, section: e.target.value })}
                    className="w-full mt-0.5 h-8 px-2 rounded border bg-background text-xs font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic border-t pt-2">
                Official DepEd Form template configured to preserve developmental grading accuracy and integrity.
              </p>
            </div>
          </div>

          {/* Right Column: Learners' Data Table */}
          <div className="md:col-span-8 border rounded-2xl p-4 bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary">LEARNERS' DATA</h3>
              <span className="text-xs text-muted-foreground font-semibold">Total Learners: {mappedStudents.length}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Male Learners */}
              <div className="border rounded-xl p-3 bg-muted/10 space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-blue-600 border-b pb-1">MALE LEARNERS</h4>
                <div className="space-y-1.5">
                  {mappedStudents.filter((s) => s.gender === "Male").map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className="w-5 text-muted-foreground font-mono font-bold">{idx + 1}.</span>
                      <input type="text" value={s.name} readOnly className="w-1/2 h-8 px-2 rounded border bg-background font-medium" />
                      <input type="text" value={s.lrn} readOnly className="w-1/4 h-8 px-2 rounded border bg-background font-mono text-[11px]" />
                      <input type="text" value={s.birthdate} readOnly className="w-1/4 h-8 px-2 rounded border bg-background text-[11px]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Female Learners */}
              <div className="border rounded-xl p-3 bg-muted/10 space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-pink-600 border-b pb-1">FEMALE LEARNERS</h4>
                <div className="space-y-1.5">
                  {mappedStudents.filter((s) => s.gender === "Female").map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className="w-5 text-muted-foreground font-mono font-bold">{idx + 1}.</span>
                      <input type="text" value={s.name} readOnly className="w-1/2 h-8 px-2 rounded border bg-background font-medium" />
                      <input type="text" value={s.lrn} readOnly className="w-1/4 h-8 px-2 rounded border bg-background font-mono text-[11px]" />
                      <input type="text" value={s.birthdate} readOnly className="w-1/4 h-8 px-2 rounded border bg-background text-[11px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TABS 2, 3, 4: CLASS SUMMARY - FIRST, SECOND, THIRD TERM */}
      {/* ------------------------------------------------------------- */}
      {(["term1", "term2", "term3"] as const).map((termKey) => {
        const termLabel =
          termKey === "term1"
            ? "CLASS SUMMARY - FIRST"
            : termKey === "term2"
            ? "CLASS SUMMARY - SECOND"
            : "CLASS SUMMARY - THIRD";

        const termTitleBanner =
          termKey === "term1"
            ? "FIRST TERM"
            : termKey === "term2"
            ? "SECOND TERM"
            : "THIRD TERM";

        return (
          <div
            key={termKey}
            className={`${activeTab === termKey ? "block" : "hidden"} overflow-x-auto print:block print:break-inside-avoid print:page-break-after border rounded-2xl`}
          >
            <div className="min-w-max print:zoom-fit p-4 bg-card space-y-4">
              {/* Header Matching Image 1 Exactly */}
              <div className="flex items-center justify-between border-b pb-4 px-2">
                <div className="flex items-center gap-3">
                  <img src={leftLogo || "/deped-seal.png"} alt="DepEd Seal" className="h-16 w-16 object-contain" />
                </div>
                <div className="text-center space-y-0.5">
                  <h2 className="text-xl font-black uppercase tracking-wider text-foreground">{termLabel}</h2>
                  <div className="flex items-center justify-center gap-4 text-xs font-bold text-muted-foreground flex-wrap pt-1">
                    <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>REGION:</strong> {schoolInfo.region}</span>
                    <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>DIVISION:</strong> {schoolInfo.division}</span>
                    <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>SCHOOL NAME:</strong> {schoolInfo.schoolName}</span>
                    <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>SCHOOL ID:</strong> {schoolInfo.schoolId}</span>
                    <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>SCHOOL YEAR:</strong> {schoolInfo.schoolYear}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
                    <span><strong>GRADE LEVEL:</strong> {schoolInfo.gradeLevel}</span>
                    <span><strong>SECTION:</strong> {schoolInfo.section}</span>
                    <span><strong>ADVISER:</strong> {schoolInfo.adviser}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <img src={rightLogo || "/deped-logo.svg"} alt="DepEd Logo" className="h-14 w-20 object-contain" />
                </div>
              </div>

              {/* Sub-Header Banner with Term Title & Quick Action Ratings */}
              <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl text-xs print:hidden border">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black uppercase tracking-wider text-xs">
                    {termTitleBanner}
                  </span>
                  <span className="font-semibold text-muted-foreground">Click any rating cell to cycle: BG &rarr; DV &rarr; CO</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkSetTerm(termKey, "CO")}
                    className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-[11px]"
                  >
                    Set All Consistent (CO)
                  </button>
                  <button
                    onClick={() => handleBulkSetTerm(termKey, "DV")}
                    className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 text-[11px]"
                  >
                    Set All Developing (DV)
                  </button>
                  <button
                    onClick={() => handleBulkSetTerm(termKey, "BG")}
                    className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 text-[11px]"
                  >
                    Set All Beginning (BG)
                  </button>
                </div>
              </div>

              {/* Class Summary Multi-Tier Table Matching Image 1 */}
              <table className="w-full text-xs text-left border-collapse border border-slate-300 dark:border-slate-800">
                <thead>
                  {/* Row 1: Main Domains */}
                  <tr className="bg-slate-200 dark:bg-slate-900 font-extrabold uppercase text-[10px] text-center">
                    <th rowSpan={3} className="border p-2 min-w-[190px] text-left">
                      LEARNER'S NAME
                    </th>
                    <th rowSpan={3} className="border p-1 w-24">
                      LRN
                    </th>
                    <th rowSpan={3} className="border p-1 w-20">
                      Date of Birth
                    </th>
                    <th colSpan={2} className="border p-1">
                      Age (BoSY)
                    </th>
                    <th colSpan={2} className="border p-1">
                      Age (EoSY)
                    </th>
                    <th rowSpan={3} className="border p-1 w-8">
                      Sex
                    </th>
                    <th colSpan={5} className="border p-1.5 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      I. Sensory-Perceptual (1-5)
                    </th>
                    <th colSpan={7} className="border p-1.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                      II. Socio-Emotional (1-7)
                    </th>
                    <th colSpan={20} className="border p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      III. Cognitive Development (1-20)
                    </th>
                    <th colSpan={28} className="border p-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                      IV. Language, Literacy, and Communication Development (1-28)
                    </th>
                  </tr>

                  {/* Row 2: Sub-domains for Domain IV and Age units */}
                  <tr className="bg-slate-100 dark:bg-slate-800 text-[9px] text-center font-bold">
                    <th className="border p-0.5">Years</th>
                    <th className="border p-0.5">Months</th>
                    <th className="border p-0.5">Years</th>
                    <th className="border p-0.5">Months</th>
                    {/* Domain I, II, III span below */}
                    <th colSpan={5} className="border p-0.5 bg-blue-50/50 dark:bg-blue-950/30">Motor Skills</th>
                    <th colSpan={7} className="border p-0.5 bg-indigo-50/50 dark:bg-indigo-950/30">Affective & Social</th>
                    <th colSpan={20} className="border p-0.5 bg-emerald-50/50 dark:bg-emerald-950/30">Cognitive & Numeracy</th>
                    {/* Domain IV subdomains */}
                    <th colSpan={4} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">A. Listening</th>
                    <th colSpan={2} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">B. Sight</th>
                    <th colSpan={6} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">C. Speaking</th>
                    <th colSpan={1} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">Phonemic</th>
                    <th colSpan={3} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">Letters</th>
                    <th colSpan={2} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">Sounds</th>
                    <th colSpan={2} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">E. Comp</th>
                    <th colSpan={3} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">F. Print</th>
                    <th colSpan={5} className="border p-0.5 bg-purple-50/50 dark:bg-purple-950/30">G. Writing</th>
                  </tr>

                  {/* Row 3: Competency Numbers 1..60 */}
                  <tr className="bg-slate-100 dark:bg-slate-800 font-mono text-[9px] text-center">
                    <th colSpan={4} className="border p-0.5"></th>
                    {/* Domain I: 1-5 */}
                    {[1, 2, 3, 4, 5].map((n) => (
                      <th key={`d1-${n}`} className="border p-1 w-7 font-bold" title={KINDER_DOMAINS[0].competencies[n - 1]?.text}>
                        {n}
                      </th>
                    ))}
                    {/* Domain II: 1-7 */}
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <th key={`d2-${n}`} className="border p-1 w-7 font-bold" title={KINDER_DOMAINS[1].competencies[n - 1]?.text}>
                        {n}
                      </th>
                    ))}
                    {/* Domain III: 1-20 */}
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <th key={`d3-${n}`} className="border p-1 w-7 font-bold" title={KINDER_DOMAINS[2].competencies[n - 1]?.text}>
                        {n}
                      </th>
                    ))}
                    {/* Domain IV: 1-28 */}
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((n) => (
                      <th key={`d4-${n}`} className="border p-1 w-7 font-bold" title={KINDER_DOMAINS[3].competencies[n - 1]?.text}>
                        {n}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(["Male", "Female"] as const).map((genderGroup) => {
                    const groupStudents = mappedStudents.filter((s) => s.gender === genderGroup);
                    if (groupStudents.length === 0) return null;

                    return (
                      <React.Fragment key={genderGroup}>
                        <tr className="bg-slate-200/70 dark:bg-slate-800/80 font-black text-[11px] uppercase">
                          <td colSpan={68} className="border px-3 py-1.5 text-primary">
                            {genderGroup === "Male" ? "MALE LEARNERS" : "FEMALE LEARNERS"} ({groupStudents.length})
                          </td>
                        </tr>
                        {groupStudents.map((st, idx) => (
                          <tr key={st.id} className="hover:bg-muted/40 transition-colors text-center font-medium">
                            <td className="border px-2 py-1 text-left whitespace-nowrap font-semibold">
                              <span className="text-muted-foreground mr-1.5">{idx + 1}.</span> {st.name}
                            </td>
                            <td className="border p-1 font-mono text-[10px] text-muted-foreground">{st.lrn}</td>
                            <td className="border p-1 text-[10px] text-muted-foreground whitespace-nowrap">{st.birthdate}</td>
                            <td className="border p-1 font-mono text-[10px]">{st.ageYears || 5}</td>
                            <td className="border p-1 font-mono text-[10px]">{st.ageMonths || 6}</td>
                            <td className="border p-1 font-mono text-[10px]">{(st.ageYears || 5) + 1}</td>
                            <td className="border p-1 font-mono text-[10px]">{st.ageMonths || 6}</td>
                            <td className="border p-1 font-mono text-[10px] text-muted-foreground">{st.gender[0]}</td>

                            {/* Competencies 1 to 60 */}
                            {KINDER_DOMAINS.map((domain) =>
                              domain.competencies.map((comp) => {
                                const key = `${domain.id}-${comp.id}`;
                                const val = ratings[st.id]?.[termKey]?.[key] || "";

                                let badgeColor = "bg-muted text-muted-foreground";
                                if (val === "CO") badgeColor = "bg-emerald-600 text-white font-black";
                                else if (val === "DV") badgeColor = "bg-blue-600 text-white font-black";
                                else if (val === "BG") badgeColor = "bg-amber-600 text-white font-black";

                                return (
                                  <td
                                    key={key}
                                    onClick={() => cycleRating(st.id, termKey, domain.id, comp.id)}
                                    className="border p-0.5 cursor-pointer hover:opacity-80 select-none text-[9px] font-mono"
                                    title={`${comp.text} (Click to change)`}
                                  >
                                    <span className={`inline-block w-full py-0.5 rounded text-center ${badgeColor}`}>
                                      {val || "-"}
                                    </span>
                                  </td>
                                );
                              })
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: CLASS RECORD - FINALS (Matches Image 2 Exactly) */}
      {/* ------------------------------------------------------------- */}
      <div className={`${activeTab === "finals" ? "block" : "hidden"} overflow-x-auto print:block border rounded-2xl`}>
        <div className="min-w-max p-4 bg-card space-y-4">
          {/* Header Matching Image 2 Exactly */}
          <div className="flex items-center justify-between border-b pb-4 px-2">
            <div className="flex items-center gap-3">
              <img src={leftLogo || "/deped-seal.png"} alt="DepEd Seal" className="h-16 w-16 object-contain" />
            </div>
            <div className="text-center space-y-0.5">
              <h2 className="text-xl font-black uppercase tracking-wider text-foreground">CLASS RECORD - FINALS</h2>
              <div className="flex items-center justify-center gap-3 text-xs font-bold text-muted-foreground flex-wrap pt-1">
                <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>REGION:</strong> {schoolInfo.region}</span>
                <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>DIVISION:</strong> {schoolInfo.division}</span>
                <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>SCHOOL NAME:</strong> {schoolInfo.schoolName}</span>
                <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>SCHOOL ID:</strong> {schoolInfo.schoolId}</span>
                <span className="border px-2 py-0.5 rounded bg-muted/30"><strong>SCHOOL YEAR:</strong> {schoolInfo.schoolYear}</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
                <span><strong>GRADE LEVEL:</strong> {schoolInfo.gradeLevel}</span>
                <span><strong>SECTION:</strong> {schoolInfo.section}</span>
                <span><strong>ADVISER:</strong> {schoolInfo.adviser}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <img src={rightLogo || "/deped-logo.svg"} alt="DepEd Logo" className="h-14 w-20 object-contain" />
            </div>
          </div>

          {/* Table matching Image 2 with dark blue header & month codes */}
          <table className="w-full text-xs text-left border-collapse border border-slate-300 dark:border-slate-800">
            <thead className="bg-[#0b1b3d] text-white font-black uppercase text-[10px] text-center">
              <tr>
                <th className="border border-slate-700 p-2 text-left min-w-[220px]">LEARNERS' NAMES</th>
                {ATTENDANCE_MONTHS.map((m, idx) => (
                  <th key={idx} className="border border-slate-700 p-1.5 w-14">
                    {m.code}
                  </th>
                ))}
                <th className="border border-slate-700 p-2 bg-blue-700 text-white font-black text-center w-16">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {(["Male", "Female"] as const).map((genderGroup) => {
                const groupStudents = mappedStudents.filter((s) => s.gender === genderGroup);
                if (groupStudents.length === 0) return null;

                return (
                  <React.Fragment key={genderGroup}>
                    <tr className="bg-slate-200/80 dark:bg-slate-800/80 font-black text-[11px] uppercase">
                      <td colSpan={14} className="border px-3 py-1.5 text-primary">
                        {genderGroup === "Male" ? "MALE" : "FEMALE"} ({groupStudents.length})
                      </td>
                    </tr>
                    {groupStudents.map((st, idx) => {
                      const { totalPresent } = calculateStudentAttendanceTotal(st.id);
                      return (
                        <tr key={st.id} className="hover:bg-muted/40 transition-colors text-center font-medium">
                          <td className="border px-2 py-1 text-left whitespace-nowrap font-semibold">
                            <span className="text-muted-foreground mr-1.5">{idx + 1}.</span> {st.name}
                          </td>

                          {ATTENDANCE_MONTHS.map((m, mIdx) => {
                            const cur = attendance[st.id]?.[mIdx] || { present: m.days, absent: 0 };
                            return (
                              <td key={mIdx} className="border p-1 font-mono text-[11px]">
                                <input
                                  type="number"
                                  min={0}
                                  max={m.days}
                                  value={cur.present}
                                  onChange={(e) => {
                                    const val = Math.min(m.days, Math.max(0, Number(e.target.value) || 0));
                                    setAttendance({
                                      ...attendance,
                                      [st.id]: {
                                        ...(attendance[st.id] || {}),
                                        [mIdx]: { present: val, absent: m.days - val },
                                      },
                                    });
                                  }}
                                  className="w-10 h-6 text-center font-mono font-bold border rounded bg-background mx-auto"
                                />
                              </td>
                            );
                          })}

                          <td className="border p-1 font-mono font-black text-blue-700 dark:text-blue-400 bg-blue-500/10">
                            {totalPresent}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Bottom Row Matching Image 2: TOTAL NUMBER OF SCHOOL DAYS */}
              <tr className="bg-slate-100 dark:bg-slate-900 font-black text-center text-[10.5px]">
                <td className="border p-2 text-left uppercase tracking-wider font-extrabold text-slate-900 dark:text-slate-100">
                  TOTAL NUMBER OF SCHOOL DAYS
                </td>
                {ATTENDANCE_MONTHS.map((m, idx) => (
                  <td key={idx} className="border p-1.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                    {m.days}
                  </td>
                ))}
                <td className="border p-2 font-mono font-black text-sm bg-blue-600 text-white">
                  201
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: SF9 REPORT CARD (FRONT & BACK) */}
      {/* ------------------------------------------------------------- */}
      <div className={`${activeTab === "sf9" ? "block" : "hidden"} space-y-6 print:block`}>
        {/* Student Selector Bar */}
        <div className="flex items-center justify-between bg-muted/40 p-3 rounded-2xl print:hidden flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Select Learner for SF9:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="h-9 px-3 rounded-xl border bg-background text-xs font-bold"
            >
              {mappedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.gender}) - LRN: {s.lrn}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Printer className="h-4 w-4" /> Print SF9 for {currentStudent.name}
            </button>
          </div>
        </div>

        {/* ===================== FRONT OF SF9 (PAGE 1) ===================== */}
        <div className="border rounded-2xl p-6 bg-white text-black shadow-sm space-y-4 print:border-none print:shadow-none print:p-0 print:break-inside-avoid print:page-break-after">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-3">
            <img src={leftLogo || "/deped-seal.png"} alt="DepEd Seal" className="h-16 w-16 object-contain" />
            <div className="text-center space-y-0.5 flex-1 px-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">Republic of the Philippines</p>
              <p className="text-[11px] uppercase font-bold text-slate-800">Department of Education</p>
              <h2 className="text-xs font-black uppercase tracking-tight text-slate-900">
                SCHOOLS DIVISION OFFICE OF {schoolInfo.division}
              </h2>
              <p className="text-[10px] font-semibold text-slate-700">District of {schoolInfo.district}</p>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-950 pt-1">
                {schoolInfo.schoolName}
              </h3>
              <h1 className="text-base font-black uppercase tracking-wider text-slate-950 pt-1">
                KINDERGARTEN PROGRESS REPORT CARD (SF9)
              </h1>
              <p className="text-[11px] font-bold text-slate-700">School Year {schoolInfo.schoolYear}</p>
            </div>
            <img src={rightLogo || "/deped-logo.svg"} alt="School Logo" className="h-16 w-20 object-contain" />
          </div>

          {/* Learner Info Card */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium border p-3 rounded-xl bg-slate-50 text-slate-900">
            <div className="space-y-1">
              <div>
                <strong>Name:</strong> <span className="font-bold underline uppercase">{currentStudent.name}</span>
              </div>
              <div>
                <strong>Section:</strong> <span className="underline">{schoolInfo.section}</span>
              </div>
              <div>
                <strong>Age (Beginning of SY):</strong> {currentStudent.ageYears || 5} Years, {currentStudent.ageMonths || 6} Months
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div>
                <strong>LRN:</strong> <span className="font-mono font-bold">{currentStudent.lrn}</span>
              </div>
              <div>
                <strong>Teacher / Adviser:</strong> <span className="underline font-bold">{schoolInfo.adviser}</span>
              </div>
              <div>
                <strong>Age (End of SY):</strong> {(currentStudent.ageYears || 5) + 1} Years, {currentStudent.ageMonths || 6} Months
              </div>
            </div>
          </div>

          {/* Informative Note Box */}
          <div className="border border-emerald-600 bg-emerald-50/50 p-2.5 rounded-lg text-[10.5px] leading-relaxed text-slate-800 italic">
            This progress report informs parents about their child's learning achievements based on the Kindergarten Curriculum Guide.
            It provides a summary of the child's performance and indicates their level of progress across different developmental
            domains every ten (10) weeks or each term. Each competency is marked as: <strong>Consistent (CO)</strong>, <strong>Developing (DV)</strong>, or <strong>Beginning (BG)</strong>.
          </div>

          {/* Competency 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px]">
            {/* Column 1: Domains I, II, III */}
            <div className="space-y-3">
              {[KINDER_DOMAINS[0], KINDER_DOMAINS[1], KINDER_DOMAINS[2]].map((domain) => (
                <div key={domain.id} className="border rounded-lg overflow-hidden border-slate-300">
                  <div className="bg-slate-100 p-1.5 font-bold text-[11px] border-b text-slate-950 flex items-center justify-between">
                    <span>{domain.title}</span>
                    <div className="flex gap-4 font-mono text-[10px] pr-2">
                      <span>T1</span>
                      <span>T2</span>
                      <span>T3</span>
                    </div>
                  </div>
                  <table className="w-full border-collapse">
                    <tbody>
                      {domain.competencies.map((comp) => {
                        const key = `${domain.id}-${comp.id}`;
                        const t1 = ratings[currentStudent.id]?.term1?.[key] || "-";
                        const t2 = ratings[currentStudent.id]?.term2?.[key] || "-";
                        const t3 = ratings[currentStudent.id]?.term3?.[key] || "-";

                        return (
                          <tr key={key} className="border-b last:border-none border-slate-200 hover:bg-slate-50">
                            <td className="p-1 leading-snug">
                              <span className="font-bold mr-1">{comp.id}.</span> {comp.text}
                            </td>
                            <td className="w-7 text-center font-mono font-bold text-[10px] border-l border-slate-200">
                              {t1}
                            </td>
                            <td className="w-7 text-center font-mono font-bold text-[10px] border-l border-slate-200">
                              {t2}
                            </td>
                            <td className="w-7 text-center font-mono font-bold text-[10px] border-l border-slate-200">
                              {t3}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Column 2: Domain IV */}
            <div className="space-y-3">
              <div className="border rounded-lg overflow-hidden border-slate-300">
                <div className="bg-slate-100 p-1.5 font-bold text-[11px] border-b text-slate-950 flex items-center justify-between">
                  <span>{KINDER_DOMAINS[3].title}</span>
                  <div className="flex gap-4 font-mono text-[10px] pr-2">
                    <span>T1</span>
                    <span>T2</span>
                    <span>T3</span>
                  </div>
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    {KINDER_DOMAINS[3].competencies.map((comp) => {
                      const key = `${KINDER_DOMAINS[3].id}-${comp.id}`;
                      const t1 = ratings[currentStudent.id]?.term1?.[key] || "-";
                      const t2 = ratings[currentStudent.id]?.term2?.[key] || "-";
                      const t3 = ratings[currentStudent.id]?.term3?.[key] || "-";

                      return (
                        <tr key={key} className="border-b last:border-none border-slate-200 hover:bg-slate-50">
                          <td className="p-1 leading-snug">
                            {comp.sub && <span className="block font-bold text-slate-600 text-[9.5px] uppercase">{comp.sub}</span>}
                            <span className="font-bold mr-1">{comp.id}.</span> {comp.text}
                          </td>
                          <td className="w-7 text-center font-mono font-bold text-[10px] border-l border-slate-200">
                            {t1}
                          </td>
                          <td className="w-7 text-center font-mono font-bold text-[10px] border-l border-slate-200">
                            {t2}
                          </td>
                          <td className="w-7 text-center font-mono font-bold text-[10px] border-l border-slate-200">
                            {t3}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== BACK OF SF9 (PAGE 2) ===================== */}
        <div className="border rounded-2xl p-6 bg-white text-black shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:break-inside-avoid print:page-break-after">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side: Teacher's Comments/Remarks */}
            <div className="space-y-4 border p-4 rounded-xl border-slate-300">
              <div className="text-center border-b pb-2">
                <h3 className="font-black text-xs uppercase tracking-wide">TEACHER'S COMMENTS / REMARKS</h3>
                <p className="text-[10px] text-slate-600 italic">
                  (Provide specific observations, strengths, and suggested interventions)
                </p>
              </div>

              {/* Term 1 */}
              <div className="space-y-2 border-b pb-3">
                <h4 className="font-bold text-xs uppercase text-slate-900">TERM 1 (UNANG TERMINO)</h4>
                <textarea
                  rows={4}
                  value={comments[currentStudent.id]?.t1 || ""}
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [currentStudent.id]: { ...(comments[currentStudent.id] || { t1: "", t2: "", t3: "" }), t1: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded text-xs bg-slate-50 font-medium leading-relaxed"
                  placeholder="Enter remarks for Term 1..."
                />
                <div className="pt-2 text-right text-xs">
                  <span className="font-semibold">Parent's/Guardian's Signature: _______________________</span>
                </div>
              </div>

              {/* Term 2 */}
              <div className="space-y-2 border-b pb-3">
                <h4 className="font-bold text-xs uppercase text-slate-900">TERM 2 (IKALAWANG TERMINO)</h4>
                <textarea
                  rows={4}
                  value={comments[currentStudent.id]?.t2 || ""}
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [currentStudent.id]: { ...(comments[currentStudent.id] || { t1: "", t2: "", t3: "" }), t2: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded text-xs bg-slate-50 font-medium leading-relaxed"
                  placeholder="Enter remarks for Term 2..."
                />
                <div className="pt-2 text-right text-xs">
                  <span className="font-semibold">Parent's/Guardian's Signature: _______________________</span>
                </div>
              </div>

              {/* Term 3 */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase text-slate-900">TERM 3 (IKATLONG TERMINO)</h4>
                <textarea
                  rows={4}
                  value={comments[currentStudent.id]?.t3 || ""}
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [currentStudent.id]: { ...(comments[currentStudent.id] || { t1: "", t2: "", t3: "" }), t3: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded text-xs bg-slate-50 font-medium leading-relaxed"
                  placeholder="Enter remarks for Term 3..."
                />
                <div className="pt-2 text-right text-xs">
                  <span className="font-semibold">Parent's/Guardian's Signature: _______________________</span>
                </div>
              </div>
            </div>

            {/* Right Side: Attendance Record, Rating Scale & Certificate of Transfer */}
            <div className="space-y-5">
              {/* Attendance Record */}
              <div className="border rounded-xl p-3 border-slate-300 space-y-2">
                <h3 className="font-black text-xs uppercase tracking-wide text-center border-b pb-1">
                  ATTENDANCE RECORD
                </h3>
                <table className="w-full text-[10.5px] border-collapse border border-slate-300 text-center">
                  <thead className="bg-slate-100 font-bold uppercase text-[9.5px]">
                    <tr>
                      <th className="border p-1">Term</th>
                      <th className="border p-1">Month</th>
                      <th className="border p-1">Class Days</th>
                      <th className="border p-1">Present</th>
                      <th className="border p-1">Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ATTENDANCE_MONTHS.map((m, idx) => {
                      const curAtt = attendance[currentStudent.id]?.[idx] || { present: m.days, absent: 0 };
                      return (
                        <tr key={idx} className="border-b border-slate-200">
                          {idx === 0 && <td rowSpan={4} className="border p-1 font-bold bg-slate-50 text-[10px]">1</td>}
                          {idx === 4 && <td rowSpan={4} className="border p-1 font-bold bg-slate-50 text-[10px]">2</td>}
                          {idx === 8 && <td rowSpan={4} className="border p-1 font-bold bg-slate-50 text-[10px]">3</td>}
                          <td className="border p-1 text-left font-medium">{m.name}</td>
                          <td className="border p-1 font-mono">{m.days}</td>
                          <td className="border p-0.5">
                            <input
                              type="number"
                              min={0}
                              max={m.days}
                              value={curAtt.present}
                              onChange={(e) => {
                                const val = Math.min(m.days, Math.max(0, Number(e.target.value) || 0));
                                setAttendance({
                                  ...attendance,
                                  [currentStudent.id]: {
                                    ...(attendance[currentStudent.id] || {}),
                                    [idx]: { present: val, absent: m.days - val },
                                  },
                                });
                              }}
                              className="w-12 h-6 text-center font-mono font-bold border rounded mx-auto"
                            />
                          </td>
                          <td className="border p-1 font-mono text-muted-foreground">{curAtt.absent}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="border p-1.5 text-center uppercase">TOTAL</td>
                      <td className="border p-1.5 font-mono">201</td>
                      <td className="border p-1.5 font-mono font-black text-emerald-700">
                        {calculateStudentAttendanceTotal(currentStudent.id).totalPresent}
                      </td>
                      <td className="border p-1.5 font-mono font-black text-rose-700">
                        {calculateStudentAttendanceTotal(currentStudent.id).totalAbsent}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rating Scale Box */}
              <div className="border rounded-xl p-3 border-slate-300 space-y-2">
                <h3 className="font-black text-xs uppercase tracking-wide text-center border-b pb-1">
                  IMPORTANT NOTE TO PARENTS / GUARDIANS
                </h3>
                <p className="text-[10px] text-slate-600 leading-snug italic">
                  This rating scale is used to record the learner's level of attainment for each competency across the developmental domains.
                </p>
                <table className="w-full text-[10px] border-collapse border border-slate-300">
                  <thead className="bg-slate-100 font-bold uppercase text-[9px]">
                    <tr>
                      <th className="border p-1.5 w-1/3">Rating</th>
                      <th className="border p-1.5">Indicators</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-bold bg-emerald-50 text-emerald-900">Consistent (CO)</td>
                      <td className="border p-2 text-slate-800 leading-snug">
                        Always demonstrates the expected competency; always participates in different activities; works independently and performs tasks advanced in some aspects.
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-bold bg-blue-50 text-blue-900">Developing (DV)</td>
                      <td className="border p-2 text-slate-800 leading-snug">
                        Sometimes demonstrates the competency; sometimes participates with minimal supervision; progresses continuously in doing assigned tasks.
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-bold bg-amber-50 text-amber-900">Beginning (BG)</td>
                      <td className="border p-2 text-slate-800 leading-snug">
                        Rarely demonstrates the expected competency; rarely participates in class activities; needs close supervision.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Certificate of Transfer */}
              <div className="border rounded-xl p-4 border-slate-300 text-center space-y-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 border-b pb-1">
                  CERTIFICATE OF TRANSFER
                </h4>
                <p className="text-xs leading-relaxed text-slate-800">
                  This is to certify that <span className="font-bold underline uppercase">{currentStudent.name}</span> of{" "}
                  <span className="font-bold underline">{schoolInfo.schoolName}</span> has developed the general competencies
                  based on the Kindergarten Curriculum Guide.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-semibold">
                  <div>
                    <div className="border-b border-black pb-1 mb-1 font-bold">{schoolInfo.adviser}</div>
                    <span className="text-[10px] uppercase text-slate-600">Class Adviser</span>
                  </div>
                  <div>
                    <div className="border-b border-black pb-1 mb-1 font-bold">{schoolInfo.schoolHead}</div>
                    <span className="text-[10px] uppercase text-slate-600">School Head / Principal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
