"use client";

import React from "react";
import type { IDTemplate, IDElement } from "@/features/ids/id.types";

interface IDCardPreviewProps {
  template: IDTemplate;
  studentData?: Record<string, string>;
  selectedElementId?: string | null;
  onSelectElement?: (id: string) => void;
  showGrid?: boolean;
  gridSizeMm?: number;
  interactive?: boolean;
  onUpdateElementPosition?: (id: string, x: number, y: number) => void;
  onUpdateElement?: (id: string, updates: Partial<IDElement>) => void;
  side?: "front" | "back" | "both";
}

export function IDCardPreview({
  template,
  studentData = {},
  selectedElementId,
  onSelectElement,
  showGrid = false,
  gridSizeMm = 5,
  interactive = false,
  onUpdateElementPosition,
  onUpdateElement,
  side = "front",
}: IDCardPreviewProps) {
  // Convert mm to pixels (3.78 pixels per mm for 96 DPI screen display)
  const pxPerMm = 3.78;
  const widthPx = template.width_mm * pxPerMm;
  const heightPx = template.height_mm * pxPerMm;

  // Derive elements and background per side
  const frontElements = template.front_elements || template.elements || [];
  const backElements = template.back_elements || [];
  const frontBgColor = template.front_background_color || template.background_color || "#ffffff";
  const backBgColor = template.back_background_color || "#f8fafc";
  const frontBgUrl = template.front_background_url || template.background_url || null;
  const backBgUrl = template.back_background_url || null;

  // Placeholder mappings for sample preview rendering
  const defaultSampleData: Record<string, string> = {
    "{student_name}": "Wilbert Gamis",
    "{student_number}": "2026-0001",
    "{lrn}": "123456789012",
    "{grade_level}": "Grade 10",
    "{section_name}": "Section A - Emerald",
    "{school_year}": "S.Y. 2025 - 2026",
    "{validity_date}": "Valid until June 2026",
    "{school_name}": "SmartSchool Academy",
    "{guardian_name}": "Maria Gamis",
    "{guardian_relationship}": "Mother",
    "{guardian_contact}": "+63 917 123 4567",
    "{home_address}": "123 Mabini St., Brgy. San Jose, Quezon City",
    "{blood_type}": "O+",
    "{school_address}": "SmartSchool Campus, Katipunan Ave, Quezon City",
    "{student_signature}": "signature_placeholder",
    "{principal_signature}": "principal_signature_placeholder",
    ...studentData,
  };

  // Mouse Drag Handler for moving elements
  const handleDragStart = (e: React.MouseEvent, el: IDElement) => {
    if (!interactive) return;
    e.stopPropagation();
    if (onSelectElement) onSelectElement(el.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = el.x;
    const initialY = el.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX_mm = (moveEvent.clientX - startX) / pxPerMm;
      const deltaY_mm = (moveEvent.clientY - startY) / pxPerMm;

      let newX = Math.round((initialX + deltaX_mm) * 10) / 10;
      let newY = Math.round((initialY + deltaY_mm) * 10) / 10;

      // Bound to card canvas
      newX = Math.max(0, Math.min(template.width_mm - el.width, newX));
      newY = Math.max(0, Math.min(template.height_mm - el.height, newY));

      if (onUpdateElement) {
        onUpdateElement(el.id, { x: newX, y: newY });
      } else if (onUpdateElementPosition) {
        onUpdateElementPosition(el.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Mouse Resize Handler for resizing elements from corner/edge handles
  const handleResizeStart = (e: React.MouseEvent, el: IDElement, handle: string) => {
    if (!interactive || !onUpdateElement) return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = el.x;
    const initialY = el.y;
    const initialW = el.width;
    const initialH = el.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX_mm = (moveEvent.clientX - startX) / pxPerMm;
      const deltaY_mm = (moveEvent.clientY - startY) / pxPerMm;

      let newX = initialX;
      let newY = initialY;
      let newW = initialW;
      let newH = initialH;

      if (handle.includes("e")) {
        newW = Math.max(4, initialW + deltaX_mm);
      }
      if (handle.includes("s")) {
        newH = Math.max(3, initialH + deltaY_mm);
      }
      if (handle.includes("w")) {
        const possibleW = initialW - deltaX_mm;
        if (possibleW >= 4) {
          newW = possibleW;
          newX = initialX + deltaX_mm;
        }
      }
      if (handle.includes("n")) {
        const possibleH = initialH - deltaY_mm;
        if (possibleH >= 3) {
          newH = possibleH;
          newY = initialY + deltaY_mm;
        }
      }

      onUpdateElement(el.id, {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
        width: Math.round(newW * 10) / 10,
        height: Math.round(newH * 10) / 10,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Mouse Rotation Handler
  const handleRotateStart = (e: React.MouseEvent, el: IDElement, cardRect: DOMRect) => {
    if (!interactive || !onUpdateElement) return;
    e.stopPropagation();

    const centerX = cardRect.left + (el.x + el.width / 2) * pxPerMm;
    const centerY = cardRect.top + (el.y + el.height / 2) * pxPerMm;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let deg = Math.round(rad * (180 / Math.PI)) + 90;
      if (deg < 0) deg += 360;

      onUpdateElement(el.id, {
        style: {
          ...el.style,
          rotation: deg % 360,
        },
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const renderElementContent = (el: IDElement) => {
    let contentStr = el.content || "";
    // Substitute placeholders
    Object.entries(defaultSampleData).forEach(([key, val]) => {
      contentStr = contentStr.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), val);
    });

    const style = el.style || {};

    switch (el.type) {
      case "TEXT":
        return (
          <div
            className="w-full h-full flex items-center overflow-hidden pointer-events-none select-none"
            style={{
              justifyContent:
                style.textAlign === "center"
                  ? "center"
                  : style.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
              color: style.color || "#000000",
              fontSize: style.fontSize || "12px",
              fontFamily: style.fontFamily || "inherit",
              fontWeight: style.fontWeight || "normal",
              fontStyle: style.fontStyle || "normal",
              textDecoration: style.textDecoration || "none",
            }}
          >
            <span className="truncate w-full">{contentStr || "Text"}</span>
          </div>
        );

      case "IMAGE":
        return (
          <div
            className="w-full h-full border flex items-center justify-center overflow-hidden pointer-events-none select-none"
            style={{
              borderRadius: style.borderRadius || "4px",
              borderColor: style.borderColor || "#cbd5e1",
              borderWidth: style.borderWidth || "1px",
              backgroundColor: style.backgroundColor || "#f8fafc",
            }}
          >
            {contentStr && (contentStr.startsWith("http") || contentStr.startsWith("data:")) ? (
              <img src={contentStr} alt="ID Element" className="w-full h-full object-cover" />
            ) : contentStr === "profile_photo" ? (
              <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-500 text-[10px] font-semibold">
                <span>[ PHOTO ]</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">Image</span>
            )}
          </div>
        );

      case "SIGNATURE":
        return (
          <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none">
            {contentStr && (contentStr.startsWith("http") || contentStr.startsWith("data:")) ? (
              <img src={contentStr} alt="Signature" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full border border-dashed border-indigo-400 bg-indigo-50/50 flex items-center justify-center text-[9px] text-indigo-600 font-serif italic">
                Signature Line
              </div>
            )}
          </div>
        );

      case "SHAPE":
        const shapeType = style.shapeType || "rectangle";
        if (shapeType === "circle") {
          return (
            <div
              className="w-full h-full pointer-events-none select-none"
              style={{
                borderRadius: "50%",
                backgroundColor: style.backgroundColor || "#3b82f6",
                borderColor: style.borderColor || "transparent",
                borderWidth: style.borderWidth || "0px",
                borderStyle: "solid",
              }}
            />
          );
        }
        if (shapeType === "line") {
          return (
            <div
              className="w-full h-full pointer-events-none select-none flex items-center"
              style={{
                backgroundColor: style.backgroundColor || "#000000",
                height: style.borderWidth || "2px",
              }}
            />
          );
        }
        return (
          <div
            className="w-full h-full pointer-events-none select-none"
            style={{
              borderRadius: style.borderRadius || "0px",
              backgroundColor: style.backgroundColor || "#1e293b",
              borderColor: style.borderColor || "transparent",
              borderWidth: style.borderWidth || "0px",
              borderStyle: "solid",
            }}
          />
        );

      case "QR_CODE":
        return (
          <div className="w-full h-full bg-white border border-slate-300 p-1 flex items-center justify-center pointer-events-none select-none rounded shadow-sm">
            <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900 fill-current">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm11-2h7v8h-7V2zm2 2v4h3V4h-3zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 3h3v3h-3v-3zm0-5h5v2h-5v-2zm-4-4h2v5h-2V9zm2 7h2v5h-2v-5zm-4 2h2v3h-2v-3zm0-8h2v2h-2V11z" />
            </svg>
          </div>
        );

      case "BARCODE":
        return (
          <div className="w-full h-full bg-white border border-slate-300 p-1 flex flex-col items-center justify-center pointer-events-none select-none rounded">
            <div className="w-full flex-1 bg-gradient-to-r from-black via-white to-black opacity-80" />
            <span className="text-[7px] font-mono text-slate-700 mt-0.5">2026-0001</span>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSingleCard = (elements: IDElement[], bgColor: string, bgUrl: string | null, cardSideName: "front" | "back") => {
    return (
      <div
        id={`card-canvas-${cardSideName}`}
        className="relative overflow-hidden bg-white shadow-xl border border-border select-none rounded-lg"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          backgroundColor: bgColor,
          backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Guidelines Grid */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)`,
              backgroundSize: `${gridSizeMm * pxPerMm}px ${gridSizeMm * pxPerMm}px`,
            }}
          />
        )}

        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground font-medium border-2 border-dashed border-slate-200">
            Empty {cardSideName === "front" ? "Front" : "Back"} Side - Add elements
          </div>
        )}

        {elements.map((el) => {
          const isSelected = selectedElementId === el.id;

          return (
            <div
              key={el.id}
              onClick={(e) => {
                if (interactive && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement(el.id);
                }
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleDragStart(e, el);
              }}
              className={`absolute group ${
                interactive ? "cursor-move hover:ring-2 hover:ring-primary/50" : ""
              } ${isSelected ? "ring-2 ring-primary ring-offset-1 z-50" : ""}`}
              style={{
                left: `${el.x * pxPerMm}px`,
                top: `${el.y * pxPerMm}px`,
                width: `${el.width * pxPerMm}px`,
                height: `${el.height * pxPerMm}px`,
                zIndex: isSelected ? 999 : el.z_index,
                opacity: el.style?.opacity ?? 1,
                transform: el.style?.rotation ? `rotate(${el.style.rotation}deg)` : "none",
              }}
            >
              {renderElementContent(el)}

              {/* Selection Handles for Mouse Resizing & Rotation */}
              {interactive && isSelected && (
                <div className="absolute inset-0 pointer-events-none border-2 border-primary rounded-sm">
                  {/* Rotation Handle Top Center */}
                  <div
                    onMouseDown={(e) => {
                      const canvasEl = document.getElementById(`card-canvas-${cardSideName}`);
                      if (canvasEl) {
                        handleRotateStart(e, el, canvasEl.getBoundingClientRect());
                      }
                    }}
                    className="pointer-events-auto absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary text-white rounded-full border border-white flex items-center justify-center cursor-grab hover:scale-110 transition-transform shadow-md"
                    title="Drag to Rotate"
                  >
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-primary" />

                  {/* Corner Handles */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, el, "nw")}
                    className="pointer-events-auto absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full border border-white cursor-nwse-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, el, "ne")}
                    className="pointer-events-auto absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full border border-white cursor-nesw-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, el, "sw")}
                    className="pointer-events-auto absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full border border-white cursor-nesw-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, el, "se")}
                    className="pointer-events-auto absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full border border-white cursor-nwse-resize hover:scale-125 transition-transform"
                  />

                  {/* Edge Handles */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, el, "e")}
                    className="pointer-events-auto absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border border-white cursor-ew-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, el, "s")}
                    className="pointer-events-auto absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full border border-white cursor-ns-resize hover:scale-125 transition-transform"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (side === "both") {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Front Side</span>
          {renderSingleCard(frontElements, frontBgColor, frontBgUrl, "front")}
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Back Side</span>
          {renderSingleCard(backElements, backBgColor, backBgUrl, "back")}
        </div>
      </div>
    );
  }

  const currentElements = side === "back" ? backElements : frontElements;
  const currentBgColor = side === "back" ? backBgColor : frontBgColor;
  const currentBgUrl = side === "back" ? backBgUrl : frontBgUrl;

  return renderSingleCard(currentElements, currentBgColor, currentBgUrl, side);
}
