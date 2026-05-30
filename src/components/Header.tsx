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
  activeTab, setActiveTab, onExportExcel,
  submissions = [], currentUser, onLogout
}: HeaderProps) {
  
  // Logic tính toán cho bảng điều khiển
  const rawTabs = [
    { id: 'dashboard', label: 'TỔNG QUAN', icon: BarChart3 },
    { id: 'browser', label: 'BÁO CÁO', icon: BookOpen },
    { id: 'emulationScores', label: 'ĐIỂM THI ĐUA', icon: TrendingUp },
    { id: 'leaderboard', label: 'XẾP HẠNG', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'NỘP BC' : 'NHẬP ĐIỂM', icon: Edit },
    { id: 'departments', label: 'PHÒNG BAN', icon: Briefcase },
    { id: 'importer', label: 'NẠP EXCEL', icon: Upload },
    { id: 'accounts', label: 'PHÂN QUYỀN', icon: Users }
  ] as const;

  const tabs = rawTabs.filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

  const totalCount = submissions.length || 1;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
  const avgPerformanceScore = submissions.reduce((sum, s) => s.Tong_Diem ? sum + s.Tong_Diem : sum, 0) / (submissions.length || 1);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Tầng 1: Thông tin hệ thống */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-2 rounded text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-950 tracking-wide">HỆ THỐNG QUẢN LÝ THI ĐUA</h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Thống kê Hưng Yên 2026</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-[12px] font-medium text-slate-600">
             <span>Hoàn thành: <span className="font-bold text-slate-950">{Math.round((submittedCount / totalCount) * 100)}%</span></span>
             <span>Đúng hạn: <span className="font-bold text-blue-800">{Math.round((onTimeCount / (submittedCount || 1)) * 100)}%</span></span>
             <span>Điểm TB: <span className="font-bold text-blue-800">{avgPerformanceScore.toFixed(1)}</span></span>
             <button onClick={onExportExcel} className="ml-4 px-4 py-1.5 bg-slate-950 text-white font-bold rounded hover:bg-black transition-all">Xuất Excel</button>
          </div>
        </div>

        {/* Tầng 2: Menu điều hướng */}
        <div className="flex overflow-x-auto gap-8 border-t border-slate-100 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'border-slate-950 text-slate-950' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
