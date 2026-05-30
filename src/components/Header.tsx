/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Trophy, BarChart3, Edit, Briefcase, Download, 
  Upload, LogOut, Users, BookOpen, TrendingUp 
} from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: any;
  setActiveTab: (tab: any) => void;
  onResetData: () => void;
  onClearAllData?: () => void;
  onExportExcel: () => void;
  submissions: ReportSubmission[];
  currentUser: User;
  onLogout: () => void;
}

export default function Header({
  activeTab, setActiveTab, onExportExcel,
  submissions = [], currentUser, onLogout
}: HeaderProps) {
  
  const tabs = [
    { id: 'dashboard', label: 'Tổng Quan', icon: BarChart3 },
    { id: 'browser', label: 'Báo Cáo', icon: BookOpen },
    { id: 'emulationScores', label: 'Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp BC' : 'Nhập Điểm', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Nạp Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ].filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

  // TÍNH TOÁN LOGIC KPI ĐẦY ĐỦ
  const totalCount = submissions.length || 1;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
  const avgPerformanceScore = submissions.reduce((sum, s) => s.Tong_Diem ? sum + s.Tong_Diem : sum, 0) / submissions.length || 0;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-md">
      {/* NỀN ĐỒ HỌA SẮC NÉT */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
          <path d="M 50,90 Q 150,20 250,75 T 450,30 T 650,85 L 650,120 L 50,120 Z" fill="#e2e8f0" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-950 p-2 rounded-lg text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[15px] font-black text-slate-950 tracking-tight">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Thống kê Hưng Yên 2026</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
             <div className="text-[11px] font-bold text-slate-950">Hoàn thành: <span className="font-black">{Math.round((submittedCount / totalCount) * 100)}%</span></div>
             <div className="text-[11px] font-bold text-slate-950">Đúng hạn: <span className="font-black text-emerald-700">{Math.round((onTimeCount / (submittedCount || 1)) * 100)}%</span></div>
             <div className="text-[11px] font-bold text-slate-950">Điểm TB: <span className="font-black text-indigo-700">{avgPerformanceScore.toFixed(1)}</span></div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onExportExcel} className="px-3 py-1.5 text-[11px] bg-slate-950 text-white font-black rounded-lg hover:bg-black transition-all cursor-pointer">Xuất Excel</button>
            <button onClick={onLogout} className="p-1.5 text-slate-500 hover:text-black cursor-pointer"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 mt-4 pt-2 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                  isActive ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-950'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
