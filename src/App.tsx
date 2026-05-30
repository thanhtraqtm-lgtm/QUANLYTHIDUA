/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsDashboard from './components/StatsDashboard';
import Leaderboard from './components/Leaderboard';
import SubmissionManager from './components/SubmissionManager';
import DepartmentReport from './components/DepartmentReport';
import ExcelImporter from './components/ExcelImporter';
import Login from './components/Login';
import ReportBrowser from './components/ReportBrowser';
import AccountManager from './components/AccountManager';
import EmulationScores from './components/EmulationScores';
import { generateInitialSubmissions, UNITS_DATA, DEPARTMENTS_DATA } from './data/emulationData';
import { ReportSubmission, LeaderboardRow, Unit, Department, User } from './types';
import * as XLSX from 'xlsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem('emulation_user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [submissions, setSubmissions] = useState<ReportSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'manager' | 'departments' | 'importer' | 'accounts'>('dashboard');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  
  // State mới để lọc dữ liệu
  const [filterType, setFilterType] = useState<string>('all');

  // Helper to initialize standard user accounts
  const getDefaultAccounts = (): User[] => {
    const adminAcc: User = {
      username: 'admin',
      role: 'admin',
      displayName: 'Quản trị viên Hệ thống (Toàn quyền)',
      password: '123',
      permissions: ['view_reports', 'grade_reports', 'upload_excel', 'manage_accounts']
    };

    const deptsAccs: User[] = [
      {
        username: 'phong_th',
        role: 'room',
        deptCode: 'P_TH',
        displayName: 'Phòng Thống kê Tổng hợp (Người chấm)',
        password: '123',
        permissions: ['view_reports', 'grade_reports', 'upload_excel']
      },
      {
        username: 'phong_cn',
        role: 'room',
        deptCode: 'P_CN',
        displayName: 'Phòng Thống kê Công nghiệp (Người chấm)',
        password: '123',
        permissions: ['view_reports', 'grade_reports']
      },
      {
        username: 'phong_nnxh',
        role: 'room',
        deptCode: 'P_NNXH',
        displayName: 'Phòng Thống kê Nông nghiệp và Xã hội (Người chấm)',
        password: '123',
        permissions: ['view_reports', 'grade_reports']
      },
      {
        username: 'phong_dv',
        role: 'room',
        deptCode: 'P_DV',
        displayName: 'Phòng Thống kê Thương mại - Dịch vụ (Người chấm)',
        password: '123',
        permissions: ['view_reports', 'grade_reports']
      },
      {
        username: 'phong_tchc',
        role: 'room',
        deptCode: 'P_TCHC',
        displayName: 'Phòng Tổ Chức Hành Chính (Người chấm)',
        password: '123',
        permissions: ['view_reports', 'grade_reports']
      }
    ];

    const tkcsAccs: User[] = UNITS_DATA.map(u => ({
      username: u.Ma_DV.toLowerCase(),
      role: 'tkcs' as const,
      unitCode: u.Ma_DV,
      displayName: u.Ten_Don_Vi,
      password: '123',
      permissions: ['view_reports']
    }));

    return [adminAcc, ...deptsAccs, ...tkcsAccs];
  };

  const [accounts, setAccounts] = useState<User[]>(() => {
    const cached = localStorage.getItem('emulation_users');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.length <= 1) throw new Error('Migrating accounts layout');
        return parsed;
      } catch (e) {}
    }
    const defaultAccs = getDefaultAccounts();
    localStorage.setItem('emulation_users', JSON.stringify(defaultAccs));
    return defaultAccs;
  });

  const handleAddAccount = (newAcc: User) => {
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    localStorage.setItem('emulation_users', JSON.stringify(updated));
  };

  const handleUpdateAccount = (username: string, updatedFields: Partial<User>) => {
    const updated = accounts.map(acc => {
      if (acc.username.toLowerCase() === username.toLowerCase()) {
        return { ...acc, ...updatedFields };
      }
      return acc;
    });
    setAccounts(updated);
    localStorage.setItem('emulation_users', JSON.stringify(updated));

    if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
      const merged = { ...currentUser, ...updatedFields };
      setCurrentUser(merged);
      localStorage.setItem('emulation_user', JSON.stringify(merged));
    }
  };

  const handleDeleteAccount = (username: string) => {
    const updated = accounts.filter(acc => acc.username.toLowerCase() !== username.toLowerCase());
    setAccounts(updated);
    localStorage.setItem('emulation_users', JSON.stringify(updated));
  };

  const handleResetAccounts = () => {
    const defaultAccs = getDefaultAccounts();
    setAccounts(defaultAccs);
    localStorage.setItem('emulation_users', JSON.stringify(defaultAccs));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('emulation_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('emulation_user');
    setActiveTab('dashboard');
  };

  useEffect(() => {
    const cached = localStorage.getItem('emulation_submissions');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const usesNewExcelPlan = parsed.some((r: any) => 
          r.Ten_Bao_Cao && (
            r.Ten_Bao_Cao.includes('ngân sách') || 
            r.Ten_Bao_Cao.includes('Ngân sách') || 
            r.Ten_Bao_Cao.includes('Niên giám') || 
            r.Ten_Bao_Cao.includes('tôn giáo')
          )
        );
        
        if (!usesNewExcelPlan) {
          const fresh = generateInitialSubmissions();
          setSubmissions(fresh);
          localStorage.setItem('emulation_submissions', JSON.stringify(fresh));
        } else {
          setSubmissions(parsed);
        }
      } catch (e) {
        console.error('Failed to parse cached submissions', e);
        const fresh = generateInitialSubmissions();
        setSubmissions(fresh);
        localStorage.setItem('emulation_submissions', JSON.stringify(fresh));
      }
    } else {
      const fresh = generateInitialSubmissions();
      setSubmissions(fresh);
      localStorage.setItem('emulation_submissions', JSON.stringify(fresh));
    }
  }, []);

  const handleUpdateSubmissionsList = (updatedList: ReportSubmission[]) => {
    setSubmissions(updatedList);
    localStorage.setItem('emulation_submissions', JSON.stringify(updatedList));
  };

  const handleUpdateSingleSubmission = (id: number, updatedFields: Partial<ReportSubmission>) => {
    const updated = submissions.map(sub => {
      if (sub.ID === id) {
        return { ...sub, ...updatedFields };
      }
      return sub;
    });
    handleUpdateSubmissionsList(updated);
  };

  const handleResetToDefault = () => {
    const fresh = generateInitialSubmissions();
    handleUpdateSubmissionsList(fresh);
    alert('Đã khôi phục thành công danh sách điểm thi đua và tiến độ mặc định của 14 đơn vị thống kê cấp huyện!');
  };

  const handleClearAllSubmissions = () => {
    handleUpdateSubmissionsList([]);
  };

  const handleDeleteSingleSubmission = (id: number) => {
    const updated = submissions.filter(sub => sub.ID !== id);
    handleUpdateSubmissionsList(updated);
  };

  const handleAddNewSubmission = (newSub: Omit<ReportSubmission, "ID">) => {
    const maxId = submissions.reduce((max, sub) => (sub.ID > max ? sub.ID : max), 0);
    const completedSub: ReportSubmission = {
      ...newSub,
      ID: maxId + 1
    };
    handleUpdateSubmissionsList([completedSub, ...submissions]);
  };

  const handleImportExcelComplete = (imported: ReportSubmission[]) => {
    handleUpdateSubmissionsList(imported);
    setActiveTab('manager'); 
  };

  // Logic lọc dữ liệu mới
  const handleNavigate = (criteria: string) => {
    setFilterType(criteria);
    setActiveTab('browser');
  };

  const getFilteredSubmissions = () => {
    const today = new Date('2026-05-25');
    switch (filterType) {
      case 'submitted': return submissions.filter(s => s.Ngay_Nop !== null);
      case 'ontime': return submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) <= 0);
      case 'late': return submissions.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) > 0);
      case 'overdue': return submissions.filter(s => s.Ngay_Nop === null && new Date(s.Han_Nop) < today);
      default: return submissions;
    }
  };

  const calculateLeaderboard = (): LeaderboardRow[] => {
    const unitsMap: { [maDv: string]: ReportSubmission[] } = {};
    UNITS_DATA.forEach(u => { unitsMap[u.Ma_DV] = []; });
    submissions.forEach(sub => { if (unitsMap[sub.Ma_DV]) unitsMap[sub.Ma_DV].push(sub); });

    const rows: LeaderboardRow[] = UNITS_DATA.map(unit => {
      const unitSubs = unitsMap[unit.Ma_DV] || [];
      const submitted = unitSubs.filter(s => s.Ngay_Nop !== null);
      const isPast = (dateStr: string) => new Date(dateStr) < new Date('2026-05-25');
      
      let emulationIndex = 0;
      const totalDinhMuc = unitSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
      if (totalDinhMuc > 0) {
        const achievedScores = unitSubs.reduce((sum, s) => (s.Tong_Diem !== null ? sum + s.Tong_Diem : sum), 0);
        emulationIndex = (achievedScores / totalDinhMuc) * 100;
      }

      return {
        Ma_DV: unit.Ma_DV,
        Ten_Don_Vi: unit.Ten_Don_Vi,
        Vung: unit.Vung,
        Tong_Bao_Cao: unitSubs.length,
        Da_Nop: submitted.length,
        Nop_Dung_Han: submitted.filter(s => (s.So_Ngay_Tre ?? 0) <= 0).length,
        Nop_Tre_Han: submitted.filter(s => (s.So_Ngay_Tre ?? 0) > 0).length,
        Chua_Nop: unitSubs.filter(s => s.Ngay_Nop === null && isPast(s.Han_Nop)).length,
        Tong_Diem_Dinh_Muc: totalDinhMuc,
        Diem_Thoi_Gian_Tong: unitSubs.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0),
        Diem_Chat_Luong_Tong: unitSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0),
        Diem_Thi_Dua: Math.round(emulationIndex * 10) / 10,
        So_Ngay_Tre_Tong: submitted.reduce((sum, s) => sum + (s.So_Ngay_Tre ?? 0), 0),
        Rank: 0
      };
    });

    const sorted = rows.sort((a, b) => b.Diem_Thi_Dua - a.Diem_Thi_Dua || a.So_Ngay_Tre_Tong - b.So_Ngay_Tre_Tong);
    sorted.forEach((row, index) => { row.Rank = (index > 0 && sorted[index - 1].Diem_Thi_Dua !== row.Diem_Thi_Dua) ? index + 1 : (index === 0 ? 1 : sorted[index-1].Rank); });
    return sorted;
  };

  const leaderboardData = calculateLeaderboard();

  const handleExportExcelAll = () => {
    // Giữ nguyên logic Excel của bạn...
    // (Lược bỏ đoạn code này trong hiển thị để rút gọn, bạn giữ nguyên code cũ của bạn là được)
    alert("Chức năng Excel giữ nguyên");
  };

  const getSelectedUnitSubmissions = (): ReportSubmission[] | null => {
    if (!selectedUnit) return null;
    return submissions.filter(s => s.Ma_DV === selectedUnit);
  };

  const getSelectedUnitName = (): string | null => {
    if (!selectedUnit) return null;
    const unitObj = UNITS_DATA.find(u => u.Ma_DV === selectedUnit);
    return unitObj ? unitObj.Ten_Don_Vi : selectedUnit;
  };

  if (currentUser === null) {
    return <Login onLoginSuccess={handleLoginSuccess} units={UNITS_DATA} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetToDefault}
        onClearAllData={handleClearAllSubmissions}
        onExportExcel={handleExportExcelAll}
        submissions={submissions}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <StatsDashboard 
            submissions={submissions}
            leaderboard={leaderboardData}
            onSelectUnit={(maDv) => setSelectedUnit(maDv)}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'browser' && (
          <ReportBrowser 
            submissions={getFilteredSubmissions()} // Đã thay bằng dữ liệu đã lọc
            departments={DEPARTMENTS_DATA}
            units={UNITS_DATA}
            onUpdateSubmission={handleUpdateSingleSubmission}
            currentUser={currentUser}
          />
        )}
        
        {/* ... (Các Tab còn lại giữ nguyên) ... */}
        {activeTab === 'leaderboard' && <Leaderboard leaderboard={leaderboardData} submissions={submissions} onSelectUnit={(maDv) => setSelectedUnit(maDv)} selectedUnitSubmissions={getSelectedUnitSubmissions()} selectedUnitName={getSelectedUnitName()} onCloseDetailModal={() => setSelectedUnit(null)} />}
        {activeTab === 'emulationScores' && <EmulationScores submissions={submissions} units={UNITS_DATA} departments={DEPARTMENTS_DATA} />}
        {activeTab === 'manager' && <SubmissionManager submissions={submissions} departments={DEPARTMENTS_DATA} units={UNITS_DATA} onUpdateSubmission={handleUpdateSingleSubmission} onDeleteSubmission={handleDeleteSingleSubmission} onAddNewSubmission={handleAddNewSubmission} currentUser={currentUser} />}
        {activeTab === 'departments' && <DepartmentReport submissions={submissions} departments={DEPARTMENTS_DATA} />}
        {activeTab === 'importer' && <ExcelImporter onImportComplete={handleImportExcelComplete} existingCount={submissions.length} />}
        {activeTab === 'accounts' && <AccountManager accounts={accounts} onAddAccount={handleAddAccount} onUpdateAccount={handleUpdateAccount} onDeleteAccount={handleDeleteAccount} onResetAccounts={handleResetAccounts} units={UNITS_DATA} currentUser={currentUser} />}
      </main>
    </div>
  );
}
