import React, { useState } from 'react';
import { ReportSubmission } from '../types';
import { 
  Building2, 
  Briefcase, 
  Layers, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  FileSpreadsheet, 
  Activity, 
  PlusCircle, 
  Download 
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SummaryMenuProps {
  submissions: ReportSubmission[];
  departments: { Ma_Phong: string; Ten_Phong: string }[];
  units: { Ma_DV: string; Ten_Don_Vi: string; Vung: string }[];
}

type SummarySubTab = 'by-unit' | 'by-dept' | 'by-type';

export default function SummaryMenu({ submissions, departments, units }: SummaryMenuProps) {
  const [subTab, setSubTab] = useState<SummarySubTab>('by-unit');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'VUNG1' | 'VUNG2'>('ALL');

  // --- 1. DATA COMPUTATION FOR GROUPS ---

  // GROUPS A: BY UNIT (14 units)
  const unitSummaries = units.map(u => {
    const uSubs = submissions.filter(s => s.Ma_DV === u.Ma_DV);
    const total = uSubs.length;
    const completed = uSubs.filter(s => s.Ngay_Nop !== null).length;
    const onTime = uSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
    const late = uSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0).length;
    const overdue = uSubs.filter(s => s.Ngay_Nop === null).length; // pending

    const totalDinhMuc = uSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
    const totalDiemThoiGian = uSubs.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0);
    const totalDiemChatLuong = uSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0);
    const totalTongDiem = uSubs.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const onTimeRate = completed > 0 ? (onTime / completed) * 100 : 0;
    const emulationIndex = totalDinhMuc > 0 ? (totalTongDiem / totalDinhMuc) * 100 : 0;
    const totalDaysLate = uSubs.reduce((sum, s) => sum + (s.So_Ngay_Tre ?? 0), 0);

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
      Diem_Thi_Dua_Phan_Tram: Math.round(emulationIndex * 10) / 10,
      Tong_Ngay_Tre: totalDaysLate
    };
  });

  // GROUPS B: BY RESPONSIBLE DEPARTMENT
  const deptSummaries = departments.map(d => {
    const dSubs = submissions.filter(s => s.Ma_Phong === d.Ma_Phong);
    const total = dSubs.length;
    const completed = dSubs.filter(s => s.Ngay_Nop !== null).length;
    const onTime = dSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
    const late = dSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0).length;
    const overdue = dSubs.filter(s => s.Ngay_Nop === null).length;

    const totalDinhMuc = dSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
    const totalDiemThoiGian = dSubs.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0);
    const totalDiemChatLuong = dSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0);
    const totalTongDiem = dSubs.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const avgDaysLate = completed > 0 ? (dSubs.reduce((sum, s) => sum + (s.So_Ngay_Tre ?? 0), 0) / completed) : 0;
    const emulationIndex = totalDinhMuc > 0 ? (totalTongDiem / totalDinhMuc) * 100 : 0;

    return {
      Ma_Phong: d.Ma_Phong,
      Ten_Phong: d.Ten_Phong,
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
      Diem_Thi_Dua_Phan_Tram: Math.round(emulationIndex * 10) / 10,
      TB_Ngay_Tre: Math.round(avgDaysLate * 10) / 10
    };
  });

  // GROUPS C: BY REPORT TYPE
  const reportTypes = Array.from(new Set(submissions.map(s => s.Loai_BC || 'Tháng')));
  const typeSummaries = reportTypes.map(type => {
    const tSubs = submissions.filter(s => s.Loai_BC === type);
    const total = tSubs.length;
    const completed = tSubs.filter(s => s.Ngay_Nop !== null).length;
    const onTime = tSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
    const late = tSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0).length;
    const overdue = tSubs.filter(s => s.Ngay_Nop === null).length;

    const totalDinhMuc = tSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
    const totalDiemThoiGian = tSubs.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0);
    const totalDiemChatLuong = tSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0);
    const totalTongDiem = tSubs.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const emulationIndex = totalDinhMuc > 0 ? (totalTongDiem / totalDinhMuc) * 100 : 0;
    const avgDaysLate = completed > 0 ? (tSubs.reduce((sum, s) => sum + (s.So_Ngay_Tre ?? 0), 0) / completed) : 0;

    return {
      Loai_BC: type,
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
      Diem_Thi_Dua_Phan_Tram: Math.round(emulationIndex * 10) / 10,
      TB_Ngay_Tre: Math.round(avgDaysLate * 10) / 10
    };
  });

  // --- SEARCH AND FILTER RUNS ---
  const filteredUnitSummaries = unitSummaries.filter(u => {
    const matchesSearch = u.Ten_Don_Vi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.Ma_DV.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (regionFilter === 'ALL') return matchesSearch;
    if (regionFilter === 'VUNG1') return matchesSearch && u.Vung === 'Khu vực 1';
    if (regionFilter === 'VUNG2') return matchesSearch && u.Vung === 'Khu vực 2';
    return matchesSearch;
  });

  const filteredDeptSummaries = deptSummaries.filter(d => 
    d.Ten_Phong.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.Ma_Phong.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTypeSummaries = typeSummaries.filter(t => 
    t.Loai_BC.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // --- EXCEL SPECIFIC SUB-EXPORTS ---
  const handleExportSelectedSummaryTable = () => {
    try {
      const wb = XLSX.utils.book_new();

      if (subTab === 'by-unit') {
        const sheetData = filteredUnitSummaries.map((u, i) => ({
          'STT': i + 1,
          'Mã Đơn Vị (Ma_DV)': u.Ma_DV,
          'Tên Đơn Vị': u.Ten_Don_Vi,
          'Vùng Địa Bàn': u.Vung,
          'Tổng Số Chỉ Tiêu Giao': u.Tong_Bao_Cao,
          'Số Lượng Đã Nộp': u.Da_Nop,
          'Nộp Đúng Hạn': u.Dung_Han,
          'Nộp Trễ Hạn': u.Trere_Han,
          'Số Báo Cáo Thiếu (Trễ nộp)': u.Chua_Nop,
          'Tổng Điểm Định Mực GP': u.Diem_Dinh_Muc,
          'Tổng Điểm Thời Gian (Diem_TG)': u.Diem_TG,
          'Tổng Điểm Chất Lượng NV': u.Diem_Chat_Luong,
          'Tổng Điểm Thực Đạt (Tong_Diem)': u.Tong_Diem,
          'Tỷ Lệ Hoàn Thành (%)': `${u.Ti_Le_HT}%`,
          'Chỉ Số Thi Đua Đạt (%)': `${u.Diem_Thi_Dua_Phan_Tram}%`,
          'Tổng Số Ngày Trễ': u.Tong_Ngay_Tre
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, 'Tổng Hợp Theo Đơn Vị');
        XLSX.writeFile(wb, `Tong_hop_Theo_Don_Vi_${new Date().getFullYear()}.xlsx`);
      } 
      else if (subTab === 'by-dept') {
        const sheetData = filteredDeptSummaries.map((d, i) => ({
          'STT': i + 1,
          'Mã Phòng (Ma_Phong)': d.Ma_Phong,
          'Tên Phòng Phụ Trách': d.Ten_Phong,
          'Tổng Số Báo Cáo Đang Giao': d.Tong_Bao_Cao,
          'Độ Phủ Đã Nộp': d.Da_Nop,
          'Số Lượt Đúng Giờ': d.Dung_Han,
          'Giờ Trễ Quá Hạn': d.Chua_Nop,
          'Tổng Điểm Định Mực': d.Diem_Dinh_Muc,
          'Điểm Thời Gian Ghi Nhận': d.Diem_TG,
          'Điểm Nghiệp Vụ Chuyên Môn': d.Diem_Chat_Luong,
          'Tổng Điểm Thu Về': d.Tong_Diem,
          'Hiệu Suất Nộp (%)': `${d.Ti_Le_HT}%`,
          'Chỉ Số Hoạt Động (%)': `${d.Diem_Thi_Dua_Phan_Tram}%`,
          'Bình Quân Ngày Trễ': d.TB_Ngay_Tre
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, 'Tổng Hợp Theo Phòng Nghiệp Vụ');
        XLSX.writeFile(wb, `Tong_hop_Theo_Phong_${new Date().getFullYear()}.xlsx`);
      } 
      else if (subTab === 'by-type') {
        const sheetData = filteredTypeSummaries.map((t, i) => ({
          'STT': i + 1,
          'Loại Báo Cáo (Loai_BC)': t.Loai_BC,
          'Tổng Chỉ Tiêu Phân Giao': t.Tong_Bao_Cao,
          'Tổng Số Báo Cáo Đã Nộp': t.Da_Nop,
          'Thời Hạn Nộp Đúng': t.Dung_Han,
          'Quá Hạn/Chưa Nộp': t.Chua_Nop,
          'Tổng Điểm Định Mực': t.Diem_Dinh_Muc,
          'Điểm Thời Gian đạt': t.Diem_TG,
          'Điểm Thẩm Định chất lượng': t.Diem_Chat_Luong,
          'Điểm Tổng Cộng thực': t.Tong_Diem,
          'Chỉ Số Giao Nộp (%)': `${t.Ti_Le_HT}%`,
          'Chỉ Số Thi Đua (%)': `${t.Diem_Thi_Dua_Phan_Tram}%`,
          'Bình Quân Ngày Trễ (ngày)': t.TB_Ngay_Tre
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, 'Tổng Hợp Theo Loại Báo Cáo');
        XLSX.writeFile(wb, `Tong_hop_Theo_Loai_BC_${new Date().getFullYear()}.xlsx`);
      }
    } catch (e: any) {
      alert(`Không thể xuất excel: ${e.message}`);
    }
  };

  // --- EXCEL DOWNLOAD CURRENT DATA RAW MATRIX ---
  const handleExportExactlyRawFormat = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Exact columns requested: Ma_DV, Ma_Phong, Ten_Bao_Cao, Loai_BC, Han_Nop, Diem_TG, Diem_Dinh_Muc, So_Ngay_Tre
      const requestedRows = submissions.map((s, index) => ({
        'STT': index + 1,
        'Ma_DV': s.Ma_DV,
        'Ma_Phong': s.Ma_Phong,
        'Ten_Bao_Cao': s.Ten_Bao_Cao,
        'Loai_BC': s.Loai_BC,
        'Han_Nop': s.Han_Nop,
        'Diem_TG': s.Diem_Thoi_Gian !== null ? s.Diem_Thoi_Gian : 0,
        'Diem_Dinh_Muc': s.Diem_Dinh_Muc,
        'So_Ngay_Tre': s.So_Ngay_Tre !== null ? s.So_Ngay_Tre : 0
      }));

      const ws = XLSX.utils.json_to_sheet(requestedRows);
      XLSX.utils.book_append_sheet(wb, ws, 'DuLieu_ChiTiet');
      
      // Write file
      XLSX.writeFile(wb, `Du_Lieu_Chi_Tiet_Bao_Cao_Giao_Diem_${new Date().getFullYear()}.xlsx`);
      alert('Đã xuất file bảng kê chi tiết chính xác 8 cột theo yêu cầu!');

    } catch (err: any) {
      alert(`Lỗi xuất Excel: ${err.message}`);
    }
  };


  return (
    <div className="space-y-6" id="summary-management-menu">
      
      {/* SECTION HEADER BLOCK */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="space-y-1.5 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Layers className="w-5 h-5 text-indigo-600" />
            </span>
            <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Menu Tổng hợp Báo cáo chỉ tiêu</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Hệ thống tự động biên dịch, chia nhóm gom số liệu và tổng hợp theo từng tiêu điểm nghiệp vụ phục vụ cơ chế thi đua công bằng.
          </p>
        </div>

        {/* Export exact raw table requested */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button 
            onClick={handleExportExactlyRawFormat}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Tải Excel Chi Tiết 8 Cột</span>
          </button>
        </div>
      </div>

      {/* THREE MAIN MENU SUB-TABS */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap p-1 bg-slate-100/80 rounded-xl gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => { setSubTab('by-unit'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center ${subTab === 'by-unit' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Building2 className="w-4 h-4" />
            <span>Tổng hợp Theo Đơn Vị</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setSubTab('by-dept'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center ${subTab === 'by-dept' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Theo Phòng Phụ trách</span>
          </button>

          <button
            type="button"
            onClick={() => { setSubTab('by-type'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center ${subTab === 'by-type' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Theo Loại báo cáo</span>
          </button>
        </div>

        {/* Right Search Bar Controls mapping */}
        <div className="flex items-center gap-2 w-full sm:w-auto relative">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400"
            />
          </div>

          {/* Region filter specifically for unit subgroup */}
          {subTab === 'by-unit' && (
            <select
              value={regionFilter}
              onChange={(e: any) => setRegionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-2 text-slate-600 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả Vùng</option>
              <option value="VUNG1">Khu vực 1</option>
              <option value="VUNG2">Khu vực 2</option>
            </select>
          )}

          {/* Quick Excel download for this specific summary table */}
          <button 
            type="button"
            onClick={handleExportSelectedSummaryTable}
            title="Xuất bảng tổng hợp hiện tại ra Excel"
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-slate-500"
          >
            <Download className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* MAIN AGGREGATED DISPLAY CONTENT GRID */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
        
        {/* VIEW 1: TỔNG HỢP THEO ĐƠN VỊ */}
        {subTab === 'by-unit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">Mã DV</th>
                  <th className="py-3 px-4">Tên huyện / chi cục / đơn vị</th>
                  <th className="py-3 px-3 text-center">Địa bàn</th>
                  <th className="py-3 px-3 text-center">Giao</th>
                  <th className="py-3 px-3 text-center">Đã Nộp</th>
                  <th className="py-3 px-3 text-center">Đúng hạn</th>
                  <th className="py-3 px-3 text-center">Đế trễ</th>
                  <th className="py-3 px-3 text-center bg-slate-150/50">Trễ hạn (chưa nộp)</th>
                  <th className="py-3 px-3 text-center bg-sky-50 text-indigo-900">Điểm TG</th>
                  <th className="py-3 px-3 text-center bg-indigo-50/40 text-indigo-900">Chuẩn CL</th>
                  <th className="py-3 px-4 text-center bg-indigo-50 text-indigo-700 font-bold border-l border-indigo-100">Tổng điểm</th>
                  <th className="py-3 px-4 text-center border-l border-slate-100">Chỉ số thi đua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-[11.5px]">
                {filteredUnitSummaries.length > 0 ? (
                  filteredUnitSummaries.map((u, index) => (
                    <tr key={u.Ma_DV} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-800">{u.Ma_DV}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-800 leading-snug">{u.Ten_Don_Vi}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${u.Vung === 'Khu vực 1' ? 'text-sky-700 bg-sky-50' : 'text-slate-600 bg-slate-100'}`}>
                          {u.Vung}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">{u.Tong_Bao_Cao}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-600">{u.Da_Nop}</td>
                      <td className="py-3.5 px-3 text-center font-mono">
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          {u.Dung_Han}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-amber-600">{u.Trere_Han}</td>
                      <td className="py-3.5 px-3 text-center font-mono">
                        {u.Chua_Nop > 0 ? (
                          <span className="text-rose-600 font-bold bg-rose-55 px-1.5 py-0.5 rounded animate-pulse">
                            {u.Chua_Nop}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono bg-indigo-50/10 font-semibold text-indigo-700">{u.Diem_TG}</td>
                      <td className="py-3.5 px-3 text-center font-mono bg-indigo-50/5 text-slate-700">{u.Diem_Chat_Luong}</td>
                      <td className="py-3.5 px-4 text-center font-mono bg-indigo-50/50 text-indigo-850 font-black border-l border-indigo-100/50 text-xs">
                        {u.Tong_Diem}
                        <div className="text-[9px] text-slate-400 font-medium font-mono leading-none mt-0.5">Max {u.Diem_Dinh_Muc}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center border-l border-slate-100">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${u.Diem_Thi_Dua_Phan_Tram}%` }} />
                          </div>
                          <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                            {u.Diem_Thi_Dua_Phan_Tram}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-slate-400">Không tìm thấy đơn vị phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: TỔNG HỢP THEO PHÒNG BAN PHỤ TRÁCH */}
        {subTab === 'by-dept' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">Mã Phòng</th>
                  <th className="py-3 px-4">Tên phòng ban nghiệp vụ phụ trách</th>
                  <th className="py-3 px-3 text-center">Tổng báo cáo giao</th>
                  <th className="py-3 px-3 text-center">Đã nhận nộp</th>
                  <th className="py-3 px-3 text-center">Nộp chuẩn thời gian</th>
                  <th className="py-3 px-3 text-center">Quá hạn chưa thu</th>
                  <th className="py-3 px-3 text-center bg-sky-50 text-sky-900 border-l border-sky-100">Điểm TG đạt</th>
                  <th className="py-3 px-3 text-center bg-indigo-50/40 text-indigo-900">Điểm chuyên môn</th>
                  <th className="py-3 px-4 text-center bg-indigo-50 font-black text-indigo-700 border-l border-indigo-100">Tổng điểm</th>
                  <th className="py-3 px-3 text-center">Bình quân ngày trễ</th>
                  <th className="py-3 px-4 text-center border-l border-slate-100">Hiệu suất phòng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-[11.5px]">
                {filteredDeptSummaries.length > 0 ? (
                  filteredDeptSummaries.map((d, index) => (
                    <tr key={d.Ma_Phong} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-800">{d.Ma_Phong}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-800 leading-snug">{d.Ten_Phong}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">{d.Tong_Bao_Cao}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-600">{d.Da_Nop}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-600 font-semibold bg-emerald-50/30">{d.Dung_Han}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-rose-600 font-semibold bg-rose-50/30">{d.Chua_Nop}</td>
                      <td className="py-3.5 px-3 text-center font-mono bg-sky-50/30 text-sky-800 border-l border-sky-100/50">{d.Diem_TG}</td>
                      <td className="py-3.5 px-3 text-center font-mono bg-indigo-50/10 text-slate-600">{d.Diem_Chat_Luong}</td>
                      <td className="py-3.5 px-4 text-center font-mono bg-indigo-50/40 text-indigo-900 font-black border-l border-indigo-100/50">
                        {d.Tong_Diem}
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5 font-medium">Định mức {d.Diem_Dinh_Muc}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono">
                        {d.TB_Ngay_Tre > 0 ? (
                          <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                            {d.TB_Ngay_Tre} ngày
                          </span>
                        ) : (
                          <span className="text-slate-400">0 ngày</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center border-l border-slate-100">
                        <span className="font-mono font-black text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                          {d.Diem_Thi_Dua_Phan_Tram}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-slate-400">Không tìm thấy phòng ban nghiệp vụ phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: TỔNG HỢP THEO LOẠI BÁO CÁO */}
        {subTab === 'by-type' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">Loại báo cáo</th>
                  <th className="py-3 px-3 text-center">Tổng số lượt giao</th>
                  <th className="py-3 px-3 text-center">Đã hoàn thành nộp</th>
                  <th className="py-3 px-3 text-center">Số lượt nộp đúng hạn</th>
                  <th className="py-3 px-3 text-center">Quá hạn chưa nộp</th>
                  <th className="py-3 px-3 text-center bg-sky-50 text-sky-900 border-l border-sky-100">Tổng điểm TG</th>
                  <th className="py-3 px-3 text-center bg-indigo-50/40 text-indigo-900">Tổng điểm CM</th>
                  <th className="py-3 px-4 text-center bg-indigo-50 font-black text-indigo-700 border-l border-indigo-100">Tổng điểm đạt</th>
                  <th className="py-3 px-3 text-center">Trễ hạn bình quân</th>
                  <th className="py-3 px-4 text-center border-l border-slate-100">Chỉ số thi đua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-[11.5px]">
                {filteredTypeSummaries.length > 0 ? (
                  filteredTypeSummaries.map((t, index) => (
                    <tr key={t.Loai_BC} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                          {t.Loai_BC}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">{t.Tong_Bao_Cao}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-600">{t.Da_Nop}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-600 bg-emerald-50/20">{t.Dung_Han}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-rose-600 bg-rose-50/20">{t.Chua_Nop}</td>
                      <td className="py-3.5 px-3 text-center font-mono bg-sky-50/20 text-sky-800 border-l border-sky-100/50">{t.Diem_TG}</td>
                      <td className="py-3.5 px-3 text-center font-mono bg-indigo-50/10 text-slate-600">{t.Diem_Chat_Luong}</td>
                      <td className="py-3.5 px-4 text-center font-mono bg-indigo-50/40 text-indigo-900 font-black border-l border-indigo-100/50">
                        {t.Tong_Diem}
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5 font-medium">Định mức {t.Diem_Dinh_Muc}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono">
                        {t.TB_Ngay_Tre > 0 ? (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1 rounded">
                            {t.TB_Ngay_Tre} ngày
                          </span>
                        ) : (
                          <span className="text-slate-400">0 ngày</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center border-l border-slate-100">
                        <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                          {t.Diem_Thi_Dua_Phan_Tram}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">Không tìm thấy loại báo cáo phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER GENERAL INFO BOX */}
      <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl flex items-start gap-3 text-left">
        <div className="p-2 bg-slate-200 text-slate-600 rounded-xl mt-0.5">
          <Star className="w-4 h-4 text-slate-600" />
        </div>
        <div className="space-y-1">
          <h5 className="font-bold text-slate-700 text-xs">Cơ chế tự xếp hạng và dồn chỉ tiêu liên kết</h5>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
            Các điểm số chỉ tiêu được liên kết song song. Trình Excel chi tiết 8 cột được cấu hình đồng bộ trực tiếp với hệ dữ liệu dán và truyền tệp xlsx, giúp việc quản trị số liệu và đồng bộ hóa báo cáo trở nên linh hoạt nhất có thể.
          </p>
        </div>
      </div>

    </div>
  );
}
