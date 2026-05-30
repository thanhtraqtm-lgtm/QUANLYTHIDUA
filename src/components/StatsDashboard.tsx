import React from 'react';
import { ReportSubmission, LeaderboardRow } from '../types';
import { Calendar, AlertCircle, Clock, CheckCircle, BarChart2 } from 'lucide-react';

interface StatsDashboardProps {
  submissions: ReportSubmission[];
  leaderboard: LeaderboardRow[];
  onSelectUnit: (maDv: string) => void;
  onNavigate: (criteria: string) => void; // Props bắt buộc để click vào là hiện chi tiết
}

export default function StatsDashboard({ submissions, leaderboard, onSelectUnit, onNavigate }: StatsDashboardProps) {
  // Logic tính toán số liệu
  const today = new Date('2026-05-25');
  
  const totalCount = submissions.length;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
  const lateCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0).length;
  const overdueCount = submissions.filter(s => s.Ngay_Nop === null && new Date(s.Han_Nop) < today).length;

  return (
    <div className="space-y-6">
      {/* Grid 5 nút bấm - Đã tích hợp onNavigate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Nút 1: Tổng số */}
        <button onClick={() => onNavigate('all')} className="text-left bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Tổng chỉ tiêu</p>
          <h3 className="text-xl font-black text-slate-800">{totalCount}</h3>
        </button>

        {/* Nút 2: Đã nộp */}
        <button onClick={() => onNavigate('submitted')} className="text-left bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-emerald-600 uppercase">Đã nộp</p>
          <h3 className="text-xl font-black text-emerald-700">{submittedCount}</h3>
        </button>

        {/* Nút 3: Đúng hạn */}
        <button onClick={() => onNavigate('ontime')} className="text-left bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-sky-600 uppercase">Đúng hạn</p>
          <h3 className="text-xl font-black text-sky-700">{onTimeCount}</h3>
        </button>

        {/* Nút 4: Báo cáo muộn */}
        <button onClick={() => onNavigate('late')} className="text-left bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-amber-600 uppercase">Báo cáo muộn</p>
          <h3 className="text-xl font-black text-amber-700">{lateCount}</h3>
        </button>

        {/* Nút 5: Quá hạn */}
        <button onClick={() => onNavigate('overdue')} className="text-left bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-rose-600 uppercase">Quá hạn</p>
          <h3 className="text-xl font-black text-rose-700">{overdueCount}</h3>
        </button>

      </div>

      {/* Phần còn lại của Dashboard (giữ nguyên nếu bạn đã có code cũ) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          Bảng xếp hạng thi đua
        </h2>
        {/* ... nội dung hiển thị bảng xếp hạng của bạn ... */}
        <p className="text-sm text-slate-500">Bảng xếp hạng được cập nhật dựa trên {submissions.length} báo cáo.</p>
      </div>
    </div>
  );
}
