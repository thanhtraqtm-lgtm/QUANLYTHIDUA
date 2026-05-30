/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import panelImage from '../panel.png'; 
import { 
  BarChart3, Edit, Briefcase, Upload, Users, 
  BookOpen, TrendingUp, Trophy, LogOut, Download 
} from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExportExcel: () => void;
  submissions: ReportSubmission[];
  currentUser: User;
  onLogout: () => void;
}

export default function Header({
  activeTab, setActiveTab, onExportExcel, submissions, currentUser, onLogout
}: HeaderProps) {
  
  const tabs = useMemo(() => [
    { id: 'dashboard', label: 'Tổng Quan', icon: BarChart3 },
    { id: 'browser', label: 'Chi Tiết BC', icon: BookOpen },
    { id: 'emulationScores', label: 'Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp BC' : 'Nhập Điểm', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Nạp Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ].filter(tab => !(currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts'))), [currentUser?.role]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full shadow-sm">
      <div className="w-full max-w-[1300px] mx-auto px-10">
        
        {/* Container Ảnh */}
        <div className="w-full pt-2 relative">
          <img 
            src={panelImage} 
            alt="Header Panel" 
            className="w-full h-[270px] object-cover rounded-lg block" 
          />

          {/* ĐỒ THỊ - ĐÃ ÉP HIỂN THỊ MÀU ĐỎ RỰC - Z-INDEX 9999 */}
          <div className="absolute top-4 right-4 z-[9999] bg-white p-4 rounded-xl border-4 border-red-600 shadow-2xl">
             <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Xu hướng (Check)</p>
             <svg width="120" height="40" viewBox="0 0 100 30">
               <path 
                 d="M 0 25 C 20 5, 40 25, 60 10 S 80 25, 100 5" 
                 fill="none" 
                 stroke="#ff0000" 
                 strokeWidth="4" 
                 strokeLinecap="round"
               />
             </svg>
          </div>
        </div>
        
        {/* Menu điều hướng */}
        <div className="flex items-center justify-between mt-2 px-2 pb-1">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-[12px] font-bold whitespace-nowrap border-b-2 transition-all -mb-[1px] ${
                    isActive 
                      ? 'border-blue-600 text-blue-700' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 py-1 shrink-0 ml-4">
            <button onClick={onExportExcel} className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-[12px] font-bold rounded hover:bg-emerald-700 transition-colors">
              <Download size={14} /> Excel
            </button>
            <button onClick={onLogout} className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 text-[12px] font-bold rounded border border-red-100 hover:bg-red-100 transition-colors">
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
