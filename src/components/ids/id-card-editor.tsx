"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Save,
  LayoutTemplate,
  Settings,
  Image as ImageIcon,
  Type,
  QrCode,
  Square,
  PenTool,
  Grid,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Barcode,
  Loader2,
  CheckCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IDCardPreview } from "@/components/ids/id-card-preview";
import type { IDTemplate, IDElement } from "@/features/ids/id.types";
import { saveIDTemplate } from "@/features/ids/id.actions";

interface IDEditorClientProps {
  initialTemplate?: IDTemplate | null;
}

export function IDEditorClient({ initialTemplate }: IDEditorClientProps) {
  const router = useRouter();

  const [template, setTemplate] = useState<IDTemplate>(() => {
    if (initialTemplate) {
      return {
        ...initialTemplate,
        front_elements: initialTemplate.front_elements || initialTemplate.elements || [],
        back_elements: initialTemplate.back_elements || [],
        front_background_color: initialTemplate.front_background_color || initialTemplate.background_color || "#ffffff",
        back_background_color: initialTemplate.back_background_color || "#f8fafc",
      };
    }
    return {
      id: "new",
      name: "Standard Student ID 2026",
      width_mm: 54,
      height_mm: 86,
      orientation: "portrait",
      background_color: "#ffffff",
      front_background_color: "#ffffff",
      back_background_color: "#f8fafc",
      is_active: true,
      elements: [],
      front_elements: [
        {
          id: "header-banner",
          type: "SHAPE",
          x: 0,
          y: 0,
          width: 54,
          height: 18,
          content: "",
          style: { backgroundColor: "#1e3a8a", shapeType: "rectangle", borderRadius: "0px" },
          z_index: 1,
        },
        {
          id: "school-name",
          type: "TEXT",
          x: 2,
          y: 3,
          width: 50,
          height: 6,
          content: "SMARTSCHOOL ACADEMY",
          style: { color: "#ffffff", fontSize: "11px", fontWeight: "bold", textAlign: "center" },
          z_index: 2,
        },
        {
          id: "student-photo",
          type: "IMAGE",
          x: 14,
          y: 21,
          width: 26,
          height: 28,
          content: "profile_photo",
          style: { borderRadius: "8px", borderColor: "#1e3a8a", borderWidth: "2px" },
          z_index: 3,
        },
        {
          id: "student-name",
          type: "TEXT",
          x: 2,
          y: 51,
          width: 50,
          height: 6,
          content: "{student_name}",
          style: { color: "#0f172a", fontSize: "13px", fontWeight: "bold", textAlign: "center" },
          z_index: 4,
        },
        {
          id: "student-lrn",
          type: "TEXT",
          x: 2,
          y: 57,
          width: 50,
          height: 5,
          content: "ID: {student_number}",
          style: { color: "#2563eb", fontSize: "10px", fontWeight: "600", textAlign: "center" },
          z_index: 4,
        },
        {
          id: "qr-code",
          type: "QR_CODE",
          x: 20,
          y: 68,
          width: 14,
          height: 14,
          content: "{verification_url}",
          style: {},
          z_index: 4,
        },
      ],
      back_elements: [
        {
          id: "back-header",
          type: "TEXT",
          x: 2,
          y: 6,
          width: 50,
          height: 6,
          content: "TERMS & CONDITIONS",
          style: { color: "#1e3a8a", fontSize: "10px", fontWeight: "bold", textAlign: "center" },
          z_index: 1,
        },
        {
          id: "back-line",
          type: "SHAPE",
          x: 4,
          y: 13,
          width: 46,
          height: 1,
          content: "",
          style: { backgroundColor: "#cbd5e1", shapeType: "line" },
          z_index: 1,
        },
        {
          id: "back-rules",
          type: "TEXT",
          x: 4,
          y: 16,
          width: 46,
          height: 20,
          content: "This identification card is non-transferable and must be worn at all times while inside school premises. If found, please return to office.",
          style: { color: "#475569", fontSize: "7px", textAlign: "center" },
          z_index: 2,
        },
        {
          id: "emergency-contact",
          type: "TEXT",
          x: 4,
          y: 44,
          width: 46,
          height: 5,
          content: "Emergency: {guardian_contact}",
          style: { color: "#0f172a", fontSize: "8px", fontWeight: "600", textAlign: "center" },
          z_index: 2,
        },
        {
          id: "principal-signature",
          type: "SIGNATURE",
          x: 12,
          y: 58,
          width: 30,
          height: 12,
          content: "",
          style: {},
          z_index: 3,
        },
        {
          id: "principal-label",
          type: "TEXT",
          x: 2,
          y: 72,
          width: 50,
          height: 5,
          content: "SCHOOL PRINCIPAL",
          style: { color: "#1e293b", fontSize: "7px", fontWeight: "bold", textAlign: "center" },
          z_index: 3,
        },
      ],
    };
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSizeMm, setGridSizeMm] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find selected element in either front_elements or back_elements
  const frontEls = template.front_elements || [];
  const backEls = template.back_elements || [];

  const selectedInFront = frontEls.find((el) => el.id === selectedElementId);
  const selectedInBack = backEls.find((el) => el.id === selectedElementId);
  const selectedElement = selectedInFront || selectedInBack;
  const selectedSide: "front" | "back" = selectedInBack ? "back" : "front";

  // Add Element Helper
  const handleAddElement = (
    targetSide: "front" | "back",
    type: IDElement["type"],
    contentOverride?: string,
    styleOverride?: Record<string, any>,
    defaultWidth = 30,
    defaultHeight = 10
  ) => {
    const editSideKey = targetSide === "back" ? "back_elements" : "front_elements";
    const currentEls = template[editSideKey] || [];
    const newId = `el-${Date.now()}`;
    const newElement: IDElement = {
      id: newId,
      type,
      x: 5,
      y: 30,
      width: defaultWidth,
      height: defaultHeight,
      content: contentOverride || (type === "TEXT" ? "Sample Text" : ""),
      style: styleOverride || {
        fontSize: "12px",
        color: "#0f172a",
        textAlign: "left",
      },
      z_index: currentEls.length + 1,
    };

    setTemplate((prev) => ({
      ...prev,
      [editSideKey]: [...(prev[editSideKey] || []), newElement],
    }));
    setSelectedElementId(newId);
  };

  // Update single element (mouse drag / resize / property)
  const handleUpdateElement = (id: string, updates: Partial<IDElement>) => {
    const isBack = (template.back_elements || []).some((el) => el.id === id);
    const editSideKey = isBack ? "back_elements" : "front_elements";

    setTemplate((prev) => ({
      ...prev,
      [editSideKey]: (prev[editSideKey] || []).map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  };

  const updateSelectedElement = (key: keyof IDElement, value: any) => {
    if (!selectedElementId) return;
    handleUpdateElement(selectedElementId, { [key]: value });
  };

  // Image / Signature File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElementId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateSelectedElement("content", dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Update selected element style
  const updateSelectedStyle = (styleKey: string, value: any) => {
    if (!selectedElementId) return;
    const isBack = (template.back_elements || []).some((el) => el.id === selectedElementId);
    const editSideKey = isBack ? "back_elements" : "front_elements";

    setTemplate((prev) => ({
      ...prev,
      [editSideKey]: (prev[editSideKey] || []).map((el) => {
        if (el.id === selectedElementId) {
          return {
            ...el,
            style: {
              ...el.style,
              [styleKey]: value,
            },
          };
        }
        return el;
      }),
    }));
  };

  // Delete Element
  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    const isBack = (template.back_elements || []).some((el) => el.id === selectedElementId);
    const editSideKey = isBack ? "back_elements" : "front_elements";

    setTemplate((prev) => ({
      ...prev,
      [editSideKey]: (prev[editSideKey] || []).filter((el) => el.id !== selectedElementId),
    }));
    setSelectedElementId(null);
  };

  // Duplicate Element
  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const isBack = (template.back_elements || []).some((el) => el.id === selectedElementId);
    const editSideKey = isBack ? "back_elements" : "front_elements";
    const dupId = `el-${Date.now()}`;
    const duplicate: IDElement = {
      ...selectedElement,
      id: dupId,
      x: Math.min(selectedElement.x + 3, template.width_mm - 10),
      y: Math.min(selectedElement.y + 3, template.height_mm - 10),
      z_index: (template[editSideKey] || []).length + 1,
    };

    setTemplate((prev) => ({
      ...prev,
      [editSideKey]: [...(prev[editSideKey] || []), duplicate],
    }));
    setSelectedElementId(dupId);
  };

  // Save Template
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    const res = await saveIDTemplate(template);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        router.push("/admin/ids");
      }, 1200);
    } else {
      alert("Failed to save template: " + res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/ids"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to ID Management
          </Link>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="Template Title..."
              className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:outline-none transition-colors px-1 py-0.5"
            />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {template.width_mm}x{template.height_mm}mm
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-3 border transition-colors ${
              showGrid ? "bg-muted text-foreground border-primary/50" : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <Grid className="mr-2 h-4 w-4" />
            Grid Guidelines
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50 gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-300" /> Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Template
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[720px]">
        {/* Left Toolbar (Elements Palette) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center text-foreground">
              <LayoutTemplate className="mr-2 h-4 w-4 text-primary" /> Add Elements
            </h3>

            {/* Front Side Details Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Front Card Elements
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handleAddElement(
                      "front",
                      "IMAGE",
                      "profile_photo",
                      { borderRadius: "8px", borderColor: "#1e3a8a", borderWidth: "2px" },
                      26,
                      28
                    )
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-600" /> Photo (2x2)
                </button>
                <button
                  onClick={() =>
                    handleAddElement("front", "TEXT", "{student_name}", {
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#0f172a",
                      textAlign: "center",
                    }, 48, 6)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-blue-600" /> Full Name
                </button>
                <button
                  onClick={() =>
                    handleAddElement("front", "TEXT", "ID: {student_number}", {
                      fontSize: "10px",
                      fontWeight: "600",
                      color: "#2563eb",
                      textAlign: "center",
                    }, 48, 5)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-indigo-600" /> Student ID
                </button>
                <button
                  onClick={() =>
                    handleAddElement("front", "TEXT", "LRN: {lrn}", {
                      fontSize: "9px",
                      fontWeight: "600",
                      color: "#475569",
                      textAlign: "center",
                    }, 48, 5)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-slate-600" /> LRN Number
                </button>
                <button
                  onClick={() =>
                    handleAddElement("front", "TEXT", "Grade: {grade_level} - {section_name}", {
                      fontSize: "9px",
                      color: "#475569",
                      textAlign: "center",
                    }, 48, 5)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-slate-600" /> Grade/Section
                </button>
                <button
                  onClick={() =>
                    handleAddElement("front", "TEXT", "S.Y. {school_year}", {
                      fontSize: "8px",
                      color: "#64748b",
                      textAlign: "center",
                    }, 48, 4)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-slate-500" /> School Year
                </button>
                <button
                  onClick={() => handleAddElement("front", "SIGNATURE", "{student_signature}", {}, 28, 10)}
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <PenTool className="h-3.5 w-3.5 text-indigo-600" /> Student Sign
                </button>
                <button
                  onClick={() => handleAddElement("front", "QR_CODE", "{verification_url}", {}, 14, 14)}
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <QrCode className="h-3.5 w-3.5 text-slate-800" /> QR Code
                </button>
              </div>
            </div>

            {/* Back Side Details Buttons */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Back Card Elements
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handleAddElement("back", "TEXT", "Guardian: {guardian_name} ({guardian_relationship})", {
                      fontSize: "8px",
                      fontWeight: "600",
                      color: "#0f172a",
                      textAlign: "center",
                    }, 48, 5)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-blue-600" /> Guardian Name
                </button>
                <button
                  onClick={() =>
                    handleAddElement("back", "TEXT", "Emergency: {guardian_contact}", {
                      fontSize: "8px",
                      fontWeight: "bold",
                      color: "#b91c1c",
                      textAlign: "center",
                    }, 48, 5)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-rose-600" /> Emergency Phone
                </button>
                <button
                  onClick={() =>
                    handleAddElement("back", "TEXT", "Address: {home_address}", {
                      fontSize: "7px",
                      color: "#475569",
                      textAlign: "center",
                    }, 48, 6)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-slate-600" /> Home Address
                </button>
                <button
                  onClick={() =>
                    handleAddElement("back", "TEXT", "Blood Type: {blood_type}", {
                      fontSize: "8px",
                      fontWeight: "bold",
                      color: "#dc2626",
                      textAlign: "center",
                    }, 24, 5)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-red-600" /> Blood Type
                </button>
                <button
                  onClick={() =>
                    handleAddElement("back", "TEXT", "{school_address}", {
                      fontSize: "7px",
                      color: "#64748b",
                      textAlign: "center",
                    }, 48, 5)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="h-3.5 w-3.5 text-slate-500" /> School Address
                </button>
                <button
                  onClick={() => handleAddElement("back", "SIGNATURE", "{principal_signature}", {}, 30, 10)}
                  className="flex items-center gap-1.5 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <PenTool className="h-3.5 w-3.5 text-indigo-600" /> Principal Sign
                </button>
              </div>
            </div>

            {/* Banners & Shapes */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Shapes & Lines
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handleAddElement(
                      selectedSide,
                      "SHAPE",
                      "",
                      { backgroundColor: "#1e3a8a", shapeType: "rectangle", borderRadius: "0px" },
                      54,
                      18
                    )
                  }
                  className="flex items-center gap-2 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Square className="h-4 w-4 text-blue-800 fill-blue-800" /> Header Bar
                </button>
                <button
                  onClick={() =>
                    handleAddElement(
                      selectedSide,
                      "SHAPE",
                      "",
                      { backgroundColor: "#cbd5e1", shapeType: "line", borderWidth: "2px" },
                      48,
                      2
                    )
                  }
                  className="flex items-center gap-2 p-2 rounded-xl border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
                >
                  <Square className="h-4 w-4 text-slate-400" /> Divider Line
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Specs Settings */}
          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm flex items-center text-foreground">
              <Settings className="mr-2 h-4 w-4 text-primary" /> Card Dimensions & Backgrounds
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Width (mm)</label>
                <input
                  type="number"
                  value={template.width_mm}
                  onChange={(e) => setTemplate({ ...template, width_mm: Number(e.target.value) })}
                  className="w-full bg-background border h-8 rounded-lg px-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Height (mm)</label>
                <input
                  type="number"
                  value={template.height_mm}
                  onChange={(e) => setTemplate({ ...template, height_mm: Number(e.target.value) })}
                  className="w-full bg-background border h-8 rounded-lg px-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Front Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={template.front_background_color || "#ffffff"}
                    onChange={(e) => setTemplate({ ...template, front_background_color: e.target.value })}
                    className="h-8 w-10 border rounded cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={template.front_background_color || "#ffffff"}
                    onChange={(e) => setTemplate({ ...template, front_background_color: e.target.value })}
                    className="flex-1 bg-background border h-8 rounded-lg px-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Back Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={template.back_background_color || "#ffffff"}
                    onChange={(e) => setTemplate({ ...template, back_background_color: e.target.value })}
                    className="h-8 w-10 border rounded cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={template.back_background_color || "#ffffff"}
                    onChange={(e) => setTemplate({ ...template, back_background_color: e.target.value })}
                    className="flex-1 bg-background border h-8 rounded-lg px-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Canvas Workspace */}
        <div className="lg:col-span-6 bg-slate-900/5 dark:bg-slate-950 border rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner">
          <div className="transition-transform duration-200">
            <IDCardPreview
              template={template}
              selectedElementId={selectedElementId}
              onSelectElement={(id) => setSelectedElementId(id)}
              showGrid={showGrid}
              gridSizeMm={gridSizeMm}
              interactive={true}
              side="both"
              onUpdateElement={handleUpdateElement}
            />
          </div>
        </div>

        {/* Right Inspector Sidebar (Element Properties) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4 h-full">
            <h3 className="font-semibold text-sm flex items-center justify-between text-foreground">
              <span className="flex items-center">
                <Settings className="mr-2 h-4 w-4 text-primary" /> Element Inspector
              </span>
              {selectedElement && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDuplicateSelected}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Duplicate Element"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-1 rounded hover:bg-muted text-destructive"
                    title="Delete Element"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </h3>

            {!selectedElement ? (
              <div className="text-center py-12 text-xs text-muted-foreground space-y-2 border border-dashed rounded-xl p-4">
                <LayoutTemplate className="h-8 w-8 mx-auto opacity-40" />
                <p>No element selected.</p>
                <p className="text-[11px]">Click an element on the canvas to inspect & change properties.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Element Type Badge */}
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-semibold text-primary uppercase text-[11px]">
                    Type: {selectedElement.type}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{selectedElement.id}</span>
                </div>

                {/* Content Input */}
                <div>
                  <label className="font-medium text-muted-foreground mb-1 block">Content / Label</label>
                  <textarea
                    rows={2}
                    value={selectedElement.content}
                    onChange={(e) => updateSelectedElement("content", e.target.value)}
                    className="w-full bg-background border rounded-lg p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-mono"
                  />
                </div>

                {/* Signature / Image Upload Button */}
                {(selectedElement.type === "IMAGE" || selectedElement.type === "SIGNATURE") && (
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-dashed text-center space-y-2">
                    <span className="text-[11px] font-semibold block text-foreground">
                      Upload Custom {selectedElement.type === "SIGNATURE" ? "Signature" : "Image"} File
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                  </div>
                )}

                {/* Position & Dimensions */}
                <div className="space-y-2">
                  <span className="font-semibold text-muted-foreground block">Position & Size (mm)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">X (Left)</label>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => updateSelectedElement("x", Number(e.target.value))}
                        className="w-full bg-background border h-7 rounded px-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Y (Top)</label>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => updateSelectedElement("y", Number(e.target.value))}
                        className="w-full bg-background border h-7 rounded px-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Width</label>
                      <input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => updateSelectedElement("width", Number(e.target.value))}
                        className="w-full bg-background border h-7 rounded px-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Height</label>
                      <input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => updateSelectedElement("height", Number(e.target.value))}
                        className="w-full bg-background border h-7 rounded px-2 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Styling */}
                {selectedElement.type === "TEXT" && (
                  <div className="space-y-2 border-t pt-3">
                    <span className="font-semibold text-muted-foreground block">Text Styles</span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Font Size</label>
                        <input
                          type="text"
                          value={selectedElement.style?.fontSize || "12px"}
                          onChange={(e) => updateSelectedStyle("fontSize", e.target.value)}
                          className="w-full bg-background border h-7 rounded px-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Weight</label>
                        <select
                          value={selectedElement.style?.fontWeight || "normal"}
                          onChange={(e) => updateSelectedStyle("fontWeight", e.target.value)}
                          className="w-full bg-background border h-7 rounded px-1"
                        >
                          <option value="normal">Normal</option>
                          <option value="600">Semi Bold</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Text Alignment</label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateSelectedStyle("textAlign", "left")}
                          className={`flex-1 p-1 rounded border flex justify-center ${
                            selectedElement.style?.textAlign === "left" ? "bg-primary text-white" : "bg-background"
                          }`}
                        >
                          <AlignLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSelectedStyle("textAlign", "center")}
                          className={`flex-1 p-1 rounded border flex justify-center ${
                            selectedElement.style?.textAlign === "center" ? "bg-primary text-white" : "bg-background"
                          }`}
                        >
                          <AlignCenter className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSelectedStyle("textAlign", "right")}
                          className={`flex-1 p-1 rounded border flex justify-center ${
                            selectedElement.style?.textAlign === "right" ? "bg-primary text-white" : "bg-background"
                          }`}
                        >
                          <AlignRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.style?.color || "#000000"}
                          onChange={(e) => updateSelectedStyle("color", e.target.value)}
                          className="h-7 w-8 border rounded cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={selectedElement.style?.color || "#000000"}
                          onChange={(e) => updateSelectedStyle("color", e.target.value)}
                          className="flex-1 bg-background border h-7 rounded px-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shape / Image Styling */}
                {(selectedElement.type === "SHAPE" || selectedElement.type === "IMAGE") && (
                  <div className="space-y-2 border-t pt-3">
                    <span className="font-semibold text-muted-foreground block">Appearance & Border</span>

                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Fill Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.style?.backgroundColor || "#1e3a8a"}
                          onChange={(e) => updateSelectedStyle("backgroundColor", e.target.value)}
                          className="h-7 w-8 border rounded cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={selectedElement.style?.backgroundColor || "#1e3a8a"}
                          onChange={(e) => updateSelectedStyle("backgroundColor", e.target.value)}
                          className="flex-1 bg-background border h-7 rounded px-2 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Border Radius</label>
                        <input
                          type="text"
                          value={selectedElement.style?.borderRadius || "0px"}
                          onChange={(e) => updateSelectedStyle("borderRadius", e.target.value)}
                          className="w-full bg-background border h-7 rounded px-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Border Width</label>
                        <input
                          type="text"
                          value={selectedElement.style?.borderWidth || "0px"}
                          onChange={(e) => updateSelectedStyle("borderWidth", e.target.value)}
                          className="w-full bg-background border h-7 rounded px-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
