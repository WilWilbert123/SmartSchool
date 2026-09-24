-- Migration: Add right_logo_url to schools table

ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS right_logo_url TEXT;
