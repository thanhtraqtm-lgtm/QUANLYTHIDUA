/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ReportSubmission, Unit, Department } from '../types';
import { 
  Trophy, 
  MapPin, 
  Building, 
  Briefcase, 
  Layers, 
  Search, 
  ArrowUpDown, 
  Info, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EmulationScoresProps {
  submissions: ReportSubmission[];
  units: Unit[];
  departments: Department[];
}

const LINH_VUC_LIST = [
  { id: 'ALL', name: 'Tất cả lĩnh vực chuyên môn', depts: [] },
  { id: 'Tong_Hop', name: 'Thống kê Tổng hợp & Phương pháp chế độ', depts: ['P_TH'] },
  { id: 'Cong_Nghiep', name: 'Thống kê Công nghiệp - Xây dựng', depts: ['P_CN'] },
  { id: 'Nong_Lam_Thuy_San', name: 'Thống kê Nông, Lâm nghiệp & Thủy sản', depts: ['P_NNXH'] },
  { id: 'Thuong_Mai_Dich_Vu', name: 'Thống kê Thương mại, Dịch vụ & Giá', depts: ['P_DV'] },
  { id: 'To_Chuc_Hanh_Chinh', name: 'Tổ chức, Hành chính & Cải cách hành chính', depts: ['P_TCHC'] }
];

export default function EmulationScores({ submissions, units, departments }: EmulationScoresProps) {
  // Filter States
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedField, setSelectedField] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sorter State
  const [sortField, setSortField] = useState<'Rank' | 'Ten_Don_Vi' | 'Tong_Bao_Cao' | 'Da_Nop' | 'Nop_Dung_Han' | 'Tong_Diem' | 'Diem_Thi_Dua'>('Rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Drilldown Modal or Collapsible unit details
  const [expandedUnitCode, setExpandedUnitCode] = useState<string | null>(null);

  // Derive unique regions dynamically
  const uniqueRegions = useMemo(() => {
    const set = new Set(units.map(u => u.Vung));
    return ['ALL', ...Array.from(set)];
  }, [units]);

  // Reactive Calculation of Emulation Score for Each Unit under filter conditions
  const processedScores = useMemo(() => {
    // 1. Get filtered submissions under constraints
    let filteredSubs = [...submissions];

    // Filter by Region
    if (selectedRegion !== 'ALL') {
      filteredSubs = filteredSubs.filter(sub => sub.Vung === selectedRegion);
    }

    // Filter by Department (Phòng giao)
    if (selectedDept !== 'ALL') {
      filteredSubs = filteredSubs.filter(sub => sub.Ma_Phong === selectedDept);
    }

    // Filter by Specialty Field (Lĩnh vực)
    if (selectedField !== 'ALL') {
      const fieldObj = LINH_VUC_LIST.find(f => f.id === selectedField);
      if (fieldObj && fieldObj.depts.length > 0) {
        filteredSubs = filteredSubs.filter(sub => fieldObj.depts.includes(sub.Ma_Phong));
      }
    }

    // Since we want to display score status of EACH unit matching the criteria,
    // let's group these filtered submissions by Ma_DV.
    const subsByUnit: { [maDv: string]: ReportSubmission[] } = {};
    units.forEach(u => {
      subsByUnit[u.Ma_DV] = [];
    });

    filteredSubs.forEach(sub => {
      if (subsByUnit[sub.Ma_DV]) {
        subsByUnit[sub.Ma_DV].push(sub);
      }
    });

    // 2. Map units to score rows
    let rows = units.map(unit => {
      const unitSubs = subsByUnit[unit.Ma_DV] || [];
      const totalCount = unitSubs.length;
      
      const submitted = unitSubs.filter(s => s.Ngay_Nop !== null);
      const submittedCount = submitted.length;
      
      const onTimeCount = submitted.filter(s => (s.So_Ngay_Tre ?? 0) <= 0).length;
      const lateCount = submitted.filter(s => (s.So_Ngay_Tre ?? 0) > 0).length;

      const isPast = (dateStr: string) => new Date(dateStr) < new Date('2026-05-25');
      const overdueCount = unitSubs.filter(s => s.Ngay_Nop === null && isPast(s.Han_Nop)).length;
      const pendingCount = unitSubs.filter(s => s.Ngay_Nop === null && !isPast(s.Han_Nop)).length;

      const totalDinhMuc = unitSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
      const totalAchieved = unitSubs.reduce((sum, s) => {
        if (s.Tong_Diem !== null) return sum + s.Tong_Diem;
        return sum; // unsubmitted or overdue is 0
      }, 0);

      // Score index scaled out of 100
      let emulationIndex = 0;
      if (totalDinhMuc > 0) {
        emulationIndex = (totalAchieved / totalDinhMuc) * 100;
      } else {
        // If no reports match under the currently selected filters (e.g. a department that has no reports for this district)
        emulationIndex = -1; // represent as N/A or not active
      }

      const totalDelayedDays = submitted.reduce((sum, s) => sum + (s.So_Ngay_Tre ?? 0), 0);

      return {
        Ma_DV: unit.Ma_DV,
        Ten_Don_Vi: unit.Ten_Don_Vi,
        Vung: unit.Vung,
        Tong_Bao_Cao: totalCount,
        Da_Nop: submittedCount,
        Nop_Dung_Han: onTimeCount,
        Nop_Tre_Han: lateCount,
        Chua_Nop: overdueCount,
        Pending: pendingCount,
        Tong_Diem_Dinh_Muc: totalDinhMuc,
        Tong_Diem: totalAchieved,
        Diem_Thi_Dua: emulationIndex === -1 ? 0 : Math.round(emulationIndex * 10) / 10,
        Has_Data: emulationIndex !== -1,
        So_Ngay_Tre_Tong: totalDelayedDays,
        Rank: 0
      };
    });

    // Filter by Unit name / code search phrase or dropdown unit filter
    if (selectedUnit !== 'ALL') {
      rows = rows.filter(r => r.Ma_DV === selectedUnit);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(r => 
        r.Ten_Don_Vi.toLowerCase().includes(q) || 
        r.Ma_DV.toLowerCase().includes(q)
      );
    }

    // Filter rows by region if chosen is region specific
    if (selectedRegion !== 'ALL') {
      rows = rows.filter(r => r.Vung === selectedRegion);
    }

    // Calculate actual ranking relative to filtered subset
    // Sort descending by score, only ranking elements with active data
    const activeRows = rows.filter(r => r.Has_Data);
    const emptyRows = rows.filter(r => !r.Has_Data);

    const sortedActive = [...activeRows].sort((a, b) => {
      if (b.Diem_Thi_Dua !== a.Diem_Thi_Dua) {
        return b.Diem_Thi_Dua - a.Diem_Thi_Dua;
      }
      return a.So_Ngay_Tre_Tong - b.So_Ngay_Tre_Tong;
    });

    // Assign ranking
    let currentRank = 1;
    sortedActive.forEach((row, idx) => {
      if (idx > 0 && sortedActive[idx - 1].Diem_Thi_Dua !== row.Diem_Thi_Dua) {
        currentRank = idx + 1;
      }
      row.Rank = currentRank;
    });

    // Recombine all elements
    const combined = [...sortedActive, ...emptyRows.map(r => ({ ...r, Rank: 999 }))];

    // Apply main user table sorting on fields
    return combined.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      // Numeric sort with ranking override (Rank = 999 stays bottom usually)
      return sortAsc 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    });

  }, [submissions, units, selectedRegion, selectedUnit, selectedDept, selectedField, searchQuery, sortField, sortAsc]);

  // General Filter metrics summary for selected scope
  const summaryKPI = useMemo(() => {
    let matchedSubs = [...submissions];
    
    if (selectedRegion !== 'ALL') {
      matchedSubs = matchedSubs.filter(s => s.Vung === selectedRegion);
    }
    if (selectedUnit !== 'ALL') {
      matchedSubs = matchedSubs.filter(s => s.Ma_DV === selectedUnit);
    }
    if (selectedDept !== 'ALL') {
      matchedSubs = matchedSubs.filter(s => s.Ma_Phong === selectedDept);
    }
    if (selectedField !== 'ALL') {
      const fieldObj = LINH_VUC_LIST.find(f => f.id === selectedField);
      if (fieldObj && fieldObj.depts.length > 0) {
        matchedSubs = matchedSubs.filter(s => fieldObj.depts.includes(s.Ma_Phong));
      }
    }

    const total = matchedSubs.length;
    const submitted = matchedSubs.filter(s => s.Ngay_Nop !== null);
    const submittedCount = submitted.length;
    const onTime = submitted.filter(s => (s.So_Ngay_Tre ?? 0) <= 0).length;
    const late = submitted.filter(s => (s.So_Ngay_Tre ?? 0) > 0).length;
    
    const isPast = (dateStr: string) => new Date(dateStr) < new Date('2026-05-25');
    const overdue = matchedSubs.filter(s => s.Ngay_Nop === null && isPast(s.Han_Nop)).length;

    const totalDinhMuc = matchedSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
    const totalAchieved = matchedSubs.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);
    
    const emulationRate = totalDinhMuc > 0 ? (totalAchieved / totalDinhMuc) * 100 : 0;

    return {
      total,
      submittedCount,
      onTime,
      late,
      overdue,
      emulationScore: Math.round(emulationRate * 10) / 10,
      completionRate: total > 0 ? Math.round((submittedCount / total) * 100) : 0
    };
  }, [submissions, selectedRegion, selectedUnit, selectedDept, selectedField]);

  // Table Sorter toggle action
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Quick reset for all filters
  const resetAllFilters = () => {
    setSelectedRegion('ALL');
    setSelectedUnit('ALL');
    setSelectedDept('ALL');
    setSelectedField('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6" id="emulation-scores-root">
      
      {/* HEADER HERO BANNER FOR EMULATION SCORES */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md relative overflow-hidden border border-sky-400/10">
        <div className="absolute right-0 top-0 p-6 opacity-5 pointer-events-none">
          <Trophy className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-sky-500/25 text-sky-300 px-3 py-0.5 rounded-full border border-sky-400/20">
              Chuyên mục Tra cứu
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              Công cụ Lọc đa chiều
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black mt-2 tracking-tight">
            TRA CỨU & PHÂN TÍCH ĐIỂM THI ĐUA ĐỊA PHƯƠNG
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Xem điểm thi đua theo thang phần trăm đổi mới dựa trên chỉ số báo cáo hoàn thành chuyên môn. Lọc chi tiết theo địa bàn vùng, từng đơn vị huyện thị, phòng chuyên môn giao việc, hoặc phân tích sâu theo lĩnh vực phụ trách đặc thù.
          </p>
        </div>
      </div>

      {/* MULTI-DIMENSIONAL FILTERS COMPARTMENT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Bộ lọc tính điểm liên thông</h3>
          </div>
          <button 
            onClick={resetAllFilters}
            className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-800 hover:underline transition-all cursor-pointer"
          >
            🔄 Reset bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* FILTER 1: REGION (VÙNG) */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs sm:text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" /> Lọc theo Địa bàn Vùng
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedUnit('ALL'); // reset unit as it's child of region
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10 text-slate-900 font-sans font-semibold cursor-pointer shadow-xs"
            >
              <option value="ALL">👉 Tất cả Vùng (Khu vực 1 & Khu vực 2)</option>
              {uniqueRegions.filter(r => r !== 'ALL').map(r => (
                <option key={r} value={r}>Vùng: {r}</option>
              ))}
            </select>
          </div>

          {/* FILTER 2: UNIT (ĐƠN VỊ THỐNG KÊ) */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs sm:text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-600 shrink-0" /> Lọc theo Đơn vị Cơ sở
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10 text-slate-900 font-sans font-semibold cursor-pointer shadow-xs"
            >
              <option value="ALL">👉 Tất cả Đơn vị cấp huyện (14 Chi cục)</option>
              {units
                .filter(u => selectedRegion === 'ALL' || u.Vung === selectedRegion)
                .map(u => (
                  <option key={u.Ma_DV} value={u.Ma_DV}>{u.Ten_Don_Vi} ({u.Ma_DV})</option>
                ))}
            </select>
          </div>

          {/* FILTER 3: DEPARTMENT (PHÒNG BAN CHUYÊN MÔN) */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs sm:text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-sky-600 shrink-0" /> Lọc theo Phòng Giao Việc
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                if (e.target.value !== 'ALL') {
                  setSelectedField('ALL'); // reset field since room is specific
                }
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10 text-slate-900 font-sans font-semibold cursor-pointer shadow-xs"
            >
              <option value="ALL">👉 Tất cả Phòng ban chuyên môn</option>
              {departments.map(d => (
                <option key={d.Ma_Phong} value={d.Ma_Phong}>{d.Ten_Phong}</option>
              ))}
            </select>
          </div>

          {/* FILTER 4: FIELD OF CHARGE (LĨNH VỰC PHỤ TRÁCH) */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs sm:text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600 shrink-0" /> Lọc theo Lĩnh vực Phụ trách
            </label>
            <select
              value={selectedField}
              onChange={(e) => {
                setSelectedField(e.target.value);
                if (e.target.value !== 'ALL') {
                  setSelectedDept('ALL'); // reset department since field takes precedence
                }
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10 text-slate-900 font-sans font-semibold cursor-pointer shadow-xs"
            >
              {LINH_VUC_LIST.map(f => (
                <option key={f.id} value={f.id}>{f.id === 'ALL' ? '👉 ' : ''}{f.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Text search & layout bar */}
        <div className="relative pt-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 pt-5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-505 shrink-0 text-slate-500 font-bold" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm nhanh tên chi cục hoặc mã đơn vị cần cứu hộ dữ liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* FILTER SCOPE KPI SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Weighted Score */}
        <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs text-slate-600 font-bold uppercase leading-none block">Điểm thi đua TB</span>
            <span className="text-xl sm:text-2xl font-black font-sans text-slate-900 block mt-1.5">{summaryKPI.emulationScore}</span>
            <span className="text-xs text-indigo-700 font-bold">Toàn bộ phạm vi lọc</span>
          </div>
        </div>

        {/* KPI: Completion Rate */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
            <CheckCircle className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs text-slate-600 font-bold uppercase leading-none block">Tỉ lệ hoàn thành</span>
            <span className="text-xl sm:text-2xl font-black font-sans text-slate-900 block mt-1.5">{summaryKPI.completionRate}%</span>
            <span className="text-xs text-emerald-700 font-bold">{summaryKPI.submittedCount} / {summaryKPI.total} báo cáo</span>
          </div>
        </div>

        {/* KPI: On-time vs Late */}
        <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-600 text-white rounded-xl shadow-xs">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs text-slate-600 font-bold uppercase leading-none block">Đúng hạn vs Trễ hạn</span>
            <span className="text-xl sm:text-2xl font-black font-sans text-slate-900 block mt-1.5">{summaryKPI.onTime} đúng</span>
            <span className="text-xs text-amber-700 font-bold">{summaryKPI.late} lần nộp trễ</span>
          </div>
        </div>

        {/* KPI: Overdue alerts */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-5 rounded-xl border border-rose-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-600 text-white rounded-xl shadow-xs">
            <AlertTriangle className="w-5.5 h-5.5 animate-bounce" />
          </div>
          <div>
            <span className="text-xs text-slate-600 font-bold uppercase leading-none block">Chậm nộp / Quá hạn</span>
            <span className="text-xl sm:text-2xl font-black font-sans text-rose-700 block mt-1.5">{summaryKPI.overdue} báo cáo</span>
            <span className="text-xs text-rose-700 font-bold">Cần đôn đốc khẩn cấp</span>
          </div>
        </div>

      </div>

      {/* DETAILED DYNAMIC COMPARISON SCORE CHART */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase">Biểu đồ Trực quan</span>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              📈 Điểm số thi đua thực tế của từng đơn vị theo điều kiện lọc
            </h4>
          </div>
          <div className="text-[10px] text-slate-400 font-mono text-right italic">
            Hiển thị điểm thi đua (0 - 100) của các Chi cục có dữ liệu chỉ tiêu
          </div>
        </div>

        {/* Responsive Custom Vector Chart */}
        <div className="relative w-full h-44 mt-2">
          {processedScores.filter(item => item.Has_Data).length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-xs text-slate-400 italic rounded-xl font-sans">
              Không có dữ liệu biểu đồ cho điều kiện lọc hiện tại.
            </div>
          ) : (
            <svg viewBox="0 0 600 150" className="w-full h-full overflow-visible">
              {/* Grid Horizontal Lines */}
              <line x1="45" y1="10" x2="585" y2="10" stroke="#f8fafc" strokeWidth="1" />
              <line x1="45" y1="40" x2="585" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="45" y1="70" x2="585" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="45" y1="100" x2="585" y2="100" stroke="#cbd5e1" strokeWidth="1.2" />

              {/* Y Axis markings */}
              <text x="20" y="14" fontSize="8" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">100</text>
              <text x="20" y="44" fontSize="8" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">50</text>
              <text x="20" y="74" fontSize="8" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">25</text>
              <text x="20" y="104" fontSize="8" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">0</text>

              {/* Dynamic Bars render for active units */}
              {processedScores.filter(item => item.Has_Data).map((item, idx, arr) => {
                const stepX = arr.length > 10 ? 540 / arr.length : 40;
                const barWidth = arr.length > 10 ? Math.max(10, stepX - 10) : 22;
                
                const val = item.Diem_Thi_Dua;
                const height = (val / 100) * 90; // scale 100% inside 90px height
                const x = 50 + idx * stepX;
                const y = 100 - height;

                const barColor = item.Vung === 'Khu vực 1' ? '#0ea5e9' : '#10b981';

                return (
                  <g key={item.Ma_DV} className="group">
                    {/* Hover tooltip card */}
                    <rect 
                      x={x - 4} 
                      y="5" 
                      width={barWidth + 8} 
                      height="115" 
                      fill="transparent" 
                      className="group-hover:fill-slate-50/70 rounded transition-colors duration-200"
                    />
                    {/* Main Bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={height} 
                      fill={barColor} 
                      rx="2"
                      className="transition-all duration-300" 
                    />
                    {/* Top score labels on hover */}
                    <text 
                      x={x + barWidth / 2} 
                      y={y - 5} 
                      fontSize="8" 
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      textAnchor="middle"
                    >
                      {item.Diem_Thi_Dua.toFixed(1)}
                    </text>
                    {/* Unit short code label below line */}
                    <text 
                      x={x + barWidth / 2} 
                      y="114" 
                      fontSize="7" 
                      fill="#64748b" 
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {item.Ma_DV}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Legend dots */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 mt-2 font-sans">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Vùng Khu vực 1</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Vùng Khu vực 2</span>
            <span className="text-[9px] text-slate-400 font-mono italic">Rê chuột lên cột biểu đồ để coi giá trị cụ thể</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC COMPREHENSIVE RANKS TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="px-5 py-4 bg-slate-100/70 border-b border-indigo-100/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Bảng kê khai tính điểm thi đua chi tiết
            </h4>
            <p className="text-xs text-slate-700 font-sans mt-1">
              Danh mục các chi cục được xếp hạng động. Nhấp vào dòng để xem danh sách báo cáo chi tiết được lập chỉ số tính điểm.
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 bg-sky-100 text-sky-900 font-bold rounded-lg font-mono border border-sky-200">
            Khóa hiển thị: {processedScores.length} đơn vị thống kê
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-800">
                <th className="py-4 px-4 font-bold text-slate-800 text-xs sm:text-[13px] uppercase text-center w-16">
                  <button onClick={() => handleSort('Rank')} className="flex items-center space-x-1 mx-auto hover:text-slate-950 font-extrabold">
                    <span>Hạng</span> <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-4 px-4 font-bold text-slate-800 text-xs sm:text-[13px] uppercase">
                  <button onClick={() => handleSort('Ten_Don_Vi')} className="flex items-center space-x-1 hover:text-slate-950 font-extrabold border-b border-dashed border-slate-300">
                    <span>Chi Cục / Đơn vị</span> <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-4 px-3 font-bold text-slate-800 text-xs sm:text-[13px] uppercase text-center font-extrabold">Địa bàn</th>
                <th className="py-4 px-3 font-bold text-slate-800 text-xs sm:text-[13px] uppercase text-center">
                  <button onClick={() => handleSort('Tong_Bao_Cao')} className="flex items-center space-x-1 mx-auto hover:text-slate-950 font-extrabold">
                    <span>Giao việc</span> <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-4 px-3 font-bold text-slate-800 text-xs sm:text-[13px] uppercase text-center">
                  <button onClick={() => handleSort('Da_Nop')} className="flex items-center space-x-1 mx-auto hover:text-slate-950 font-extrabold">
                    <span>Đã nộp</span> <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-4 px-3 font-extrabold text-emerald-800 text-xs sm:text-[13px] uppercase text-center">
                  <button onClick={() => handleSort('Nop_Dung_Han')} className="flex items-center space-x-1 mx-auto hover:text-emerald-950">
                    <span>Đúng hạn</span> <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-4 px-3 font-extrabold text-amber-800 text-xs sm:text-[13px] uppercase text-center">Trễ hạn</th>
                <th className="py-4 px-3 font-extrabold text-rose-800 text-xs sm:text-[13px] uppercase text-center">Chưa nộp</th>
                <th className="py-4 px-3 font-bold text-slate-800 text-xs sm:text-[13px] uppercase text-center">Trễ tổng</th>
                <th className="py-4 px-4 font-extrabold text-indigo-900 text-xs sm:text-[13px] uppercase text-center bg-indigo-50/50 w-32">
                  <button onClick={() => handleSort('Diem_Thi_Dua')} className="flex items-center space-x-2 mx-auto hover:text-indigo-950">
                    <span>Điểm Thi Đua</span> <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-4 px-4 font-bold text-slate-800 text-xs sm:text-[13px] uppercase text-center w-24">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {processedScores.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-600 font-bold italic text-sm">
                    Không tìm thấy dữ liệu thi đua tương ứng với bộ lọc của bạn.
                  </td>
                </tr>
              ) : (
                processedScores.map((row) => {
                  const isExpanded = expandedUnitCode === row.Ma_DV;
                  
                  // Filter submissions specific to this unit and to matching filter settings for drilldown list
                  const unitDrilldownSubs = submissions.filter(sub => {
                    const matchUnit = sub.Ma_DV === row.Ma_DV;
                    const matchRegion = selectedRegion === 'ALL' || sub.Vung === selectedRegion;
                    const matchDept = selectedDept === 'ALL' || sub.Ma_Phong === selectedDept;
                    
                    let matchField = true;
                    if (selectedField !== 'ALL') {
                      const fieldObj = LINH_VUC_LIST.find(f => f.id === selectedField);
                      if (fieldObj && fieldObj.depts.length > 0) {
                        matchField = fieldObj.depts.includes(sub.Ma_Phong);
                      }
                    }
                    return matchUnit && matchRegion && matchDept && matchField;
                  });

                  return (
                    <React.Fragment key={row.Ma_DV}>
                      {/* TABLE ROW CONTAINER */}
                      <tr 
                        className={`hover:bg-sky-50/45 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-sky-50/50' : ''
                        }`}
                        onClick={() => setExpandedUnitCode(isExpanded ? null : row.Ma_DV)}
                      >
                        {/* RANKING COL */}
                        <td className="py-4 px-4 text-center">
                          {row.Rank === 999 ? (
                            <span className="text-slate-600 font-semibold italic text-xs">N/A</span>
                          ) : row.Rank <= 3 ? (
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-sm ${
                              row.Rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs' :
                              row.Rank === 2 ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-xs' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {row.Rank}
                            </span>
                          ) : (
                            <span className="font-mono text-xs sm:text-sm font-black text-slate-700">{row.Rank}</span>
                          )}
                        </td>

                        {/* UNIT NAME & DETAILS */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900 text-xs sm:text-[14px] leading-tight">{row.Ten_Don_Vi}</span>
                            <span className="text-[11px] text-slate-600 font-mono font-bold mt-1 tracking-tight bg-slate-100 px-2.5 py-0.5 rounded-md w-max">Mã: {row.Ma_DV}</span>
                          </div>
                        </td>

                        {/* REGION AREA */}
                        <td className="py-4 px-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            row.Vung === 'Khu vực 1' 
                              ? 'bg-sky-100 text-sky-800 border-sky-200' 
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                            {row.Vung}
                          </span>
                        </td>

                        {/* COUNTS GIAO VIEC */}
                        <td className="py-4 px-3 text-center font-mono font-bold text-slate-800 text-xs sm:text-sm">{row.Tong_Bao_Cao}</td>
                        <td className="py-4 px-3 text-center font-mono font-bold text-slate-800 text-xs sm:text-sm">{row.Da_Nop}</td>
                        <td className="py-4 px-3 text-center font-mono font-black text-emerald-700 text-xs sm:text-sm">{row.Nop_Dung_Han}</td>
                        <td className="py-4 px-3 text-center font-mono font-black text-amber-700 text-xs sm:text-sm">{row.Nop_Tre_Han}</td>
                        <td className="py-4 px-3 text-center font-mono font-black text-rose-700 text-xs sm:text-sm">
                          {row.Chua_Nop > 0 ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded text-xs animate-pulse font-extrabold">{row.Chua_Nop}</span>
                          ) : '0'}
                        </td>
                        <td className="py-4 px-3 text-center font-mono font-bold text-slate-700 text-xs sm:text-sm">{row.So_Ngay_Tre_Tong}d</td>

                        {/* EMULATION SCORE POINT INDEX SCORE */}
                        <td className="py-4 px-4 text-center bg-slate-50/50">
                          {!row.Has_Data ? (
                            <span className="text-slate-500 italic text-[11px] font-semibold">N/A (Chưa nộp)</span>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="font-sans text-xs sm:text-sm font-black text-slate-900 bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-lg shadow-2xs">
                                {row.Diem_Thi_Dua}
                              </span>
                              {/* progress micro line */}
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    row.Diem_Thi_Dua >= 90 ? 'bg-emerald-500' :
                                    row.Diem_Thi_Dua >= 75 ? 'bg-sky-500' :
                                    row.Diem_Thi_Dua >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${row.Diem_Thi_Dua}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>

                        {/* DRILLDOWN BUTTON TRIGGER */}
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExpandedUnitCode(isExpanded ? null : row.Ma_DV)}
                            className="p-1 px-3 bg-slate-200 hover:bg-sky-150 text-slate-800 hover:text-sky-900 text-xs font-black rounded-lg flex items-center space-x-1.5 mx-auto transition-all cursor-pointer border border-slate-300"
                          >
                            <span>Xem</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* DRILLDOWN SPREADSHEET DETAIL FOR CHOSEN UNIT */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={11} className="py-4 px-5 sm:px-8 bg-slate-100/50">
                            <div className="p-4 bg-white rounded-xl border border-slate-300 space-y-4 shadow-lg">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                                <span className="text-xs sm:text-sm font-black text-indigo-900 font-sans uppercase">
                                  📋 Biên chế chi tiết điểm thi đua — <span className="text-indigo-700">{row.Ten_Don_Vi}</span> ({unitDrilldownSubs.length} chỉ tiêu khớp)
                                </span>
                                <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                                  Bộ lọc: {selectedDept !== 'ALL' ? `Phòng ${selectedDept}` : selectedField !== 'ALL' ? `Lĩnh vực ${selectedField}` : 'Tất cả phòng ban'}
                                </span>
                              </div>

                              {unitDrilldownSubs.length === 0 ? (
                                <div className="py-8 text-center text-slate-500 text-xs sm:text-sm italic font-sans font-semibold">
                                  Không có báo cáo nào khớp với điều kiện lọc chuyên môn nghiệp vụ hiện tại.
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left font-sans text-slate-800 border-collapse table-auto text-xs sm:text-sm">
                                    <thead>
                                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase tracking-wider text-xs">
                                        <th className="py-3 px-3">Nội dung Báo cáo / Tổng điều tra</th>
                                        <th className="py-3 px-2 text-center">Phòng ban giao</th>
                                        <th className="py-3 px-3 text-center">Hạn nộp định mức</th>
                                        <th className="py-3 px-3 text-center">Ngày nộp thực tế</th>
                                        <th className="py-3 px-2 text-center">Định mức</th>
                                        <th className="py-3 px-2 text-center">Điểm TG</th>
                                        <th className="py-3 px-2 text-center">Điểm CL</th>
                                        <th className="py-3 px-3 text-center bg-indigo-50/55">Điểm thi đua</th>
                                        <th className="py-3 px-3">Room thẩm định & Ý kiến</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 font-sans">
                                      {unitDrilldownSubs.map((sub) => {
                                        const dateDisplay = sub.Ngay_Nop 
                                          ? new Date(sub.Ngay_Nop).toLocaleDateString('vi-VN') 
                                          : 'Chưa nộp';
                                        const deadlineDisplay = new Date(sub.Han_Nop).toLocaleDateString('vi-VN');

                                        return (
                                          <tr key={sub.ID} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-3 font-bold text-slate-900 text-xs sm:text-[13px] leading-relaxed max-w-sm">{sub.Ten_Bao_Cao}</td>
                                            <td className="py-3 px-2 text-center text-slate-900 font-extrabold font-mono text-xs">
                                              <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{sub.Ma_Phong}</span>
                                            </td>
                                            <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">{deadlineDisplay}</td>
                                            <td className="py-3 px-3 text-center">
                                              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${
                                                sub.Ngay_Nop
                                                  ? (sub.So_Ngay_Tre ?? 0) > 0 
                                                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                                  : 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                                              }`}>
                                                {dateDisplay}
                                              </span>
                                            </td>
                                            <td className="py-3 px-2 text-center font-mono font-bold text-slate-800">{sub.Diem_Dinh_Muc}</td>
                                            <td className="py-3 px-2 text-center font-mono font-bold text-sky-700">{sub.Diem_Thoi_Gian ?? 0}</td>
                                            <td className="py-3 px-2 text-center font-mono font-bold text-amber-700">{sub.Diem_Chat_Luong ?? 0}</td>
                                            <td className="py-3 px-3 text-center font-mono font-black text-slate-950 bg-indigo-50 text-sm border-x border-indigo-100/50">
                                              {sub.Tong_Diem ?? 0}
                                            </td>
                                            <td className="py-3 px-3 text-slate-900 italic max-w-xs font-medium leading-normal" title={sub.Nhan_Xet}>
                                              {sub.Nhan_Xet || <span className="text-slate-400 font-light">Không có ghi chú</span>}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
