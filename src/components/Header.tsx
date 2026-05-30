/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, BarChart3, Edit, Briefcase, Download, 
  Upload, RotateCcw, Sparkles, TrendingUp, LogOut, 
  Users, BookOpen, Trash2 
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
  activeTab, setActiveTab, onResetData, onClearAllData, onExportExcel,
  submissions = [], currentUser, onLogout
}: HeaderProps) {
  
  const rawTabs = [
    { id: 'dashboard', label: 'Tổng Quan Hiệu Suất', icon: BarChart3 },
    { id: 'browser', label: 'Xem chi tiết báo cáo', icon: BookOpen },
    { id: 'emulationScores', label: 'Xem Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp Báo Cáo' : 'Nhập Điểm Thi Đua', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Cổng Nạp Dữ Liệu Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ] as const;

  const tabs = rawTabs.filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

  const totalCount = submissions.length;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
  const avgPerformanceScore = submissions.reduce((sum, s) => s.Tong_Diem ? sum + s.Tong_Diem : sum, 0) / (submissions.length || 1);

  return (
    <header className="bg-white border-b border-indigo-100/80 sticky top-0 z-40 shadow-sm relative overflow-hidden transition-all duration-300">
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none select-none opacity-40 z-0">
        <svg className="w-full h-full text-indigo-400/40" viewBox="0 0 600 120" preserveAspectRatio="none">
          <path d="M 50,90 Q 150,20 250,75 T 450,30 T 650,85 L 650,120 L 50,120 Z" fill="#e2e8f0" />
          <path d="M 20,105 Q 180,45 320,90 T 520,25 T 650,70 L 650,120 L 20,120 Z" fill="#d1fae5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between items-start gap-4 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-sky-500/10">
              <Trophy className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-md sm:text-2xl font-black tracking-tight font-sans text-slate-900">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Thống kê Hưng Yên 2026</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 bg-white/60 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
             <div className="text-[11px] font-black text-slate-900">Hoàn thành: {Math.round((submittedCount / totalCount) * 100)}%</div>
             <div className="text-[11px] font-black text-emerald-700">Đúng hạn: {Math.round((onTimeCount / (submittedCount || 1)) * 100)}%</div>
             <div className="text-[11px] font-black text-indigo-700">Điểm TB: {avgPerformanceScore.toFixed(1)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onExportExcel} className="px-3 py-2 text-xs bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all cursor-pointer">Xuất Excel</button>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* MENU MỚI: Đậm nét, không bị lẫn màu, border dưới phân cách */}
        <div className="flex overflow-x-auto gap-1 border-t border-slate-200 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-black transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive 
                    ? 'border-slate-950 text-slate-950' 
                    : 'border-transparent text-slate-500 hover:text-slate-950'
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
