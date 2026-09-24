export type IDStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'LOST';

export interface IDTemplate {
  id: string;
  school_id?: string;
  name: string;
  width_mm: number;
  height_mm: number;
  orientation?: 'portrait' | 'landscape';
  background_color?: string;
  background_url?: string;
  front_background_color?: string;
  back_background_color?: string;
  front_background_url?: string;
  back_background_url?: string;
  elements: IDElement[]; // Front elements fallback
  front_elements?: IDElement[];
  back_elements?: IDElement[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type IDElementType = 'TEXT' | 'IMAGE' | 'QR_CODE' | 'BARCODE' | 'SHAPE' | 'SIGNATURE';

export interface IDElementStyle {
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  opacity?: number;
  rotation?: number;
  shapeType?: 'rectangle' | 'circle' | 'line' | 'header_banner';
  strokeWidth?: string;
  [key: string]: any;
}

export interface IDElement {
  id: string;
  type: IDElementType;
  x: number; // in mm
  y: number; // in mm
  width: number; // in mm
  height: number; // in mm
  content: string; // text string, field placeholder like {student_name}, or image URL / signature data URL
  style?: IDElementStyle;
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

export interface IDVerificationResult {
  found: boolean;
  isValid: boolean;
  idNumber: string;
  holderName: string;
  role: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN';
  schoolName: string;
  status: 'ACTIVE' | 'ENROLLED' | 'GRADUATED' | 'INACTIVE' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND';
  photoUrl?: string | null;
  issuedDate?: string;
  expiryDate?: string;
  gradeOrDept?: string;
  guardianName?: string;
  guardianContact?: string;
  verifiedAt: string;
  verificationHash: string;
  message?: string;
}

