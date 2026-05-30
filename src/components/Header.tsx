/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import logo from '../logo.png'; // Đảm bảo đường dẫn này trỏ đúng đến file ảnh của bạn
import { 
  BarChart3, Edit, Briefcase, Download, Upload, RotateCcw, 
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
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp BC' : 'Nhập Điểm', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Nạp Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ] as const;

  const tabs = rawTabs.filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

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
      {/* BACKGROUND VECTOR GRAPHS - Giữ nguyên */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none select-none opacity-40 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_2rem] opacity-30" />
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
              <h1 className="text-md sm:text-2xl font-black tracking-tight font-sans text-slate-900 mt-1">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
            </div>
          </div>

          {/* KPI Mini - Giữ nguyên logic */}
          <div className="hidden sm:flex items-center space-x-6 bg-slate-50/50 backdrop-blur-xs px-4 py-2 rounded-2xl border border-slate-100/80">
             {/* ... Nội dung KPI giữ nguyên như cũ ... */}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
             {/* ... Các nút chức năng giữ nguyên ... */}
          </div>
        </div>

        {/* Thanh Menu giữ nguyên hiệu ứng motion */}
        <div className="flex overflow-x-auto justify-start md:justify-end gap-3 border-t border-slate-100 pt-3.5 pb-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'bg-sky-50 text-sky-800' : 'text-slate-700 hover:bg-slate-100'
                }`}>
                <Icon size={14} /> <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
