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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm relative overflow-hidden">
      {/* Nền tinh tế */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="bg-slate-950 p-2 rounded-lg text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-950 tracking-tight leading-none">
                HỆ THỐNG QUẢN LÝ THI ĐUA
              </h1>
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mt-1">
                Thống kê Hưng Yên 2026
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 bg-slate-100 px-4 py-1.5 rounded-lg border border-slate-200">
             <div className="text-[11px] font-bold text-slate-950">Hoàn thành: <span className="font-black">{Math.round((submittedCount / totalCount) * 100)}%</span></div>
             <div className="text-[11px] font-bold text-slate-950">Đúng hạn: <span className="font-black">{Math.round((onTimeCount / (submittedCount || 1)) * 100)}%</span></div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onExportExcel} className="px-3 py-1.5 text-[11px] bg-slate-950 text-white font-bold rounded-md hover:bg-black transition-all cursor-pointer">Xuất Excel</button>
            <button onClick={onLogout} className="p-1.5 text-slate-500 hover:text-black cursor-pointer"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 border-t border-slate-200 mt-3 pt-2 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-black transition-all whitespace-nowrap cursor-pointer ${
                  isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-black hover:bg-slate-100'
                }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
