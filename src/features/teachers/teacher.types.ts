import { BaseEntity } from "@/types";

export interface Person extends BaseEntity {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  birth_date: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
  contact_number: string | null;
  address: string | null;
  profile_photo_url: string | null;
}

export interface Employee extends BaseEntity {
  person_id: string;
  school_id: string;
  user_id: string | null;
  employee_number: string;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'SUBSTITUTE';
  status: string;
  people?: Person;
}

export interface Teacher extends BaseEntity {
  employee_id: string;
  specialization: string | null;
  employees?: Employee;
}
