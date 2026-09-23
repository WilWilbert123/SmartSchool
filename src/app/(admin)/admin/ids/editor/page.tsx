"use client";

import { useState } from "react";
import { ChevronLeft, Save, LayoutTemplate, Settings, Image as ImageIcon, Type, QrCode } from "lucide-react";
import Link from "next/link";
import { IDCardPreview } from "@/components/ids/id-card-preview";
import type { IDTemplate, IDElement } from "@/features/ids/id.types";

export default function IDEditorPage() {
  const [template, setTemplate] = useState<IDTemplate>({
    id: "new",
    school_id: "default",
    name: "Untitled Template",
    width_mm: 54,
    height_mm: 86,
    is_active: true,
    elements: [
      {
        id: "el-1",
        type: "TEXT",
        x: 5,
        y: 10,
        width: 44,
        height: 10,
        content: "SmartSchool Student",
        style: { fontWeight: 'bold', fontSize: '14px', textAlign: 'center', display: 'block' },
        z_index: 1
      },
      {
        id: "el-2",
        type: "IMAGE",
        x: 17,
        y: 25,
        width: 20,
        height: 20,
        content: "profile_photo",
        z_index: 1
      }
    ]
  });

  const handleAddElement = (type: IDElement['type']) => {
    const newElement: IDElement = {
      id: `el-${Date.now()}`,
      type,
      x: 10,
      y: 10,
      width: 20,
      height: 10,
      content: type === 'TEXT' ? "New Text" : "Placeholder",
      z_index: template.elements.length + 1
    };
    
    setTemplate({
      ...template,
      elements: [...template.elements, newElement]
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/ids" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to IDs
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Template Editor</h1>
            <input 
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({...template, name: e.target.value})}
              className="px-3 py-1 bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8 h-[700px]">
        {/* Toolbar */}
        <div className="lg:col-span-1 space-y-4 flex flex-col">
          <div className="bg-card border rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-sm flex items-center mb-4">
              <LayoutTemplate className="mr-2 h-4 w-4" /> Add Elements
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleAddElement('TEXT')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-input bg-background hover:bg-muted transition-colors">
                <Type className="h-5 w-5 mb-1 text-muted-foreground" />
                <span className="text-xs font-medium">Text</span>
              </button>
              <button onClick={() => handleAddElement('IMAGE')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-input bg-background hover:bg-muted transition-colors">
                <ImageIcon className="h-5 w-5 mb-1 text-muted-foreground" />
                <span className="text-xs font-medium">Image</span>
              </button>
              <button onClick={() => handleAddElement('QR_CODE')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-input bg-background hover:bg-muted transition-colors">
                <QrCode className="h-5 w-5 mb-1 text-muted-foreground" />
                <span className="text-xs font-medium">QR Code</span>
              </button>
            </div>
          </div>

          <div className="bg-card border rounded-2xl shadow-sm p-4 flex-1 overflow-y-auto">
            <h3 className="font-semibold text-sm flex items-center mb-4">
              <Settings className="mr-2 h-4 w-4" /> Properties
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Width (mm)</label>
                <input 
                  type="number" 
                  value={template.width_mm} 
                  onChange={(e) => setTemplate({...template, width_mm: Number(e.target.value)})}
                  className="w-full h-8 rounded border bg-background px-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Height (mm)</label>
                <input 
                  type="number" 
                  value={template.height_mm} 
                  onChange={(e) => setTemplate({...template, height_mm: Number(e.target.value)})}
                  className="w-full h-8 rounded border bg-background px-2 text-sm"
                />
              </div>
              
              <hr className="my-4" />
              
              <div className="text-xs text-muted-foreground">
                <p>Select an element on the canvas to edit its properties.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-3 bg-muted/30 border rounded-2xl flex items-center justify-center relative overflow-hidden p-8" style={{
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          <div className="bg-white shadow-2xl relative">
            <IDCardPreview template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}
