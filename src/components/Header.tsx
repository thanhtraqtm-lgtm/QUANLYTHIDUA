/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import panelImage from '../panel.jpg'; // Đường dẫn tới ảnh của bạn
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
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Container của ảnh: đảm bảo khớp chiều rộng và chiều cao cố định */}
      <div className="w-full overflow-hidden" style={{ height: '150px' }}>
        <img 
          src={panelImage} 
          alt="Header Panel" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* Thanh Menu và Nút chức năng phía dưới */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200 bg-white">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold whitespace-nowrap transition-all border-b-2 ${
                  isActive 
                    ? 'border-blue-600 text-blue-700 bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Nút Xuất Excel & Đăng xuất */}
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <button 
            onClick={onExportExcel} 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[13px] font-bold rounded hover:bg-emerald-700"
          >
            <Download size={16} /> Xuất Excel
          </button>
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-[13px] font-bold rounded border border-red-100 hover:bg-red-100"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
