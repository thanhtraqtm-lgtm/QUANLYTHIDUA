/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, Edit, Briefcase, Upload, Users, BookOpen, TrendingUp, Trophy, Download, LogOut } from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onResetData: () => void;
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
    { id: 'browser', label: 'Chi Tiết BC', icon: BookOpen },
    { id: 'emulationScores', label: 'Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { id: 'manager', label: 'Nhập Điểm', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Nạp Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ];

  const totalCount = submissions.length || 1;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* 1. Hàng trên: Logo, Tiêu đề, KPI, Excel, Logout */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        
        {/* Logo & Tiêu đề */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
          <div>
            <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded w-max">THỐNG KÊ TỈNH HƯNG YÊN</div>
            <h1 className="text-sm font-black text-gray-900 mt-0.5">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
          </div>
        </div>

        {/* Khối KPI cố định (nhìn cho cân) */}
        <div className="flex items-center border rounded-lg overflow-hidden">
          <div className="px-4 py-1 text-center border-r"><p className="text-[8px] uppercase text-gray-400">Hoàn thành</p><p className="text-sm font-bold">{Math.round((submittedCount/totalCount)*100)}%</p></div>
          <div className="px-4 py-1 text-center border-r"><p className="text-[8px] uppercase text-gray-400">Đúng hạn</p><p className="text-sm font-bold text-green-600">90%</p></div>
          <div className="px-4 py-1 text-center"><p className="text-[8px] uppercase text-gray-400">Điểm TB</p><p className="text-sm font-bold">87.0</p></div>
        </div>

        {/* Nút Excel & Logout */}
        <div className="flex items-center gap-3">
          <button onClick={onExportExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-emerald-700">
            <Download size={14} /> Excel
          </button>
          <button onClick={onLogout} className="text-gray-400 hover:text-red-600"><LogOut size={18} /></button>
        </div>
      </div>

      {/* 2. Hàng Menu (Dàn đều) */}
      <div className="flex items-center gap-2 px-6 py-2 bg-gray-50">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition ${
              activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
