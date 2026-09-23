import { BaseEntity } from "@/types";

export interface Subject extends BaseEntity {
  school_id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number;
}
