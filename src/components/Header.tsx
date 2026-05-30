/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  BarChart3, 
  Edit, 
  Briefcase, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles,
  TrendingUp,
  LogOut,
  Users,
  BookOpen,
  Trash2
} from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'manager' | 'departments' | 'importer' | 'accounts';
  setActiveTab: (tab: 'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'manager' | 'departments' | 'importer' | 'accounts') => void;
  onResetData: () => void;
  onClearAllData?: () => void;
  onExportExcel: () => void;
  submissions: ReportSubmission[];
  currentUser: User;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onResetData,
  onClearAllData,
  onExportExcel,
  submissions = [],
  currentUser,
  onLogout
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

  const tabs = rawTabs.filter(tab => {
    if (currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')) return false;
    return true;
  });

  const totalCount = submissions.length;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
  const lateCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0).length;
  
  const completionRate = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;
  const onTimeRate = submittedCount > 0 ? (onTimeCount / submittedCount) * 100 : 0;

  const totalPointsAchieved = submissions.reduce((sum, s) => s.Tong_Diem !== null ? sum + s.Tong_Diem : sum, 0);
  const totalPointsCap = submissions.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
  const avgPerformanceScore = totalPointsCap > 0 ? (totalPointsAchieved / totalPointsCap) * 100 : 0;

  const strokeRadius = 15;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (completionRate / 100) * strokeCircumference;

  return (
    <header className="bg-white border-b border-indigo-100/80 sticky top-0 z-40 shadow-sm relative overflow-hidden transition-all duration-300">
      
      {/* Background decorations */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none select-none opacity-40 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_2rem] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between items-start gap-4 pb-4">
          
          <div className="flex items-center space-x-3.5">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-2xl text-white shadow-md">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-xl font-black tracking-tight text-slate-900">
                HỆ THỐNG QUẢN LÝ THI ĐUA
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Thống kê Tỉnh Hưng Yên - 2026
              </p>
            </div>
          </div>

          {/* KPI Mini Charts */}
          <div className="hidden sm:flex items-center space-x-4 bg-slate-50/50 px-4 py-2 rounded-2xl border border-slate-100">
             <div className="text-[10px] font-mono font-bold text-slate-700">
                Hoàn thành: {Math.round(completionRate)}%
             </div>
             <div className="h-3 w-[1px] bg-slate-300" />
             <div className="text-[10px] font-mono font-bold text-emerald-700">
                Đúng hạn: {Math.round(onTimeRate)}%
             </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button onClick={onExportExcel} className="px-3 py-1.5 text-[11px] bg-emerald-600 text-white font-bold rounded-lg shadow hover:bg-emerald-700 transition-all">
              Xuất Excel
            </button>
            <button onClick={onLogout} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION - Chỉnh lại khoảng cách và kích thước */}
        <div className="flex overflow-x-auto justify-start md:justify-end gap-1.5 border-t border-slate-100 pt-3.5 pb-2.5 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-lg font-sans text-[11px] font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-sky-50 text-sky-800 border border-sky-100 shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
