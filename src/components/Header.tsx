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

  const totalCount = submissions.length || 1;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;

  return (
    // THÊM SHADOW-LG ĐỂ THANH HEADER NỔI HẲN LÊN
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          
          {/* Logo & Tiêu đề */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-950 p-2.5 rounded-xl text-white shadow-xl">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-[17px] font-black text-slate-950 tracking-tight">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Thống kê Hưng Yên 2026</p>
            </div>
          </div>

          {/* ĐỒ THỊ NHỎ (SPARKLINE) TRANG TRÍ KPI */}
          <div className="hidden md:flex items-center gap-8 px-6 py-2 rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Hoàn thành</span>
                <div className="flex items-center gap-2">
                    <span className="font-black text-[14px] text-slate-950">{Math.round((submittedCount / totalCount) * 100)}%</span>
                    <TrendingUp className="w-3 h-3 text-sky-600" />
                </div>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Đúng hạn</span>
                <span className="font-black text-[14px] text-emerald-800">{Math.round((onTimeCount / (submittedCount || 1)) * 100)}%</span>
             </div>
          </div>

          <button onClick={onExportExcel} className="px-5 py-2 text-[12px] bg-slate-950 text-white font-black rounded-lg hover:bg-black transition-all shadow-md">Xuất Excel</button>
        </div>

        {/* MENU: Font to, sắc nét, đen đậm, gạch chân tách biệt */}
        <div className="flex overflow-x-auto gap-6 mt-5 pt-2 border-t border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-2 text-[14px] font-black transition-all border-b-2 whitespace-nowrap cursor-pointer ${
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
