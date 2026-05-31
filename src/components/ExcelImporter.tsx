/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ReportSubmission } from '../types';
import { UploadCloud, CheckCircle2, FileSpreadsheet, AlertTriangle, ArrowRight } from 'lucide-react';
import { getDepartmentForReport, normalizeDepartment } from '../utils/departmentHelper';
import { UNITS_DATA, DEPARTMENTS_DATA } from '../data/emulationData';

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

  // Clean Vietnamese strings for normalization
  const cleanAndNormalize = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "");    // Keep only alphanumeric characters
  };

  const processImportedRows = (rawRows: any[], detectedKeys: string[]): ReportSubmission[] => {
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
        // 2. Direct simple comparison
        const rowKeys = Object.keys(row);
        for (const key of possibleKeys) {
          const matchedKey = rowKeys.find(rk => 
            rk.toLowerCase().trim() === key.toLowerCase().trim()
          );
          if (matchedKey) return row[matchedKey];
        }
        return '';
      };

      // 1. Ma_DV
      let maDv = String(getVal([
        'Ma_DV', 'MaDV', 'MaDonVi', 'Mã_DV', 'DonVi', 'Ma_Don_Vi', 'Ma_DV_Co_So'
      ])).trim();

      // If Ma_DV is missing, try fallbacks from row values
      const rowValues = Object.values(row);
      if (!maDv && rowValues.length > 0) {
        const hypMaDv = String(rowValues[0]).trim();
        if (hypMaDv.length >= 4 && hypMaDv.length <= 8 && hypMaDv.toUpperCase().startsWith('TK')) {
          maDv = hypMaDv;
        } else if (rowValues.length > 1) {
          const hypMaDv2 = String(rowValues[1]).trim();
          if (hypMaDv2.length >= 4 && hypMaDv2.length <= 8 && hypMaDv2.toUpperCase().startsWith('TK')) {
            maDv = hypMaDv2;
          }
        }
      }

      // UPPERCASE to match system guidelines
      maDv = maDv.toUpperCase();

      // Look up Ten_Don_Vi and Vung from UNITS_DATA
      const targetUnit = UNITS_DATA.find(u => u.Ma_DV === maDv);
      const tenDonVi = targetUnit ? targetUnit.Ten_Don_Vi : (String(getVal(['Ten_Don_Vi', 'TenDonVi', 'Tên_Đơn_Vị', 'Don_Vi'])).trim() || `Thống kê Cơ Sở ${maDv}`);
      const vung = targetUnit ? targetUnit.Vung : (maDv && ['TKPH', 'TKNQ', 'TKYM', 'TKMH', 'TKKC', 'TKLB', 'TKHHT'].includes(maDv) ? 'Khu vực 1' : 'Khu vực 2');

      // 2. Ten_Bao_Cao
      let tenBaoCao = String(getVal([
        'Ten_Bao_Cao', 'TenBaoCao', 'Tên_Báo_Cáo', 'Tên_Bao_Cao_Giao_Diem', 'Bao_Cao', 'TenBC', 'Chi_Tieu', 'NoiDungBaoCao'
      ])).trim();

      if (!tenBaoCao && rowValues.length > 2) {
        // Search for a column with a reasonably long string, which is probably the report name
        const longStr = rowValues.find(v => typeof v === 'string' && v.length > 12);
        if (longStr) {
          tenBaoCao = String(longStr);
        }
      }

      // 3. Ma_Phong & Ten_Phong
      let maPhongRaw = String(getVal([
        'Ma_Phong', 'MaPhong', 'Mã_Phòng', 'Mã phòng', 'Ma_Phong_Ban', 
        'Phong', 'Phòng', 'Mã_Phòng_Nghiệp_Vụ', 'Ma_Phong_Nghiep_Vu', 
        'MaPhongNghiepVu', 'Mã phòng NV', 'Don_Vi_Nhan', 'Đơn vị nhận'
      ])).trim();

      let tenPhongRaw = String(getVal([
        'Ten_Phong', 'TenPhong', 'Tên_Phòng', 'Tên phòng', 'Ten_Phong_Ban', 
        'Phong_Ban', 'Phòng Ban', 'Phòng ban', 'Tên phòng ban'
      ])).trim();

      // Resolve department names smoothly
      let maPhong = '';
      let tenPhong = '';

      if (maPhongRaw) {
        const deptLookup = DEPARTMENTS_DATA.find(d => d.Ma_Phong.toLowerCase() === maPhongRaw.toLowerCase() || cleanAndNormalize(d.Ma_Phong) === cleanAndNormalize(maPhongRaw));
        if (deptLookup) {
          maPhong = deptLookup.Ma_Phong;
          tenPhong = deptLookup.Ten_Phong;
        }
      }

      if (!maPhong) {
        // Fallback to normalized department mapping
        const normResult = normalizeDepartment(maPhongRaw || 'P_TH', tenPhongRaw || undefined);
        maPhong = normResult.maPhong;
        tenPhong = normResult.tenPhong;
      }

      // If department is default General, double check if report title indicates a specific department
      if (maPhong === 'P_TH') {
        const betterGuess = getDepartmentForReport(tenBaoCao);
        if (betterGuess.maPhong !== 'P_TH') {
          maPhong = betterGuess.maPhong;
          tenPhong = betterGuess.tenPhong;
        }
      }

      // 4. Toc_BC (Loại báo cáo/Tần suất báo cáo)
      const loaiBc = String(getVal([
        'Toc_BC', 'Tốc_BC', 'TocBC', 'TốcBC', 'Loai_BC', 'LoaiBC', 'Loại_BC', 'Loài_BC', 'Ky_Khai_Bao', 'Loai_Bao_Cao'
      ])).trim() || 'Tháng';

      // 5. Han_Nop
      const standardizeDateStr = (dateVal: any): string | null => {
        if (!dateVal) return null;
        if (dateVal instanceof Date) {
          return dateVal.toISOString().split('T')[0];
        }
        const dateStrStr = String(dateVal).trim();
        if (dateStrStr.includes('/')) {
          const parts = dateStrStr.split('/');
          if (parts.length === 3) {
            const part0 = parts[0].padStart(2, '0');
            const part1 = parts[1].padStart(2, '0');
            const part2 = parts[2];
            if (part2.length === 4) {
              return `${part2}-${part1}-${part0}`; // DD/MM/YYYY to YYYY-MM-DD
            } else if (part0.length === 4) {
              return `${part0}-${part1}-${part2}`; // YYYY/MM/DD to YYYY-MM-DD
            }
          }
        }
        return dateStrStr;
      };

      const hanNopRaw = getVal(['Han_Nop', 'HanNop', 'Hạn_Nộp', 'Han_nop', 'Hạn nộp']);
      const hanNop = standardizeDateStr(hanNopRaw) || '2026-06-15';

      // 6. Diem_Dinh_Muc
      const diemDinhMucRaw = getVal(['Diem_Dinh_Muc', 'DiemDinhMuc', 'Điểm_Định_Mức', 'Diem_Chuan', 'Dinh_Muc', 'Diem_Dinh_Muc_GP']);
      const diemDinhMuc = diemDinhMucRaw !== '' ? parseFloat(String(diemDinhMucRaw).replace(',', '.')) : 30.0;

      // 7. Diem_TG (Điểm thời gian)
      const diemTGRaw = getVal(['Diem_TG', 'Điểm_TG', 'Diem_Thoi_Gian', 'DiemThoiGian', 'Diem_TG']);
      const diemThoiGian = diemTGRaw !== '' ? parseFloat(String(diemTGRaw).replace(',', '.')) : null;

      // 8. So_Ngay_Tre
      const soNgayTreRaw = getVal(['So_Ngay_Tre', 'SoNgayTre', 'Tre_Han_Ngay', 'So_Ngày_Trễ', 'Số_Ngày_Trễ', 'Tre_Ngay']);
      const soNgayTre = soNgayTreRaw !== '' ? parseInt(String(soNgayTreRaw), 10) : null;

      // Let's parse explicit Diem_Chat_Luong if available, else derive
      const diemChatLuongRaw = getVal(['Diem_Chat_Luong', 'DiemChatLuong', 'Điểm_Chất_Lượng', 'DiemNV']);
      const diemChatLuong = diemChatLuongRaw !== '' ? parseFloat(String(diemChatLuongRaw).replace(',', '.')) : null;

      // Synthesize Ngay_Nop matching the delays
      let ngayNopRaw = getVal(['Ngay_Nop', 'NgayNop', 'Ngày_Nộp', 'Ngay_Thuc_Te']);
      let ngayNop = standardizeDateStr(ngayNopRaw);

      if (!ngayNop) {
        if (soNgayTre !== null) {
          const parsedHan = new Date(hanNop);
          if (!isNaN(parsedHan.getTime())) {
            parsedHan.setDate(parsedHan.getDate() + soNgayTre);
            ngayNop = parsedHan.toISOString().split('T')[0];
          }
        } else if (diemThoiGian !== null) {
          // If diemThoiGian is full credit of Diem_Dinh_Muc * 1/3 (normally up to 10 points) or simply > 0, assume on-time submit
          ngayNop = hanNop; 
        }
      }

      // Compute total Score
      let tongDiem = null;
      const parsedTongDiem = getVal(['Tong_Diem', 'TongDiem', 'Tổng_Điểm']);
      if (parsedTongDiem !== '') {
        tongDiem = parseFloat(String(parsedTongDiem).replace(',', '.'));
      } else if (diemThoiGian !== null) {
        // If no explicit quality score is given, provide remaining part of score or maximum score dynamically
        const calculatedQuality = diemChatLuong !== null ? diemChatLuong : (diemDinhMuc - 10.0);
        tongDiem = diemThoiGian + calculatedQuality;
      }

      const nhanXet = String(getVal(['Nhan_Xet', 'NhanXet', 'Ghi_Chu_Kiem_Chuan', 'Nghi_An_Tre', 'Nhận_Xét', 'Ghi_Chu'])).trim() || 'Thành công nạp từ hệ quản trị chỉ tiêu Excel.';

      const id = parseInt(getVal(['ID', 'Stt', 'MaBC']), 10) || (rIdx + 1);

      if (maDv && tenBaoCao) {
        mappedSubmissions.push({
          ID: id,
          Ma_DV: maDv,
          Ten_Don_Vi: tenDonVi,
          Vung: vung,
          Ma_Phong: maPhong,
          Ten_Phong: tenPhong,
          Ten_Bao_Cao: tenBaoCao,
          Loai_BC: loaiBc,
          Han_Nop: hanNop,
          Ngay_Nop: ngayNop,
          Diem_Thoi_Gian: diemThoiGian,
          Diem_Chat_Luong: diemChatLuong,
          Tong_Diem: tongDiem !== null ? Math.round(tongDiem * 10) / 10 : null,
          Diem_Dinh_Muc: diemDinhMuc,
          So_Ngay_Tre: soNgayTre !== null ? soNgayTre : (ngayNop && hanNop ? Math.max(0, Math.floor((new Date(ngayNop).getTime() - new Date(hanNop).getTime()) / (1000 * 60 * 60 * 24))) : null),
          Nhan_Xet: nhanXet
        });
      }
    });

    return mappedSubmissions;
  };

  const handleFileParse = (file: File) => {
    const reader = new FileReader();
    setStatusMsg({ type: 'idle', label: 'Đang tải và xử lý file Excel...' });

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) throw new Error('Không thể đọc kết quả tệp dữ liệu.');

        const dataBytes = new Uint8Array(arrayBuffer as ArrayBuffer);
        const workbook = XLSX.read(dataBytes, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          throw new Error('Tệp tải lên rỗng hoặc không có dữ liệu dòng nào.');
        }

        const detectedKeys = Object.keys(rawRows[0] || {});
        const mappedSubmissions = processImportedRows(rawRows, detectedKeys);

        if (mappedSubmissions.length === 0) {
          throw new Error(
            `Không ghép được dòng dữ liệu nào! Hãy đảm bảo tệp chứa các đầu cột tối thiểu như "Ma_DV" (hoặc MaDV) và "Ten_Bao_Cao".`
          );
        }

        onImportComplete(mappedSubmissions);
        setLogCounts({ total: rawRows.length, matched: mappedSubmissions.length });
        setStatusMsg({ type: 'success', label: `Nạp thành công ${mappedSubmissions.length} chỉ tiêu chỉ số thi đua từ tệp Excel sạch sẽ!` });
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

      const lines = pastedValue.split('\n').map(line => line.split('\t').map(c => c.trim()));
      const rawRows: any[] = [];
      const headers = lines[0];

      if (lines.length < 2 || headers.length < 2) {
        throw new Error('Nội dung copy dán không đúng cấu trúc bảng Excel (Yêu cầu có tối thiểu dòng tiêu đề và 1 dòng dữ liệu bản ghi).');
      }

      for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i];
        if (rowData.length === 1 && rowData[0] === '') continue; // Skip empty line rows
        
        const rowObj: any = {};
        headers.forEach((h, hIdx) => {
          if (h) {
            rowObj[h] = rowData[hIdx] !== undefined ? rowData[hIdx] : '';
          }
        });
        rawRows.push(rowObj);
      }

      if (rawRows.length === 0) {
        throw new Error('Không phân tách được bản ghi dữ liệu hợp lệ nào từ văn bản đã dán.');
      }

      const detectedKeys = headers.filter(Boolean);
      const mappedSubmissions = processImportedRows(rawRows, detectedKeys);

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
        <div className="text-left">
          <h4 className="text-sm font-bold text-slate-800 font-sans uppercase tracking-tight">
            📥 Cổng Nạp Dữ Liệu Excel / Giao Chỉ Tiêu (8 Cột Chuẩn)
          </h4>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Hỗ trợ truyền nạp bám sát cấu trúc của 8 trường cốt lõi liên quan đến xếp hạng thi đua đơn vị và phòng ban.
          </p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-[10px] text-slate-400 font-mono block uppercase font-medium">Bản ghi hiện hành</span>
          <span className="text-xs font-bold text-slate-700 block mt-0.5">{existingCount} báo cáo giao điểm</span>
        </div>
      </div>

      {/* Select active upload or copy mode tab panel */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1">
        <button
          onClick={() => { setActiveTab('upload'); setStatusMsg({ type: 'idle', label: '' }); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-normal font-sans transition-all duration-150 cursor-pointer ${
            activeTab === 'upload' 
              ? 'bg-white text-sky-600 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📂 Chọn Tải File Excel/CSV
        </button>
        <button
          onClick={() => { setActiveTab('paste'); setStatusMsg({ type: 'idle', label: '' }); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-normal font-sans transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'paste' 
              ? 'bg-white text-sky-600 shadow-xs' 
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
          <p className="text-[10px] text-slate-400 mt-1.5 max-w-xl font-sans leading-relaxed">
            Hỗ trợ bảng nạp gốc có dòng tiêu đề đầu chứa khớp các cột: <span className="font-bold text-slate-600">Ma_DV, Ma_Phong, Ten_Bao_Cao, Toc_BC, Han_nop, Diem_TG, Diem_Dinh_Muc, So_Ngay_Tre</span>.
          </p>
        </div>
      ) : (
        /* Copy & Paste Input Target block */
        <div className="space-y-3 animate-in fade-in duration-200 text-left">
          <label className="text-xs font-bold text-slate-700 block font-sans">
            Hãy sao chép các ô trong Excel (gồm danh sách các dòng kèm dòng tiêu đề đầu tiên) của 8 cột rồi dán vào hộp bên dưới:
          </label>
          <textarea
            value={pastedValue}
            onChange={(e) => setPastedValue(e.target.value)}
            placeholder={`Vui lòng sao chép bảng dữ liệu Excel 8 cột rồi dán trực tiếp vào đây. Ví dụ định dạng:
Ma_DV	Ma_Phong	Ten_Bao_Cao	Toc_BC	Han_nop	Diem_TG	Diem_Dinh_Muc	So_Ngay_Tre
TKPH	P_TH	Báo cáo tổng hợp tháng đầu năm	Tháng	2026-06-15	10	30	0
TKNQ	P_CN	Thống kê sản xuất công nghiệp	Tháng	2026-06-20	6	30	4`}
            rows={8}
            className="w-full text-xs font-mono p-4 border rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all resize-y"
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setPastedValue(
                  `Ma_DV\tMa_Phong\tTen_Bao_Cao\tToc_BC\tHan_nop\tDiem_TG\tDiem_Dinh_Muc\tSo_Ngay_Tre\nTKPH\tP_TH\tBáo cáo tổng hợp tháng đầu năm\tTháng\t2026-06-15\t10\t30\t0\nTKNQ\tP_CN\tThống kê sản xuất công nghiệp\tTháng\t2026-06-20\t6\t30\t4`
                );
              }}
              className="text-[10px] text-sky-600 hover:text-sky-700 font-bold underline cursor-pointer"
            >
              📄 Dán dữ liệu 8 cột mẫu kiểm thử nhanh
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
        <div className={`p-4 rounded-xl border flex items-start space-x-3 text-left ${
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
                Tổng cộng quét thành công <span className="font-bold text-slate-700">{logCounts.total}</span> dòng từ dữ liệu Excel của bạn, tích hợp chính xác <span className="font-bold text-emerald-600">{logCounts.matched}</span> báo cáo khớp chuẩn!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Excel Schema matching checklist block */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-left">
        <span className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-extrabold">
          Sơ đồ so khớp chính xác 8 cột trường thông tin (Data Schema Guidance):
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
          
          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Ma_DV</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Mã đơn vị</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">TKPH, TKNQ, TKYM...</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Ma_Phong</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Mã phòng ban</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">P_TH, P_CN, P_DV...</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Ten_Bao_Cao</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Tên báo cáo</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Niên giám, Báo cáo tháng...</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Toc_BC</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Loại báo cáo</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Tháng, Quý, Năm (Tốc_BC)</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Han_nop</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Hạn nộp</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Dạng YYYY-MM-DD hoặc ngày</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Diem_TG</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Điểm thời gian</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Tối đa 10 điểm</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">Diem_Dinh_Muc</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Điểm định mức</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Ví dụ: 30.0, 50.0, 100.0</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <span className="p-1 bg-white border rounded text-[10px] font-bold text-sky-600 font-mono uppercase">So_Ngay_Tre</span>
            <div className="pt-0.5">
              <p className="font-semibold text-slate-700 leading-tight">Số ngày trễ</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">0 nếu đúng hạn, hoặc số trễ</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
