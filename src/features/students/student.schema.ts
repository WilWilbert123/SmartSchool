import { z } from "zod";

export const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  contact_number: z.string().optional(),
  address: z.string().optional(),
  
  student_number: z.string().min(1, "Student number is required"),
  admission_date: z.string().min(1, "Admission date is required"),
  current_status: z.enum(['ENROLLED', 'ALUMNI', 'TRANSFERRED', 'DROPPED']),
  guardian_name: z.string().optional(),
  guardian_contact: z.string().optional(),
});

export type StudentFormInput = z.infer<typeof studentSchema>;
