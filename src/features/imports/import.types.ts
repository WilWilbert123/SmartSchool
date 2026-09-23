export type ImportStatus = 'PENDING' | 'VALIDATING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ImportJob {
  id: string;
  type: 'STUDENTS' | 'TEACHERS' | 'GRADES';
  filename: string;
  status: ImportStatus;
  total_rows: number;
  processed_rows: number;
  error_count: number;
  success_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ImportRowError {
  row: number;
  column: string;
  message: string;
}

export interface StudentImportRow {
  first_name: string;
  last_name: string;
  student_number: string;
  admission_date: string;
  middle_name?: string;
  gender?: string;
}
