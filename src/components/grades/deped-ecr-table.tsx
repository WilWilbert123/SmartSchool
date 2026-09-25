"use client";

import { useState, useEffect } from "react";
import { DepEdECRTableTLE } from "./deped-ecr-table-tle";
import { DepEdECRTableGMRC } from "./deped-ecr-table-gmrc";
import { DepEdECRTableMAPEH } from "./deped-ecr-table-mapeh";
import { DepEdECRTableCore } from "./deped-ecr-table-core";
import { DepEdECRTableKinder } from "./deped-ecr-table-kinder";
import { DepEdECRTableSSHS } from "./deped-ecr-table-sshs";

export function DepEdECRTable({ subjectName, students }: { subjectName?: string, students?: any[] }) {
  const [template, setTemplate] = useState<"core" | "tle" | "gmrc" | "mapeh" | "kinder" | "sshs">("sshs");

  // Auto-detect based on subject name when it changes
  useEffect(() => {
    if (subjectName) {
      const lowerName = subjectName.toLowerCase();
      if (
        lowerName.includes("sshs") ||
        lowerName.includes("senior") ||
        lowerName.includes("shs") ||
        lowerName.includes("strengthened") ||
        lowerName.includes("grade 11") ||
        lowerName.includes("grade 12") ||
        lowerName.includes("stem") ||
        lowerName.includes("humss") ||
        lowerName.includes("abm") ||
        lowerName.includes("tvl")
      ) {
        setTemplate("sshs");
      } else if (lowerName.includes("kinder") || lowerName.includes("kindergarten")) {
        setTemplate("kinder");
      } else if (lowerName.includes("gmrc") || lowerName.includes("values")) {
        setTemplate("gmrc");
      } else if (
        lowerName.includes("mapeh") ||
        lowerName.includes("music") ||
        lowerName.includes("art") ||
        lowerName.includes("pe") ||
        lowerName.includes("physical") ||
        lowerName.includes("health")
      ) {
        setTemplate("mapeh");
      } else if (
        lowerName.includes("tle") ||
        lowerName.includes("epp") ||
        lowerName.includes("livelihood") ||
        lowerName.includes("technical")
      ) {
        setTemplate("tle");
      } else if (
        lowerName.includes("science") ||
        lowerName.includes("math") ||
        lowerName.includes("english") ||
        lowerName.includes("filipino") ||
        lowerName.includes("ap") ||
        lowerName.includes("araling") ||
        lowerName.includes("panlipunan") ||
        lowerName.includes("social")
      ) {
        setTemplate("core");
      }
    }
  }, [subjectName]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden bg-white dark:bg-slate-900 p-2 rounded-xl border items-center shadow-sm flex-wrap">
        <span className="text-sm font-semibold text-muted-foreground ml-2">Subject Template:</span>
        <button
          onClick={() => setTemplate("sshs")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            template === "sshs" ? "bg-blue-800 text-white shadow" : "hover:bg-muted"
          }`}
        >
          [Senior High] SSHS E-Class Record SY 2026-2027 (DO 15, s. 2026)
        </button>
        <button
          onClick={() => setTemplate("core")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            template === "core" ? "bg-primary text-primary-foreground shadow" : "hover:bg-muted"
          }`}
        >
          [Grades 2-10] 3-Term (Science, Math, English, Filipino, AP)
        </button>
        <button
          onClick={() => setTemplate("gmrc")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            template === "gmrc" ? "bg-primary text-primary-foreground shadow" : "hover:bg-muted"
          }`}
        >
          GMRC / Values Education (3 Terms)
        </button>
        <button
          onClick={() => setTemplate("tle")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            template === "tle" ? "bg-primary text-primary-foreground shadow" : "hover:bg-muted"
          }`}
        >
          EPP / TLE (20-60-20)
        </button>
        <button
          onClick={() => setTemplate("mapeh")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            template === "mapeh" ? "bg-primary text-primary-foreground shadow" : "hover:bg-muted"
          }`}
        >
          [Grades 2-10] 3-Term (Music and Arts, P.E. and Health)
        </button>
        <button
          onClick={() => setTemplate("kinder")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            template === "kinder" ? "bg-amber-600 text-white shadow font-bold" : "hover:bg-muted"
          }`}
        >
          [Kinder] E-Class Record with SF9
        </button>
      </div>

      {template === "sshs" && <DepEdECRTableSSHS students={students} />}
      {template === "core" && <DepEdECRTableCore students={students} />}
      {template === "gmrc" && <DepEdECRTableGMRC students={students} />}
      {template === "tle" && <DepEdECRTableTLE students={students} />}
      {template === "mapeh" && <DepEdECRTableMAPEH students={students} />}
      {template === "kinder" && <DepEdECRTableKinder students={students} />}
    </div>
  );
}
