/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, Edit, Briefcase, Upload, Users, BookOpen, TrendingUp, Trophy } from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: any;
  setActiveTab: (tab: any) => void;
  onExportExcel: () => void;
  submissions: ReportSubmission[];
  currentUser: User;
}

export default function Header({
  activeTab, setActiveTab, onExportExcel,
  submissions = [], currentUser
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

  const totalCount = submissions.length || 1;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  
  return (
    <header className="bg-white border-b-2 border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo phóng to, nổi bật */}
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
            
            {/* KPI hiển thị đậm nét, dễ đọc */}
            <div className="flex items-center gap-8 pl-8 border-l border-slate-200">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ hoàn thành</p>
                  <p className="text-[24px] font-black text-slate-950 mt-0.5">{Math.round((submittedCount / totalCount) * 100)}%</p>
               </div>
            </div>
          </div>

          <button onClick={onExportExcel} className="px-8 py-3 text-[14px] bg-slate-950 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg">
            Xuất Excel
          </button>
        </div>

        {/* Menu thanh thoát nhưng đậm đà */}
        <div className="flex overflow-x-auto gap-10 mt-6 pt-4 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 pb-4 text-[14px] font-bold transition-all border-b-[3px] whitespace-nowrap ${
                  isActive ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-950'
                }`}>
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
