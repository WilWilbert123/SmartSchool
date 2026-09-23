import { z } from "zod";

// Validates a single row from the CSV/XLSX for students
export const studentImportRowSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  student_number: z.string().min(1, "Student number is required"),
  admission_date: z.string().min(1, "Admission date is required"),
  middle_name: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', '']).optional().transform(v => v === '' ? undefined : v),
});

export type StudentImportRow = z.infer<typeof studentImportRowSchema>;
