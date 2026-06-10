import React, { useState } from 'react';
import { ReportSubmission } from '../types';
import { 
  Building2, 
  Briefcase, 
  Layers, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  FileSpreadsheet, 
  Activity, 
  Download,
  Calendar,
  Layers3,
  TrendingUp,
  FileText,
  Clock,
  UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SummaryMenuProps {
  submissions: ReportSubmission[];
  departments: { Ma_Phong: string; Ten_Phong: string }[];
  units: { Ma_DV: string; Ten_Don_Vi: string; Vung: string }[];
}

type SummarySubTab = 'by-unit' | 'by-dept-rank' | 'by-type-rank' | 'report-tracking';

export default function SummaryMenu({ submissions, departments, units }: SummaryMenuProps) {
  const [subTab, setSubTab] = useState<SummarySubTab>('by-unit');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'VUNG1' | 'VUNG2'>('ALL');

  // Tab 2 Filter: Selected Department
  const [selectedDept, setSelectedDept] = useState<string>('P_TH');
  
  // Tab 3 Filter: Selected Report Category
  const [selectedReportType, setSelectedReportType] = useState<string>('Báo cáo tháng');

  // Tab 4 Filter: Report Tracking Status
  const [trackingFilter, setTrackingFilter] = useState<string>('ALL');

  // Helper classifier for report types/categories
  const getReportCategory = (s: ReportSubmission): 'Báo cáo nhanh' | 'Báo cáo phân tích' | 'Báo cáo tháng' | 'Báo cáo năm' => {
    const name = s.Ten_Bao_Cao.toLowerCase();
    const type = s.Loai_BC?.toLowerCase() || '';
    if (name.includes('ước tính') || name.includes('báo cáo nhanh')) {
      return 'Báo cáo nhanh';
    }
    if (name.includes('phân tính') || name.includes('phân tích') || name.includes('chuyên đề')) {
      return 'Báo cáo phân tích';
    }
    if (type.includes('tháng') || name.includes('tháng')) {
      return 'Báo cáo tháng';
    }
    return 'Báo cáo năm';
  };

  // --- 1. DATA COMPUTATION FOR TAB 1: TỔNG HỢP THEO ĐƠN VỊ ---
  const unitSummaries = units.map(u => {
    const uSubs = submissions.filter(s => s.Ma_DV === u.Ma_DV);
    const total = uSubs.length;
    const completed = uSubs.filter(s => s.Ngay_Nop !== null).length;
    const onTime = uSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
    const late = uSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0).length;
    const overdue = uSubs.filter(s => s.Ngay_Nop === null).length;

    const totalDinhMuc = uSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
    const totalDiemThoiGian = uSubs.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0);
    const totalDiemChatLuong = uSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0);
    const totalTongDiem = uSubs.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const emulationIndex = totalDinhMuc > 0 ? (totalTongDiem / totalDinhMuc) * 100 : 0;

    return {
      Ma_DV: u.Ma_DV,
      Ten_Don_Vi: u.Ten_Don_Vi,
      Vung: u.Vung,
      Tong_Bao_Cao: total,
      Da_Nop: completed,
      Dung_Han: onTime,
      Trere_Han: late,
      Chua_Nop: overdue,
      Diem_Dinh_Muc: totalDinhMuc,
      Diem_TG: Math.round(totalDiemThoiGian * 10) / 10,
      Diem_Chat_Luong: Math.round(totalDiemChatLuong * 10) / 10,
      Tong_Diem: Math.round(totalTongDiem * 10) / 10,
      Ti_Le_HT: Math.round(completionRate * 10) / 10,
      Diem_Thi_Dua_Phan_Tram: Math.round(emulationIndex * 10) / 10
    };
  });

  const filteredUnitSummaries = unitSummaries.filter(u => {
    const matchesSearch = u.Ten_Don_Vi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.Ma_DV.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (regionFilter === 'ALL') return matchesSearch;
    if (regionFilter === 'VUNG1') return matchesSearch && u.Vung === 'Khu vực 1';
    if (regionFilter === 'VUNG2') return matchesSearch && u.Vung === 'Khu vực 2';
    return matchesSearch;
  });

  // --- 2. DATA COMPUTATION FOR TAB 2: XẾP HẠNG THEO PHÒNG BAN ---
  const unitsDeptSummaries = units.map(u => {
    const uSubs = submissions.filter(s => s.Ma_DV === u.Ma_DV && s.Ma_Phong === selectedDept);
    const total = uSubs.length;
    const completed = uSubs.filter(s => s.Ngay_Nop !== null).length;
    const totalDinhMuc = uSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
    const totalDiemThoiGian = uSubs.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0);
    const totalDiemChatLuong = uSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0);
    const totalTongDiem = uSubs.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);

    const emulationIndex = totalDinhMuc > 0 ? (totalTongDiem / totalDinhMuc) * 100 : 0;

    return {
      Ma_DV: u.Ma_DV,
      Ten_Don_Vi: u.Ten_Don_Vi,
      Vung: u.Vung,
      Tong_Bao_Cao: total,
      Da_Nop: completed,
      Diem_Dinh_Muc: totalDinhMuc,
      Diem_TG: Math.round(totalDiemThoiGian * 10) / 10,
      Diem_Chat_Luong: Math.round(totalDiemChatLuong * 10) / 10,
      Tong_Diem: Math.round(totalTongDiem * 10) / 10,
      Diem_Thi_Dua_Phan_Tram: Math.round(emulationIndex * 10) / 10
    };
  });

  // Sort units by Total Score descending to display as Rank (1 to 14)
  const rankedUnitsDept = [...unitsDeptSummaries]
    .sort((a, b) => b.Tong_Diem - a.Tong_Diem || b.Diem_Thi_Dua_Phan_Tram - a.Diem_Thi_Dua_Phan_Tram)
    .filter(u => u.Ten_Don_Vi.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- 3. DATA COMPUTATION FOR TAB 3: XẾP HẠNG THEO LOẠI BÁO CÁO ---
  const unitsTypeSummaries = units.map(u => {
    const uSubs = submissions.filter(s => s.Ma_DV === u.Ma_DV && getReportCategory(s) === selectedReportType);
    const total = uSubs.length;
    const completed = uSubs.filter(s => s.Ngay_Nop !== null).length;
    const totalDinhMuc = uSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
    const totalDiemThoiGian = uSubs.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0);
    const totalDiemChatLuong = uSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0);
    const totalTongDiem = uSubs.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);

    const emulationIndex = totalDinhMuc > 0 ? (totalTongDiem / totalDinhMuc) * 100 : 0;

    return {
      Ma_DV: u.Ma_DV,
      Ten_Don_Vi: u.Ten_Don_Vi,
      Vung: u.Vung,
      Tong_Bao_Cao: total,
      Da_Nop: completed,
      Diem_Dinh_Muc: totalDinhMuc,
      Diem_TG: Math.round(totalDiemThoiGian * 10) / 10,
      Diem_Chat_Luong: Math.round(totalDiemChatLuong * 10) / 10,
      Tong_Diem: Math.round(totalTongDiem * 10) / 10,
      Diem_Thi_Dua_Phan_Tram: Math.round(emulationIndex * 10) / 10
    };
  });

  // Sort units dynamically to rank them (1 to 14)
  const rankedUnitsType = [...unitsTypeSummaries]
    .sort((a, b) => b.Tong_Diem - a.Tong_Diem || b.Diem_Thi_Dua_Phan_Tram - a.Diem_Thi_Dua_Phan_Tram)
    .filter(u => u.Ten_Don_Vi.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- 4. DATA COMPUTATION FOR TAB 4: THEO DÕI BÁO CÁO ---
  const filteredTrackingReports = submissions.filter(s => {
    const matchesSearch = s.Ten_Bao_Cao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.Ten_Don_Vi.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    switch (trackingFilter) {
      case 'DUE_NOT_SUBMITTED': // Báo cáo đến hạn chưa gửi
        return s.Ngay_Nop === null;
      case 'ON_TIME': // Báo cáo đúng hạn
        return s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0;
      case 'LATE': // Báo cáo trễ hạn
        return s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0;
      case 'UNGRADED': // Báo cáo chưa chấm
        return s.Ngay_Nop !== null && s.Diem_Chat_Luong === null;
      case 'GRADED': // Báo cáo đã chấm
        return s.Ngay_Nop !== null && s.Diem_Chat_Luong !== null;
      case 'NOT_SUBMITTED': // Báo cáo chưa gửi
        return s.Ngay_Nop === null;
      case 'SUBMITTED': // Báo cáo đã gửi
        return s.Ngay_Nop !== null;
      default:
        return true;
    }
  });

  // Export functions to Excel
  const handleExportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      if (subTab === 'by-unit') {
        const sheetData = filteredUnitSummaries.map((u, i) => ({
          'STT': i + 1,
          'Mã Đơn Vị': u.Ma_DV,
          'Tên Đơn Vị': u.Ten_Don_Vi,
          'Vùng Địa Bàn': u.Vung,
          'Tổng Số Chỉ Tiêu': u.Tong_Bao_Cao,
          'Đã Nộp': u.Da_Nop,
          'Tổng Điểm Định Mức': u.Diem_Dinh_Muc,
          'Tổng Điểm Thời Gian': u.Diem_TG,
          'Tổng Điểm Chất Lượng': u.Diem_Chat_Luong,
          'Tổng Điểm Thực Đạt': u.Tong_Diem,
          'Chỉ Số Thi Đua (%)': `${u.Diem_Thi_Dua_Phan_Tram}%`
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, 'Điểm Theo Đơn Vị');
        XLSX.writeFile(wb, `Diem_Theo_Don_Vi_${new Date().getFullYear()}.xlsx`);
      } 
      else if (subTab === 'by-dept-rank') {
        const currentDeptName = departments.find(d => d.Ma_Phong === selectedDept)?.Ten_Phong || 'Phòng ban';
        const sheetData = rankedUnitsDept.map((u, i) => ({
          'STT (Hạng)': i + 1,
          'Mã Đơn Vị': u.Ma_DV,
          'Tên Đơn Vị': u.Ten_Don_Vi,
          'Tổng Báo cáo': u.Tong_Bao_Cao,
          'Đã Nộp': u.Da_Nop,
          'Điểm Định Mức': u.Diem_Dinh_Muc,
          'Điểm Thời Gian đạt': u.Diem_TG,
          'Điểm Chất Lượng đạt': u.Diem_Chat_Luong,
          'Tổng Điểm Thực Đạt': u.Tong_Diem,
          'Chỉ Số Thi Đua (%)': `${u.Diem_Thi_Dua_Phan_Tram}%`
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, 'Hạng Theo Lĩnh Vực');
        XLSX.writeFile(wb, `Xep_Hang_${selectedDept}_${new Date().getFullYear()}.xlsx`);
      } 
      else if (subTab === 'by-type-rank') {
        const sheetData = rankedUnitsType.map((u, i) => ({
          'STT (Hạng)': i + 1,
          'Mã Đơn Vị': u.Ma_DV,
          'Tên Đơn Vị': u.Ten_Don_Vi,
          'Tổng Báo cáo': u.Tong_Bao_Cao,
          'Đã Nộp': u.Da_Nop,
          'Điểm Định Mức': u.Diem_Dinh_Muc,
          'Điểm Thời Gian': u.Diem_TG,
          'Điểm Chất Lượng': u.Diem_Chat_Luong,
          'Tổng Điểm Thực Đạt': u.Tong_Diem,
          'Chỉ Số Thi Đua (%)': `${u.Diem_Thi_Dua_Phan_Tram}%`
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, 'Hạng Theo Loại Báo Cáo');
        XLSX.writeFile(wb, `Xep_Hang_${selectedReportType.replace(/\s+/g, '_')}_${new Date().getFullYear()}.xlsx`);
      }
      else if (subTab === 'report-tracking') {
        const sheetData = filteredTrackingReports.map((s, i) => ({
          'STT': i + 1,
          'Tên Đơn Vị': s.Ten_Don_Vi,
          'Nội Dung Báo Cáo': s.Ten_Bao_Cao,
          'Phòng Ban Giao': s.Ten_Phong,
          'Hạn Nộp': s.Han_Nop,
          'Ngày Nộp Thực Tế': s.Ngay_Nop || 'Chưa nộp',
          'Trạng Thái Nộp': s.Ngay_Nop ? ((s.So_Ngay_Tre ?? 0) > 0 ? `Trễ ${s.So_Ngay_Tre} ngày` : 'Đúng hạn') : 'Chưa nộp',
          'Điểm Thời Gian': s.Diem_Thoi_Gian ?? 0,
          'Điểm Chất Lượng': s.Diem_Chat_Luong ?? 'Chưa chấm',
          'Tổng Điểm': s.Tong_Diem ?? 0
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, 'Theo Dõi Giao Nhận');
        XLSX.writeFile(wb, `Theo_Doi_Bao_Cao_${new Date().getFullYear()}.xlsx`);
      }
    } catch (e: any) {
      alert(`Không thể xuất xlsx: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6" id="summary-management-menu">
      
      {/* EXQUISITE SECTION HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 flex-1 text-left">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-700 text-white rounded-xl shadow-md">
              <Layers3 className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none font-sans drop-shadow-xs">Tổng Hợp & Đánh Giá Chỉ Số Thi Đua</h2>
              <p className="text-xs text-slate-600 font-extrabold mt-1">
                Bảng phân dạng báo cáo, kết xuất hồ sơ thi đua tự động của 14 đơn vị thống kê cơ sở
              </p>
            </div>
          </div>
        </div>

        {/* Unified Excel Download button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button 
            type="button"
            onClick={handleExportToExcel}
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>XUẤT BẢNG TÍNH EXCEL</span>
          </button>
        </div>
      </div>

      {/* 4 MODERN MULTI-TABS INTERFACE */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* The 4 Tab buttons */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap p-1.5 bg-slate-100 rounded-2xl gap-1.5 w-full lg:w-auto border border-slate-200">
          <button
            type="button"
            onClick={() => { setSubTab('by-unit'); setSearchTerm(''); }}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border ${subTab === 'by-unit' ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm' : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200 hover:text-slate-900'}`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>1. Theo Đơn Vị</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setSubTab('by-dept-rank'); setSearchTerm(''); }}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border ${subTab === 'by-dept-rank' ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm' : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200 hover:text-slate-900'}`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>2. Theo Phòng</span>
          </button>

          <button
            type="button"
            onClick={() => { setSubTab('by-type-rank'); setSearchTerm(''); }}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border ${subTab === 'by-type-rank' ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm' : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200 hover:text-slate-900'}`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>3. Theo Loại Báo Cáo</span>
          </button>

          <button
            type="button"
            onClick={() => { setSubTab('report-tracking'); setSearchTerm(''); }}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border ${subTab === 'report-tracking' ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm' : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200 hover:text-slate-900'}`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>4. Theo Dõi Báo Cáo</span>
          </button>
        </div>

        {/* Dynamic Filters layout depending on the selected Tab */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
          
          {/* Universal Search bar for titles */}
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={
                subTab === 'report-tracking' 
                  ? "Tìm tên đơn vị hoặc báo cáo..." 
                  : "Tìm nhanh tên đơn vị..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-56 bg-slate-50 border border-slate-350 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold placeholder-slate-400 text-slate-900"
            />
          </div>

          {/* Tab 1 region filter */}
          {subTab === 'by-unit' && (
            <select
              value={regionFilter}
              onChange={(e: any) => setRegionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-350 text-xs rounded-xl px-3 py-2 text-slate-950 font-black focus:outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">👉 Tất cả Vùng</option>
              <option value="VUNG1">Khu vực 1</option>
              <option value="VUNG2">Khu vực 2</option>
            </select>
          )}

          {/* Tab 2 Department filter */}
          {subTab === 'by-dept-rank' && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-sky-50 border border-indigo-300 text-xs rounded-xl px-3 py-2 text-indigo-955 font-black focus:outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
            >
              {departments.map(d => (
                <option key={d.Ma_Phong} value={d.Ma_Phong}>🏢 {d.Ten_Phong}</option>
              ))}
            </select>
          )}

          {/* Tab 3 Report Category filter */}
          {subTab === 'by-type-rank' && (
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="bg-sky-50 border border-indigo-300 text-xs rounded-xl px-3 py-2 text-indigo-955 font-black focus:outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Báo cáo nhanh">⚡ Báo cáo nhanh</option>
              <option value="Báo cáo phân tích">📊 Báo cáo phân tích</option>
              <option value="Báo cáo tháng">📅 Báo cáo tháng</option>
              <option value="Báo cáo năm">🌟 Báo cáo năm</option>
            </select>
          )}

          {/* Tab 4 Tracking Status filter */}
          {subTab === 'report-tracking' && (
            <select
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value)}
              className="bg-indigo-50 border border-indigo-300 text-xs rounded-xl px-3 py-2 text-indigo-950 font-black focus:outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">🔍 Tất cả báo cáo</option>
              <option value="DUE_NOT_SUBMITTED">⚠️ Báo cáo đến hạn chưa gửi</option>
              <option value="ON_TIME">✅ Báo cáo đúng hạn</option>
              <option value="LATE">⏰ Báo cáo trễ hạn</option>
              <option value="UNGRADED">📝 Báo cáo chưa chấm</option>
              <option value="GRADED">⭐ Báo cáo đã chấm</option>
              <option value="NOT_SUBMITTED">❌ Báo cáo chưa gửi</option>
              <option value="SUBMITTED">📥 Báo cáo đã gửi</option>
            </select>
          )}

        </div>
      </div>

      {/* DYNAMIC RESULTS CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-350 shadow-md overflow-hidden text-left">
        
        {/* ==================== VIEW 1: TỔNG HỢP THEO ĐƠN VỊ ==================== */}
        {subTab === 'by-unit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border border-slate-300 border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-xs text-slate-705 font-semibold normal-case">
                  <th className="py-3 px-3 text-center w-12 border border-slate-300 text-slate-700 font-semibold bg-slate-100">STT</th>
                  <th className="py-3 px-3 text-center w-20 border border-slate-300 text-slate-700 font-semibold bg-slate-100">Mã đơn vị</th>
                  <th className="py-3 px-4 text-left border border-slate-300 text-slate-700 font-semibold bg-slate-100">Tên đơn vị Thống kê</th>
                  <th className="py-3 px-3 text-center w-24 border border-slate-300 text-slate-700 font-semibold bg-slate-100">Vùng</th>
                  <th className="py-3 px-3 text-center w-24 border border-slate-300 text-slate-700 font-semibold bg-slate-100">Chỉ tiêu giao</th>
                  <th className="py-3 px-3 text-center bg-sky-100/50 text-sky-950 border border-slate-300 font-semibold">Điểm thời gian</th>
                  <th className="py-3 px-3 text-center bg-indigo-50 text-indigo-950 border border-slate-300 font-semibold">Điểm chất lượng</th>
                  <th className="py-3 px-4 text-center bg-indigo-100 text-indigo-950 border border-slate-300 font-semibold font-sans">Tổng điểm thực đạt</th>
                  <th className="py-3 px-4 text-center w-36 border border-slate-300 text-slate-700 font-semibold font-sans">Chỉ số thi đua (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-sans text-[11.5px]">
                {filteredUnitSummaries.length > 0 ? (
                  filteredUnitSummaries.map((u, index) => (
                    <tr key={u.Ma_DV} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-650 border border-slate-300 bg-slate-50">{index + 1}</td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-indigo-805 border border-slate-300 bg-slate-50">{u.Ma_DV}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 border border-slate-300 bg-white">{u.Ten_Don_Vi}</td>
                      <td className="py-3 px-3 text-center border border-slate-300 bg-white">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold tracking-wide ${u.Vung === 'Khu vực 1' ? 'text-sky-700 bg-sky-50 border border-sky-200' : 'text-slate-800 bg-slate-200 border border-slate-300'}`}>
                          {u.Vung}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 border border-slate-300 bg-white">{u.Tong_Bao_Cao}</td>
                      <td className="py-3 px-3 text-center font-mono bg-sky-50/30 font-semibold text-sky-850 border border-slate-300">{u.Diem_TG}</td>
                      <td className="py-3 px-3 text-center font-mono bg-indigo-50/20 font-semibold text-slate-700 border border-slate-300">{u.Diem_Chat_Luong}</td>
                      <td className="py-3 px-4 text-center font-mono bg-indigo-55/40 text-indigo-950 font-semibold text-xs border border-slate-300">
                        <div className="text-sm font-bold text-indigo-950">{u.Tong_Diem}</div>
                        <span className="text-[9.5px] text-slate-550 font-medium block leading-none mt-0.5">Xếp ĐM {u.Diem_Dinh_Muc}</span>
                      </td>
                      <td className="py-3 px-4 text-center border border-slate-300 bg-emerald-50/20">
                        <span className="font-mono font-bold text-emerald-850 bg-emerald-100/90 border border-emerald-350 px-2.5 py-1 rounded-lg text-[11px] inline-block shadow-sm">
                          {u.Diem_Thi_Dua_Phan_Tram}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-extrabold font-sans border border-slate-300">
                      Không tìm thấy đơn vị nào phù hợp điều kiện lọc!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== VIEW 2: TỔNG HỢP THEO PHÒNG BAN (RANKED 1 - 14) ==================== */}
        {subTab === 'by-dept-rank' && (
          <div className="overflow-x-auto">
            
            {/* Header banner stating chosen department */}
            <div className="bg-indigo-50 p-4 border-b border-slate-300 text-left flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-805 font-black uppercase font-mono tracking-wider block">Lĩnh vực nghiệp vụ phụ trách:</span>
                <strong className="text-base font-black text-indigo-950 font-sans tracking-tight">
                  {departments.find(d => d.Ma_Phong === selectedDept)?.Ten_Phong || 'Lĩnh vực chọn'}
                </strong>
              </div>
              <span className="text-[10px] bg-indigo-700 text-white font-black px-3 py-1 rounded-full uppercase border border-indigo-850 shadow-xs">
                Bảng xếp hạng 14 đơn vị
              </span>
            </div>

            <table className="w-full text-left font-sans text-xs border border-slate-300 border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[11px] text-slate-800 font-extrabold uppercase font-sans tracking-wide">
                  <th className="py-4 px-4 text-center w-24 border border-slate-300 text-slate-800 font-black">Thứ Hạng</th>
                  <th className="py-4 px-3 text-center w-24 border border-slate-300 text-slate-800 font-black">Mã Đơn Vị</th>
                  <th className="py-4 px-4 text-left border border-slate-300 text-slate-800 font-black">Đơn vị thống kê cơ sở</th>
                  <th className="py-4 px-3 text-center w-28 border border-slate-300 text-slate-800 font-black">Tổng Chỉ Tiêu</th>
                  <th className="py-4 px-3 text-center w-28 border border-slate-300 text-slate-800 font-black">Đã Giao Nộp</th>
                  <th className="py-4 px-3 text-center bg-sky-100/60 text-sky-950 border border-slate-300 font-black">Điểm Thời Gian</th>
                  <th className="py-4 px-3 text-center bg-indigo-100/50 text-indigo-950 border border-slate-300 font-black">Điểm Chuyên Môn</th>
                  <th className="py-4 px-4 text-center bg-indigo-100 text-indigo-950 border border-slate-300 font-black">Điểm Thực Đạt</th>
                  <th className="py-4 px-4 text-center border border-slate-300 text-slate-800 font-black">Chỉ Số Thi Đua (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-sans text-[11.5px]">
                {rankedUnitsDept.length > 0 ? (
                  rankedUnitsDept.map((u, index) => {
                    const getRankingBadge = (rank: number) => {
                      if (rank === 1) return 'bg-amber-100 text-amber-900 border border-amber-350 font-black';
                      if (rank === 2) return 'bg-slate-150 text-slate-850 border border-slate-300 font-black';
                      if (rank === 3) return 'bg-orange-105 text-orange-900 border border-orange-350 font-black';
                      return 'bg-slate-100 text-slate-700 font-bold';
                    };

                    return (
                      <tr key={u.Ma_DV} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="py-3 px-4 text-center border border-slate-300 bg-slate-50">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-black ${getRankingBadge(index + 1)}`}>
                            Hạng {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-indigo-805 border border-slate-300 bg-slate-50">{u.Ma_DV}</td>
                        <td className="py-3 px-4 border border-slate-300 bg-white">
                          <div className="font-black text-slate-900 leading-snug">{u.Ten_Don_Vi}</div>
                          <span className="text-[10px] text-slate-500 font-sans block mt-0.5">{u.Vung}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-slate-800 border border-slate-300 bg-white">{u.Tong_Bao_Cao}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-750 font-black border border-slate-300 bg-emerald-50/10">
                          {u.Da_Nop} / {u.Tong_Bao_Cao}
                        </td>
                        <td className="py-3 px-3 text-center font-mono bg-sky-50/30 text-sky-850 font-black border border-slate-300">{u.Diem_TG}</td>
                        <td className="py-3 px-3 text-center font-mono bg-indigo-50/20 text-slate-800 font-black border border-slate-300">{u.Diem_Chat_Luong}</td>
                        <td className="py-3 px-4 text-center font-mono bg-indigo-55/40 text-indigo-950 font-black text-xs border border-slate-300">
                          <div className="text-sm font-black text-indigo-950">{u.Tong_Diem}</div>
                          <span className="text-[9.5px] text-slate-550 font-bold block mt-0.5 text-center leading-none">Max {u.Diem_Dinh_Muc}</span>
                        </td>
                        <td className="py-3 px-4 text-center border border-slate-300 bg-indigo-50/10">
                          <span className="font-mono font-black text-indigo-800 bg-indigo-100 border border-indigo-250 px-2.5 py-1 rounded-lg text-[11px] inline-block shadow-3xs">
                            {u.Diem_Thi_Dua_Phan_Tram}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-sans border border-slate-300">
                      Không tìm thấy dữ liệu xếp hạng theo phòng chuyên môn phù hợp!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== VIEW 3: TỔNG HỢP THEO LOẠI BÁO CÁO (RANKED 1 - 14) ==================== */}
        {subTab === 'by-type-rank' && (
          <div className="overflow-x-auto">
            
            {/* Header banner showing chosen report type */}
            <div className="bg-emerald-50 p-4 border-b border-slate-300 text-left flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-805 font-black uppercase font-mono tracking-wider block">Phân loại chỉ tiêu:</span>
                <strong className="text-base font-black text-emerald-955 font-sans tracking-tight">{selectedReportType}</strong>
              </div>
              <span className="text-[10px] bg-emerald-700 text-white font-black px-3 py-1 rounded-full uppercase border border-emerald-850 shadow-xs">
                Bảng xếp hạng 14 cơ sở
              </span>
            </div>

            <table className="w-full text-left font-sans text-xs border border-slate-300 border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-xs text-slate-705 font-semibold normal-case">
                  <th className="py-3 px-4 text-center w-24 border border-slate-300 text-slate-700 font-semibold">Thứ hạng</th>
                  <th className="py-3 px-3 text-center w-24 border border-slate-300 text-slate-700 font-semibold">Mã đơn vị</th>
                  <th className="py-3 px-4 text-left border border-slate-300 text-slate-700 font-semibold">Đơn vị Thống kê cơ sở</th>
                  <th className="py-3 px-3 text-center w-28 border border-slate-300 text-slate-700 font-semibold">Tổng chỉ tiêu</th>
                  <th className="py-3 px-3 text-center w-28 border border-slate-300 text-slate-700 font-semibold">Đã giao nộp</th>
                  <th className="py-3 px-3 text-center bg-sky-100/50 text-sky-950 border border-slate-300 font-semibold">Điểm thời gian</th>
                  <th className="py-3 px-3 text-center bg-indigo-50 text-indigo-950 border border-slate-300 font-semibold">Điểm chất lượng</th>
                  <th className="py-3 px-4 text-center bg-indigo-100 text-indigo-950 border border-slate-300 font-semibold">Tổng điểm đạt</th>
                  <th className="py-3 px-4 text-center border border-slate-300 text-slate-700 font-semibold">Chỉ số thi đua (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-sans text-[11.5px]">
                {rankedUnitsType.length > 0 ? (
                  rankedUnitsType.map((u, index) => {
                    const getRankingBadge = (rank: number) => {
                      if (rank === 1) return 'bg-amber-100 text-amber-900 border border-amber-305 font-bold';
                      if (rank === 2) return 'bg-slate-150 text-slate-850 border border-slate-300 font-bold';
                      if (rank === 3) return 'bg-orange-105 text-orange-900 border border-orange-355 font-bold';
                      return 'bg-slate-100 text-slate-750 font-bold';
                    };

                    return (
                      <tr key={u.Ma_DV} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center border border-slate-300 bg-slate-50">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${getRankingBadge(index + 1)}`}>
                            Hạng {index + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-indigo-805 border border-slate-300 bg-slate-50">{u.Ma_DV}</td>
                        <td className="py-3.5 px-4 border border-slate-300 bg-white">
                          <div className="font-bold text-slate-800 leading-snug">{u.Ten_Don_Vi}</div>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{u.Vung}</span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700 border border-slate-300 bg-white">{u.Tong_Bao_Cao}</td>
                        <td className="py-3.5 px-3 text-center font-mono text-emerald-750 font-semibold border border-slate-300 bg-emerald-50/10">
                          {u.Da_Nop} / {u.Tong_Bao_Cao}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono bg-sky-50/30 text-sky-850 font-semibold border border-slate-300">{u.Diem_TG}</td>
                        <td className="py-3.5 px-3 text-center font-mono bg-indigo-50/20 text-slate-700 font-semibold border border-slate-300">{u.Diem_Chat_Luong}</td>
                        <td className="py-3.5 px-4 text-center font-mono bg-indigo-55/40 text-indigo-950 font-semibold text-xs border border-slate-300">
                          <div className="text-sm font-bold text-indigo-950">{u.Tong_Diem}</div>
                          <span className="text-[9.5px] text-slate-550 font-medium block mt-0.5 leading-none">ĐM {u.Diem_Dinh_Muc}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center border border-slate-300 bg-indigo-50/10">
                          <span className="font-mono font-bold text-indigo-800 bg-indigo-100 border border-indigo-250 px-2.5 py-1 rounded-lg text-[11px] inline-block shadow-sm">
                            {u.Diem_Thi_Dua_Phan_Tram}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-sans border border-slate-300">
                      Không tìm thấy báo cáo phân loại tương ứng cho các cơ sở!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== VIEW 4: THEO DÕI BÁO CÁO (REPORT TRACKING) ==================== */}
        {subTab === 'report-tracking' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border border-slate-300 border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[11px] text-slate-800 font-extrabold uppercase font-sans tracking-wide">
                  <th className="py-4 px-3 text-center w-12 border border-slate-300 text-slate-850 font-black">STT</th>
                  <th className="py-4 px-4 text-left border border-slate-300 text-slate-850 font-black">Cơ Sở Nộp</th>
                  <th className="py-4 px-4 text-left border border-slate-300 text-slate-850 font-black">Nội Dung Chỉ Tiêu Báo Cáo</th>
                  <th className="py-4 px-3 text-left border border-slate-300 text-slate-850 font-black">Phòng Giao Ban</th>
                  <th className="py-4 px-3 text-center border border-slate-300 text-slate-850 font-black">Kỳ Hạn Nộp</th>
                  <th className="py-4 px-3 text-center border border-slate-300 text-slate-850 font-black">Ngày Nộp</th>
                  <th className="py-4 px-3 text-center border border-slate-300 text-slate-850 font-black">Trạng Thái</th>
                  <th className="py-4 px-3 text-center bg-sky-100/60 text-sky-950 border border-slate-300 font-black">Điểm TG</th>
                  <th className="py-4 px-3 text-center bg-indigo-100/50 text-indigo-950 border border-slate-300 font-black">Điểm CL</th>
                  <th className="py-4 px-4 text-center bg-indigo-100 text-indigo-950 border border-slate-300 font-black">Tổng Đạt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-sans text-[11.5px]">
                {filteredTrackingReports.length > 0 ? (
                  filteredTrackingReports.map((s, index) => {
                    const isSubmitted = s.Ngay_Nop !== null;
                    const isLate = isSubmitted && (s.So_Ngay_Tre ?? 0) > 0;
                    
                    let statusLabel = 'Chưa nộp';
                    let statusClass = 'bg-rose-50 text-rose-800 border-rose-250';

                    if (isSubmitted) {
                      if (isLate) {
                        statusLabel = `Trễ ${s.So_Ngay_Tre} ngày`;
                        statusClass = 'bg-amber-50 text-amber-850 border-amber-300';
                      } else {
                        statusLabel = 'Đúng hạn';
                        statusClass = 'bg-emerald-50 text-emerald-850 border-emerald-300';
                      }
                    }

                    return (
                      <tr key={s.ID} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="py-3 px-3 text-center font-mono font-black text-slate-500 border border-slate-300 bg-slate-50">{index + 1}</td>
                        <td className="py-3 px-4 font-black text-slate-900 border border-slate-300 bg-white">{s.Ten_Don_Vi}</td>
                        <td className="py-3 px-4 border border-slate-300 bg-white">
                          <div className="font-semibold text-slate-900 leading-relaxed font-sans">{s.Ten_Bao_Cao}</div>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{getReportCategory(s)} • Mã: {s.ID}</span>
                        </td>
                        <td className="py-3 px-3 border border-slate-300 bg-white">
                          <span className="font-extrabold text-slate-750">{s.Ten_Phong}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-slate-650 border border-slate-300 bg-white">{s.Han_Nop}</td>
                        <td className="py-3 px-3 text-center font-mono font-black text-slate-800 border border-slate-300 bg-slate-50">
                          {s.Ngay_Nop || <span className="text-slate-400 font-normal italic">Chưa nộp</span>}
                        </td>
                        <td className="py-3 px-3 text-center border border-slate-300 bg-white">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono bg-sky-50/30 text-sky-850 font-black border border-slate-300">
                          {s.Diem_Thoi_Gian !== null ? s.Diem_Thoi_Gian : '-'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono bg-indigo-50/20 text-slate-850 font-black border border-slate-300">
                          {s.Diem_Chat_Luong !== null ? s.Diem_Chat_Luong : (s.Ngay_Nop ? <span className="text-sky-700 italic">Chờ chấm</span> : '-')}
                        </td>
                        <td className="py-3 px-4 text-center font-mono bg-indigo-50 text-indigo-950 font-black border border-slate-300">
                          <div className="text-xs font-black">{s.Tong_Diem !== null ? s.Tong_Diem : '-'}</div>
                          <span className="text-[9px] text-slate-500 font-extrabold block mt-0.5 leading-none">ĐM: {s.Diem_Dinh_Muc}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 font-extrabold font-sans border border-slate-300">
                      Không tìm thấy báo cáo nào khớp điều kiện lọc theo dõi báo cáo!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* SOLID PROFESSIONAL ADVICE BOARD */}
      <div className="bg-slate-50 border border-slate-300 p-5 rounded-2xl flex items-start gap-4 text-left">
        <div className="p-2.5 bg-indigo-100 text-indigo-805 rounded-xl mt-0.5 shadow-2xs border border-indigo-200">
          <Star className="w-5 h-5 text-indigo-700" />
        </div>
        <div className="space-y-1 flex-1">
          <h5 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase leading-snug">Phân Lớp & Thống Kê Theo Quy Trình Chất Lượng</h5>
          <p className="text-xs text-slate-650 leading-relaxed font-medium">
            Mọi chỉ số tổng kết tại bảng thi đua đều được bóc tách theo phòng ban chuyên môn chỉ định hoặc loại tệp báo cáo nhanh/báo cáo phân tích giúp quá trình bình xét điểm số diễn ra minh bạch, rõ ràng. Quyết định phê duyệt thuộc quyền hạn Thống kê Tỉnh Hưng Yên.
          </p>
        </div>
      </div>

    </div>
  );
}
