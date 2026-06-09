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
import SummaryMenu from './components/SummaryMenu';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'browser' | 'leaderboard' | 'emulationScores' | 'summary' | 'manager' | 'importer' | 'accounts'>('dashboard');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [browserFilterGradeStatus, setBrowserFilterGradeStatus] = useState<string>('ALL');
  const [browserFilterDept, setBrowserFilterDept] = useState<string>('ALL');

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

  // Accounts state management
  const [accounts, setAccounts] = useState<User[]>(() => {
    const cached = localStorage.getItem('emulation_users');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Ensure they have our updated room types if cached is old
        if (parsed.length <= 1) {
          throw new Error('Migrating accounts layout');
        }

        const OLD_TO_NEW_MAP: Record<string, { code: string; name: string }> = {
          dv_01: { code: 'TKPH', name: 'Thống kê Cơ Sở Phố Hiến' },
          dv_02: { code: 'TKNQ', name: 'Thống kê Cơ Sở Như Quỳnh' },
          dv_03: { code: 'TKYM', name: 'Thống kê Cơ Sở Yên Mỹ' },
          dv_04: { code: 'TKMH', name: 'Thống kê Cơ Sở Mỹ Hào' },
          dv_05: { code: 'TKKC', name: 'Thống kê Cơ Sở Khoái Châu' },
          dv_06: { code: 'TKLB', name: 'Thống kê Cơ Sở Lương Bằng' },
          dv_07: { code: 'TKHHT', name: 'Thống kê Cơ Sở Hoàng Hoa Thám' },
          dv_08: { code: 'TKQP', name: 'Thống kê Cơ Sở Quỳnh Phụ' },
          dv_09: { code: 'TKHH', name: 'Thống kê Cơ Sở Hưng Hà' },
          dv_10: { code: 'TKDH', name: 'Thống kê Cơ Sở Đông Hưng' },
          dv_11: { code: 'TKTT', name: 'Thống kê Cơ Sở Thái Thụy' },
          dv_12: { code: 'TKTH', name: 'Thống kê Cơ Sở Tiền Hải' },
          dv_13: { code: 'TKKX', name: 'Thống kê Cơ Sở Kiến Xương' },
          dv_14: { code: 'TKVT', name: 'Thống kê Cơ Sở Vũ Thư' }
        };

        let hasChange = false;
        const migrated = parsed.map((acc: User) => {
          const normUser = acc.username.toLowerCase();
          if (OLD_TO_NEW_MAP[normUser]) {
            hasChange = true;
            const info = OLD_TO_NEW_MAP[normUser];
            return {
              ...acc,
              username: info.code.toLowerCase(),
              unitCode: info.code,
              displayName: info.name
            };
          }
          if (acc.unitCode && OLD_TO_NEW_MAP[acc.unitCode.toLowerCase()]) {
            hasChange = true;
            const info = OLD_TO_NEW_MAP[acc.unitCode.toLowerCase()];
            return {
              ...acc,
              username: info.code.toLowerCase(),
              unitCode: info.code,
              displayName: info.name
            };
          }
          const matchUnit = UNITS_DATA.find(u => u.Ma_DV === acc.unitCode);
          if (matchUnit && acc.displayName !== matchUnit.Ten_Don_Vi) {
            hasChange = true;
            return {
              ...acc,
              displayName: matchUnit.Ten_Don_Vi
            };
          }
          return acc;
        });

        if (hasChange) {
          localStorage.setItem('emulation_users', JSON.stringify(migrated));
          return migrated;
        }

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

    // Live update active user session if they altered their own profile
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
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('emulation_user');
    setActiveTab('dashboard');
  };

  // 1. Initial State Load logic
  useEffect(() => {
    const cached = localStorage.getItem('emulation_submissions');
    const schemaVersion = localStorage.getItem('emulation_schema_version');
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        
        // If they already have the v2 schema version, we respect whatever is in cached (even [] or customized list)!
        if (schemaVersion === 'v2') {
          setSubmissions(parsed);
        } else {
          // One-time auto-migration to new template
          const usesNewExcelPlan = parsed.some((r: any) => 
            r.Ten_Bao_Cao && (
              r.Ten_Bao_Cao.includes('ngân sách') || 
              r.Ten_Bao_Cao.includes('Ngân sách') || 
              r.Ten_Bao_Cao.includes('Niên giám') || 
              r.Ten_Bao_Cao.includes('tôn giáo')
            )
          );
          
          if (!usesNewExcelPlan && parsed.length > 0) {
            const fresh = generateInitialSubmissions();
            setSubmissions(fresh);
            localStorage.setItem('emulation_submissions', JSON.stringify(fresh));
          } else {
            setSubmissions(parsed);
          }
          localStorage.setItem('emulation_schema_version', 'v2');
        }
      } catch (e) {
        console.error('Failed to parse cached submissions', e);
        const fresh = generateInitialSubmissions();
        setSubmissions(fresh);
        localStorage.setItem('emulation_submissions', JSON.stringify(fresh));
        localStorage.setItem('emulation_schema_version', 'v2');
      }
    } else {
      const fresh = generateInitialSubmissions();
      setSubmissions(fresh);
      localStorage.setItem('emulation_submissions', JSON.stringify(fresh));
      localStorage.setItem('emulation_schema_version', 'v2');
    }
  }, []);

  // Update State & Cache Helper
  const handleUpdateSubmissionsList = (updatedList: ReportSubmission[]) => {
    setSubmissions(updatedList);
    localStorage.setItem('emulation_submissions', JSON.stringify(updatedList));
  };

  // 2. Row Editor Handler
  const handleUpdateSingleSubmission = (id: number, updatedFields: Partial<ReportSubmission>) => {
    setSubmissions(prev => {
      const updated = prev.map(sub => {
        if (sub.ID === id) {
          return {
            ...sub,
            ...updatedFields
          };
        }
        return sub;
      });
      localStorage.setItem('emulation_submissions', JSON.stringify(updated));
      return updated;
    });
  };

  // 3. Reset All Data action
  const handleResetToDefault = () => {
    const fresh = generateInitialSubmissions();
    setSubmissions(fresh);
    localStorage.setItem('emulation_submissions', JSON.stringify(fresh));
    localStorage.setItem('emulation_schema_version', 'v2');
    alert('Đã khôi phục thành công danh sách điểm thi đua và tiến độ mặc định của 14 đơn vị thống kê!');
  };

  const handleClearAllSubmissions = () => {
    setSubmissions([]);
    localStorage.setItem('emulation_submissions', JSON.stringify([]));
    localStorage.setItem('emulation_schema_version', 'v2');
  };

  const handleDeleteSingleSubmission = (id: number) => {
    setSubmissions(prev => {
      const updated = prev.filter(sub => sub.ID !== id);
      localStorage.setItem('emulation_submissions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddNewSubmission = (newSub: Omit<ReportSubmission, "ID">) => {
    setSubmissions(prev => {
      const maxId = prev.reduce((max, sub) => (sub.ID > max ? sub.ID : max), 0);
      const completedSub: ReportSubmission = {
        ...newSub,
        ID: maxId + 1
      };
      const updated = [completedSub, ...prev];
      localStorage.setItem('emulation_submissions', JSON.stringify(updated));
      return updated;
    });
  };

  // 4. Excel Importer complete handler
  const handleImportExcelComplete = (imported: ReportSubmission[]) => {
    setSubmissions(imported);
    localStorage.setItem('emulation_submissions', JSON.stringify(imported));
    localStorage.setItem('emulation_schema_version', 'v2');
    setActiveTab('manager'); // Direct user to managers sheet to inspect imported items
  };

  // 5. Dynamic Leaderboard Row calculation (Calculated reactively whenever submissions change)
  const calculateLeaderboard = (): LeaderboardRow[] => {
    const unitsMap: { [maDv: string]: ReportSubmission[] } = {};
    
    // Group submissions by unit Code
    UNITS_DATA.forEach(u => {
      unitsMap[u.Ma_DV] = [];
    });
    submissions.forEach(sub => {
      if (unitsMap[sub.Ma_DV]) {
        unitsMap[sub.Ma_DV].push(sub);
      }
    });

    const rows: LeaderboardRow[] = UNITS_DATA.map(unit => {
      const unitSubs = unitsMap[unit.Ma_DV] || [];
      const totalCount = unitSubs.length;
      
      const submitted = unitSubs.filter(s => s.Ngay_Nop !== null);
      const submittedCount = submitted.length;
      
      const onTimeCount = submitted.filter(s => (s.So_Ngay_Tre ?? 0) <= 0).length;
      const lateCount = submitted.filter(s => (s.So_Ngay_Tre ?? 0) > 0).length;

      // Overdue is where deadline has passed but no submission
      const isPast = (dateStr: string) => new Date(dateStr) < new Date('2026-05-25');
      const overdueCount = unitSubs.filter(s => s.Ngay_Nop === null && isPast(s.Han_Nop)).length;
      const pendingCount = unitSubs.filter(s => s.Ngay_Nop === null && !isPast(s.Han_Nop)).length;

      const totalDelayedDays = submitted.reduce((sum, s) => sum + (s.So_Ngay_Tre ?? 0), 0);

      // Score Aggregates
      const totalDinhMuc = unitSubs.reduce((sum, s) => sum + s.Diem_Dinh_Muc, 0);
      const totalTimeScore = unitSubs.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0);
      const totalQualityScore = unitSubs.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0);
      
      // Calculate emulation final points
      // Rule: Final Point is calculated out of proportional average scored points
      // Max possible score for a report template is 2 * Diem_Dinh_Muc (Diem_Thoi_Gian + Diem_Chat_Luong)
      // Emulation Score = (Sum(Tong_Diem) / Sum(Diem_Dinh_Muc)) * 100
      let emulationIndex = 0;
      if (totalDinhMuc > 0) {
        const achievedScores = unitSubs.reduce((sum, s) => {
          if (s.Tong_Diem !== null) return sum + s.Tong_Diem;
          // penalty for unsubmitted overdue reports is 0
          return sum;
        }, 0);
        emulationIndex = (achievedScores / totalDinhMuc) * 100;
        // Let's cap index score or scale it naturally
      }

      return {
        Ma_DV: unit.Ma_DV,
        Ten_Don_Vi: unit.Ten_Don_Vi,
        Vung: unit.Vung,
        Tong_Bao_Cao: totalCount,
        Da_Nop: submittedCount,
        Nop_Dung_Han: onTimeCount,
        Nop_Tre_Han: lateCount,
        Chua_Nop: overdueCount,
        Tong_Diem_Dinh_Muc: totalDinhMuc,
        Diem_Thoi_Gian_Tong: totalTimeScore,
        Diem_Chat_Luong_Tong: totalQualityScore,
         // out of max scale, rounded nicely
        Diem_Thi_Dua: Math.round(emulationIndex * 10) / 10,
        So_Ngay_Tre_Tong: totalDelayedDays,
        Rank: 0 // placeholder
      };
    });

    // Sort descending by score, then ascending by total delay days
    const sorted = rows.sort((a, b) => {
      if (b.Diem_Thi_Dua !== a.Diem_Thi_Dua) {
        return b.Diem_Thi_Dua - a.Diem_Thi_Dua;
      }
      return a.So_Ngay_Tre_Tong - b.So_Ngay_Tre_Tong;
    });

    // Assign rank with support for ties
    let currentRank = 1;
    sorted.forEach((row, index) => {
      if (index > 0 && sorted[index - 1].Diem_Thi_Dua !== row.Diem_Thi_Dua) {
        currentRank = index + 1;
      }
      row.Rank = currentRank;
    });

    return sorted;
  };

  const leaderboardData = calculateLeaderboard();

  // 6. Direct Excel Multi-Tab exporter with exact columns requested:
  // Ma_DV, Ma_Phong, Ten_Bao_Cao, Loai_BC, Han_Nop, Diem_TG, Diem_Dinh_Muc, So_Ngay_Tre
  const handleExportExcelAll = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Tab 1: Detailed submissions in the requested columns structure
      const submissionsCSV = submissions.map(sub => ({
        'Ma_DV': sub.Ma_DV,
        'Ma_Phong': sub.Ma_Phong,
        'Ten_Bao_Cao': sub.Ten_Bao_Cao,
        'Loai_BC': sub.Loai_BC,
        'Han_Nop': sub.Han_Nop,
        'Diem_TG': sub.Diem_Thoi_Gian !== null ? sub.Diem_Thoi_Gian : 0,
        'Diem_Dinh_Muc': sub.Diem_Dinh_Muc,
        'So_Ngay_Tre': sub.So_Ngay_Tre !== null ? sub.So_Ngay_Tre : 0
      }));
      const wsSubmissions = XLSX.utils.json_to_sheet(submissionsCSV);
      XLSX.utils.book_append_sheet(wb, wsSubmissions, 'Chi Tiết Giao Điểm Báo Cáo');

      // Tab 2: Aggregated Standings By Unit (Tổng hợp theo Đơn vị)
      const standingsCSV = leaderboardData.map(row => ({
        'Mã đơn vị': row.Ma_DV,
        'Tên đơn vị': row.Ten_Don_Vi,
        'Vùng địa bàn': row.Vung,
        'Tổng chỉ tiêu giao': row.Tong_Bao_Cao,
        'Đã nộp': row.Da_Nop,
        'Đúng hạn': row.Nop_Dung_Han,
        'Trễ hạn': row.Nop_Tre_Han,
        'Chưa nộp': row.Chua_Nop,
        'Tổng số ngày nộp trễ': row.So_Ngay_Tre_Tong,
        'Tổng điểm Đạt được': Math.round((row.Diem_Thoi_Gian_Tong + row.Diem_Chat_Luong_Tong) * 10) / 10,
        'Điểm thi đua thi đua trung bình': row.Diem_Thi_Dua,
        'Xếp Hạng': row.Rank
      }));
      const wsStandings = XLSX.utils.json_to_sheet(standingsCSV);
      XLSX.utils.book_append_sheet(wb, wsStandings, 'Tổng Hợp Theo Đơn Vị');

      // Tab 3: Aggregated By Department (Tổng hợp theo Phòng phụ trách)
      const deptsMetrics = DEPARTMENTS_DATA.map(d => {
        const dSubs = submissions.filter(s => s.Ma_Phong === d.Ma_Phong);
        const total = dSubs.length;
        const comp = dSubs.filter(s => s.Ngay_Nop !== null).length;
        const onTime = dSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) === 0).length;
        const scoreSum = dSubs.reduce((acc, s) => acc + (s.Tong_Diem ?? 0), 0);
        const avgDaysLate = comp > 0 ? (dSubs.reduce((sum, s) => sum + (s.So_Ngay_Tre ?? 0), 0) / comp) : 0;
        return {
          'Mã phòng': d.Ma_Phong,
          'Phòng chuyên môn nghiệp vụ': d.Ten_Phong,
          'Tổng chỉ tiêu giao': total,
          'Đã nhận nộp': comp,
          'Nộp chuẩn thời hạn': onTime,
          'Tỷ lệ hoàn thành %': total > 0 ? `${Math.round((comp / total) * 100)}%` : '0%',
          'Bình quân số ngày trễ': Math.round(avgDaysLate * 10) / 10,
          'Tổng điểm thi đua phòng': Math.round(scoreSum * 10) / 10
        };
      });
      const wsDepts = XLSX.utils.json_to_sheet(deptsMetrics);
      XLSX.utils.book_append_sheet(wb, wsDepts, 'Tổng Hợp Theo Phòng');

      // Tab 4: Aggregated By Report Type (Tổng hợp theo Loại báo cáo)
      const reportTypes = Array.from(new Set(submissions.map(s => s.Loai_BC || 'Tháng')));
      const typesMetrics = reportTypes.map(type => {
        const tSubs = submissions.filter(s => s.Loai_BC === type);
        const total = tSubs.length;
        const comp = tSubs.filter(s => s.Ngay_Nop !== null).length;
        const onTime = tSubs.filter(s => s.Ngay_Nop !== null && (s.So_Ngay_Tre ?? 0) === 0).length;
        const scoreSum = tSubs.reduce((acc, s) => acc + (s.Tong_Diem ?? 0), 0);
        return {
          'Loại báo cáo': type,
          'Tổng lượt chỉ tiêu giao': total,
          'Đã hoàn thành': comp,
          'Nộp đúng hạn': onTime,
          'Tỷ lệ hoàn thành': total > 0 ? `${Math.round((comp / total) * 100)}%` : '0%',
          'Tổng điểm thi đua loại BC': Math.round(scoreSum * 10) / 10
        };
      });
      const wsTypes = XLSX.utils.json_to_sheet(typesMetrics);
      XLSX.utils.book_append_sheet(wb, wsTypes, 'Tổng Hợp Theo Loại BC');

      XLSX.writeFile(wb, 'Phan_Mem_Giao_Diem_Thi_Dua_Chi_Tiet_2026.xlsx');
      alert('Đã tải thành công tệp Excel đa trang! Trang đầu tiên chứa dữ liệu 8 cột chi tiết theo yêu cầu, kèm theo các trang tổng hợp theo Đơn vị, Phòng chuyên trách và Loại báo cáo.');
    } catch (err: any) {
      alert(`Đã xảy ra lỗi khi tạo tệp Excel: ${err.message}`);
    }
  };

  // Selected Unit Submissions for modal overview drilldown
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
    return <Login onLoginSuccess={handleLoginSuccess} units={UNITS_DATA} accounts={accounts} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-sky-500/20">
      
      {/* Visual Navigation Header component */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        submissions={submissions}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main active route container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <StatsDashboard 
            submissions={submissions}
            leaderboard={leaderboardData}
            onSelectUnit={(maDv) => {
              setSelectedUnit(maDv);
            }}
            onClickOverdue={() => {
              setBrowserFilterGradeStatus('OVERDUE');
              setBrowserFilterDept('ALL');
              setActiveTab('browser');
            }}
            onClickCompletionRate={() => {
              setBrowserFilterGradeStatus('SUBMITTED');
              setBrowserFilterDept('ALL');
              setActiveTab('browser');
            }}
            onClickEmulationScore={() => {
              setActiveTab('leaderboard');
            }}
            onClickQualityScore={() => {
              setBrowserFilterGradeStatus('GRADED');
              setBrowserFilterDept('ALL');
              setActiveTab('browser');
            }}
            onClickTimeScore={() => {
              setBrowserFilterGradeStatus('ON_TIME');
              setBrowserFilterDept('ALL');
              setActiveTab('browser');
            }}
            onResetData={handleResetToDefault}
          />
        )}

        {activeTab === 'browser' && (
          <ReportBrowser 
            submissions={submissions}
            departments={DEPARTMENTS_DATA}
            units={UNITS_DATA}
            onUpdateSubmission={handleUpdateSingleSubmission}
            onDeleteSubmission={handleDeleteSingleSubmission}
            currentUser={currentUser}
            initialGradeStatus={browserFilterGradeStatus}
            initialDept={browserFilterDept}
            onFilterChange={(status, dept) => {
              setBrowserFilterGradeStatus(status);
              setBrowserFilterDept(dept);
            }}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard 
            leaderboard={leaderboardData}
            submissions={submissions}
            onSelectUnit={(maDv) => setSelectedUnit(maDv)}
            selectedUnitSubmissions={getSelectedUnitSubmissions()}
            selectedUnitName={getSelectedUnitName()}
            onCloseDetailModal={() => setSelectedUnit(null)}
          />
        )}

        {activeTab === 'emulationScores' && (
          <EmulationScores 
            submissions={submissions}
            units={UNITS_DATA}
            departments={DEPARTMENTS_DATA}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryMenu 
            submissions={submissions}
            departments={DEPARTMENTS_DATA}
            units={UNITS_DATA}
          />
        )}

        {activeTab === 'manager' && (
          <SubmissionManager 
            submissions={submissions}
            departments={DEPARTMENTS_DATA}
            units={UNITS_DATA}
            onUpdateSubmission={handleUpdateSingleSubmission}
            onDeleteSubmission={handleDeleteSingleSubmission}
            onAddNewSubmission={handleAddNewSubmission}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'importer' && (
          <ExcelImporter 
            onImportComplete={handleImportExcelComplete}
            existingCount={submissions.length}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountManager 
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onResetAccounts={handleResetAccounts}
            units={UNITS_DATA}
            currentUser={currentUser}
            onResetData={handleResetToDefault}
            onClearAllData={handleClearAllSubmissions}
            onExportExcel={handleExportExcelAll}
          />
        )}

      </main>

    </div>
  );
}
