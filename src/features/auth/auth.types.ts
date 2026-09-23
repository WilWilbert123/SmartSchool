export type UserRole = 
  | 'SUPERADMIN' 
  | 'ADMIN' 
  | 'TEACHER' 
  | 'NON_TEACHING' 
  | 'STUDENT';

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'ARCHIVED';

export interface AppUser {
  id: string; // References auth.users
  school_id: string;
  role_id: string;
  role_name: UserRole;
  email: string;
  first_name: string;
  last_name: string;
  status: UserStatus;
  created_at: string;
}

export interface SessionData {
  user: AppUser | null;
  error: string | null;
}
