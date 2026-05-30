/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logo from '../logo.png'; 
import { BarChart3, Edit, Briefcase, Upload, Users, BookOpen, TrendingUp, Trophy, LogOut, Trash2, Settings } from 'lucide-react';
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
    { id: 'dashboard', label: 'Xem chi tiết báo cáo', icon: BarChart3 },
    { id: 'browser', label: 'Xem Điểm Thi Đua', icon: BookOpen },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Trophy },
    { id: 'manager', label: 'Nhập Điểm Thi Đua', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Cổng Nạp Dữ Liệu Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ];

  const totalCount = submissions.length || 1;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const progressPercent = Math.round((submittedCount / totalCount) * 100);

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 py-5">
        <div className="flex items-start justify-between gap-8">
          
          {/* 1. Phần Tiêu đề bên trái */}
          <div className="w-1/3">
            <div className="flex gap-2 mb-3">
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded">THỐNG KÊ TỈNH HƯNG YÊN</span>
              <span className="border border-slate-300 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">Phiên bản 2026</span>
            </div>
            <h1 className="text-[18px] font-black text-slate-950 leading-tight">HỆ THỐNG QUẢN LÝ & CHẤM ĐIỂM THI ĐUA BÁO CÁO THỐNG KÊ</h1>
            <p className="text-[12px] text-slate-500 mt-2">Vietnam Statistics System — Kênh quản lý nộp báo cáo chuyên môn nghiệp vụ tự động.</p>
          </div>

          {/* 2. Khối KPI trung tâm */}
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center font-bold text-slate-500">{progressPercent}%</div>
                <div>
                   <p className="text-[9px] font-bold text-slate-500 uppercase">Chỉ tiêu hoàn thành</p>
                   <p className="text-sm font-bold">{submittedCount} / {totalCount} báo cáo</p>
                </div>
             </div>
             
             {/* Đồ thị dạng đường đơn giản */}
             <div className="flex items-end gap-1 h-8">
                <div className="w-8 h-2 bg-orange-500 rounded-full"></div>
                <svg className="w-20 h-8" viewBox="0 0 100 30" fill="none" stroke="#6366f1" strokeWidth="2">
                   <path d="M0 25 C 20 25, 30 5, 50 15 S 80 5, 100 5" />
                </svg>
             </div>
          </div>

          {/* 3. Khu vực tài khoản & Chức năng */}
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">Q</div>
                <div className="text-xs">
                    <p className="font-bold">Quản trị viên Hệ thống</p>
                    <p className="text-[10px] text-slate-500 uppercase">{currentUser?.role || 'ADMIN'}</p>
                </div>
             </div>
             <div className="flex gap-2">
                <button onClick={onExportExcel} className="flex-1 bg-emerald-600 text-white text-[11px] font-bold py-2 rounded-lg hover:bg-emerald-700">Xuất Excel</button>
                <button onClick={onResetData} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200"><Settings size={14}/></button>
                <button onClick={onLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button>
             </div>
          </div>
        </div>
      </div>

      {/* 4. Menu phía dưới */}
      <div className="border-t border-slate-100 px-6">
         <div className="max-w-[1600px] mx-auto flex gap-8 py-4">
            {rawTabs.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-2 text-[13px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}>
                     <Icon size={16} />
                     {tab.label}
                  </button>
               );
            })}
         </div>
      </div>
    </header>
  );
}
