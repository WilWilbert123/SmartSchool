export interface Exam {
  id: string;
  title: string;
  subject_id: string | null;
  class_id: string | null;
  exam_date: string;
  start_time: string | null;
  end_time: string | null;
  total_marks: number;
  passing_marks: number;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  room_number: string | null;
  created_at: string;
  subjects?: {
    code: string;
    name: string;
  } | null;
  classes?: {
    grade_level: string;
    section_name: string;
  } | null;
}

export interface CreateExamInput {
  title: string;
  subject_id?: string;
  class_id?: string;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  total_marks?: number;
  passing_marks?: number;
  status?: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  room_number?: string;
}
