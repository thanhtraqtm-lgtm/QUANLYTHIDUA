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
  activeTab: 'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'manager' | 'departments' | 'importer' | 'accounts';
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
  
  const rawTabs = [
    { id: 'dashboard', label: 'Tổng Quan', icon: BarChart3 },
    { id: 'browser', label: 'Báo Cáo', icon: BookOpen },
    { id: 'emulationScores', label: 'Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp BC' : 'Nhập Điểm', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Nạp Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ] as const;

  const tabs = rawTabs.filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

  const totalCount = submissions.length || 1;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
  const avgPerformanceScore = submissions.reduce((sum, s) => s.Tong_Diem ? sum + s.Tong_Diem : sum, 0) / (submissions.length || 1);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Background Graphic */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none select-none opacity-40 z-0">
        <svg className="w-full h-full text-indigo-400/40" viewBox="0 0 600 120" preserveAspectRatio="none">
          <path d="M 50,90 Q 150,20 250,75 T 450,30 T 650,85 L 650,120 L 50,120 Z" fill="#e2e8f0" />
          <path d="M 20,105 Q 180,45 320,90 T 520,25 T 650,70 L 650,120 L 20,120 Z" fill="#d1fae5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-950 p-2 rounded-xl text-white shadow-lg">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-black text-slate-950 tracking-tight">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
              <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Thống kê Hưng Yên 2026</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 px-4 py-2 rounded-lg border border-slate-200 bg-white/80 shadow-inner">
             <div className="text-[12px] font-black text-slate-950">Hoàn thành: {Math.round((submittedCount / totalCount) * 100)}%</div>
             <div className="text-[12px] font-black text-emerald-800">Đúng hạn: {Math.round((onTimeCount / (submittedCount || 1)) * 100)}%</div>
             <div className="text-[12px] font-black text-indigo-900">Điểm TB: {avgPerformanceScore.toFixed(1)}</div>
          </div>

          <button onClick={onExportExcel} className="px-4 py-2 text-[12px] bg-slate-950 text-white font-black rounded-lg hover:bg-black transition-all">Xuất Excel</button>
        </div>

        {/* Menu chỉnh sửa: Cỡ chữ 13px, font black, border dày */}
        <div className="flex overflow-x-auto gap-4 mt-5 pt-2 border-t border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-2 text-[13px] font-black transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'border-slate-950 text-slate-950' 
                    : 'border-transparent text-slate-500 hover:text-slate-950'
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
