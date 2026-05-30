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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Đồ thị mini */}
          <div className="flex items-center gap-4">
            {/* Sử dụng logo.png */}
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            
            <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-6">
               <div className="flex flex-col items-start">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Tiến độ</span>
                  <div className="flex items-end gap-1 h-4">
                    {[20, 40, 60, 30, 80].map((h, i) => (
                        <div key={i} className="w-1 bg-sky-500 rounded-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
               </div>
               <span className="text-[12px] font-black text-slate-900 ml-2">{Math.round((submittedCount / totalCount) * 100)}%</span>
            </div>
          </div>

          <button onClick={onExportExcel} className="px-4 py-1.5 text-[12px] bg-sky-600 text-white font-semibold rounded hover:bg-sky-700 transition-all">Xuất Excel</button>
        </div>

        {/* Menu thanh mảnh */}
        <div className="flex overflow-x-auto gap-8 mt-4 pt-2 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-2 text-[12px] font-semibold transition-all border-b-2 whitespace-nowrap ${
                  isActive ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-900'
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
