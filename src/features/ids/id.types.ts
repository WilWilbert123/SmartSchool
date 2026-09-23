export type IDStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'LOST';

export interface IDTemplate {
  id: string;
  school_id: string;
  name: string;
  width_mm: number;
  height_mm: number;
  background_url?: string;
  elements: IDElement[];
  is_active: boolean;
}

export type IDElementType = 'TEXT' | 'IMAGE' | 'QR_CODE' | 'BARCODE' | 'SHAPE';

export interface IDElement {
  id: string;
  type: IDElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // the data field mapping or static text
  style?: Record<string, any>;
  z_index: number;
}

export interface StudentID {
  id: string;
  student_id: string;
  template_id: string;
  status: IDStatus;
  issued_date: string;
  expiry_date: string;
  qr_data: string;
}
