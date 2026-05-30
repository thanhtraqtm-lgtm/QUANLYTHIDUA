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
    { id: 'dashboard', label: 'Tổng Quan Hiệu Suất', icon: BarChart3 },
    { id: 'browser', label: 'Xem chi tiết báo cáo', icon: BookOpen },
    { id: 'emulationScores', label: 'Xem Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp Báo Cáo' : 'Nhập Điểm Thi Đua', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Cổng Nạp Dữ Liệu Excel', icon: Upload },
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

  const totalPointsAchieved = submissions.reduce((sum, s) => {
    if (s.Tong_Diem !== null) return sum + s.Tong_Diem;
    return sum;
  }, 0);
  const totalPointsCap = submissions.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
  const avgPerformanceScore = totalPointsCap > 0 ? (totalPointsAchieved / totalPointsCap) * 100 : 0;

  const strokeRadius = 15;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (completionRate / 100) * strokeCircumference;

  return (
    <header className="bg-white border-b border-indigo-100/80 sticky top-0 z-40 shadow-sm relative overflow-hidden transition-all duration-300">
      
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none select-none opacity-40 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_2rem] opacity-30" />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute right-40 top-1/4 w-44 h-44 rounded-full bg-indigo-200/25 blur-2xl" />

        <svg className="w-full h-full text-indigo-400/40" viewBox="0 0 600 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="header-mesh-grad-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="header-mesh-grad-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 50,90 Q 150,20 250,75 T 450,30 T 650,85 L 650,120 L 50,120 Z" fill="url(#header-mesh-grad-1)" />
          <path d="M 20,105 Q 180,45 320,90 T 520,25 T 650,70 L 650,120 L 20,120 Z" fill="url(#header-mesh-grad-2)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between items-start gap-4 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-sky-500/10">
              <Trophy className="h-5.5 w-5.5" id="header-trophy-logo-icon" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-white font-sans tracking-wide font-extrabold uppercase bg-gradient-to-r from-red-600 via-blue-600 to-indigo-700 px-2.5 py-0.5 rounded-full shadow-sm">
                  Thống kê Tỉnh Hưng Yên
                </span>
              </div>
              <h1 className="text-md sm:text-2xl font-black tracking-tight font-sans text-slate-900 mt-1" id="app-title-header">
                HỆ THỐNG QUẢN LÝ & CHẤM ĐIỂM THI ĐUA BÁO CÁO THỐNG KÊ
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 lg:space-x-6 bg-slate-50/50 backdrop-blur-xs px-4 py-2 rounded-2xl border border-slate-100/80">
            <div className="flex items-center space-x-3.5 border-r border-slate-200/80 pr-4">
              <span className="text-[9.5px] font-extrabold uppercase">Chỉ tiêu hoàn thành: {Math.round(completionRate)}%</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[9.5px] font-extrabold uppercase">Tỷ lệ đúng hạn: {Math.round(onTimeRate)}%</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
             <button onClick={onExportExcel} className="flex items-center space-x-1 px-3 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">
              <Download className="w-3.5 h-3.5" /> <span>Xuất Excel</span>
            </button>
            <button onClick={onLogout} className="p-2 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MENU ĐÃ CHỈNH SỬA: Gọn gàng, khoảng cách hợp lý */}
        <div className="flex overflow-x-auto justify-start gap-1 border-t border-slate-100 pt-3.5 pb-2.5 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-sans text-xs transition-all shrink-0 cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
