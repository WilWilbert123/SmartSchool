export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_REDIRECTS: Record<Role, string> = {
  SUPERADMIN: "/superadmin",
  ADMIN: "/admin",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};
