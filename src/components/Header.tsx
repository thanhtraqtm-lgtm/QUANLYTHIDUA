/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  BarChart3, 
  Edit, 
  Briefcase, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  User as UserIcon,
  BookOpen,
  Users,
  Grid,
  Trash2
} from 'lucide-react';
import { ReportSubmission, User } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'summary' | 'manager' | 'importer' | 'accounts';
  setActiveTab: (tab: 'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'summary' | 'manager' | 'importer' | 'accounts') => void;
  submissions: ReportSubmission[];
  currentUser: User;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  submissions = [],
  currentUser,
  onLogout
}: HeaderProps) {
  
  const [bannerUrl, setBannerUrl] = React.useState<string | null>(() => {
    return localStorage.getItem('system_banner_image') || '/panel.png';
  });
  const [isBannerError, setIsBannerError] = React.useState(false);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBase64 = event.target?.result as string;
        
        // 1. Cập nhật state ngay lập tức để người dùng nhìn thấy ảnh tức thì!
        setBannerUrl(rawBase64);
        setIsBannerError(false);
        
        // 2. Thực hiện tối ưu nén lưu trữ trong nền, không để lỗi chặn hiển thị hình ảnh hiện tại
        const img = new Image();
        img.onload = () => {
          try {
            const maxWidth = 1200;
            const maxHeight = 300;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
              try {
                localStorage.setItem('system_banner_image', compressedBase64);
                // Cập nhật lại bản tối ưu nhẹ hơn nếu lưu thành công
                setBannerUrl(compressedBase64);
              } catch (storageErr) {
                console.warn('Không thể lưu ảnh lâu dài vào localStorage (bộ nhớ đầy hoặc bị chặn iframe):', storageErr);
              }
            }
          } catch (canvasErr) {
            console.warn('Lỗi xử lý canvas nén:', canvasErr);
          }
        };
        img.onerror = () => {
          console.warn('Lỗi tải ảnh động.');
        };
        img.src = rawBase64;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBanner = () => {
    localStorage.removeItem('system_banner_image');
    setBannerUrl('/panel.png');
    setIsBannerError(false);
  };
  
  const rawTabs = [
    { id: 'dashboard', label: 'Tổng Quan', icon: BarChart3 },
    { id: 'browser', label: 'Chi Tiết BC', icon: BookOpen },
    { id: 'emulationScores', label: 'Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { id: 'summary', label: 'Tổng Hợp', icon: Grid },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp BC' : 'Chấm Điểm', icon: Edit },
    { id: 'importer', label: 'Giao Báo Cáo', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ] as const;

  const tabs = rawTabs.filter(tab => {
    if (tab.id === 'importer' && !currentUser?.permissions?.includes('upload_excel')) {
      return false;
    }
    if (tab.id === 'accounts' && !currentUser?.permissions?.includes('manage_accounts')) {
      return false;
    }
    return true;
  });

  // Calculate high-level metrics for mini charts in header unit
  const totalCount = submissions.length;
  const submittedCount = submissions.filter(s => s.Ngay_Nop !== null).length;
  const onTimeCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0).length;
  const lateCount = submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0).length;
  
  // Ratios
  const completionRate = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;
  const onTimeRate = submittedCount > 0 ? (onTimeCount / submittedCount) * 100 : 0;

  // Average Score of all elements
  const totalPointsAchieved = submissions.reduce((sum, s) => {
    if (s.Tong_Diem !== null) return sum + s.Tong_Diem;
    return sum;
  }, 0);
  const totalPointsCap = submissions.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
  const avgPerformanceScore = totalPointsCap > 0 ? (totalPointsAchieved / totalPointsCap) * 100 : 0;

  // Dynamic stroke settings for progress ring
  const strokeRadius = 15;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (completionRate / 100) * strokeCircumference;

  return (
    <header className="bg-white border-b border-indigo-100/80 sticky top-0 z-40 shadow-sm relative overflow-hidden transition-all duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        
        {/* Main Title, Mini Graphs & Control bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between items-start gap-4 pb-4">
          
          {/* Logo Title text container or Beautiful Panoramic Banner Image */}
          {bannerUrl && !isBannerError ? (
            <div className="flex-1 w-full relative group rounded-2xl overflow-hidden border border-indigo-100 shadow-sm transition-all duration-200">
              <img 
                src={bannerUrl} 
                alt="HỆ THỐNG QUẢN LÝ BÁO CÁO THI ĐUA THỐNG KÊ TỈNH HƯNG YÊN" 
                onError={() => {
                  if (bannerUrl === '/panel.png') {
                    setIsBannerError(true);
                  } else {
                    setBannerUrl('/panel.png');
                  }
                }}
                className="w-full h-auto block"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-slate-900/60 backdrop-blur-xs p-1.5 rounded-xl z-20">
                <label className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1">
                  <Upload className="w-3 h-3 text-indigo-600" />
                  Thay đổi ảnh banner
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                </label>
                <button 
                  onClick={handleResetBanner}
                  className="px-2 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Logo chữ
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3.5">
              <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-sky-500/10 shrink-0">
                <Trophy className="h-5.5 w-5.5" id="header-trophy-logo-icon" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-white font-sans tracking-wide font-bold uppercase bg-gradient-to-r from-red-600 via-blue-600 to-indigo-700 px-2.5 py-0.5 rounded-full shadow-sm">
                    Thống kê Tỉnh Hưng Yên
                  </span>
                  <span className="text-[9px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-sky-150">
                    <Sparkles className="w-2.5 h-2.5 animate-spin" /> Phiên bản 2026
                  </span>
                </div>
                <h1 className="text-md sm:text-2xl font-bold tracking-tight font-sans text-slate-900 mt-1" id="app-title-header">
                  HỆ THỐNG QUẢN LÝ & CHẤM ĐIỂM THI ĐUA BÁO CÁO THỐNG KÊ
                </h1>
                <p className="text-[11.5px] text-slate-600 font-medium font-sans mt-1">
                  Vietnam Statistics System — Kênh quản lý nộp báo cáo chuyên môn nghiệp vụ tự động.
                </p>
              </div>
              {/* Add an option to upload the banner directly from here */}
              <div className="pl-2 border-l border-slate-100 hidden md:block">
                <label className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs" title="Tải ảnh banner thay thế tiêu đề chữ">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  Sử dụng ảnh Panel
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Utility Action Trigger tools */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end shrink-0">
            

          </div>

        </div>

        {/* BRIGHT TABS NAVIGATION AREA with dynamic bottom borders, aligned to the right for extra permission tab space */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-slate-100 pt-3.5 pb-2.5 select-none overflow-visible">
          {/* List of scrollable category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1.5 lg:pb-0 flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  id={`tab-nav-${tab.id}`}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-sans text-xs transition-all relative overflow-hidden shrink-0 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-sky-500/40 border ${
                    isActive 
                      ? 'bg-indigo-700 text-white font-bold shadow-sm border-indigo-800' 
                      : 'text-slate-700 hover:text-indigo-950 font-semibold bg-slate-50 border-slate-300 hover:bg-slate-100 hover:shadow-xs'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            {/* Dummy spacer to guarantee spacing at the end. Avoids cut off characters. */}
            <div className="w-4 shrink-0" />
          </div>

          {/* Right Action Menu: LOGOUT only */}
          <div className="flex items-center gap-2 shrink-0 lg:border-l lg:border-slate-100 lg:pl-3.5">
            {/* Logout trigger */}
            <button 
              onClick={onLogout}
              className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 active:scale-[0.98] font-sans font-extrabold rounded-xl border border-rose-150 transition-all cursor-pointer whitespace-nowrap"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
