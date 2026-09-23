export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: "ALL" | "STUDENTS" | "TEACHERS" | "PARENTS";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  author_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  audience?: "ALL" | "STUDENTS" | "TEACHERS" | "PARENTS";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}
