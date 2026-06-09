/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ReportSubmission, Department, Unit, User } from '../types';
import { getDepartmentForReport } from '../utils/departmentHelper';
import { 
  Edit3, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  Search, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  FileCheck2, 
  Send, 
  Info,
  PlusCircle,
  Trash2
} from 'lucide-react';

interface SubmissionManagerProps {
  submissions: ReportSubmission[];
  departments: Department[];
  units: Unit[];
  onUpdateSubmission: (id: number, updatedFields: Partial<ReportSubmission>) => void;
  onDeleteSubmission?: (id: number) => void;
  onAddNewSubmission?: (newSub: Omit<ReportSubmission, 'ID'>) => void;
  currentUser: User;
}

export default function SubmissionManager({
  submissions,
  departments,
  units,
  onUpdateSubmission,
  onDeleteSubmission,
  onAddNewSubmission,
  currentUser
}: SubmissionManagerProps) {
  const isTkcs = currentUser?.role === 'tkcs';
  const isRoom = currentUser?.role === 'room';

  // Master Filter States
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Sync unitFilter and deptFilter based on logged-in user roles
  useEffect(() => {
    if (isTkcs && currentUser?.unitCode) {
      setUnitFilter(currentUser.unitCode);
    }
    if (isRoom && currentUser?.deptCode) {
      setDeptFilter(currentUser.deptCode);
    }
  }, [isTkcs, isRoom, currentUser]);

  const currentUnitFilter = isTkcs ? (currentUser?.unitCode || 'ALL') : unitFilter;


  const [editingSubmission, setEditingSubmission] = useState<ReportSubmission | null>(null);
  const [editNgayNop, setEditNgayNop] = useState('');
  const [editDiemChatLuong, setEditDiemChatLuong] = useState(0);
  const [editDiemThoiGian, setEditDiemThoiGian] = useState(0);
  const [editFileDinhKem, setEditFileDinhKem] = useState<string | null>(null);
  const [editNhanXet, setEditNhanXet] = useState('');

  // Confirmation overlays state
  const [submissionToDelete, setSubmissionToDelete] = useState<ReportSubmission | null>(null);
  const [showAllUnitsAssignConfirm, setShowAllUnitsAssignConfirm] = useState<boolean>(false);

  // New report creation form states
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportUnit, setNewReportUnit] = useState('ALL');
  const [newReportDept, setNewReportDept] = useState('P_TH');
  const [newReportFreq, setNewReportFreq] = useState('Tháng');
  const [newReportMaxPoints, setNewReportMaxPoints] = useState(30);
  const [newReportDeadline, setNewReportDeadline] = useState('2026-06-15');
  const [isDeptManuallySelected, setIsDeptManuallySelected] = useState(false);

  const handleTitleChange = (val: string) => {
    setNewReportTitle(val);
    if (!isDeptManuallySelected) {
      const guessed = getDepartmentForReport(val);
      setNewReportDept(guessed.maPhong);
    }
  };

  const executeBulkAssign = () => {
    if (!onAddNewSubmission) return;

    const deptObj = departments.find(d => d.Ma_Phong === newReportDept);
    const tenPhong = deptObj ? deptObj.Ten_Phong : 'Phòng nghiệp vụ';

    units.forEach(u => {
      onAddNewSubmission({
        Ma_DV: u.Ma_DV,
        Ten_Don_Vi: u.Ten_Don_Vi,
        Vung: u.Vung,
        Ma_Phong: newReportDept,
        Ten_Phong: tenPhong,
        Ten_Bao_Cao: newReportTitle.trim(),
        Loai_BC: newReportFreq,
        Han_Nop: newReportDeadline,
        Ngay_Nop: null,
        Diem_Thoi_Gian: 0,
        Diem_Chat_Luong: null,
        Diem_Dinh_Muc: newReportMaxPoints,
        Tong_Diem: null,
        So_Ngay_Tre: null,
        Nhan_Xet: `Được giao bổ sung đồng loạt bởi cán bộ quản trị tỉnh.`
      });
    });
    alert(`Giao chỉ tiêu báo cáo đồng loạt tới 14 Đơn vị Thống kê thành công!`);
    setNewReportTitle('');
    setIsDeptManuallySelected(false);
    setShowAllUnitsAssignConfirm(false);
  };

  const handleAssignNewSubmission = () => {
    if (!newReportTitle.trim()) {
      alert('Vui lòng nhập tên báo cáo nghiệp vụ chuyên môn.');
      return;
    }
    if (!newReportDeadline) {
      alert('Vui lòng định lượng thời hạn quy định nộp.');
      return;
    }
    if (!onAddNewSubmission) return;

    const deptObj = departments.find(d => d.Ma_Phong === newReportDept);
    const tenPhong = deptObj ? deptObj.Ten_Phong : 'Phòng nghiệp vụ';

    if (newReportUnit === 'ALL') {
      setShowAllUnitsAssignConfirm(true);
    } else {
      const unitObj = units.find(u => u.Ma_DV === newReportUnit);
      if (!unitObj) return;

      onAddNewSubmission({
        Ma_DV: unitObj.Ma_DV,
        Ten_Don_Vi: unitObj.Ten_Don_Vi,
        Vung: unitObj.Vung,
        Ma_Phong: newReportDept,
        Ten_Phong: tenPhong,
        Ten_Bao_Cao: newReportTitle.trim(),
        Loai_BC: newReportFreq,
        Han_Nop: newReportDeadline,
        Ngay_Nop: null,
        Diem_Thoi_Gian: 0,
        Diem_Chat_Luong: null,
        Diem_Dinh_Muc: newReportMaxPoints,
        Tong_Diem: null,
        So_Ngay_Tre: null,
        Nhan_Xet: 'Được phân công bổ sung bởi Thống kê Tỉnh.'
      });
      alert(`Đã giao phân công báo cáo "${newReportTitle}" thành công cho riêng đơn vị ${unitObj.Ten_Don_Vi}!`);
      setNewReportTitle('');
      setIsDeptManuallySelected(false);
    }
  };

  const canGradeEditing = currentUser?.role === 'admin' || (currentUser?.role === 'room' && editingSubmission?.Ma_Phong === currentUser?.deptCode);

  // Filter handlers
  const filteredSubmissions = submissions.filter(sub => {
    const matchUnit = currentUnitFilter === 'ALL' || sub.Ma_DV === currentUnitFilter;
    const matchDept = deptFilter === 'ALL' || sub.Ma_Phong === deptFilter;
    
    // Status Logic
    const isPast = new Date(sub.Han_Nop) < new Date('2026-05-25');
    let matchStatus = true;
    if (statusFilter === 'ON_TIME') {
      matchStatus = sub.Ngay_Nop !== null && (sub.So_Ngay_Tre ?? 0) <= 0;
    } else if (statusFilter === 'LATE') {
      matchStatus = sub.Ngay_Nop !== null && (sub.So_Ngay_Tre ?? 0) > 0;
    } else if (statusFilter === 'OVERDUE') {
      matchStatus = sub.Ngay_Nop === null && isPast;
    } else if (statusFilter === 'PENDING') {
      matchStatus = sub.Ngay_Nop === null && !isPast;
    }

    const matchSearch = sub.Ten_Bao_Cao.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        sub.Ten_Don_Vi.toLowerCase().includes(searchQuery.toLowerCase());

    return matchUnit && matchDept && matchStatus && matchSearch;
  });

  // Pagination calculators
  const totalPages = Math.ceil(filteredSubmissions.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSubmissions.slice(indexOfFirstRow, indexOfLastRow);

  const handleEditClick = (sub: ReportSubmission) => {
    setEditingSubmission(sub);
    setEditNgayNop(sub.Ngay_Nop || '');
    setEditDiemChatLuong(sub.Diem_Chat_Luong || 0);
    setEditDiemThoiGian(sub.Diem_Thoi_Gian !== null ? sub.Diem_Thoi_Gian : sub.Diem_Dinh_Muc);
    setEditNhanXet(sub.Nhan_Xet || '');
    setEditFileDinhKem(sub.File_Dinh_Kem || null);
  };

  const handleApplyPreset = (percent: number, maxScore: number) => {
    const calcScore = Math.round((percent / 100) * maxScore * 10) / 10;
    setEditDiemChatLuong(calcScore);
  };

  const handleSaveEdit = () => {
    if (!editingSubmission) return;

    const updated: Partial<ReportSubmission> = {};
    if (editNgayNop) {
      updated.Ngay_Nop = editNgayNop;
      // Calculate delay days
      const deadline = new Date(editingSubmission.Han_Nop);
      const submissionDate = new Date(editNgayNop);
      
      const timeDiff = submissionDate.getTime() - deadline.getTime();
      const delayDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      updated.So_Ngay_Tre = Math.max(0, delayDays);
    } else {
      updated.Ngay_Nop = null;
      updated.So_Ngay_Tre = null;
    }

    updated.Diem_Thoi_Gian = editDiemThoiGian;
    updated.Diem_Chat_Luong = editDiemChatLuong;
    updated.Tong_Diem = Math.round((editDiemThoiGian + editDiemChatLuong) * 10) / 10;
    updated.Nhan_Xet = editNhanXet;
    if (editFileDinhKem) {
      updated.File_Dinh_Kem = editFileDinhKem;
    }

    onUpdateSubmission(editingSubmission.ID, updated);
    setEditingSubmission(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="submissions-manager-frame">
      
      {/* LEFT 3 COLS: Submission Master logs List Table */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Filters control deck summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Filter 1: Unit selection */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold font-sans uppercase">Đơn vị Thống kê</label>
              {isTkcs ? (
                <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold font-sans">
                  {currentUser?.displayName}
                </div>
              ) : (
                <select 
                  value={unitFilter}
                  onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-700 outline-none"
                >
                  <option value="ALL">Tất cả đơn vị (14)</option>
                  {units.map(u => <option key={u.Ma_DV} value={u.Ma_DV}>{u.Ten_Don_Vi}</option>)}
                </select>
              )}
            </div>

            {/* Filter 2: Department selection */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold font-sans uppercase">Phòng chuyên môn</label>
              {isRoom ? (
                <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold font-sans">
                  {departments.find(d => d.Ma_Phong === currentUser?.deptCode)?.Ten_Phong || 'Bộ phận chuyên môn'}
                </div>
              ) : (
                <select 
                  value={deptFilter}
                  onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-700 outline-none"
                >
                  <option value="ALL">Tất cả Phòng ban</option>
                  {departments.map(d => <option key={d.Ma_Phong} value={d.Ma_Phong}>{d.Ten_Phong}</option>)}
                </select>
              )}
            </div>

            {/* Filter 3: Submission Deadline status */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold font-sans uppercase">Trạng thái Giao điểm</label>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả tiến độ</option>
                <option value="ON_TIME">Nộp đúng / trước hạn</option>
                <option value="LATE">Chậm hạn (Nop trễ)</option>
                <option value="OVERDUE">⚠️ Quá hạn chưa nộp</option>
                <option value="PENDING">Chờ nộp (Chưa đến hạn)</option>
              </select>
            </div>

          </div>

          <div className="relative">
            <input 
              type="text"
              placeholder="Gõ từ khóa tên báo cáo hoặc tên cơ sở để lọc nhanh..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-sans"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

        </div>

        {/* Master Log Table list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-300 table-auto text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-xs font-sans text-slate-700 font-semibold normal-case">
                  <th className="py-3 px-4 border border-slate-300 font-semibold">Báo cáo chỉ tiêu</th>
                  <th className="py-3 px-4 min-w-[150px] border border-slate-300 font-semibold">Đơn vị nộp</th>
                  <th className="py-3 px-3 text-center border border-slate-300 font-semibold">Phòng</th>
                  <th className="py-3 px-3 text-center border border-slate-300 font-semibold">Hạn nộp</th>
                  <th className="py-3 px-3 text-center border border-slate-300 font-semibold">Ngày thực tế</th>
                  <th className="py-3 px-3 text-center border border-slate-300 font-semibold">Định mức</th>
                  <th className="py-3 px-3 text-center border border-slate-300 font-semibold">Tổng điểm</th>
                  <th className="py-3 px-4 text-center w-20 border border-slate-300 font-semibold">Lựa chọn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-sans italic">
                      Không tìm thấy chỉ số kiểm chuẩn giao điểm phù hợp điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  currentRows.map((row) => {
                    const isOverdue = row.Ngay_Nop === null && new Date(row.Han_Nop) < new Date('2026-05-25');
                    
                    return (
                      <tr key={row.ID} className="hover:bg-slate-50/50 transition-colors duration-100">
                        
                        {/* Report description */}
                        <td className="py-4 px-5 border border-slate-300">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-700 leading-normal">{row.Ten_Bao_Cao}</span>
                            <span className="text-[10px] text-slate-400 font-sans mt-0.5">Loại kỳ hạn: {row.Loai_BC}</span>
                          </div>
                        </td>

                        {/* Unit name */}
                        <td className="py-4 px-4 border border-slate-300">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700 text-xs">{row.Ten_Don_Vi}</span>
                            <span className="text-[10px] text-slate-400 font-sans mt-0.5">{row.Vung} (Mã: {row.Ma_DV})</span>
                          </div>
                        </td>

                        {/* Department code */}
                        <td className="py-4 px-3 text-center text-slate-500 font-medium border border-slate-300">
                          {row.Ma_Phong}
                        </td>

                        {/* Deadline Date */}
                        <td className="py-4 px-3 text-center font-mono text-slate-600 border border-slate-300">
                          {new Date(row.Han_Nop).toLocaleDateString('vi-VN')}
                        </td>

                        {/* Submission status and actual date */}
                        <td className="py-4 px-3 text-center border border-slate-300">
                          {row.Ngay_Nop ? (
                            <div className="flex flex-col items-center">
                              <span className="font-mono font-semibold text-slate-800">
                                {new Date(row.Ngay_Nop).toLocaleDateString('vi-VN')}
                              </span>
                              {row.So_Ngay_Tre && row.So_Ngay_Tre > 0 ? (
                                <span className="text-[9px] text-amber-600 font-sans font-semibold bg-amber-50 px-1 py-0.5 rounded mt-0.5">
                                  Trễ {row.So_Ngay_Tre} ngày
                                </span>
                              ) : (
                                <span className="text-[9px] text-emerald-600 font-sans font-semibold bg-emerald-50 px-1 py-0.5 rounded mt-0.5">
                                  Đúng hạn
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={`px-2 py-1 rounded-[6px] text-[10px] font-sans font-bold flex items-center justify-center space-x-1 mx-auto w-fit ${
                              isOverdue ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isOverdue && <AlertTriangle className="w-3 h-3 mr-0.5" />}
                              <span>{isOverdue ? 'Khẩn: Quá hạn' : 'Chờ nộp'}</span>
                            </span>
                          )}
                        </td>

                        {/* Benchmark Max Points */}
                        <td className="py-4 px-3 text-center font-mono text-slate-500 border border-slate-300">
                          {row.Diem_Dinh_Muc}
                        </td>

                        {/* Evaluated Total Points */}
                        <td className="py-4 px-3 text-center border border-slate-300">
                          {row.Tong_Diem !== null ? (
                            <span className="font-mono font-extrabold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-xs">
                              {row.Tong_Diem}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans">-</span>
                          )}
                        </td>

                         {/* Actions score edit button */}
                        <td className="py-4 px-5 text-center font-sans border border-slate-300">
                          {isTkcs ? (
                            row.Ngay_Nop ? (
                              <button 
                                onClick={() => handleEditClick(row)}
                                className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                <Info className="w-3.5 h-3.5 text-slate-500" />
                                <span>Chi tiết</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleEditClick(row)}
                                className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs border border-emerald-150"
                              >
                                <Send className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                                <span>Nộp ngay</span>
                              </button>
                            )
                          ) : (
                            // Admin or Room of this report can Grade. Other Room can only see details.
                            <div className="flex items-center justify-center space-x-1.5">
                              {currentUser?.role === 'admin' || (currentUser?.role === 'room' && row.Ma_Phong === currentUser?.deptCode) ? (
                                <button 
                                  onClick={() => handleEditClick(row)}
                                  className="inline-flex items-center space-x-1 bg-sky-50 text-sky-700 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                                  <span>Chấm</span>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleEditClick(row)}
                                  className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                                >
                                  <Info className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Xem</span>
                                </button>
                              )}
                              {(currentUser?.role === 'admin' || (currentUser?.role === 'room' && row.Ma_Phong === currentUser?.deptCode)) && onDeleteSubmission && (
                                <button 
                                  onClick={() => setSubmissionToDelete(row)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 rounded-lg transition-colors cursor-pointer shrink-0 border border-rose-100/50"
                                  title="Xóa dòng báo cáo giao này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination layout */}
          {totalPages > 1 && (
            <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-sans">
                Đang xem dòng <span className="font-semibold text-slate-700">{indexOfFirstRow + 1}</span> - <span className="font-semibold text-slate-700">{Math.min(indexOfLastRow, filteredSubmissions.length)}</span> trong tổng {filteredSubmissions.length} dòng
              </span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 select-none hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold text-slate-600 px-2">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 select-none hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* RIGHT 1 COL: Scoring Sidebar Panel */}
      <div className="lg:col-span-1">
        {editingSubmission ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-5 sticky top-6 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-1002">
              <h4 className="text-xs font-extrabold text-slate-900 font-sans uppercase tracking-tight flex items-center gap-1.5">
                {isTkcs 
                  ? (editingSubmission.Ngay_Nop ? '📄 Chi tiết điểm chấm' : '📬 Khai báo nộp báo cáo')
                  : '✏️ Form Chấm Điểm'
                }
              </h4>
              <button 
                onClick={() => setEditingSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target submission description meta */}
            <div className="space-y-2 text-xs font-sans">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Chỉ tiêu / Đơn vị</p>
              <h5 className="font-bold text-slate-800 leading-snug">{editingSubmission.Ten_Bao_Cao}</h5>
              <p className="text-slate-500 font-medium">Bên nộp: <span className="text-indigo-700 font-bold">{editingSubmission.Ten_Don_Vi}</span></p>
              <p className="text-slate-500 font-medium">Hạn Định: <span className="text-rose-600 font-semibold font-mono">{new Date(editingSubmission.Han_Nop).toLocaleDateString('vi-VN')}</span></p>
              <p className="text-slate-500 font-medium">Thang định mức: <span className="font-extrabold text-slate-800 font-mono">{editingSubmission.Diem_Dinh_Muc} điểm</span></p>
              
              {editingSubmission.File_Dinh_Kem && (
                <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-xl mt-2 animate-in fade-in duration-200">
                  <span className="text-[9px] text-sky-700 font-black uppercase block leading-none">📁 Tải liệu Đính Kèm</span>
                  <div className="flex items-center justify-between text-[11px] font-sans text-sky-900 mt-1.5 gap-2">
                    <span className="font-extrabold truncate text-slate-800" title={editingSubmission.File_Dinh_Kem}>
                      {editingSubmission.File_Dinh_Kem}
                    </span>
                    <button 
                      type="button"
                      onClick={() => alert(`Đang tải tệp về máy tính người dùng: ${editingSubmission.File_Dinh_Kem}`)}
                      className="px-2 py-1 bg-sky-600 text-white hover:bg-sky-700 rounded-lg text-[9px] font-black transition-all cursor-pointer flex items-center shrink-0"
                    >
                      Mở / Tải
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-3 border-t border-slate-100">
              
              {/* Field 1: Submitting Date picker */}
              {isTkcs && editingSubmission.Ngay_Nop ? (
                <div className="space-y-1.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Ngày nộp thực tế</span>
                  <span className="text-xs font-sans font-extrabold text-slate-800">
                    {new Date(editingSubmission.Ngay_Nop).toLocaleDateString('vi-VN')}
                  </span>
                  {editingSubmission.So_Ngay_Tre && editingSubmission.So_Ngay_Tre > 0 ? (
                    <span className="text-[9px] text-rose-600 font-sans font-bold bg-rose-50 px-1.5 py-0.5 rounded ml-2">
                      Muộn {editingSubmission.So_Ngay_Tre} ngày
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-600 font-sans font-bold bg-emerald-50 px-1.5 py-0.5 rounded ml-2">
                      Đúng hạn
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block">
                    {isTkcs ? 'Chọn Ngày Nộp Báo Cáo' : 'Khai báo Ngày Nộp Thực Tế'}
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={editNgayNop} // Default to current emulated system time May 25, 2026
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditNgayNop(val);
                        if (val) {
                          const deadline = new Date(editingSubmission.Han_Nop);
                          const submissionDate = new Date(val);
                          const timeDiff = submissionDate.getTime() - deadline.getTime();
                          const delayDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                          const calculated = delayDays > 0 
                            ? Math.max(0, editingSubmission.Diem_Dinh_Muc - (delayDays * 2))
                            : editingSubmission.Diem_Dinh_Muc;
                          setEditDiemThoiGian(calculated);
                        } else {
                          setEditDiemThoiGian(0);
                        }
                      }}
                      disabled={!(isTkcs ? !editingSubmission.Ngay_Nop : canGradeEditing)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed font-mono"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-sans block leading-normal pt-0.5 italic">
                    {isTkcs 
                      ? '* Vui lòng chọn ngày nộp thực tế để thực hiện quy trình nộp.'
                      : '* Trực tiếp tính ngày nộp muộn để phạt điểm thời hạn nộp tự động.'
                    }
                  </p>
                </div>
              )}

              {/* Field 2 & 3 custom controls according to role */}
              {isTkcs ? (
                // TKCS READ ONLY DISPLAYS
                <div className="space-y-3.5 pt-2">
                  {/* File Upload Attachment simulator box */}
                  {!editingSubmission.Ngay_Nop && (
                    <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] text-slate-800 font-black font-sans uppercase block">📄 Đính kèm tệp gửi báo cáo</span>
                      <div className="border border-dashed border-indigo-200 hover:border-indigo-400/80 rounded-xl p-3 bg-white text-center transition-colors">
                        {editFileDinhKem ? (
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-extrabold text-indigo-900 truncate max-w-[150px]" title={editFileDinhKem}>
                              📎 {editFileDinhKem}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => setEditFileDinhKem(null)} 
                              className="text-[10px] font-black text-rose-600 hover:underline cursor-pointer flex items-center shrink-0"
                            >
                              Gỡ bỏ
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 font-sans font-medium">Kéo thả tệp báo cáo bản số hoặc chọn tệp nhanh mẫu:</p>
                            <div className="flex gap-1.5 justify-center">
                              <button 
                                type="button" 
                                onClick={() => {
                                  const filename = `BC_${editingSubmission.Loai_BC.replace(/\s+/g,"")}_Signed_${editingSubmission.Ma_DV}.pdf`;
                                  setEditFileDinhKem(filename);
                                }}
                                className="px-2 py-1 text-[9px] bg-sky-50 hover:bg-sky-100 text-sky-700 rounded font-sans font-black transition-colors cursor-pointer"
                              >
                                📑 Đính kèm .PDF
                              </button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const filename = `BieuSoLieu_${editingSubmission.Loai_BC.replace(/\s+/g,"")}_Data_${editingSubmission.Ma_DV}.xlsx`;
                                  setEditFileDinhKem(filename);
                                }}
                                className="px-2 py-1 text-[9px] bg-teal-50 hover:bg-teal-100 text-teal-700 rounded font-sans font-black transition-colors cursor-pointer"
                              >
                                📊 Đính kèm .XLSX
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {editingSubmission.Ngay_Nop && editingSubmission.File_Dinh_Kem && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Tệp đính kèm đã gửi</span>
                      <span className="text-xs font-mono font-extrabold text-slate-800">
                        📎 {editingSubmission.File_Dinh_Kem}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Điểm Thời Gian Nộp</span>
                    <span className="text-xs font-mono font-extrabold text-slate-800">
                      {editingSubmission.Diem_Thoi_Gian !== null ? editingSubmission.Diem_Thoi_Gian : 'Chưa xếp điểm nộp'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Điểm Chất Lượng Thẩm Định</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono font-extrabold ${editingSubmission.Diem_Chat_Luong !== null ? 'text-slate-800' : 'text-slate-400 font-normal italic'}`}>
                        {editingSubmission.Diem_Chat_Luong !== null ? editingSubmission.Diem_Chat_Luong : 'Chờ giám khảo thẩm định...'}
                      </span>
                      {editingSubmission.Diem_Chat_Luong !== null && (
                        <span className="text-[10px] text-slate-400">/ Thang {editingSubmission.Diem_Dinh_Muc}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Phản Hồi & Nhận Xét của Admin</span>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-[11px] leading-relaxed italic">
                      {editingSubmission.Nhan_Xet || 'Chưa có ghi chú kiểm chuẩn từ cán bộ chấm thi đua.'}
                    </div>
                  </div>

                  {/* Safety locking warning */}
                  <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-1.5 text-indigo-700 text-[9px] leading-normal">
                    <Info className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span>
                      Điểm thi đua được khóa bảo mật. Bạn chỉ có quyền khai báo nộp báo cáo chỉ tiêu. Ý kiến chấm điểm và thang đánh giá chất lượng thuộc thẩm quyền của Thống kê Tỉnh Hưng Yên.
                    </span>
                  </div>
                </div>
              ) : (
                // ADMIN INTERACTIVE SCORING OPTIONS
                <>
                  {/* Field 2A: Custom numerical Time score can be manually overridden/entered as requested by user */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-800 font-black font-sans uppercase block">
                      1. Điểm Thời gian (Chủ động Tự trừ điểm / Ghi nhận)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number"
                        step="0.5"
                        min="0"
                        max={editingSubmission.Diem_Dinh_Muc}
                        value={editDiemThoiGian}
                        onChange={(e) => setEditDiemThoiGian(Math.min(editingSubmission.Diem_Dinh_Muc, Math.max(0, parseFloat(e.target.value) || 0)))}
                        disabled={!canGradeEditing}
                        className="w-20 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-center outline-none"
                      />
                      <span className="text-[11px] text-slate-500 font-sans">/ Max định mức: <span className="font-bold text-slate-700 block sm:inline">{editingSubmission.Diem_Dinh_Muc}</span></span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-sans leading-normal italic">
                      * Đề xuất dựa trên ngày nộp. Giám khảo tự điều chỉnh nhập thủ công để cộng phạt điểm thời hạn theo đúng quy chế thi đua.
                    </p>
                  </div>

                  {/* Field 2B: Custom numerical Quality score grading dials */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-800 font-black font-sans uppercase block">2. Điểm khảo sát Chất Lượng</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number"
                        step="0.1"
                        min="0"
                        max={editingSubmission.Diem_Dinh_Muc}
                        value={editDiemChatLuong}
                        onChange={(e) => setEditDiemChatLuong(Math.min(editingSubmission.Diem_Dinh_Muc, Math.max(0, parseFloat(e.target.value) || 0)))}
                        disabled={!canGradeEditing}
                        className="w-20 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-center"
                      />
                      <span className="text-[11px] text-slate-500 font-sans">/ Max: <span className="font-bold text-slate-700">{editingSubmission.Diem_Dinh_Muc}</span></span>
                    </div>

                    {/* Direct Dial presets shortcuts helper */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-sans block uppercase font-medium">Bố cục Gợi ý Đánh giá:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button 
                          type="button" 
                          onClick={() => handleApplyPreset(100, editingSubmission.Diem_Dinh_Muc)}
                          disabled={!canGradeEditing}
                          className="px-1.5 py-1 text-[9px] font-sans font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors text-center cursor-pointer"
                        >
                          Loại A (100%)
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleApplyPreset(85, editingSubmission.Diem_Dinh_Muc)}
                          disabled={!canGradeEditing}
                          className="px-1.5 py-1 text-[9px] font-sans font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors text-center cursor-pointer"
                        >
                          Loại B (85%)
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleApplyPreset(70, editingSubmission.Diem_Dinh_Muc)}
                          disabled={!canGradeEditing}
                          className="px-1.5 py-1 text-[9px] font-sans font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors text-center cursor-pointer"
                        >
                          Loại C (70%)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Field 3: Reviewer Comments */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Nhận xét, Thẩm định kiểm chuẩn</label>
                    <textarea 
                      rows={3}
                      value={editNhanXet}
                      onChange={(e) => setEditNhanXet(e.target.value)}
                      disabled={!canGradeEditing}
                      placeholder={canGradeEditing ? "Ghi chú nhận xét lỗi số liệu hoặc biểu dương tiến độ..." : "Bạn không có đặc quyền ghi chú cho phòng ban này."}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed font-sans"
                    />
                  </div>
                </>
              )}

            </div>

            {/* Save Buttons and Reset link */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              {isTkcs ? (
                // Only let them save if the report is not yet submitted
                !editingSubmission.Ngay_Nop && (
                  <button 
                    type="button"
                    onClick={() => {
                      const finalDate = editNgayNop || '2026-05-25';
                      
                      const updated: Partial<ReportSubmission> = {};
                      updated.Ngay_Nop = finalDate;
                      
                      const deadline = new Date(editingSubmission.Han_Nop);
                      const submissionDate = new Date(finalDate);
                      const timeDiff = submissionDate.getTime() - deadline.getTime();
                      const delayDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                      updated.So_Ngay_Tre = Math.max(0, delayDays);

                      // Save customized time score
                      updated.Diem_Thoi_Gian = editDiemThoiGian;

                      // Unit submission resets/holds quality scoring as unassessed or retains older assessment
                      updated.Diem_Chat_Luong = null; 
                      updated.Tong_Diem = editDiemThoiGian; 
                      if (editFileDinhKem) {
                        updated.File_Dinh_Kem = editFileDinhKem;
                      }
                      updated.Nhan_Xet = "Thống kê Cơ Sở đã tự khai nộp báo cáo qua cổng số liệu. Đang chờ Thống kê Tỉnh Hưng Yên chấm điểm chất lượng và phê duyệt.";

                      onUpdateSubmission(editingSubmission.ID, updated);
                      setEditingSubmission(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Nộp báo cáo ngay</span>
                  </button>
                )
              ) : canGradeEditing ? (
                <button 
                  type="button"
                  onClick={handleSaveEdit}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Ghi nhớ & Tính điểm
                </button>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl text-[10px] leading-normal font-medium text-center">
                  Bạn đang xem báo cáo ở chế độ Đọc (Read-only). Quyền chỉnh sửa thuộc về {departments.find(d => d.Ma_Phong === editingSubmission.Ma_Phong)?.Ten_Phong || 'Phòng ban được chỉ định'}.
                </div>
              )}
              <button 
                type="button"
                onClick={() => setEditingSubmission(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-sans text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
              >
                {isTkcs && editingSubmission.Ngay_Nop ? 'Đóng cửa sổ' : 'Hủy bỏ'}
              </button>
            </div>

          </div>
        ) : (
          currentUser?.role === 'admin' && onAddNewSubmission ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 sticky top-6">
              <div className="flex items-center space-x-2 pb-2.5 border-b border-indigo-100">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-900 font-sans uppercase tracking-tight">
                  Giao Chỉ Tiêu Báo Cáo
                </h4>
              </div>

              {/* Form elements with state */}
              <div className="space-y-3.5">
                {/* 1. Ten_Bao_Cao */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Tên báo cáo nghiệp vụ mới</label>
                  <input 
                    type="text"
                    value={newReportTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Báo cáo tình hình xuất khẩu..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-sans outline-none"
                  />
                </div>

                {/* 2. Target Units */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Đơn vị nhận giao</label>
                  <select 
                    value={newReportUnit}
                    onChange={(e) => setNewReportUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 outline-none font-sans"
                  >
                    <option value="ALL">✨ GIAO ĐỒNG LOẠT (TẤT CẢ 14 ĐƠN VỊ)</option>
                    {units.map(u => (
                      <option key={u.Ma_DV} value={u.Ma_DV}>{u.Ten_Don_Vi}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Assigned Department */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Phòng chuyên môn nhận nộp</label>
                  <select 
                    value={newReportDept}
                    onChange={(e) => {
                      setNewReportDept(e.target.value);
                      setIsDeptManuallySelected(true);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 outline-none font-sans"
                  >
                    {departments.map(d => (
                      <option key={d.Ma_Phong} value={d.Ma_Phong}>{d.Ten_Phong}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Loai_BC */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block font-sans">Kỳ hạn nộp</label>
                    <select 
                      value={newReportFreq}
                      onChange={(e) => setNewReportFreq(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 outline-none font-sans"
                    >
                      <option value="Tháng">Tháng</option>
                      <option value="Quý">Quý</option>
                      <option value="Sáu Tháng">Sáu Tháng</option>
                      <option value="Năm">Năm</option>
                      <option value="Đột Xuất">Đột Xuất</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block font-sans">Điểm chuẩn (Đ.mức)</label>
                    <input 
                      type="number"
                      min="1"
                      max="1000"
                      step="any"
                      value={newReportMaxPoints}
                      onChange={(e) => setNewReportMaxPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 outline-none font-sans font-mono"
                      placeholder="Nhập số điểm định mức..."
                    />
                  </div>
                </div>

                {/* 5. Han_Nop */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block font-sans">Hạn nộp báo cáo (Hạn chót)</label>
                  <input 
                    type="date"
                    value={newReportDeadline}
                    onChange={(e) => setNewReportDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-sans outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAssignNewSubmission}
                className="w-full py-2.5 bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-sans text-xs font-black rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                GIAO PHÂN CÔNG CHỈ TIÊU
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-3 flex flex-col justify-center items-center py-16 sticky top-6">
              <div className="p-3 bg-white rounded-full text-slate-400 border border-slate-100 shadow-xs">
                <Calendar className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-700 font-sans block">
                  {isTkcs ? 'Trung tâm nộp tờ trình báo cáo' : 'Bảng điều hướng chấm điểm'}
                </h5>
                <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                  {isTkcs 
                    ? 'Chọn bất kì chỉ định nộp báo cáo nào của chi cục để theo dõi hạn nộp, thực hiện đăng ký và theo dõi phiếu phản hồi và điểm chất lượng.'
                    : 'Nhấp nút Chấm điểm bên cạnh bất kì chỉ tiêu báo cáo nào của các đơn vị để cập nhật ngày nộp, thẩm định điểm chất lượng và phê duyệt thi đua.'
                  }
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {showAllUnitsAssignConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="bg-linear-to-r from-sky-500 to-indigo-650 p-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-white animate-pulse" />
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Xác nhận phân công đồng loạt</h3>
            </div>
            <div className="p-5 space-y-4 font-sans text-xs text-left">
              <p className="text-slate-600 leading-relaxed font-semibold">
                Hệ thống ghi nhận bạn đang yêu cầu phân công đồng loạt báo cáo sau cho <strong className="text-sky-600">tất cả 14 Đơn vị Thống kê</strong>:
              </p>
              <div className="p-3 bg-sky-50 border border-sky-100 text-sky-900 rounded-xl space-y-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Tên báo cáo:</span>
                  <strong className="text-slate-900">{newReportTitle}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Phòng quản lý:</span>
                  <span className="font-medium text-slate-700">{departments.find(d => d.Ma_Phong === newReportDept)?.Ten_Phong || 'Phòng nghiệp vụ'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Định mức / Hạn nộp:</span>
                  <strong className="text-indigo-900">{newReportMaxPoints} — Hạn: {newReportDeadline}</strong>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAllUnitsAssignConfirm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={executeBulkAssign}
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  Xác nhận phân công đồng loạt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {submissionToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-linear-to-r from-rose-600 to-rose-700 p-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-white animate-bounce" />
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Xác nhận xóa bỏ báo cáo</h3>
            </div>
            <div className="p-5 space-y-4 font-sans text-xs">
              <p className="text-slate-600 leading-relaxed font-semibold">
                Bạn có thực sự muốn xóa bỏ vĩnh viễn báo cáo được giao sau đây không? Hãy lưu ý rằng hành động này không thể khôi phục tự động.
              </p>
              <div className="p-3 bg-rose-50 border border-rose-100/80 rounded-xl space-y-1.5 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">ID bản ghi:</span>
                  <strong className="text-rose-900"># {submissionToDelete.ID}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Tên báo cáo:</span>
                  <strong className="text-slate-900">{submissionToDelete.Ten_Bao_Cao}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Đơn vị nhận giao:</span>
                  <strong className="text-slate-900">{submissionToDelete.Ten_Don_Vi}</strong>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmissionToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteSubmission) {
                      onDeleteSubmission(submissionToDelete.ID);
                    }
                    setSubmissionToDelete(null);
                  }}
                  className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-rose-500/10"
                >
                  Xác nhận Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
