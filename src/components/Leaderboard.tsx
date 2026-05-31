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
      
      {/* CƠ CHẾ TÍNH ĐIỂM & XẾP HẠNG THI ĐUA */}
      <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100/80 flex flex-col sm:flex-row shadow-xs gap-4 font-sans text-xs">
        <div className="p-3 bg-indigo-500 text-white rounded-2xl flex items-center justify-center self-start shadow-md shadow-indigo-500/10 shrink-0">
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-2 text-left">
          <h4 className="font-extrabold text-indigo-950 uppercase tracking-wide text-[12px]">Hướng dẫn Cơ chế Tính điểm & Xếp hạng Thi đua</h4>
          <p className="text-indigo-900 leading-relaxed font-semibold">
            Điểm xếp hạng và xếp hạng được tính toán tự động dựa trên tổng điểm thực tế của toàn bộ các loại báo cáo được giao đối với từng đơn vị:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-800 font-medium leading-relaxed">
            <li>
              <strong className="text-indigo-950">Định Mức Điểm Chỉ Tiêu:</strong> Mỗi báo cáo nghiệp vụ được phòng ban chuyên môn giao có định mức điểm quy định (Ví dụ: báo cáo tháng là <span className="font-extrabold">20đ</span>, báo cáo quý là <span className="font-extrabold">40đ</span>). Nếu đơn vị được giao 12 báo cáo tháng, tổng định mức điểm tối đa của nhóm báo cáo này là <span className="font-extrabold">12 &times; 20 = 240đ</span>.
            </li>
            <li>
              <strong className="text-indigo-950">Định Mức = Điểm Thời Gian (50%) + Điểm Chất Lượng (50%):</strong>
              <ul className="list-circle pl-4 mt-0.5 space-y-0.5 text-slate-700">
                <li><strong className="text-sky-700">Điểm Thời Gian (Tối đa 50% định mức):</strong> Ghi nhận tự động khi nộp đúng hạn hoặc sớm (10đ / 20đ). Nếu nộp trễ hạn, mỗi ngày trễ trừ 1 điểm, khấu trừ tối đa về 0.</li>
                <li><strong className="text-indigo-750">Điểm Chất Lượng chuyên môn (Tối đa 50% định mức):</strong> Do phòng nghiệp vụ chuyên trách thẩm định chấm dựa trên độ tin cậy và sự chu đáo của biểu mẫu số liệu (10đ / 20đ).</li>
              </ul>
            </li>
            <li>
              <strong className="text-indigo-950">Chỉ Số Thi Đua Xếp Hạng:</strong> Điểm % thi đua tổng hợp hiển thị là tỷ phần phần trăm của Tổng điểm đạt được chia cho Tổng định mức điểm được giao của tất cả báo cáo:
              <div className="mt-1.5 p-2 bg-indigo-950/5 text-indigo-950 font-mono font-bold rounded-lg border border-indigo-200/50 inline-block text-[10px]">
                Chỉ số Thi Đua Đơn Vị (%) = ( Tổng Điểm Thực Tế Đạt Được / Tổng Điểm Định Mức Giao ) &times; 100
              </div>
            </li>
          </ul>
        </div>
      </div>

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
              {(() => {
                const totalDinhMucVal = selectedUnitSubmissions.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
                const totalTongDiemVal = selectedUnitSubmissions.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);
                const emulationIndexVal = totalDinhMucVal > 0 ? (totalTongDiemVal / totalDinhMucVal) * 105 : 0; // Scaled proportional count index
                const realPercent = Math.min(100, Math.round((totalTongDiemVal / totalDinhMucVal) * 100 * 10) / 10);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 font-sans block uppercase">Hoàn thành chỉ tiêu</span>
                      <span className="text-xl font-bold font-mono text-slate-705 mt-1 block">
                        {selectedUnitSubmissions.filter(s => s.Ngay_Nop !== null).length} / {selectedUnitSubmissions.length} báo cáo
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 font-sans block uppercase font-semibold text-indigo-700">Tổng điểm thực đạt</span>
                      <span className="text-xl font-bold font-mono text-indigo-800 mt-1 block">
                        {totalTongDiemVal.toFixed(1)}đ / {totalDinhMucVal}đ
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-650 font-sans block uppercase font-extrabold">Chỉ số thi đua đạt</span>
                      <span className="text-xl font-black font-mono text-emerald-600 mt-1 block">
                        {realPercent}%
                      </span>
                    </div>
                  </div>
                );
              })()}

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
