"use client";

import React from "react";
import type { IDTemplate, StudentID } from "@/features/ids/id.types";

interface IDCardPreviewProps {
  template: IDTemplate;
  studentData?: Record<string, string>; // Mapped data like { "student.first_name": "John" }
}

export function IDCardPreview({ template, studentData = {} }: IDCardPreviewProps) {
  // Convert mm to pixels (roughly 3.78 pixels per mm for 96 DPI)
  const pxPerMm = 3.78;
  const widthPx = template.width_mm * pxPerMm;
  const heightPx = template.height_mm * pxPerMm;

  return (
    <div 
      className="relative overflow-hidden bg-white shadow-xl mx-auto rounded-lg border border-border flex items-center justify-center text-muted-foreground"
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        backgroundImage: template.background_url ? `url(${template.background_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {template.elements.length === 0 && (
        <span className="text-sm">Blank Canvas</span>
      )}
      
      {template.elements.map((el) => {
        const value = studentData[el.content] || el.content;
        
        return (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: `${el.x * pxPerMm}px`,
              top: `${el.y * pxPerMm}px`,
              width: `${el.width * pxPerMm}px`,
              height: `${el.height * pxPerMm}px`,
              zIndex: el.z_index,
              ...el.style
            }}
          >
            {el.type === 'TEXT' && (
              <span style={el.style}>{value}</span>
            )}
            
            {el.type === 'IMAGE' && (
              <div className="w-full h-full bg-muted border flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
                {value.startsWith('http') || value.startsWith('data:') ? (
                  <img src={value} alt="ID Element" className="w-full h-full object-cover" />
                ) : (
                  "Image"
                )}
              </div>
            )}
            
            {el.type === 'QR_CODE' && (
              <div className="w-full h-full bg-black" style={{ maskImage: 'url(/qr-placeholder.svg)', WebkitMaskImage: 'url(/qr-placeholder.svg)' }}>
                {/* Real app would render an actual QR code component here */}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
