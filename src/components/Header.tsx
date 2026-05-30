/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import logo from '../logo.png'; // Đảm bảo đường dẫn này đúng
import { 
  BarChart3, Edit, Briefcase, Download, Upload, RotateCcw, 
  Sparkles, TrendingUp, LogOut, BookOpen, Users, Trash2, Settings 
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
    { id: 'importer', label: 'Nạp Dữ Liệu', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ] as const;

  const tabs = rawTabs.filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

  const totalCount = submissions.length;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
  const completionRate = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;
  const onTimeRate = submittedCount > 0 ? (onTimeCount / submittedCount) * 100 : 0;
  const lateCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0).length;

  return (
    <header className="bg-white border-b border-indigo-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between items-start gap-4 pb-4">
          
          {/* Logo và Tiêu đề */}
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-white font-extrabold uppercase bg-red-600 px-2 py-0.5 rounded-full">Thống kê Tỉnh Hưng Yên</span>
              </div>
              <h1 className="text-lg font-black text-slate-900 mt-1 uppercase">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
            </div>
          </div>

          {/* KPI Mini */}
          <div className="hidden sm:flex items-center space-x-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
             <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold">Hoàn thành</p>
                <p className="text-sm font-black">{Math.round(completionRate)}%</p>
             </div>
             <div className="text-center border-l pl-6">
                <p className="text-[9px] text-slate-500 uppercase font-bold">Đúng hạn</p>
                <p className="text-sm font-black text-emerald-600">{Math.round(onTimeRate)}%</p>
             </div>
          </div>

          {/* Nút chức năng */}
          <div className="flex items-center gap-2">
            <button onClick={onExportExcel} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">
              <Download size={14} /> Xuất Excel
            </button>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-600"><LogOut size={16}/></button>
          </div>
        </div>

        {/* Thanh Menu (Sát nhau, không mất chữ) */}
        <div className="flex overflow-x-auto justify-start gap-2 border-t border-slate-100 pt-3">
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
