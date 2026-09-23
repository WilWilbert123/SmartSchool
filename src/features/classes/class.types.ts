import { BaseEntity } from "@/types";

export interface AcademicYear extends BaseEntity {
  school_id: string;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  start_date: string;
  end_date: string;
}

export interface Class extends BaseEntity {
  school_id: string;
  academic_year_id: string;
  grade_level: string;
  section_name: string;
  adviser_id: string | null;
  room_number: string | null;
  academic_years?: AcademicYear;
  adviser?: any; // To be typed properly if needed
}
