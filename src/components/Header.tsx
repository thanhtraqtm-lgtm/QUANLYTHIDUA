/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import logo from '../logo.png'; // Đã thay bằng logo của bạn
import { 
  Trophy, BarChart3, Edit, Briefcase, Download, Upload, RotateCcw, 
  Sparkles, TrendingUp, LogOut, BookOpen, Users, Trash2 
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
  activeTab, setActiveTab, onResetData, onClearAllData, onExportExcel,
  submissions = [], currentUser, onLogout
}: HeaderProps) {
  
  const rawTabs = [
    { id: 'dashboard', label: 'Tổng Quan', icon: BarChart3 },
    { id: 'browser', label: 'Chi Tiết BC', icon: BookOpen },
    { id: 'emulationScores', label: 'Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp Báo Cáo' : 'Nhập Điểm', icon: Edit },
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
  const totalPointsAchieved = submissions.reduce((sum, s) => (s.Tong_Diem ?? 0) + sum, 0);
  const totalPointsCap = submissions.reduce((sum, s) => s.Diem_Dinh_Muc + sum, 0);
  const avgPerformanceScore = totalPointsCap > 0 ? (totalPointsAchieved / totalPointsCap) * 100 : 0;
  const strokeRadius = 15;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (completionRate / 100) * strokeCircumference;

  return (
    <header className="bg-white border-b border-indigo-100/80 sticky top-0 z-40 shadow-sm relative overflow-hidden transition-all duration-300">
      {/* Giữ nguyên phần background graphic của bạn */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none select-none opacity-40 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_2rem] opacity-30" />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl" />
        <svg className="w-full h-full text-indigo-400/40" viewBox="0 0 600 120" preserveAspectRatio="none">
            <path d="M 50,90 Q 150,20 250,75 T 450,30 T 650,85 L 650,120 L 50,120 Z" fill="#e0f2fe" opacity="0.3"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between items-start gap-4 pb-4">
          
          <div className="flex items-center space-x-3.5">
            {/* Logo thay thế ở đây */}
            <img src={logo} alt="Logo" className="h-12 w-12 object-contain rounded-lg p-1 bg-white shadow-sm border border-slate-100" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-white font-extrabold uppercase bg-red-600 px-2 py-0.5 rounded-full">Thống kê Tỉnh Hưng Yên</span>
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 mt-1">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-6 bg-slate-50/80 px-4 py-2 rounded-2xl border border-slate-100">
             {/* Các chỉ số KPI giữ nguyên */}
             <div className="text-center border-r pr-6"><p className="text-[9px] font-bold text-slate-500 uppercase">Hoàn thành</p><p className="text-sm font-black">{Math.round(completionRate)}%</p></div>
             <div className="text-center border-r pr-6"><p className="text-[9px] font-bold text-slate-500 uppercase">Đúng hạn</p><p className="text-sm font-black text-emerald-600">{Math.round(onTimeRate)}%</p></div>
             <div className="text-center"><p className="text-[9px] font-bold text-slate-500 uppercase">Điểm TB</p><p className="text-sm font-black">{avgPerformanceScore.toFixed(1)}</p></div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onExportExcel} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"><Download size={14} /> Excel</button>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-600"><LogOut size={16}/></button>
          </div>
        </div>

        {/* Menu thanh thoát và sát nhau */}
        <div className="flex overflow-x-auto justify-start gap-3 border-t border-slate-100 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all ${
                  isActive ? 'bg-sky-50 text-sky-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
