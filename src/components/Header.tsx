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
    { id: 'dashboard', label: 'TỔNG QUAN', icon: BarChart3 },
    { id: 'browser', label: 'BÁO CÁO', icon: BookOpen },
    { id: 'emulationScores', label: 'ĐIỂM THI ĐUA', icon: TrendingUp },
    { id: 'leaderboard', label: 'XẾP HẠNG', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'NỘP BC' : 'NHẬP ĐIỂM', icon: Edit },
    { id: 'departments', label: 'PHÒNG BAN', icon: Briefcase },
    { id: 'importer', label: 'NẠP EXCEL', icon: Upload },
    { id: 'accounts', label: 'PHÂN QUYỀN', icon: Users }
  ].filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Tầng 1: Logo giữ nguyên */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-sky-600 p-2 rounded-lg text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[16px] font-bold text-slate-800 tracking-tight">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Thống kê Hưng Yên 2026</p>
            </div>
          </div>
          <button onClick={onExportExcel} className="px-4 py-1.5 text-[12px] bg-sky-600 text-white font-semibold rounded hover:bg-sky-700 transition-all">Xuất Excel</button>
        </div>

        {/* MENU KIỂU MỚI: Thanh mảnh, tinh tế, font chuẩn như ảnh bạn gửi */}
        <div className="flex overflow-x-auto gap-8 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-[12px] font-semibold tracking-wide transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'border-sky-600 text-sky-700' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
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
