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

  return (
    <header className="bg-white sticky top-0 z-50 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]">
      {/* TẦNG 1: THƯƠNG HIỆU & TIÊU ĐỀ (Bệ vệ) */}
      <div className="bg-slate-950 text-white px-8 py-4 flex items-center gap-6">
        <img src={logo} alt="Logo" className="h-16 w-16 object-contain bg-white rounded-full p-1" />
        <div>
          <h1 className="text-[22px] font-black uppercase tracking-tight">Hệ thống Phần mềm Quản lý Thi đua</h1>
          <p className="text-[14px] font-bold text-sky-400 uppercase tracking-widest">Thống kê Tỉnh Hưng Yên</p>
        </div>
      </div>

      {/* TẦNG 2: KPI & CHỨC NĂNG (Thông tin đậm đặc) */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex gap-12">
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tiến độ hoàn thành</p>
              <p className="text-[28px] font-black text-slate-950">{Math.round((submittedCount / totalCount) * 100)}%</p>
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Đúng hạn</p>
              <p className="text-[28px] font-black text-sky-600">{Math.round((onTimeCount / (submittedCount || 1)) * 100)}%</p>
           </div>
        </div>
        <div className="flex gap-4">
           <button onClick={onResetData} className="text-[12px] font-bold text-slate-400 hover:text-red-500">Reset</button>
           <button onClick={onLogout} className="text-[12px] font-bold text-slate-400 hover:text-red-500">Đăng xuất</button>
           <button onClick={onExportExcel} className="px-8 py-3 bg-slate-950 text-white text-[14px] font-bold rounded-lg hover:bg-black transition-all">XUẤT EXCEL</button>
        </div>
      </div>

      {/* TẦNG 3: MENU ĐIỀU HƯỚNG (Thanh thoát) */}
      <div className="px-8 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-10 h-14">
          {rawTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 h-full text-[13px] font-bold transition-all border-b-2 ${
                  isActive ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-950'
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
