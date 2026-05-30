/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DepartmentMapping {
  maPhong: string;
  tenPhong: string;
}

/**
 * Standardize and map rough department codes / names to official system departments
 */
export function normalizeDepartment(maPhongRaw: string, tenPhongRaw?: string): DepartmentMapping {
  const code = (maPhongRaw || '').trim().toUpperCase();
  const name = (tenPhongRaw || '').trim().toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  // 1. Check for Nông nghiệp và Xã hội alternatives (e.g. P_NN, P_NNXH, nông nghiệp, nông lâm thủy sản)
  if (
    code === 'P_NN' || 
    code === 'P_NNXH' || 
    code.includes('NON_NGHIEP') || 
    code === 'NN' || 
    name.includes('nong nghiep') || 
    name.includes('nong lam') || 
    name.includes('thuy san') || 
    name.includes('xa hoi')
  ) {
    return { maPhong: 'P_NNXH', tenPhong: 'Phòng Thống kê Nông nghiệp và Xã hội' };
  }

  // 2. Check for Công nghiệp alternatives (e.g. P_CN, công nghiệp, xây dựng)
  if (
    code === 'P_CN' || 
    code.includes('CONG_NGHIEP') || 
    code === 'CN' || 
    name.includes('cong nghiep') || 
    name.includes('xay dung')
  ) {
    return { maPhong: 'P_CN', tenPhong: 'Phòng Thống kê Công nghiệp' };
  }

  // 3. Check for Thương mại - Dịch vụ alternatives (e.g. P_DV, thương mại, dịch vụ, bán lẻ)
  if (
    code === 'P_DV' || 
    code.includes('DICH_VU') || 
    code === 'DV' || 
    name.includes('thuong mai') || 
    name.includes('dich vu') || 
    name.includes('ban le')
  ) {
    return { maPhong: 'P_DV', tenPhong: 'Phòng Thống kê Thương mại - Dịch vụ' };
  }

  // 4. Check for Tổ chức Hành chính (P_TCHC, hành chính, tổ chức)
  if (
    code === 'P_TCHC' || 
    code.includes('TO_CHUC') || 
    code.includes('HANH_CHINH') || 
    code === 'TCHC' || 
    name.includes('to chuc') || 
    name.includes('hanh chinh') || 
    name.includes('cai cach')
  ) {
    return { maPhong: 'P_TCHC', tenPhong: 'Phòng Tổ Chức Hành Chính' };
  }

  // 5. Check for Tổng hợp (P_TH, tổng hợp, phương pháp chế độ)
  if (
    code === 'P_TH' || 
    code.includes('TONG_HOP') || 
    code === 'TH' || 
    name.includes('tong hop') || 
    name.includes('phuong phap') || 
    name.includes('che do')
  ) {
    return { maPhong: 'P_TH', tenPhong: 'Phòng Thống kê Tổng hợp' };
  }

  // Fallback to standard check or mapping
  return { 
    maPhong: code || 'P_TH', 
    tenPhong: tenPhongRaw || 'Phòng Thống kê Tổng hợp' 
  };
}

/**
 * Automatically determine the correct department code and department name
 * based on keyword patterns in the report name.
 * 
 * @param reportName The name of the report/file
 * @returns Standard department code and display name mapping
 */
export function getDepartmentForReport(reportName: string): DepartmentMapping {
  const norm = (reportName || '').toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/đ/g, "d");

  // 1. Phòng Thống kê Nông nghiệp và Xã hội (P_NNXH)
  if (
    norm.includes('nong lam') ||
    norm.includes('nong nghiep') ||
    norm.includes('lam nghiep') ||
    norm.includes('thuy san') ||
    norm.includes('chan nuoi') ||
    norm.includes('trong trot') ||
    norm.includes('giao duc') ||
    norm.includes('y te') ||
    norm.includes('dan so') ||
    norm.includes('dan cu') ||
    norm.includes('muc song') ||
    norm.includes('xa hoi') ||
    norm.includes('03.h') ||
    norm.includes('04.h') ||
    norm.includes('phu nu') ||
    norm.includes('tre em') ||
    norm.includes('lao dong') ||
    norm.includes('viec lam') ||
    norm.includes('moi truong')
  ) {
    return { maPhong: 'P_NNXH', tenPhong: 'Phòng Thống kê Nông nghiệp và Xã hội' };
  }

  // 2. Phòng Thống kê Công nghiệp (P_CN)
  if (
    norm.includes('cong nghiep') ||
    norm.includes('iip') ||
    norm.includes('xay dung') ||
    norm.includes('dau tu') ||
    norm.includes('giao thong') ||
    norm.includes('van tai') ||
    norm.includes('nang luong') ||
    norm.includes('buu chinh') ||
    norm.includes('vien thong') ||
    norm.includes('co so ha tang') ||
    norm.includes('xuat khau cong nghiep')
  ) {
    return { maPhong: 'P_CN', tenPhong: 'Phòng Thống kê Công nghiệp' };
  }

  // 3. Phòng Thống kê Thương mại - Dịch vụ (P_DV)
  if (
    norm.includes('thuong mai') ||
    norm.includes('dich vu') ||
    norm.includes('ban le') ||
    norm.includes('doanh thu dich vu') ||
    norm.includes('cpi') ||
    norm.includes('gia ca') ||
    norm.includes('tieu dung') ||
    norm.includes('du lich') ||
    norm.includes('khach san') ||
    norm.includes('nha hang') ||
    norm.includes('xuat khau') ||
    norm.includes('nhap khau') ||
    norm.includes('thi truong') ||
    norm.includes('tai chinh') ||
    norm.includes('ngan hang') ||
    norm.includes('bao hiem')
  ) {
    return { maPhong: 'P_DV', tenPhong: 'Phòng Thống kê Thương mại - Dịch vụ' };
  }

  // 4. Phòng Tổ Chức Hành Chính (P_TCHC)
  if (
    norm.includes('cai cach') ||
    norm.includes('hanh chinh') ||
    norm.includes('to chuc') ||
    norm.includes('nhan su') ||
    norm.includes('ke khai') ||
    norm.includes('tai san') ||
    norm.includes('thu nhap') ||
    norm.includes('thi dua') ||
    norm.includes('khen thuong') ||
    norm.includes('dang ky') ||
    norm.includes('tai tai san') ||
    norm.includes('luong') ||
    norm.includes('phu cap') ||
    norm.includes('noi bo')
  ) {
    return { maPhong: 'P_TCHC', tenPhong: 'Phòng Tổ Chức Hành Chính' };
  }

  // 5. Default/Fallback: Phòng Thống kê Tổng hợp (P_TH)
  // Handles generic reports, "Tổng hợp", "Kinh tế", "Ước thu", "Ngân sách", "Niên giám", "Chuyên đề", etc.
  return { maPhong: 'P_TH', tenPhong: 'Phòng Thống kê Tổng hợp' };
}
