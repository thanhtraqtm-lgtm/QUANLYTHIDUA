/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ReportSubmission } from '../types';
import { UploadCloud, CheckCircle2, FileSpreadsheet, AlertTriangle, ArrowRight } from 'lucide-react';
import { getDepartmentForReport, normalizeDepartment } from '../utils/departmentHelper';

interface ExcelImporterProps {
  onImportComplete: (importedData: ReportSubmission[]) => void;
  existingCount: number;
}

export default function ExcelImporter({ onImportComplete, existingCount }: ExcelImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'idle' | 'success' | 'error'; label: string }>({ type: 'idle', label: '' });
  const [logCounts, setLogCounts] = useState<{ total: number; matched: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedValue, setPastedValue] = useState('');

  const handleFileParse = (file: File) => {
    const reader = new FileReader();
    setStatusMsg({ type: 'idle', label: 'Đang tải và xử lý file...' });

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) throw new Error('Không thể đọc kết quả tệp dữ liệu dưới dạng ArrayBuffer.');

        const dataBytes = new Uint8Array(arrayBuffer as ArrayBuffer);
        const workbook = XLSX.read(dataBytes, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw JSON rows
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          throw new Error('Tệp tải lên rỗng hoặc không có dữ liệu dòng nào.');
        }

        const detectedKeys = Object.keys(rawRows[0] || {});

        // Helper to normalize any string for robust cross-language header matching
        const cleanAndNormalize = (str: string): string => {
          return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9]/g, "");    // Keep only alphanumeric characters
        };

        const normalizedKeysMap = new Map<string, string>();
        detectedKeys.forEach(originalKey => {
          normalizedKeysMap.set(cleanAndNormalize(originalKey), originalKey);
        });

        // Validate and convert schema to matching ReportSubmission objects
        const mappedSubmissions: ReportSubmission[] = [];

        rawRows.forEach((row, rIdx) => {
          // Dynamic matched keys
          const getVal = (possibleKeys: string[]): any => {
            // 1. Try normalized matching
            for (const key of possibleKeys) {
              const cleanTarget = cleanAndNormalize(key);
              for (const [cleanDetected, originalKey] of normalizedKeysMap.entries()) {
                if (cleanDetected === cleanTarget || cleanDetected.includes(cleanTarget) || cleanTarget.includes(cleanDetected)) {
                  return row[originalKey];
                }
              }
            }
            // 2. Direct simple lower-case fallback comparison
            const rowKeys = Object.keys(row);
            for (const key of possibleKeys) {
              const matchedKey = rowKeys.find(rk => 
                rk.toLowerCase().trim() === key.toLowerCase().trim()
              );
              if (matchedKey) return row[matchedKey];
            }
            return '';
          };

          // Columns in User CSV: ID,Ma_DV,Ten_Don_Vi,Ma_Phong,Ten_Phong,Ten_Bao_Cao,Loai_BC,Han_Nop,Ngay_Nop,Diem_Thoi_Gian,Diem_Chat_Luong,Tong_Diem,Diem_Dinh_Muc,So_Ngay_Tre
          const id = parseInt(getVal(['ID', 'Stt', 'MaBC']), 10) || (rIdx + 1);
          
          let maDv = String(getVal(['Ma_DV', 'MaDV', 'MaDonVi', 'Mã_DV', 'DonVi', 'Ma_Don_Vi', 'Ma_DV_Co_So'])).trim();
          let tenBaoCao = String(getVal(['Ten_Bao_Cao', 'TenBaoCao', 'Tên_Báo_Cáo', 'Tên_Bao_Cao_Giao_Diem', 'Bao_Cao', 'TenBC', 'Chi_Tieu', 'NoiDungBaoCao'])).trim();

          // Fallbacks for critical missing keys: try to guess by index columns if still empty
          const rowValues = Object.values(row);
          if (!maDv && rowValues.length > 1) {
            // Assume 2nd column might be Ma_DV if it is short code like TKxx
            const hypotheticalMaDv = String(rowValues[1]).trim();
            if (hypotheticalMaDv.length >= 4 && hypotheticalMaDv.length <= 8 && hypotheticalMaDv.startsWith('TK')) {
              maDv = hypotheticalMaDv;
            }
          }
          if (!tenBaoCao && rowValues.length > 5) {
            // Guess a column that looks like long report name
            const longStringCol = rowValues.find(v => String(v).length > 15);
            if (longStringCol) {
              tenBaoCao = String(longStringCol);
            }
          }

          const tenDonVi = String(getVal(['Ten_Don_Vi', 'TenDonVi', 'Tên_Đơn_Vị', 'Ten_Don_Vi_Xep_Hang', 'Don_Vi', 'Tên_Đơn_Vị_Cơ_Sở', 'Ten_Co_So'])).trim();
          
          let maPhongRaw = String(getVal([
            'Ma_Phong', 'MaPhong', 'Mã_Phòng', 'Mã phòng', 'Ma_Phong_Ban', 
            'Phong', 'Phòng', 'Mã_Phòng_Nghiệp_Vụ', 'Ma_Phong_Nghiep_Vu', 
            'MaPhongNghiepVu', 'Mã phòng NV', 'Don_Vi_Nhan', 'Đơn vị nhận'
          ])).trim();
          
          let tenPhongRaw = String(getVal([
            'Ten_Phong', 'TenPhong', 'Tên_Phòng', 'Tên phòng', 'Ten_Phong_Ban', 
            'Phong_Ban', 'Phòng Ban', 'Phòng ban', 'Tên phòng ban', 'Phòng nhận', 
            'Phong_Nhan', 'Bo_Phan', 'Bộ phận', 'Phu_Trach', 'Phụ trách'
          ])).trim();

          // Check if both are empty - dynamic guessing
          if (!maPhongRaw && !tenPhongRaw) {
            const guessed = getDepartmentForReport(tenBaoCao);
            maPhongRaw = guessed.maPhong;
            tenPhongRaw = guessed.tenPhong;
          }

          // Leverage the intelligent normalization mapping
          const normResult = normalizeDepartment(maPhongRaw, tenPhongRaw || undefined);
          let maPhong = normResult.maPhong;
          let tenPhong = normResult.tenPhong;

          // Double check if standard result falls back to general but report name has a more specific department keyword
          if (maPhong === 'P_TH') {
            const guessed = getDepartmentForReport(tenBaoCao);
            if (guessed.maPhong !== 'P_TH') {
              maPhong = guessed.maPhong;
              tenPhong = guessed.tenPhong;
            }
          }

          const loaiBc = String(getVal(['Loai_BC', 'LoaiBC', 'Loài_BC', 'Ky_Khai_Bao', 'Ky_Ha_Nop', 'Loai_Bao_Cao'])).trim() || 'Tháng';
          
          let hanNopRaw = getVal(['Han_Nop', 'HanNop', 'Hạn_Nộp', 'Ngay_Het_Han', 'Han_Ngon']);
          let ngayNopRaw = getVal(['Ngay_Nop', 'NgayNop', 'Ngày_Nộp', 'Ngay_Thuc_Te']);

          // Parse and Standardize Date format to YYYY-MM-DD
          const standardizeDateStr = (dateVal: any): string | null => {
            if (!dateVal) return null;
            if (dateVal instanceof Date) {
              return dateVal.toISOString().split('T')[0];
            }
            // If string in DD/MM/YYYY format
            const dateStrStr = String(dateVal).trim();
            if (dateStrStr.includes('/')) {
              const parts = dateStrStr.split('/');
              if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                // Check if year is first
                if (parts[2].length === 4) {
                  return `${year}-${month}-${day}`;
                } else if (parts[0].length === 4) {
                  return `${parts[0]}-${month}-${parts[1].padStart(2, '0')}`;
                }
              }
            }
            return dateStrStr;
          };

          const hanNop = standardizeDateStr(hanNopRaw) || '2026-06-15';
          const ngayNop = standardizeDateStr(ngayNopRaw);

          const diemDinhMuc = parseFloat(String(getVal(['Diem_Dinh_Muc', 'DiemDinhMuc', 'Điểm_Định_Mức', 'Diem_Chuan', 'Dinh_Muc'])).replace(',', '.')) || 30.0;
          const diemThoiGian = getVal(['Diem_Thoi_Gian', 'DiemThoiGian']) !== '' 
            ? parseFloat(String(getVal(['Diem_Thoi_Gian', 'DiemThoiGian'])).replace(',', '.')) 
            : null;
          const diemChatLuong = getVal(['Diem_Chat_Luong', 'DiemChatLuong']) !== '' 
            ? parseFloat(String(getVal(['Diem_Chat_Luong', 'DiemChatLuong'])).replace(',', '.')) 
            : null;
          const tongDiem = getVal(['Tong_Diem', 'TongDiem']) !== '' 
            ? parseFloat(String(getVal(['Tong_Diem', 'TongDiem'])).replace(',', '.')) 
            : null;

          const soNgayTre = getVal(['So_Ngay_Tre', 'SoNgayTre', 'Tre_Han_Ngay']) !== '' 
            ? parseInt(String(getVal(['So_Ngay_Tre', 'SoNgayTre'])), 10) 
            : null;
          
          const nhanXet = String(getVal(['Nhan_Xet', 'NhanXet', 'Ghi_Chu_Kiem_Chuan', 'Nghi_An_Tre', 'Nhận_Xét', 'Audit_Mark_Note'])).trim() || 'Thành công nạp từ bảng Excel bản cứng.';

          // Assign region based on Ma_DV
          let vung = 'Khu vực 2'; 
          const hHungYen = ['TKPH', 'TKNQ', 'TKYM', 'TKMH', 'TKKC', 'TKLB', 'TKHHT'];
          if (hHungYen.includes(maDv)) {
            vung = 'Khu vực 1';
          }

          if (maDv && tenBaoCao) {
            mappedSubmissions.push({
              ID: id,
              Ma_DV: maDv,
              Ten_Don_Vi: tenDonVi || `Thống kê Cơ Sở ${maDv}`,
              Vung: vung,
              Ma_Phong: maPhong,
              Ten_Phong: tenPhong,
              Ten_Bao_Cao: tenBaoCao,
              Loai_BC: loaiBc,
              Han_Nop: hanNop,
              Ngay_Nop: ngayNop,
              Diem_Thoi_Gian: diemThoiGian,
              Diem_Chat_Luong: diemChatLuong,
              Tong_Diem: tongDiem !== null ? tongDiem : (diemThoiGian !== null && diemChatLuong !== null ? (diemThoiGian + diemChatLuong) : null),
              Diem_Dinh_Muc: diemDinhMuc,
              So_Ngay_Tre: soNgayTre,
              Nhan_Xet: nhanXet
            });
          }
        });

        if (mappedSubmissions.length === 0) {
          throw new Error(
            `Không ghép được dòng dữ liệu nào! Các trường phát hiện trong tệp: [${detectedKeys.join(', ')}]. Bạn cần đảm bảo có các đầu cột tương đương "Ma_DV" (mã đơn vị) và "Ten_Bao_Cao" (tên báo cáo).`
          );
        }

        onImportComplete(mappedSubmissions);
        setLogCounts({ total: rawRows.length, matched: mappedSubmissions.length });
        setStatusMsg({ type: 'success', label: `Nạp thành công ${mappedSubmissions.length} dòng dữ liệu thi đua thiết bị sạch sẽ!` });
      } catch (err: any) {
        setStatusMsg({ type: 'error', label: err.message || 'Lỗi định dạng tệp Excel/CSV không được hỗ trợ.' });
      }
    };

    reader.onerror = () => {
      setStatusMsg({ type: 'error', label: 'Lỗi tải đọc tệp dữ liệu vật lý.' });
    };

    reader.readAsArrayBuffer(file);
  };

  const handlePasteSubmit = () => {
    try {
      if (!pastedValue.trim()) {
        throw new Error('Bạn chưa dán nội dung chữ nào vào hộp văn bản dán Excel.');
      }
      setStatusMsg({ type: 'idle', label: 'Đang phân tích dữ liệu dán bạt...' });

      // Split words and tabs
      const lines = pastedValue.split('\n').map(line => line.split('\t').map(c => c.trim()));
      const rawRows: any[] = [];
      const headers = lines[0];

      if (lines.length < 2 || headers.length < 2) {
        throw new Error('Nội dung copy dán không đúng định dạng bảng Excel (Yêu cầu có tối thiểu 2 cột và 2 hàng bao gồm tiêu đề).');
      }

      for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i];
        if (rowData.length === 1 && rowData[0] === '') continue; // Skip empty row lines
        
        const rowObj: any = {};
        headers.forEach((h, hIdx) => {
          if (h) {
            rowObj[h] = rowData[hIdx] !== undefined ? rowData[hIdx] : '';
          }
        });
        rawRows.push(rowObj);
      }

      if (rawRows.length === 0) {
        throw new Error('Không phân tách được bản ghi dữ liệu hợp lệ nào.');
      }

      const detectedKeys = headers.filter(Boolean);

      // Helper to normalize any string for robust cross-language header matching
      const cleanAndNormalize = (str: string): string => {
        return str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]/g, "");    // Keep only alphanumeric characters
      };

      const normalizedKeysMap = new Map<string, string>();
      detectedKeys.forEach(originalKey => {
        normalizedKeysMap.set(cleanAndNormalize(originalKey), originalKey);
      });

      const mappedSubmissions: ReportSubmission[] = [];

      rawRows.forEach((row, rIdx) => {
        const getVal = (possibleKeys: string[]): any => {
          // 1. Try normalized matching
          for (const key of possibleKeys) {
            const cleanTarget = cleanAndNormalize(key);
            for (const [cleanDetected, originalKey] of normalizedKeysMap.entries()) {
              if (cleanDetected === cleanTarget || cleanDetected.includes(cleanTarget) || cleanTarget.includes(cleanDetected)) {
                return row[originalKey];
              }
            }
          }
          // 2. Direct key compare
          const rowKeys = Object.keys(row);
          for (const key of possibleKeys) {
            const matchedKey = rowKeys.find(rk => 
              rk.toLowerCase().trim() === key.toLowerCase().trim()
            );
            if (matchedKey) return row[matchedKey];
          }
          return '';
        };

        const id = parseInt(getVal(['ID', 'Stt', 'MaBC']), 10) || (rIdx + 1);
        let maDv = String(getVal(['Ma_DV', 'MaDV', 'MaDonVi', 'Mã_DV', 'DonVi', 'Ma_Don_Vi', 'Ma_DV_Co_So'])).trim();
        let tenBaoCao = String(getVal(['Ten_Bao_Cao', 'TenBaoCao', 'Tên_Báo_Cáo', 'Tên_Bao_Cao_Giao_Diem', 'Bao_Cao', 'TenBC', 'Chi_Tieu', 'NoiDungBaoCao'])).trim();

        // Fallbacks
        const rowValues = Object.values(row);
        if (!maDv && rowValues.length > 1) {
          const hypotheticalMaDv = String(rowValues[1]).trim();
          if (hypotheticalMaDv.length >= 4 && hypotheticalMaDv.length <= 8 && hypotheticalMaDv.startsWith('TK')) {
            maDv = hypotheticalMaDv;
          }
        }
        if (!tenBaoCao && rowValues.length > 2) {
          const longStringCol = rowValues.find(v => String(v).length > 10);
          if (longStringCol) {
            tenBaoCao = String(longStringCol);
          }
        }

        const tenDonVi = String(getVal(['Ten_Don_Vi', 'TenDonVi', 'Tên_Đơn_Vị', 'Ten_Don_Vi_Xep_Hang', 'Don_Vi', 'Tên_Đơn_Vị_Cơ_Sở', 'Ten_Co_So'])).trim();
        
        let maPhongRaw = String(getVal([
          'Ma_Phong', 'MaPhong', 'Mã_Phòng', 'Mã phòng', 'Ma_Phong_Ban', 
          'Phong', 'Phòng', 'Mã_Phòng_Nghiệp_Vụ', 'Ma_Phong_Nghiep_Vu', 
          'MaPhongNghiepVu', 'Mã phòng NV', 'Don_Vi_Nhan', 'Đơn vị nhận'
        ])).trim();
        
        let tenPhongRaw = String(getVal([
          'Ten_Phong', 'TenPhong', 'Tên_Phòng', 'Tên phòng', 'Ten_Phong_Ban', 
          'Phong_Ban', 'Phòng Ban', 'Phòng ban', 'Tên phòng ban', 'Phòng nhận', 
          'Phong_Nhan', 'Bo_Phan', 'Bộ phận', 'Phu_Trach', 'Phụ trách'
        ])).trim();

        // Check if both are empty - dynamic guessing
        if (!maPhongRaw && !tenPhongRaw) {
          const guessed = getDepartmentForReport(tenBaoCao);
          maPhongRaw = guessed.maPhong;
          tenPhongRaw = guessed.tenPhong;
        }

        // Leverage the intelligent normalization mapping
        const normResult = normalizeDepartment(maPhongRaw, tenPhongRaw || undefined);
        let maPhong = normResult.maPhong;
        let tenPhong = normResult.tenPhong;

        // Double check if standard result falls back to general but report name has a more specific department keyword
        if (maPhong === 'P_TH') {
          const guessed = getDepartmentForReport(tenBaoCao);
          if (guessed.maPhong !== 'P_TH') {
            maPhong = guessed.maPhong;
            tenPhong = guessed.tenPhong;
          }
        }

        const loaiBc = String(getVal(['Loai_BC', 'LoaiBC', 'Loài_BC', 'Ky_Khai_Bao', 'Ky_Ha_Nop', 'Loai_Bao_Cao'])).trim() || 'Tháng';
        
        let hanNopRaw = getVal(['Han_Nop', 'HanNop', 'Hạn_Nộp', 'Ngay_Het_Han', 'Han_Ngon']);
        let ngayNopRaw = getVal(['Ngay_Nop', 'NgayNop', 'Ngày_Nộp', 'Ngay_Thuc_Te']);

        const standardizeDateStr = (dateVal: any): string | null => {
          if (!dateVal) return null;
          const dateStrStr = String(dateVal).trim();
          if (dateStrStr.includes('/')) {
            const parts = dateStrStr.split('/');
            if (parts.length === 3) {
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              const year = parts[2];
              if (parts[2].length === 4) {
                return `${year}-${month}-${day}`;
              } else if (parts[0].length === 4) {
                return `${parts[0]}-${month}-${parts[1].padStart(2, '0')}`;
              }
            }
          }
          return dateStrStr;
        };

        const hanNop = standardizeDateStr(hanNopRaw) || '2026-06-15';
        const ngayNop = standardizeDateStr(ngayNopRaw);

        const diemDinhMuc = parseFloat(String(getVal(['Diem_Dinh_Muc', 'DiemDinhMuc', 'Điểm_Định_Mức', 'Diem_Chuan', 'Dinh_Muc'])).replace(',', '.')) || 30.0;
        const diemThoiGian = getVal(['Diem_Thoi_Gian', 'DiemThoiGian']) !== '' 
          ? parseFloat(String(getVal(['Diem_Thoi_Gian', 'DiemThoiGian'])).replace(',', '.')) 
          : null;
        const diemChatLuong = getVal(['Diem_Chat_Luong', 'DiemChatLuong']) !== '' 
          ? parseFloat(String(getVal(['Diem_Chat_Luong', 'DiemChatLuong'])).replace(',', '.')) 
          : null;
        const tongDiem = getVal(['Tong_Diem', 'TongDiem']) !== '' 
          ? parseFloat(String(getVal(['Tong_Diem', 'TongDiem'])).replace(',', '.')) 
          : null;

        const soNgayTre = getVal(['So_Ngay_Tre', 'SoNgayTre', 'Tre_Han_Ngay']) !== '' 
          ? parseInt(String(getVal(['So_Ngay_Tre', 'SoNgayTre'])), 10) 
          : null;
        
        const nhanXet = String(getVal(['Nhan_Xet', 'NhanXet', 'Ghi_Chu_Kiem_Chuan', 'Nghi_An_Tre', 'Nhận_Xét', 'Audit_Mark_Note'])).trim() || 'Thành công nạp từ dữ liệu dán trực tiếp.';

        let vung = 'Khu vực 2'; 
        const hHungYen = ['TKPH', 'TKNQ', 'TKYM', 'TKMH', 'TKKC', 'TKLB', 'TKHHT'];
        if (hHungYen.includes(maDv)) {
          vung = 'Khu vực 1';
        }

        if (maDv && tenBaoCao) {
          mappedSubmissions.push({
            ID: id,
            Ma_DV: maDv,
            Ten_Don_Vi: tenDonVi || `Thống kê Cơ Sở ${maDv}`,
            Vung: vung,
            Ma_Phong: maPhong,
            Ten_Phong: tenPhong,
            Ten_Bao_Cao: tenBaoCao,
            Loai_BC: loaiBc,
            Han_Nop: hanNop,
            Ngay_Nop: ngayNop,
            Diem_Thoi_Gian: diemThoiGian,
            Diem_Chat_Luong: diemChatLuong,
            Tong_Diem: tongDiem !== null ? tongDiem : (diemThoiGian !== null && diemChatLuong !== null ? (diemThoiGian + diemChatLuong) : null),
            Diem_Dinh_Muc: diemDinhMuc,
            So_Ngay_Tre: soNgayTre,
            Nhan_Xet: nhanXet
          });
        }
      });

      if (mappedSubmissions.length === 0) {
        throw new Error('Không phân tích được dòng dữ liệu thi đua nào hợp lệ! Hãy chắc chắn có các trường Ma_DV và Ten_Bao_Cao.');
      }

      onImportComplete(mappedSubmissions);
      setLogCounts({ total: rawRows.length, matched: mappedSubmissions.length });
      setStatusMsg({ type: 'success', label: `Nạp thành công ${mappedSubmissions.length} dòng dữ liệu thi đua từ clipboard dán!` });
      setPastedValue('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', label: err.message || 'Lỗi xử lý dữ liệu dán trực tiếp.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileParse(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileParse(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="excel-importer-box">
      
      {/* Header and short instructions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 font-sans uppercase tracking-tight">
            📥 Cổng Nạp Dữ Liệu Excel / Giao Chỉ Tiêu
          </h4>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Nạp trực tiếp bảng chấm điểm hoặc danh sách báo cáo Excel CSV để cập nhật tệp giao điểm thời hạn.
          </p>
        </div>
        <div className="text-start md:text-right">
          <span className="text-[10px] text-slate-400 font-mono block uppercase font-medium">Bản ghi hiện hành</span>
          <span className="text-xs font-bold text-slate-700 block mt-0.5">{existingCount} chỉ số giao điểm</span>
        </div>
      </div>

      {/* Select active upload or copy mode tab panel */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1">
        <button
          onClick={() => { setActiveTab('upload'); setStatusMsg({ type: 'idle', label: '' }); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-normal font-sans transition-all duration-150 ${
            activeTab === 'upload' 
              ? 'bg-white text-sky-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📂 Chọn Tải File Excel/CSV
        </button>
        <button
          onClick={() => { setActiveTab('paste'); setStatusMsg({ type: 'idle', label: '' }); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-normal font-sans transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'paste' 
              ? 'bg-white text-sky-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📋 Dán trực tiếp từ Excel (Không cần File)
        </button>
      </div>

      {activeTab === 'upload' ? (
        /* Main Drag Drop Target Area */
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-200 ${
            isDragging 
              ? 'border-sky-500 bg-sky-50/50' 
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
          }`}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <div className="p-4 bg-slate-50 rounded-full text-slate-400 border border-slate-100">
            <UploadCloud className="w-8 h-8 text-sky-500 animate-pulse" />
          </div>

          <h5 className="font-bold text-slate-700 text-xs mt-4 font-sans">
            Click để tải lên tệp hoặc kéo thả file Excel vào đây
          </h5>
          <p className="text-[10px] text-slate-400 mt-1 max-w-md font-sans leading-normal">
            Hỗ trợ tệp định dạng .xlsx, .xls hoặc .csv bảng nộp gốc có tiêu đề chứa: <span className="font-semibold text-slate-600">Ma_DV, Ten_Bao_Cao, Han_Nop, Ngay_Nop, Diem_Dinh_Muc</span>.
          </p>
        </div>
      ) : (
        /* Copy & Paste Input Target block */
        <div className="space-y-3 animate-in fade-in duration-200">
          <label className="text-xs font-bold text-slate-700 block font-sans">
            Hãy sao chép các ô trong Excel (gồm danh sách các dòng kèm dòng tiêu đề đầu tiên) rồi dán vào hộp bên dưới:
          </label>
          <textarea
            value={pastedValue}
            onChange={(e) => setPastedValue(e.target.value)}
            placeholder={`Vui lòng copy và dán bảng Excel vào đây. Ví dụ cấu trúc của bảng:
Ma_DV	Ten_Bao_Cao	Han_Nop	Diem_Dinh_Muc
TKPH	Báo cáo Thống kê sản xuất nông lâm nghiệp	2026-06-15	30
TKNQ	Báo cáo chỉ số phát triển công nghiệp	2026-06-20	30`}
            rows={8}
            className="w-full text-xs font-mono p-4 border rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all resize-y"
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setPastedValue(
                  `Ma_DV\tTen_Bao_Cao\tHan_Nop\tDiem_Dinh_Muc\nTKPH\tBáo cáo tổng hợp số liệu công nghiệp tháng\t2026-06-15\t30\nTKNQ\tBáo cáo Thống kê thương mại dịch vụ cơ sở\t2026-06-18\t30`
                );
              }}
              className="text-[10px] text-sky-600 hover:text-sky-700 font-bold underline"
            >
              📄 Dán mẫu thử nghiệm nhanh
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={!pastedValue.trim()}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-sans shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" /> Xử lý dữ liệu dán và Hoàn tất
            </button>
          </div>
        </div>
      )}

      {/* Status Notifications Panel */}
      {statusMsg.type !== 'idle' && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs font-sans">
            <p className="font-bold leading-normal">{statusMsg.label}</p>
            {logCounts && statusMsg.type === 'success' && (
              <p className="mt-1 text-slate-500 block">
                Tổng cộng quét <span className="font-bold text-slate-700">{logCounts.total}</span> dòng raw Excel, thiết lập thành công <span className="font-bold text-emerald-600">{logCounts.matched}</span> báo cáo giao điểm chuẩn hóa.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Excel Schema matching checklist block */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
        <span className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-extrabold">
          Sơ đồ so khớp trường trường dữ liệu (System Schema guidelines):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
          
          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Ma_DV</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Mã ĐV</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">TKPH, TKNQ, etc.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Han_Nop</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Hạn nộp</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Hạn tuyệt đối nộp</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Ngay_Nop</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Ngày nộp</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">(Tùy chọn: nạp trước)</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Dinh_Muc</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Điểm chuẩn</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Điểm tối đa của báo cáo</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
