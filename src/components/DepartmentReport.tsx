/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReportSubmission, Department } from '../types';
import { ShieldCheck, CheckSquare, Clock, AlertOctagon, Layers } from 'lucide-react';

interface DepartmentReportProps {
  submissions: ReportSubmission[];
  departments: Department[];
}

export default function DepartmentReport({ submissions, departments }: DepartmentReportProps) {
  
  // Calculate aggregate performance metrics for each department
  const deptsStats = departments.map(d => {
    const deptSubs = submissions.filter(s => s.Ma_Phong === d.Ma_Phong);
    const totalCount = deptSubs.length;
    const submitted = deptSubs.filter(s => s.Ngay_Nop !== null);
    const submittedCount = submitted.length;
    const onTimeCount = submitted.filter(s => (s.So_Ngay_Tre ?? 0) <= 0).length;
    const lateCount = submitted.filter(s => (s.So_Ngay_Tre ?? 0) > 0).length;
    const overdueCount = deptSubs.filter(s => s.Ngay_Nop === null && new Date(s.Han_Nop) < new Date('2026-05-25')).length;
    
    // Average Quality score
    const qualitySums = deptSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0);
    const avgQuality = totalCount > 0 ? (qualitySums / totalCount) : 0;

    const rate = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;

    return {
      code: d.Ma_Phong,
      name: d.Ten_Phong,
      totalCount,
      submittedCount,
      onTimeCount,
      lateCount,
      overdueCount,
      avgQuality,
      rate
    };
  });

  return (
    <div className="space-y-6" id="department-report-panel">
      
      {/* Intro info box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 font-sans uppercase tracking-tight">
          📊 Báo cáo Giản đồ Hiệu suất Phòng chuyên môn
        </h4>
        <p className="text-xs text-slate-500 font-sans mt-1 leading-relaxed">
          Tra cứu nhanh tỷ lệ hoàn thành báo cáo số liệu chỉ tiêu đã giao và điểm đánh giá kỹ năng tổng hợp của từng Phòng chuyên môn nghiệp vụ thuộc Thống kê Tỉnh Hưng Yên.
        </p>
      </div>

      {/* Grid listing department cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {deptsStats.map((dept) => (
          <div key={dept.code} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-200 transition-all">
            
            {/* Header part */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <span className="text-[10px] text-sky-600 font-mono tracking-wider font-extrabold uppercase">{dept.code}</span>
              <h5 className="font-bold text-xs text-slate-700 font-sans leading-snug mt-0.5">{dept.name}</h5>
            </div>

            {/* Content list */}
            <div className="p-5 space-y-4 flex-1">
              
              {/* Progress bar visual */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Tiến độ Giao điểm</span>
                  <span className="font-mono font-bold text-slate-700">{dept.rate.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>

              {/* Statistics Metrics Lists block */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                
                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 leading-none block uppercase font-medium">Đúng Hạn</span>
                    <span className="font-mono font-bold text-slate-700 block mt-0.5">{dept.onTimeCount} / {dept.totalCount}</span>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 leading-none block uppercase font-medium">Trễ Hạn</span>
                    <span className="font-mono font-bold text-slate-700 block mt-0.5">{dept.lateCount} lần</span>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex items-center space-x-2 col-span-2">
                  <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 leading-none block uppercase font-medium">⚠️ Quá hạn cực điểm</span>
                    <span className="font-mono font-bold text-rose-600 block mt-0.5">{dept.overdueCount} chỉ tiêu chưa nộp</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Average Quality Footing */}
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-sans">Điểm chất lượng TB:</span>
              <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                {dept.avgQuality.toFixed(1)}đ
              </span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
