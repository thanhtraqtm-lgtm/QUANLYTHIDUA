/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  username: string;
  role: 'admin' | 'tkcs' | 'room';
  unitCode?: string;
  deptCode?: string; // For department-level accounts (e.g., P_TH, P_CN)
  displayName: string;
  password?: string;
  permissions?: string[]; // e.g., 'grade_reports', 'view_reports', 'manage_accounts', 'upload_excel'
}

export interface Unit {
  Ma_DV: string;
  Ten_Don_Vi: string;
  Vung: string;
}

export interface ReportSubmission {
  ID: number;
  Ma_DV: string;
  Ten_Don_Vi: string;
  Vung: string;
  Ma_Phong: string;
  Ten_Phong: string;
  Ten_Bao_Cao: string;
  Loai_BC: string;
  Han_Nop: string; // "DD/MM/YYYY" or "YYYY-MM-DD"
  Ngay_Nop: string | null;  // User input "YYYY-MM-DD" or null
  Diem_Thoi_Gian: number | null; // Calculated or entered
  Diem_Chat_Luong: number | null; // Max is Diem_Dinh_Muc, graded by user
  Tong_Diem: number | null; // Diem_Thoi_Gian + Diem_Chat_Luong
  Diem_Dinh_Muc: number; // e.g. 15, 20, 30, 40, 50, 100, 200
  So_Ngay_Tre: number | null; // Calculated
  Nhan_Xet: string; // Reviewer note
  File_Dinh_Kem?: string | null; // Simulated attached file path/name
}

export interface Department {
  Ma_Phong: string;
  Ten_Phong: string;
}

export interface LeaderboardRow {
  Ma_DV: string;
  Ten_Don_Vi: string;
  Vung: string;
  Tong_Bao_Cao: number;
  Da_Nop: number;
  Nop_Dung_Han: number;
  Nop_Tre_Han: number;
  Chua_Nop: number;
  Tong_Diem_Dinh_Muc: number;
  Diem_Thoi_Gian_Tong: number;
  Diem_Chat_Luong_Tong: number;
  Diem_Thi_Dua: number; // Average score or Total Score
  So_Ngay_Tre_Tong: number;
  Rank: number;
}
