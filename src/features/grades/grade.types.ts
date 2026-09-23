export type AcademicStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
export type GradeLevel = 'KINDERGARTEN' | 'GRADE_1' | 'GRADE_2' | 'GRADE_3' | 'GRADE_4' | 'GRADE_5' | 'GRADE_6' | 'GRADE_7' | 'GRADE_8' | 'GRADE_9' | 'GRADE_10' | 'GRADE_11' | 'GRADE_12';

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  status: AcademicStatus;
  start_date: string;
  end_date: string;
}

export interface Subject {
  id: string;
  school_id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
}

export interface Class {
  id: string;
  school_id: string;
  academic_year_id: string;
  grade_level: GradeLevel;
  section_name: string;
  adviser_id?: string;
  room_number?: string;
  academic_year?: AcademicYear;
}

export interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id?: string;
  subject?: Subject;
}

export interface Grade {
  id: string;
  enrollment_id: string;
  class_subject_id: string;
  quarter_1?: number;
  quarter_2?: number;
  quarter_3?: number;
  quarter_4?: number;
  final_grade?: number;
  remarks?: string;
}

export interface StudentGradeRecord {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  grades: {
    [subject_id: string]: Grade;
  };
}
