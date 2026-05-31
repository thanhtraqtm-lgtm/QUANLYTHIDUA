/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  SlidersHorizontal, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download, 
  X, 
  Calendar, 
  Percent, 
  Check, 
  ChevronDown,
  Info,
  Sliders,
  Trash2
} from 'lucide-react';
import { ReportSubmission, Department, Unit, User } from '../types';

interface ReportBrowserProps {
  submissions: ReportSubmission[];
  departments: Department[];
  units: Unit[];
  onUpdateSubmission: (id: number, updatedFields: Partial<ReportSubmission>) => void;
  onDeleteSubmission?: (id: number) => void;
  currentUser: User;
  initialGradeStatus?: string;
  initialDept?: string;
  onFilterChange?: (gradeStatus: string, deptCode: string) => void;
}

export default function ReportBrowser({ 
  submissions = [], 
  departments = [], 
  units = [], 
  onUpdateSubmission,
  onDeleteSubmission,
  currentUser,
  initialGradeStatus = 'ALL',
  initialDept = 'ALL',
  onFilterChange
}: ReportBrowserProps) {
  const isAdminOrAssessor = currentUser?.role === 'admin';

  // Custom Deletion Confirmation State
  const [subToDelete, setSubToDelete] = useState<ReportSubmission | null>(null);

  // Filters State
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [selectedGradeStatus, setSelectedGradeStatus] = useState<string>(initialGradeStatus);
  const [selectedReportName, setSelectedReportName] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state if initial props change
  useEffect(() => {
    setSelectedGradeStatus(initialGradeStatus);
  }, [initialGradeStatus]);

  useEffect(() => {
    setSelectedDept(initialDept);
  }, [initialDept]);

  // Sync back to parent when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedGradeStatus, selectedDept);
    }
  }, [selectedGradeStatus, selectedDept]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Selected Submission for "Chấm" / view detail
  const [editingReport, setEditingReport] = useState<ReportSubmission | null>(null);
  const [editNgayNop, setEditNgayNop] = useState('');
  const [editDiemChatLuong, setEditDiemChatLuong] = useState<number>(0);
  const [editNhanXet, setEditNhanXet] = useState('');

  // Auto compile list of unique Regions & Report names from current submissions
  const regionsList = Array.from(new Set(submissions.map(s => s.Vung))).filter(Boolean);
  const reportTemplatesList = Array.from(new Set(submissions.map(s => s.Ten_Bao_Cao))).filter(Boolean);

  // Filter application
  const filteredSubmissions = submissions.filter(sub => {
    // 1. Lọc theo khu vực địa lý
    const matchRegion = selectedRegion === 'ALL' || sub.Vung === selectedRegion;

    // 2. Lọc theo phòng ban chuyên môn
    const matchDept = selectedDept === 'ALL' || sub.Ma_Phong === selectedDept;

    // 3. Lọc theo nghiệp vụ chấm
    let matchGrade = true;
    if (selectedGradeStatus === 'GRADED') {
      matchGrade = sub.Diem_Chat_Luong !== null;
    } else if (selectedGradeStatus === 'NOT_GRADED') {
      matchGrade = sub.Diem_Chat_Luong === null;
    } else if (selectedGradeStatus === 'MONTHLY') {
      matchGrade = sub.Loai_BC.startsWith('Tháng') || sub.Loai_BC === 'Tháng';
    } else if (selectedGradeStatus === 'QUARTERLY') {
      matchGrade = sub.Loai_BC.startsWith('Quý') || sub.Loai_BC === 'Quý';
    } else if (selectedGradeStatus === 'YEARLY') {
      matchGrade = sub.Loai_BC === 'Năm' || sub.Loai_BC === 'Cả năm' || sub.Loai_BC.includes('năm');
    } else if (selectedGradeStatus === 'MONTH_1_9') {
      const matchMonthVal = sub.Loai_BC.match(/Tháng\s+(\d+)/);
      if (matchMonthVal) {
        const m = parseInt(matchMonthVal[1], 10);
        matchGrade = m >= 1 && m <= 9;
      } else {
        matchGrade = sub.Loai_BC.includes('9 tháng') || sub.Loai_BC.includes('6 tháng');
      }
    } else if (selectedGradeStatus === 'MONTH_1_12') {
      const matchMonthVal = sub.Loai_BC.match(/Tháng\s+(\d+)/);
      if (matchMonthVal) {
        const m = parseInt(matchMonthVal[1], 10);
        matchGrade = m >= 1 && m <= 12;
      } else {
        matchGrade = sub.Loai_BC.startsWith('Tháng') || sub.Loai_BC.includes('12 tháng') || sub.Loai_BC === 'Cả năm' || sub.Loai_BC === 'Năm';
      }
    } else if (selectedGradeStatus === 'SUBMITTED') {
      matchGrade = sub.Ngay_Nop !== null;
    } else if (selectedGradeStatus === 'ON_TIME') {
      matchGrade = sub.Ngay_Nop !== null && (sub.So_Ngay_Tre ?? 0) <= 0;
    } else if (selectedGradeStatus === 'OVERDUE') {
      const isPast = new Date(sub.Han_Nop) < new Date('2026-05-25');
      matchGrade = sub.Ngay_Nop === null && isPast;
    } else if (selectedGradeStatus === 'LATE') {
      const isPast = new Date(sub.Han_Nop) < new Date('2026-05-25');
      matchGrade = (sub.Ngay_Nop !== null && (sub.So_Ngay_Tre ?? 0) > 0) || (sub.Ngay_Nop === null && isPast);
    }

    // 4. Lọc theo tên báo cáo cụ thể
    const matchReportSelected = selectedReportName === 'ALL' || sub.Ten_Bao_Cao === selectedReportName;

    // Search query matched on Report Name / Unit Name / Code
    const matchesSearch = 
      sub.Ten_Bao_Cao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.Ten_Don_Vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.Ma_DV.toLowerCase().includes(searchQuery.toLowerCase());

    return matchRegion && matchDept && matchGrade && matchReportSelected && matchesSearch;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredSubmissions.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSubmissions.slice(indexOfFirstRow, indexOfLastRow);

  // Sync index on filters update
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, selectedDept, selectedGradeStatus, selectedReportName, searchQuery]);

  // Handle click on Chấm icon
  const handleOpenChaoModal = (sub: ReportSubmission) => {
    setEditingReport(sub);
    setEditNgayNop(sub.Ngay_Nop || '');
    setEditDiemChatLuong(sub.Diem_Chat_Luong !== null ? sub.Diem_Chat_Luong : sub.Diem_Dinh_Muc / 2);
    setEditNhanXet(sub.Nhan_Xet || '');
  };

  // Direct calculation of points
  const handleApplyPreset = (percent: number, maxScore: number) => {
    const scoreVal = Math.round((percent / 100) * (maxScore / 2) * 10) / 10;
    setEditDiemChatLuong(scoreVal);
  };

  // Keep and submit scores
  const handleSaveAssessment = () => {
    if (!editingReport) return;

    const data: Partial<ReportSubmission> = {};
    const maxThoiGian = editingReport.Diem_Dinh_Muc / 2;
    const maxChatLuong = editingReport.Diem_Dinh_Muc / 2;

    if (editNgayNop) {
      data.Ngay_Nop = editNgayNop;
      // Evaluate delay days
      const limit = new Date(editingReport.Han_Nop);
      const submitDate = new Date(editNgayNop);
      const mGaps = submitDate.getTime() - limit.getTime();
      const rawGaps = Math.ceil(mGaps / (1000 * 3600 * 24));
      const actualGaps = Math.max(0, rawGaps);

      data.So_Ngay_Tre = actualGaps;
      
      // Calculate Diem_Thoi_Gian (-1 pt delay per day, capped to min 0, max is maxThoiGian)
      if (actualGaps > 0) {
        data.Diem_Thoi_Gian = Math.max(0, maxThoiGian - actualGaps);
      } else {
        data.Diem_Thoi_Gian = maxThoiGian;
      }
    } else {
      data.Ngay_Nop = null;
      data.So_Ngay_Tre = null;
      data.Diem_Thoi_Gian = 0;
    }

    data.Diem_Chat_Luong = editDiemChatLuong;
    data.Tong_Diem = Math.round(((data.Diem_Thoi_Gian || 0) + editDiemChatLuong) * 10) / 10;
    data.Nhan_Xet = editNhanXet;

    onUpdateSubmission(editingReport.ID, data);
    setEditingReport(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Tên Báo Cáo', 'Tên Đơn Vị', 'Vùng', 'Phòng Ban', 'Chu Kỳ', 'Hạn Nộp', 'Ngày Nộp', 'Trễ Hạn', 'Định Mức', 'Điểm Thời Gian', 'Điểm Chất Lượng', 'Tổng Điểm', 'Nhận Xét'];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(",")].concat(
          filteredSubmissions.map(s => [
            s.ID,
            `"${s.Ten_Bao_Cao.replace(/"/g, '""')}"`,
            `"${s.Ten_Don_Vi.replace(/"/g, '""')}"`,
            `"${s.Vung}"`,
            `"${s.Ten_Phong}"`,
            s.Loai_BC,
            s.Han_Nop,
            s.Ngay_Nop || 'Chưa nộp',
            s.So_Ngay_Tre || 0,
            s.Diem_Dinh_Muc,
            s.Diem_Thoi_Gian || 0,
            s.Diem_Chat_Luong || 0,
            s.Tong_Diem || 0,
            `"${(s.Nhan_Xet || '').replace(/"/g, '""')}"`
          ].join(","))
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Quan_Ly_Cham_Diem_Thong_Ke.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-level filter metrics count
  const totalGradedCount = filteredSubmissions.filter(s => s.Diem_Chat_Luong !== null).length;
  const avgPoints = filteredSubmissions.length > 0 
    ? Math.round((filteredSubmissions.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0) / filteredSubmissions.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-6" id="quan-ly-cham-diem-panel">
      
      {/* 1. SECTION HEADER TITLES */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-500" />
            XEM CHI TIẾT BÁO CÁO & CHẤM ĐIỂM THI ĐUA
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu thang điểm nộp báo cáo, thẩm duyệt chấm điểm chuyên môn, thống kê trạng thái giao nhận của từng đơn vị thống kê cơ sở.
          </p>
        </div>
        
        {/* CSV Exporter */}
        <button
          onClick={handleExportCSV}
          className="self-start md:self-auto px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-150 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tải CSV Bảng lọc</span>
        </button>
      </div>

      {/* 2. ADVANCED CRITERIA FILTER BLOCKS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        
        {/* Label block indicator */}
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>Bộ lọc thiết lập kiểm duyệt chuyên sâu</span>
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* A. Lọc điểm theo khu vực */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">
              1. Lọc theo khu vực:
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-sans"
            >
              <option value="ALL">Tất cả khu vực địa bàn ({regionsList.length})</option>
              {regionsList.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* B. Lọc điểm theo phòng ban */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">
              2. Lọc theo phòng ban:
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-sans"
            >
              <option value="ALL">Tất cả phòng ban nghiệp vụ ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept.Ma_Phong} value={dept.Ma_Phong}>{dept.Ten_Phong}</option>
              ))}
            </select>
          </div>

          {/* C. Lọc theo nghiệp vụ chấm */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">
              3. Nghiệp vụ chấm điểm:
            </label>
            <select
              value={selectedGradeStatus}
              onChange={(e) => setSelectedGradeStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-sans"
            >
              <option value="ALL">Tất cả trạng thái nghiệp vụ</option>
              <option value="SUBMITTED">✓ Đã nộp báo cáo (Đầy đủ)</option>
              <option value="ON_TIME">✓ Đúng tiến độ (Đúng hạn)</option>
              <option value="GRADED">✓ Được chấm chuyên môn</option>
              <option value="NOT_GRADED">⚠ Chưa chấm chuyên môn</option>
              <option value="MONTHLY">Kỳ báo cáo: Tháng</option>
              <option value="QUARTERLY">Kỳ báo cáo: Quý</option>
              <option value="YEARLY">Kỳ báo cáo: Năm</option>
              <option value="MONTH_1_9">📅 Tách Báo cáo 9 tháng (Tháng 1 - 9)</option>
              <option value="MONTH_1_12">📅 Tách Báo cáo 12 tháng (Tháng 1 - 12)</option>
              <option value="LATE">Chậm tiến độ / Quá hạn (Tổng cộng)</option>
              <option value="OVERDUE">⚠️ Chỉ tiêu Quá Hạn chưa nộp</option>
            </select>
          </div>

          {/* D. Lọc theo báo cáo chấm */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">
              4. Danh mục báo cáo chấm:
            </label>
            <select
              value={selectedReportName}
              onChange={(e) => setSelectedReportName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-sans truncate"
            >
              <option value="ALL">Tất cả báo cáo chỉ tiêu ({reportTemplatesList.length})</option>
              {reportTemplatesList.map(tpl => (
                <option key={tpl} value={tpl}>{tpl}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Dynamic Text Search Keyword to drill-down */}
        <div className="relative pt-2">
          <input 
            type="text"
            placeholder="Tìm nhanh theo từ khóa tên báo cáo, tên huyện, mã chi cục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-sans"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
        </div>

        {/* Live filtered sub-metrics stats */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <div className="flex items-center space-x-2">
            <span>Tìm thấy: <strong className="text-slate-700">{filteredSubmissions.length}</strong> tệp bản ghi.</span>
            <span>•</span>
            <span>Đã chấm: <strong className="text-emerald-600">{totalGradedCount}</strong></span>
            <span>•</span>
            <span>Bình quân: <strong className="text-sky-600">{avgPoints}</strong></span>
          </div>
          <div>Trang {currentPage} / {totalPages}</div>
        </div>

      </div>

      {/* 3. DYNAMIC EXCEL-COMPLIANT TABLE VIEW */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="emulation-report-score-manager-table shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto text-xs font-sans">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase font-mono text-slate-400 font-extrabold tracking-wider">
                <th className="py-4 px-5">Tên Báo Cáo</th>
                <th className="py-4 px-4">Tên đơn vị</th>
                <th className="py-4 px-4">Tên Phòng Ban</th>
                <th className="py-4 px-3 text-center">Điểm Thời Gian</th>
                <th className="py-4 px-3 text-center">Định mức</th>
                <th className="py-4 px-3 text-center">Tổng Điểm</th>
                <th className="py-4 px-4 text-center">Chấm</th>
                <th className="py-4 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-slate-400 font-sans italic">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Không tìm thấy dữ liệu điểm thi đua phù hợp điều kiện lọc chuyên đề.
                  </td>
                </tr>
              ) : (
                currentRows.map((row) => {
                  const isSubmitted = row.Ngay_Nop !== null;
                  const isLate = isSubmitted && (row.So_Ngay_Tre ?? 0) > 0;
                  const isOverdue = !isSubmitted && new Date(row.Han_Nop) < new Date('2026-05-25');
                  
                  return (
                    <tr key={row.ID} className="hover:bg-slate-50/40 transition-colors duration-100">
                      
                      {/* CỘT 1: Tên Báo Cáo */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col max-w-sm">
                          <span className="font-extrabold text-xs text-slate-800 leading-snug">
                            {row.Ten_Bao_Cao}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5 font-mono">
                            Kỳ hạn: {row.Loai_BC} | Hạn nhập: {row.Han_Nop}
                          </span>
                        </div>
                      </td>

                      {/* CỘT 2: Tên đơn vị */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col whitespace-nowrap">
                          <span className="font-semibold text-slate-700 text-xs">
                            {row.Ten_Don_Vi}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Khu vực: <strong className="text-slate-500 font-bold">{row.Vung}</strong> | {row.Ma_DV}
                          </span>
                        </div>
                      </td>

                      {/* CỘT 3: Tên Phòng Ban */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col max-w-[170px]">
                          <span className="text-slate-700 text-xs truncate" title={row.Ten_Phong}>
                            {row.Ten_Phong}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Phòng ban: {row.Ma_Phong}
                          </span>
                        </div>
                      </td>

                      {/* CỘT 4: Điểm Thời Gian */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-bold text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded">
                          {row.Diem_Thoi_Gian !== null ? `${row.Diem_Thoi_Gian}` : '0'}
                        </span>
                      </td>

                      {/* CỘT 5: Định mức */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-medium text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {row.Diem_Dinh_Muc}
                        </span>
                      </td>

                      {/* CỘT 6: Tổng Điểm */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-2 py-1.5 rounded-lg border border-indigo-100">
                          {row.Tong_Diem !== null ? `${row.Tong_Diem}` : '0'}
                        </span>
                      </td>

                      {/* CỘT 7: Chấm */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          
                          {/* Score visual tag */}
                          {row.Diem_Chat_Luong !== null ? (
                            <span className="font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded leading-none border border-emerald-150">
                              Chuyên môn đạt: {row.Diem_Chat_Luong}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic block">
                              Chưa chấm điểm
                            </span>
                          )}

                          {/* Dynamic assessing actions */}
                          <div className="flex items-center space-x-1.5 mt-1 justify-center">
                            <button
                              onClick={() => handleOpenChaoModal(row)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                                isAdminOrAssessor
                                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{isAdminOrAssessor ? 'Chấm điểm' : 'Xem chi tiết'}</span>
                            </button>

                            {(currentUser?.role === 'admin' || (currentUser?.role === 'room' && row.Ma_Phong === currentUser?.deptCode)) && onDeleteSubmission && (
                              <button 
                                onClick={() => setSubToDelete(row)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 rounded-lg transition-colors cursor-pointer shrink-0 border border-rose-100"
                                title="Xóa dòng báo cáo giao này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CỘT 8: Trạng Thái */}
                      <td className="py-3.5 px-4 text-center">
                        {isSubmitted ? (
                          isLate ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Trễ {row.So_Ngay_Tre} ngày</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Đúng hạn</span>
                            </span>
                          )
                        ) : (
                          isOverdue ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center space-x-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Quá hạn đổ</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 border border-slate-200 inline-flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Chờ nộp BC</span>
                            </span>
                          )
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER CONTROL DECK */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trang trước</span>
            </button>
            
            <span className="text-[11px] font-mono font-bold text-slate-500">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>Trang sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 5. INTERACTIVE SCORE ASSESSMENT DRAWER / MODAL DIALOG */}
      <AnimatePresence>
        {editingReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Header Title with Custom Slate Banner */}
              <div className="bg-slate-950 text-white p-5 flex items-center justify-between relative">
                <div>
                  <span className="text-[9px] text-sky-400 font-mono tracking-widest font-extrabold uppercase bg-sky-950/80 px-2 py-0.5 rounded">
                    Phòng chuyên môn: {editingReport.Ma_Phong}
                  </span>
                  <h3 className="text-sm font-black text-white mt-1 leading-snug">
                    {isAdminOrAssessor ? 'THẨM THỨC CHẤM ĐIỂM CHUYÊN MÔN' : 'CHI TIẾT CHỈ TIÊU GIAO ĐIỂM THI ĐUA'}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingReport(null)}
                  className="p-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  ĐÓNG ✕
                </button>
              </div>

              {/* Modal Core Contents */}
              <div className="p-5 space-y-4 text-xs font-sans">
                
                {/* Meta Summary Info */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] font-mono leading-none">Tên báo cáo kinh tế</span>
                      <p className="font-extrabold text-slate-800 leading-snug mt-1">{editingReport.Ten_Bao_Cao}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] font-mono leading-none">Đơn vị huyện / chi cục</span>
                      <p className="font-extrabold text-slate-800 leading-snug mt-1">{editingReport.Ten_Don_Vi} ({editingReport.Ma_DV})</p>
                    </div>
                  </div>
                  <div className="h-[1px] bg-slate-200/50" />
                  <div className="flex justify-between items-center text-[10px]">
                    <span>Chu kỳ kỳ hạn: <strong className="text-slate-700">{editingReport.Loai_BC}</strong></span>
                    <span>Thời hạn nộp tối đa: <strong className="text-rose-600">{editingReport.Han_Nop}</strong></span>
                  </div>
                </div>

                {/* Score breakdown metrics display */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">Định mức</span>
                    <span className="text-md font-black text-slate-800 block mt-0.5">{editingReport.Diem_Dinh_Muc}</span>
                  </div>
                  <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100">
                    <span className="text-[9px] text-sky-600 font-bold block uppercase font-mono">Điểm thời gian</span>
                    <span className="text-md font-black text-sky-800 block mt-0.5">
                      {editingReport.Diem_Thoi_Gian !== null ? `${editingReport.Diem_Thoi_Gian}` : '0'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-150">
                    <span className="text-[9px] text-indigo-600 font-bold block uppercase font-mono">Chuyên môn</span>
                    <span className="text-md font-black text-indigo-800 block mt-0.5">
                      {editingReport.Diem_Chat_Luong !== null ? `${editingReport.Diem_Chat_Luong}` : 'Chưa chấm'}
                    </span>
                  </div>
                </div>

                {/* ADAPTIVE EDITING COMPONENT Segments */}
                {isAdminOrAssessor ? (
                  <div className="space-y-4 border-t border-slate-100 pt-3">
                    
                    {/* Input I: Ngày nộp thực tế */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase font-mono tracking-wide">
                        * Ngày tiếp nhận thực tế:
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={editNgayNop}
                          onChange={(e) => setEditNgayNop(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Input II: Điểm chất lượng */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase font-mono">
                        <span>* Điểm chất lượng chuyên môn (Tối đa {editingReport.Diem_Dinh_Muc / 2}):</span>
                        <span className="text-indigo-600">Đạt {editDiemChatLuong} / {editingReport.Diem_Dinh_Muc / 2}</span>
                      </div>
                      
                      <input
                        type="number"
                        min="0"
                        max={editingReport.Diem_Dinh_Muc / 2}
                        step="0.5"
                        value={editDiemChatLuong}
                        onChange={(e) => setEditDiemChatLuong(Math.min(editingReport.Diem_Dinh_Muc / 2, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />

                      {/* Preset speed points */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(100, editingReport.Diem_Dinh_Muc)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-[10px] text-indigo-700 font-extrabold rounded-lg cursor-pointer transition-colors"
                        >
                          Đạt 100% Định mức
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(90, editingReport.Diem_Dinh_Muc)}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Đạt 90%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(80, editingReport.Diem_Dinh_Muc)}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Đạt 80%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(50, editingReport.Diem_Dinh_Muc)}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Đạt 50%
                        </button>
                      </div>
                    </div>

                    {/* Input III: Nhận xét kiểm chuẩn */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase font-mono col-span text-right">
                        Nhận xét kiểm duyệt & Ghi nhận thi đua:
                      </label>
                      <textarea
                        value={editNhanXet}
                        onChange={(e) => setEditNhanXet(e.target.value)}
                        placeholder="Ví dụ: Nộp sớm đầy đủ chỉ tiêu, dữ liệu được thẩm duyệt chuẩn xác..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500/20 placeholder-slate-400 text-slate-700"
                      />
                    </div>

                  </div>
                ) : (
                  <div className="space-y-3.5 border-t border-slate-100 pt-3">
                    {/* Read-only remarks */}
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-150">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block font-mono">Nhận xét chi tiết chuyên môn:</span>
                      <p className="text-slate-700 font-medium leading-relaxed italic text-xs mt-1">
                        "{editingReport.Nhan_Xet || 'Không có nhận xét bổ sung từ kiểm duyệt viên.'}"
                      </p>
                    </div>
                    
                    {/* Real-time details logs */}
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                      <Info className="w-3.5 h-3.5" />
                      <span>Ngày nộp ghi nhận: <strong className="text-slate-600">{editingReport.Ngay_Nop || 'Chưa thực hiện nộp báo cáo'}</strong></span>
                    </div>
                  </div>
                )}

                {/* Drawer Save Actions Controls footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingReport(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Đóng cửa sổ
                  </button>
                  
                  {isAdminOrAssessor && (
                    <button
                      type="button"
                      onClick={handleSaveAssessment}
                      className="px-4.5 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-extrabold rounded-xl cursor-pointer shadow-md shadow-sky-500/10 transition-all"
                    >
                      Lưu kết quả chấm điểm
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}

        {subToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="bg-linear-to-r from-rose-600 to-rose-700 p-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-white animate-bounce" />
                <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Xác nhận xóa bỏ báo cáo</h3>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                  Bạn có thực sự muốn xóa bỏ vĩnh viễn báo cáo được giao sau đây không? Hành động này sẽ loại bỏ dòng dữ liệu liên quan khỏi hệ thống và không thể khôi phục tự động.
                </p>
                <div className="p-3 bg-rose-50 border border-rose-100/80 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">ID Bản Ghi:</span>
                    <strong className="text-rose-900"># {subToDelete.ID}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Tên Báo Cáo:</span>
                    <strong className="text-slate-900">{subToDelete.Ten_Bao_Cao}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Trực Thuộc Phòng:</span>
                    <span className="text-slate-700 font-semibold">{subToDelete.Ten_Phong}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Đơn Vị Nhận Giao:</span>
                    <strong className="text-slate-900">{subToDelete.Ten_Don_Vi}</strong>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSubToDelete(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteSubmission) {
                        onDeleteSubmission(subToDelete.ID);
                      }
                      setSubToDelete(null);
                    }}
                    className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-rose-500/10"
                  >
                    Xác nhận Xóa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
