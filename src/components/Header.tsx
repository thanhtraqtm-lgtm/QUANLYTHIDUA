/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logo from '../logo.png'; 
import { BarChart3, Edit, Briefcase, Upload, Users, BookOpen, TrendingUp, Trophy } from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: any;
  setActiveTab: (tab: any) => void;
  onResetData: () => void;
  onLogout: () => void;
  onExportExcel: () => void;
  submissions: ReportSubmission[];
  currentUser: User;
}

export default function Header({
  activeTab, setActiveTab, onResetData, onLogout, onExportExcel,
  submissions = [], currentUser
}: HeaderProps) {
  
  const rawTabs = [
    { id: 'dashboard', label: 'TỔNG QUAN', icon: BarChart3 },
    { id: 'browser', label: 'BÁO CÁO', icon: BookOpen },
    { id: 'emulationScores', label: 'ĐIỂM THI ĐUA', icon: TrendingUp },
    { id: 'leaderboard', label: 'XẾP HẠNG', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'NỘP BC' : 'NHẬP ĐIỂM', icon: Edit },
    { id: 'departments', label: 'PHÒNG BAN', icon: Briefcase },
    { id: 'importer', label: 'NẠP EXCEL', icon: Upload },
    { id: 'accounts', label: 'PHÂN QUYỀN', icon: Users }
  ].filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')));

  const totalCount = submissions.length || 1;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;

  // Biểu đồ trải dài: Dữ liệu nhiều cột hơn để chạy hết thanh
  const chartBars = Array.from({ length: 40 }, () => Math.floor(Math.random() * 60) + 20);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 pt-4">
        {/* Tầng 1: Logo, KPI, Nút */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
            <div className="flex items-center gap-8 pl-6 border-l border-slate-200">
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tiến độ</p>
                  <p className="text-xl font-black text-slate-950">{Math.round((submittedCount / totalCount) * 100)}%</p>
               </div>
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Đúng hạn</p>
                  <p className="text-xl font-black text-blue-700">{Math.round((onTimeCount / (submittedCount || 1)) * 100)}%</p>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onExportExcel} className="px-6 py-2 bg-slate-950 text-white text-[12px] font-bold rounded-lg hover:bg-black transition-all">XUẤT EXCEL</button>
          </div>
        </div>

        {/* Đồ thị chạy full chiều ngang thanh menu */}
        <div className="flex items-end gap-[2px] h-4 w-full opacity-30 mb-2">
            {chartBars.map((h, i) => (
                <div key={i} className="flex-1 bg-sky-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
        </div>

        {/* Tầng 2: Menu */}
        <div className="flex overflow-x-auto gap-8 pt-1">
          {rawTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-[12px] font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-950'
                }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
