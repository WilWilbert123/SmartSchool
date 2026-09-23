import { z } from "zod";

export const gradeEntrySchema = z.object({
  id: z.string().optional(),
  enrollment_id: z.string(),
  class_subject_id: z.string(),
  quarter_1: z.number().min(0).max(100).optional(),
  quarter_2: z.number().min(0).max(100).optional(),
  quarter_3: z.number().min(0).max(100).optional(),
  quarter_4: z.number().min(0).max(100).optional(),
  final_grade: z.number().min(0).max(100).optional(),
  remarks: z.string().max(255).optional(),
});

export type GradeEntryInput = z.infer<typeof gradeEntrySchema>;
