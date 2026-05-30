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
  activeTab: 'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'manager' | 'departments' | 'importer' | 'accounts';
  setActiveTab: (tab: 'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'manager' | 'departments' | 'importer' | 'accounts') => void;
  onResetData: () => void;
  onClearAllData?: () => void;
  onExportExcel: () => void;
  submissions: ReportSubmission[];
  currentUser: User;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onResetData,
  onClearAllData,
  onExportExcel,
  submissions = [],
  currentUser,
  onLogout
}: HeaderProps) {
  
  const rawTabs = [
    { id: 'dashboard', label: 'Tổng Quan Hiệu Suất', icon: BarChart3 },
    { id: 'browser', label: 'Xem chi tiết báo cáo', icon: BookOpen },
    { id: 'emulationScores', label: 'Xem Điểm Thi Đua', icon: TrendingUp },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Trophy },
    { id: 'manager', label: currentUser?.role === 'tkcs' ? 'Nộp Báo Cáo' : 'Nhập Điểm Thi Đua', icon: Edit },
    { id: 'departments', label: 'Phòng Ban', icon: Briefcase },
    { id: 'importer', label: 'Cổng Nạp Dữ Liệu Excel', icon: Upload },
    { id: 'accounts', label: 'Phân Quyền', icon: Users }
  ] as const;

  const tabs = rawTabs.filter(tab => {
    if (currentUser?.role === 'tkcs' && (tab.id === 'importer' || tab.id === 'accounts')) return false;
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
      
      {/* BACKGROUND VECTOR DECORATIVE GRAPHS & Grid lines - LIGHT GRAPHICS STYLE */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none select-none opacity-40 z-0">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_2rem] opacity-30" />
        
        {/* Sky-blue abstract gradient overlay glow */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute right-40 top-1/4 w-44 h-44 rounded-full bg-indigo-200/25 blur-2xl" />

        {/* Dynamic Vector SVG Line/Bar charts decoration representing trend curve */}
        <svg className="w-full h-full text-indigo-400/40" viewBox="0 0 600 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="header-mesh-grad-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="header-mesh-grad-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Wave Curve 1 */}
          <path 
            d="M 50,90 Q 150,20 250,75 T 450,30 T 650,85 L 650,120 L 50,120 Z" 
            fill="url(#header-mesh-grad-1)" 
            className="transition-all duration-300"
          />
          <path 
            d="M 50,90 Q 150,20 250,75 T 450,30 T 650,85" 
            fill="none" 
            stroke="#38bdf8" 
            strokeWidth="2.5" 
            strokeDasharray="2 3"
            strokeLinecap="round" 
            className="opacity-70"
          />

          {/* Wave Curve 2 */}
          <path 
            d="M 20,105 Q 180,45 320,90 T 520,25 T 650,70 L 650,120 L 20,120 Z" 
            fill="url(#header-mesh-grad-2)" 
          />
          <path 
            d="M 20,105 Q 180,45 320,90 T 520,25 T 650,70" 
            fill="none" 
            stroke="#6366f1" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className="opacity-50"
          />

          {/* Spark points circles */}
          <circle cx="250" cy="75" r="3.5" fill="#0ea5e9" className="animate-ping" />
          <circle cx="250" cy="75" r="2.5" fill="#0284c7" />
          <circle cx="450" cy="30" r="4" fill="#6366f1" />
          <circle cx="520" cy="25" r="3" fill="#10b981" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        
        {/* Main Title, Mini Graphs & Control bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between items-start gap-4 pb-4">
          
          {/* Logo Title text container with custom gradients */}
          <div className="flex items-center space-x-3.5">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-sky-500/10">
              <Trophy className="h-5.5 w-5.5" id="header-trophy-logo-icon" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-white font-sans tracking-wide font-extrabold uppercase bg-gradient-to-r from-red-600 via-blue-600 to-indigo-700 px-2.5 py-0.5 rounded-full shadow-sm">
                  Thống kê Tỉnh Hưng Yên
                </span>
                <span className="text-[9px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-sky-150">
                  <Sparkles className="w-2.5 h-2.5 animate-spin" /> Phiên bản 2026
                </span>
              </div>
              <h1 className="text-md sm:text-2xl font-black tracking-tight font-sans text-slate-900 mt-1" id="app-title-header">
                HỆ THỐNG QUẢN LÝ & CHẤM ĐIỂM THI ĐUA BÁO CÁO THỐNG KÊ
              </h1>
              <p className="text-[11.5px] text-slate-800 font-extrabold font-sans mt-1">
                Vietnam Statistics System — Kênh quản lý nộp báo cáo chuyên môn nghiệp vụ tự động.
              </p>
            </div>
          </div>

          {/* MINI KPI CHARTS & TREND INDICATORS STRIP ("thể hiện bằng hình ảnh biểu đồ...") */}
          <div className="hidden sm:flex items-center space-x-4 lg:space-x-6 bg-slate-50/50 backdrop-blur-xs px-4 py-2 rounded-2xl border border-slate-100/80">
            
            {/* MINI CHART A: Circular progress completeness wheel */}
            <div className="flex items-center space-x-3.5 border-r border-slate-200/80 pr-4 lg:pr-5">
              <div className="relative flex items-center justify-center">
                {/* SVG circular donut chart */}
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle 
                    cx="20" 
                    cy="20" 
                    r={strokeRadius} 
                    stroke="#e2e8f0" 
                    strokeWidth="3.5" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="20" 
                    cy="20" 
                    r={strokeRadius} 
                    stroke="url(#completion-ring-grad)" 
                    strokeWidth="3.5" 
                    fill="transparent" 
                    strokeDasharray={strokeCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="completion-ring-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-[10.5px] font-mono font-black text-slate-900">
                  {Math.round(completionRate)}%
                </span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-800 font-extrabold block uppercase tracking-wide leading-none">Chỉ tiêu hoàn thành</span>
                <span className="text-xs font-extrabold font-mono text-slate-900 block mt-1">
                  {submittedCount} <span className="text-[10px] text-slate-700 font-extrabold">/ {totalCount} báo cáo</span>
                </span>
              </div>
            </div>

            {/* MINI CHART B: Stacked mini bar of on-time versus late issues */}
            <div className="flex items-center space-x-3 border-r border-slate-200/80 pr-4 lg:pr-5">
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center space-x-1 justify-between w-20 text-[9.5px] font-mono text-slate-800 font-black leading-none">
                  <span className="text-emerald-700 font-bold">Đúng {Math.round(onTimeRate)}%</span>
                </div>
                {/* Mini color bars representation */}
                <div className="w-20 h-2 bg-slate-200 rounded-full flex overflow-hidden">
                  <div className="bg-emerald-600" style={{ width: `${onTimeRate}%` }} />
                  <div className="bg-amber-500" style={{ width: `${100 - onTimeRate}%` }} />
                </div>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-800 font-extrabold block uppercase tracking-wide leading-none">Tỷ lệ nộp đúng hạn</span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-xs font-black text-emerald-700 font-mono inline-flex items-center">
                    {onTimeCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">|</span>
                  <span className="text-xs font-black text-amber-600 font-mono inline-flex items-center">
                    {lateCount} trễ
                  </span>
                </div>
              </div>
            </div>

            {/* MINI CHART C: Vector trend path showing average simulation point Index */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                {/* Sparkline curve */}
                <svg className="w-16 h-7 text-indigo-500" viewBox="0 0 100 30" fill="none">
                  <path 
                    d="M 5,22 Q 25,5 45,18 T 85,8 T 95,9" 
                    stroke="#4338ca" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                  <circle cx="45" cy="18" r="2.5" fill="#4f46e5" />
                  <circle cx="85" cy="8" r="2.5" fill="#4338ca" className="animate-ping" />
                  <circle cx="85" cy="8" r="2" fill="#312e81" />
                </svg>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-800 font-extrabold block uppercase tracking-wide leading-none">Chỉ số thi đua TB</span>
                <span className="text-xs font-black text-slate-900 font-sans block mt-1 tracking-tight">
                  {avgPerformanceScore.toFixed(1)} <span className="text-[10px] text-indigo-700 font-black">đ</span>
                </span>
              </div>
            </div>

          </div>

          {/* Utility Action Trigger tools */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end">
            
            {/* User Account / Profile display pill */}
            <div className="flex items-center space-x-2 bg-indigo-50/50 border border-indigo-100/50 px-3 py-1.5 rounded-xl text-slate-700">
              <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-sm">
                {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-[10.5px] font-black font-sans text-slate-900 leading-none">
                  {currentUser?.displayName?.replace('Cục Thống kê', 'Thống kê Tỉnh Hưng Yên')}
                </span>
                <span className="text-[9px] font-black font-mono text-indigo-700 uppercase tracking-widest mt-1.5 leading-none">
                  {currentUser?.role === 'admin' ? 'Admin' : `Đơn vị: ${currentUser?.unitCode}`}
                </span>
              </div>
              
              <div className="h-4.5 w-[1px] bg-slate-200 mx-1.5" />
              
              <button 
                onClick={onLogout}
                className="p-1 hover:bg-rose-100/60 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SheetJS download utility Excel */}
            <button 
              onClick={onExportExcel}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white font-sans font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Xuất Excel</span>
            </button>

            {/* Rollback storage presets reset - Admin only */}
            {currentUser?.role === 'admin' && (
              <>
                <button 
                  onClick={onResetData}
                  className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-sans font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  title="Khôi phục trạng thái mặc định"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline font-sans">Mặc định</span>
                </button>

                {onClearAllData && (
                  <button 
                    onClick={() => {
                      if (window.confirm("Cảnh báo cực hạn: Bạn có thực sự muốn XÓA SẠCH toàn bộ danh mục báo cáo đang giao? Tiến toán này không thể khôi phục và sẽ dọn trống danh sách để tự phân công/nạp mới từ đầu.")) {
                        onClearAllData();
                        alert("Đã xóa sạch toàn bộ các nội dung báo cáo thống kê thành công.");
                      }
                    }}
                    className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 font-sans font-bold rounded-xl border border-rose-100 transition-colors cursor-pointer"
                    title="Xoá sạch toàn bộ báo cáo đang giao"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline font-sans">Xoá Sạch BC</span>
                  </button>
                )}
              </>
            )}

          </div>

        </div>

        {/* BRIGHT TABS NAVIGATION AREA with dynamic bottom borders, aligned to the right for extra permission tab space */}
        <div className="flex overflow-x-auto justify-start md:justify-end gap-3 border-t border-slate-100 pt-3.5 pb-2.5 select-none scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                id={`tab-nav-${tab.id}`}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl font-sans text-xs transition-all relative overflow-hidden shrink-0 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
                  isActive 
                    ? 'bg-sky-50 text-sky-800 font-extrabold shadow-xs border border-sky-100/90' 
                    : 'text-slate-700 hover:text-slate-950 font-bold hover:bg-slate-100/70'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-sky-500"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-700' : 'text-slate-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          {/* Dummy spacer to guarantee spacing at the end. Avoids cut off characters. */}
          <div className="w-10 shrink-0" />
        </div>

      </div>
    </header>
  );
}
