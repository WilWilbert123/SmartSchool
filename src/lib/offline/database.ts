import Dexie, { type Table } from 'dexie';
import type { StudentGradeRecord } from '@/features/grades/grade.types';

// Defines the offline database schema for the PWA
export class SmartSchoolDB extends Dexie {
  students!: Table<any, string>;
  grades!: Table<StudentGradeRecord, string>;
  sync_queue!: Table<SyncOperation, number>;

  constructor() {
    super('SmartSchoolDB');
    this.version(1).stores({
      students: 'id, student_number, person.last_name',
      grades: 'enrollment_id, student_id',
      sync_queue: '++id, operation, entity, entity_id, status, created_at'
    });
  }
}

export interface SyncOperation {
  id?: number;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  entity: 'STUDENTS' | 'GRADES';
  entity_id: string;
  payload: any;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  error_message?: string;
  created_at: string;
}

export const db = new SmartSchoolDB();
