export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type StudentStatus = 'ENROLLED' | 'ALUMNI' | 'TRANSFERRED' | 'DROPPED';

export interface Person {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  birth_date?: string | null;
  gender?: Gender | null;
  contact_number?: string | null;
  address?: string | null;
  profile_photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  person_id: string;
  school_id: string;
  user_id?: string | null;
  student_number: string;
  admission_date: string;
  current_status: StudentStatus;
  guardian_name?: string | null;
  guardian_contact?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Joined relation
  person?: Person;
}
