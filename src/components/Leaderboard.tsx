/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LeaderboardRow, ReportSubmission } from '../types';
import { Trophy, ArrowUpDown, ChevronRight, X, CalendarCheck, HelpCircle } from 'lucide-react';

interface LeaderboardProps {
  leaderboard: LeaderboardRow[];
  submissions: ReportSubmission[];
  onSelectUnit: (maDv: string) => void;
  selectedUnitSubmissions: ReportSubmission[] | null;
  selectedUnitName: string | null;
  onCloseDetailModal: () => void;
}

export default function Leaderboard({
  leaderboard,
  submissions,
  onSelectUnit,
  selectedUnitSubmissions,
  selectedUnitName,
  onCloseDetailModal
}: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [sortField, setSortField] = useState<keyof LeaderboardRow>('Rank');
  const [sortAsc, setSortAsc] = useState(true);

  // Sorting and filtering logic
  const handleSort = (field: keyof LeaderboardRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredLeaderboard = leaderboard
    .filter(row => {
      const matchSearch = row.Ten_Don_Vi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.Ma_DV.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRegion = regionFilter === 'ALL' || row.Vung === regionFilter;
      return matchSearch && matchRegion;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      // Numbers sorting
      return sortAsc 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    });

  return (
    <div className="space-y-6" id="leaderboard-panel">
      
      {/* Filters bar & Action layout */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input 
            type="text"
            placeholder="Tìm kiếm đơn vị thống kê (Tên hoặc mã)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans"
          />
        </div>

        {/* Region selector switch */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className="text-xs text-slate-400 font-sans font-medium">Bản đồ Vùng:</span>
          <div className="bg-slate-100 p-0.5 rounded-xl flex">
            <button 
              onClick={() => setRegionFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all ${regionFilter === 'ALL' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Tất cả Vùng
            </button>
            <button 
              onClick={() => setRegionFilter('Khu vực 1')}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all ${regionFilter === 'Khu vực 1' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Khu vực 1
            </button>
            <button 
              onClick={() => setRegionFilter('Khu vực 2')}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all ${regionFilter === 'Khu vực 2' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Khu vực 2
            </button>
          </div>
        </div>

      </div>

      {/* Main Table Card wrapper */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                
                {/* Headers column with sort clicks */}
                <th className="py-4 px-5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center w-16">
                  <button onClick={() => handleSort('Rank')} className="flex items-center space-x-1 mx-auto hover:text-slate-700">
                    <span>Hạng</span> <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>

                <th className="py-4 px-5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider min-w-[200px]">
                  <button onClick={() => handleSort('Ten_Don_Vi')} className="flex items-center space-x-1 hover:text-slate-700">
                    <span>Đơn vị Thống kê</span> <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>

                <th className="py-4 px-4 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  <button onClick={() => handleSort('Vung')} className="flex items-center space-x-1 mx-auto hover:text-slate-700">
                    <span>Vùng</span> <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>

                <th className="py-4 px-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  <span className="cursor-help" title="Tổng số báo cáo được giao">Giao chỉ tiêu</span>
                </th>

                <th className="py-4 px-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  <span className="text-emerald-700 font-semibold cursor-help" title="Số lượng báo cáo nộp đúng hoặc trước hạn">Đúng hạn</span>
                </th>

                <th className="py-4 px-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  <span className="text-amber-700 font-semibold cursor-help" title="Số lượng báo cáo nộp trễ hạn">Trễ hạn</span>
                </th>

                <th className="py-4 px-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  <span className="text-rose-700 font-semibold cursor-help" title="Số lượng báo cáo quá hạn định nhưng vẫn chưa nộp">Quá hạn</span>
                </th>

                <th className="py-4 px-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  <button onClick={() => handleSort('So_Ngay_Tre_Tong')} className="flex items-center space-x-1 mx-auto hover:text-slate-700">
                    <span>Tổng ngày trễ</span> <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>

                <th className="py-4 px-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  <button onClick={() => handleSort('Diem_Thi_Dua')} className="flex items-center space-x-1 mx-auto hover:text-slate-700">
                    <span>Điểm thi đua TB</span> <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>

                <th className="py-4 px-5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center w-20">
                  Thao tác
                </th>
                
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400 font-sans italic">
                    Không tìm thấy dữ liệu đơn vị thỏa mãn điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((row) => (
                  <tr key={row.Ma_DV} className="hover:bg-slate-50/50 transition-colors duration-100">
                    
                    {/* Rank Row */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center">
                        {row.Rank <= 3 ? (
                          <div className={`p-1.5 rounded-full flex items-center justify-center ${
                            row.Rank === 1 ? 'bg-amber-100 text-amber-700' :
                            row.Rank === 2 ? 'bg-slate-100 text-slate-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            <Trophy className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="font-mono text-xs font-bold text-slate-500">{row.Rank}</span>
                        )}
                      </div>
                    </td>

                    {/* Unit Info */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-700">{row.Ten_Don_Vi}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">Mã đơn vị: {row.Ma_DV}</span>
                      </div>
                    </td>

                    {/* Region Location */}
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-sans ${
                        row.Vung === 'Khu vực 1' ? 'bg-sky-50 text-sky-700' : 'bg-teal-50 text-teal-700'
                      }`}>
                        {row.Vung}
                      </span>
                    </td>

                    {/* Commited total indicators */}
                    <td className="py-4 px-3 text-center font-mono text-xs font-semibold text-slate-600">
                      {row.Tong_Bao_Cao}
                    </td>

                    {/* On-Time indicators stats count */}
                    <td className="py-4 px-3 text-center font-mono text-xs font-bold text-emerald-600">
                      {row.Nop_Dung_Han}
                    </td>

                    {/* Late submissions stats count */}
                    <td className="py-4 px-3 text-center font-mono text-xs font-bold text-amber-500">
                      {row.Nop_Tre_Han}
                    </td>

                    {/* Non-submitted/Uncommitted overdue stats count */}
                    <td className="py-4 px-3 text-center font-mono text-xs font-bold text-rose-500">
                      {row.Chua_Nop}
                    </td>

                    {/* Total delayed days */}
                    <td className="py-4 px-3 text-center font-mono text-xs font-bold text-slate-600">
                      {row.So_Ngay_Tre_Tong} ngày
                    </td>

                    {/* EMULATION FINAL SCORE */}
                    <td className="py-4 px-3 text-center">
                      <span className="font-mono text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {row.Diem_Thi_Dua.toFixed(1)}đ
                      </span>
                    </td>

                    {/* Actions drilldown trigger */}
                    <td className="py-4 px-5 text-center">
                      <button 
                        onClick={() => onSelectUnit(row.Ma_DV)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 text-[11px] font-sans font-medium rounded-lg transition-colors"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RATING ASSISTANCE DRILLDOWN DETAILS MODAL OVERLAY */}
      {selectedUnitSubmissions && selectedUnitName && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header info */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-sky-400 font-mono tracking-wider font-extrabold uppercase">Thống kê Giao điểm chi tiết</span>
                <h3 className="text-sm font-bold font-sans mt-0.5 uppercase tracking-wide">{selectedUnitName}</h3>
              </div>
              <button 
                onClick={onCloseDetailModal}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal master detailed log */}
            <div className="p-6 overflow-y-auto max-h-[500px] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-sans block block uppercase">Chỉ tiêu Hoàn thành</span>
                  <span className="text-xl font-bold font-mono text-slate-700 mt-1 block">
                    {selectedUnitSubmissions.filter(s => s.Ngay_Nop !== null).length} / {selectedUnitSubmissions.length}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-sans block block uppercase font-medium">Nộp trễ hạn</span>
                  <span className="text-xl font-bold font-mono text-amber-600 mt-1 block">
                    {selectedUnitSubmissions.filter(s => (s.So_Ngay_Tre ?? 0) > 0).length} lần
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-sans block block uppercase">Điểm thi đua trung bình</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                    {(selectedUnitSubmissions.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0) / selectedUnitSubmissions.length).toFixed(1)}đ
                  </span>
                </div>
              </div>

              {/* Submissions detailed list log */}
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse table-auto text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Tên báo cáo kinh tế</th>
                      <th className="py-3 px-3 text-center">Phòng Giao</th>
                      <th className="py-3 px-3 text-center">Hạn Nộp</th>
                      <th className="py-3 px-3 text-center">Ngày Nộp Phục</th>
                      <th className="py-3 px-3 text-center">Điểm ĐN</th>
                      <th className="py-3 px-3 text-center">Điểm TG</th>
                      <th className="py-3 px-3 text-center">Điểm CL</th>
                      <th className="py-3 px-4 text-center">Tổng Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedUnitSubmissions.map((sub) => {
                      const displaySubDate = sub.Ngay_Nop 
                        ? new Date(sub.Ngay_Nop).toLocaleDateString('vi-VN') 
                        : 'Chưa nộp';
                      const displayDeadline = new Date(sub.Han_Nop).toLocaleDateString('vi-VN');
                      
                      return (
                        <tr key={sub.ID} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-medium text-slate-700">{sub.Ten_Bao_Cao}</td>
                          <td className="py-3.5 px-3 text-center text-slate-500">{sub.Ma_Phong}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-600">{displayDeadline}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-mono ${
                              sub.Ngay_Nop 
                                ? (sub.So_Ngay_Tre ?? 0) > 0 ? 'bg-amber-50 text-amber-700 font-semibold' : 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700 font-bold block animate-pulse'
                            }`}>
                              {displaySubDate}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">{sub.Diem_Dinh_Muc}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-emerald-600">{sub.Diem_Thoi_Gian ?? 0}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-sky-600">{sub.Diem_Chat_Luong ?? 0}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-800">
                            {sub.Tong_Diem ?? 0}đ
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={onCloseDetailModal}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-sm"
              >
                Đóng thông tin
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
