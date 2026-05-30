/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import panelImage from '../panel.jpg'; 
import { 
  BarChart3, Edit, Briefcase, Upload, Users, 
  BookOpen, TrendingUp, Trophy, LogOut, Download 
} from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onExportExcel: () => void;
  submissions: ReportSubmission[];
  currentUser: User;
  onLogout: () => void;
}

export default function Header({
  activeTab, setActiveTab, onExportExcel, currentUser, onLogout
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
    <header className="sticky top-0 z-50 bg-white">
      {/* ẢNH PANEL: Đảm bảo không có padding, không có margin, ép sát mép */}
      <div className="w-full">
        <img 
          src={panelImage} 
          alt="Header Panel" 
          className="w-full h-[150px] object-cover block" 
        />
      </div>
      
      {/* THANH MENU: Đảm bảo chiều rộng bằng ảnh bên trên */}
      <div className="flex items-center justify-between px-4 border-b border-gray-200 bg-white">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold whitespace-nowrap border-b-2 transition-all ${
                  isActive 
                    ? 'border-blue-600 text-blue-700' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Nút chức năng */}
        <div className="flex items-center gap-2 py-1 shrink-0">
          <button onClick={onExportExcel} className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-[12px] font-bold rounded hover:bg-emerald-700">
            <Download size={14} /> Excel
          </button>
          <button onClick={onLogout} className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 text-[12px] font-bold rounded border border-red-100">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
