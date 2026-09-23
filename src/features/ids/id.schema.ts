import { z } from "zod";

export const idTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Template name is required"),
  width_mm: z.number().min(50).max(300),
  height_mm: z.number().min(50).max(300),
  background_url: z.string().optional(),
  elements: z.array(z.any()), // Can be tightened later
  is_active: z.boolean().default(true),
});

export type IDTemplateInput = z.infer<typeof idTemplateSchema>;
