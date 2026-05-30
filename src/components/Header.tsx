/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logo from '../logo.png'; 
import { BarChart3, Edit, Briefcase, Upload, Users, BookOpen, TrendingUp, Trophy, LogOut, Download } from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: string;
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
  
  const tabs = [
    { id: 'dashboard', label: 'Tổng Quan', icon: BarChart3 },
    { id: 'browser', label: 'Chi Tiết BC', icon: BookOpen },
    { id: 'emulationScores', label: 'Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp BC' : 'Nhập Điểm', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Nạp Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ].filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

  return (
    <header className="bg-white border-b border-indigo-100 shadow-sm sticky top-0 z-50">
      {/* Tầng 1: Logo, Tiêu đề & Nút Đăng xuất */}
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
            <p className="text-[11px] font-bold text-sky-700 uppercase tracking-widest">Thống kê Tỉnh Hưng Yên</p>
          </div>
        </div>

        {/* Nút Đăng xuất to rõ ràng */}
        <button onClick={onLogout} className="px-5 py-2 bg-red-50 text-red-700 text-[12px] font-bold rounded-lg hover:bg-red-100 flex items-center gap-2 border border-red-100">
           <LogOut size={16}/> ĐĂNG XUẤT
        </button>
      </div>

      {/* Tầng 2: Menu, Nút Excel & Đồ thị mờ */}
      <div className="max-w-[1600px] mx-auto px-6 border-t border-slate-100 flex items-center justify-between relative overflow-hidden">
        
        {/* Đồ thị mờ dưới nền */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10 flex items-center">
           <svg className="w-full h-full" preserveAspectRatio="none">
              <path d="M0 50 C 300 10, 600 90, 1200 50 S 1500 10, 1600 50" stroke="currentColor" fill="none" strokeWidth="60" />
           </svg>
        </div>

        <div className="flex overflow-x-auto gap-2 py-3 z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
                  isActive ? 'bg-sky-50 text-sky-800' : 'text-slate-600 hover:bg-slate-50'
                }`}>
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Nút Excel nằm cùng hàng Menu */}
        <button onClick={onExportExcel} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white text-[13px] font-bold rounded-lg hover:bg-emerald-700 shadow-md z-10">
          <Download size={16} /> XUẤT EXCEL
        </button>
      </div>
    </header>
  );
}
