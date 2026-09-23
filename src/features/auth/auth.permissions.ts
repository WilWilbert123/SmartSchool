import { AppUser, UserRole } from "./auth.types";

export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: ["SUPERADMIN", "ADMIN"],
  MANAGE_SCHOOLS: ["SUPERADMIN"],
  MANAGE_ACADEMICS: ["SUPERADMIN", "ADMIN"],
  MANAGE_IDS: ["SUPERADMIN", "ADMIN"],
  VIEW_ALL_REPORTS: ["SUPERADMIN", "ADMIN"],

  // Teacher permissions
  MANAGE_CLASS_GRADES: ["SUPERADMIN", "ADMIN", "TEACHER"],
  MANAGE_CLASS_ATTENDANCE: ["SUPERADMIN", "ADMIN", "TEACHER"],
  VIEW_ASSIGNED_STUDENTS: ["SUPERADMIN", "ADMIN", "TEACHER"],

  // Student permissions
  VIEW_OWN_GRADES: ["STUDENT"],
  VIEW_OWN_ID: ["STUDENT"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(user: AppUser | null, permission: Permission): boolean {
  if (!user) return false;
  
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(user.role_name);
}

export function isTeacherOrAdmin(role: UserRole): boolean {
  return ["SUPERADMIN", "ADMIN", "TEACHER"].includes(role);
}
