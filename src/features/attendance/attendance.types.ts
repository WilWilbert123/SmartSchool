import { BaseEntity } from "@/types";

export interface Attendance extends BaseEntity {
  enrollment_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks: string | null;
  recorded_by: string | null;
  enrollment?: {
    student?: {
      student_number: string;
      people?: {
        first_name: string;
        last_name: string;
      }
    },
    class?: {
      grade_level: string;
      section_name: string;
    }
  }
}
