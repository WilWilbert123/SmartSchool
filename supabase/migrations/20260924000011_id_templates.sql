-- Migration: ID Templates Table
CREATE TABLE IF NOT EXISTS public.id_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  width_mm NUMERIC NOT NULL DEFAULT 54,
  height_mm NUMERIC NOT NULL DEFAULT 86,
  orientation TEXT NOT NULL DEFAULT 'portrait',
  background_color TEXT DEFAULT '#ffffff',
  background_url TEXT,
  front_background_color TEXT DEFAULT '#ffffff',
  back_background_color TEXT DEFAULT '#f8fafc',
  front_background_url TEXT,
  back_background_url TEXT,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  front_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  back_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.id_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to id_templates"
  ON public.id_templates FOR SELECT USING (true);

CREATE POLICY "Allow full access to id_templates for all"
  ON public.id_templates FOR ALL USING (true);

-- Insert Default Template
INSERT INTO public.id_templates (id, name, width_mm, height_mm, orientation, background_color, elements, is_active)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Standard Official Student ID 2026',
  54,
  86,
  'portrait',
  '#ffffff',
  '[
    {
      "id": "header-banner",
      "type": "SHAPE",
      "x": 0,
      "y": 0,
      "width": 54,
      "height": 18,
      "content": "",
      "style": {
        "backgroundColor": "#1e3a8a",
        "shapeType": "rectangle",
        "borderRadius": "0px"
      },
      "z_index": 1
    },
    {
      "id": "school-name",
      "type": "TEXT",
      "x": 2,
      "y": 3,
      "width": 50,
      "height": 6,
      "content": "SMARTSCHOOL ACADEMY",
      "style": {
        "color": "#ffffff",
        "fontSize": "11px",
        "fontWeight": "bold",
        "textAlign": "center"
      },
      "z_index": 2
    },
    {
      "id": "id-subtitle",
      "type": "TEXT",
      "x": 2,
      "y": 10,
      "width": 50,
      "height": 5,
      "content": "OFFICIAL STUDENT IDENTIFICATION CARD",
      "style": {
        "color": "#93c5fd",
        "fontSize": "7px",
        "fontWeight": "bold",
        "textAlign": "center"
      },
      "z_index": 2
    },
    {
      "id": "student-photo",
      "type": "IMAGE",
      "x": 14,
      "y": 21,
      "width": 26,
      "height": 28,
      "content": "profile_photo",
      "style": {
        "borderRadius": "8px",
        "borderColor": "#1e3a8a",
        "borderWidth": "2px"
      },
      "z_index": 3
    },
    {
      "id": "student-name",
      "type": "TEXT",
      "x": 2,
      "y": 51,
      "width": 50,
      "height": 6,
      "content": "{student_name}",
      "style": {
        "color": "#0f172a",
        "fontSize": "13px",
        "fontWeight": "bold",
        "textAlign": "center"
      },
      "z_index": 4
    },
    {
      "id": "student-lrn",
      "type": "TEXT",
      "x": 2,
      "y": 57,
      "width": 50,
      "height": 5,
      "content": "ID: {student_number}",
      "style": {
        "color": "#2563eb",
        "fontSize": "10px",
        "fontWeight": "600",
        "textAlign": "center"
      },
      "z_index": 4
    },
    {
      "id": "grade-section",
      "type": "TEXT",
      "x": 2,
      "y": 62,
      "width": 50,
      "height": 5,
      "content": "Grade: {grade_level} - {section_name}",
      "style": {
        "color": "#475569",
        "fontSize": "9px",
        "fontWeight": "normal",
        "textAlign": "center"
      },
      "z_index": 4
    },
    {
      "id": "qr-code",
      "type": "QR_CODE",
      "x": 20,
      "y": 68,
      "width": 14,
      "height": 14,
      "content": "{verification_url}",
      "style": {},
      "z_index": 4
    }
  ]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;
