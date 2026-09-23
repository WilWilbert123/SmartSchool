"use client";

import { useEffect } from "react";
import { applyAccentColor } from "@/lib/theme/accent-colors";

export function AccentInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem("smartschool_accent_color");
    if (saved) {
      applyAccentColor(saved);
    }
  }, []);

  return null;
}
