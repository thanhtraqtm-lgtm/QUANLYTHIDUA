/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User as UserIcon, ShieldAlert, Eye, EyeOff, Trophy, Info } from 'lucide-react';
import { User as UserType, Unit } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
  units: Unit[];
  accounts?: UserType[];
}

export default function Login({ onLoginSuccess, units, accounts }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const inputUser = username.trim().toLowerCase();

    // Fetch stateful accounts
    let availAccounts = accounts || [];
    if (availAccounts.length === 0) {
      const cachedUsersRaw = localStorage.getItem('emulation_users');
      if (cachedUsersRaw) {
        try {
          availAccounts = JSON.parse(cachedUsersRaw);
        } catch (err) {}
      }
    }

    setTimeout(() => {
      // 1. Check custom users state
      const matched = availAccounts.find(
        u => u.username.toLowerCase() === inputUser && u.password === password
      );

      if (matched) {
        onLoginSuccess(matched);
      } else {
        // 2. Fallback check for default admin
        if (inputUser === 'admin' && password === '123') {
          onLoginSuccess({
            username: 'admin',
            role: 'admin',
            displayName: 'Quản trị viên Hệ thống (Toàn quyền)',
            permissions: ['view_reports', 'grade_reports', 'upload_excel', 'manage_accounts']
          });
          return;
        }

        // 3. Fallback check for default department accounts
        const defaultDepts = [
          { username: 'phong_th', deptCode: 'P_TH', displayName: 'Phòng Tổng hợp (Người chấm)' },
          { username: 'phong_cn', deptCode: 'P_CN', displayName: 'Phòng Thống kê Công nghiệp (Người chấm)' },
          { username: 'phong_nnxh', deptCode: 'P_NNXH', displayName: 'Phòng Thống kê Nông nghiệp và Xã hội (Người chấm)' },
          { username: 'phong_dv', deptCode: 'P_DV', displayName: 'Phòng Thống kê Thương mại - Dịch vụ (Người chấm)' },
          { username: 'phong_tchc', deptCode: 'P_TCHC', displayName: 'Phòng Tổ Chức Hành Chính (Người chấm)' }
        ];
        const matchedDept = defaultDepts.find(d => d.username === inputUser);
        if (matchedDept && password === '123') {
          onLoginSuccess({
            username: matchedDept.username,
            role: 'room',
            deptCode: matchedDept.deptCode,
            displayName: matchedDept.displayName,
            permissions: ['view_reports', 'grade_reports']
          });
          return;
        }

        // 4. Fallback check for unit codes like 'dv_01', 'dv_02'
        const matchedUnit = units.find(u => u.Ma_DV.toLowerCase() === inputUser);
        if (matchedUnit && password === '123') {
          onLoginSuccess({
            username: inputUser,
            role: 'tkcs',
            unitCode: matchedUnit.Ma_DV,
            displayName: matchedUnit.Ten_Don_Vi,
            permissions: ['view_reports']
          });
          return;
        }

        setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" id="login-layout-wrapper">
      
      {/* Decorative vectors */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-sky-100/50 via-indigo-50/20 to-transparent pointer-events-none select-none" />
      <div className="absolute left-10 top-10 w-96 h-96 rounded-full bg-sky-200/20 blur-3xl pointer-events-none select-none" />
      <div className="absolute right-10 bottom-10 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none select-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <img 
              src="/ten-file-logo-cua-ban.png" 
              alt="Logo" 
              className="h-16 w-16 object-contain" 
            />
          </div>
          <span className="text-[10px] text-sky-600 uppercase tracking-widest font-extrabold bg-sky-50 border border-sky-150 px-3 py-1 rounded-full font-sans">
            Thống kê Tỉnh Hưng Yên
          </span>
          <span className="text-[10px] text-sky-600 uppercase tracking-widest font-extrabold bg-sky-50 border border-sky-150 px-3 py-1 rounded-full font-sans">
            Thống kê Tỉnh Hưng Yên
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans uppercase">
            Đăng nhập hệ thống thi đua
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm font-sans px-4">
            Hệ thống giao kế hoạch công tác và đánh giá thời hạn nộp báo cáo của các đơn vị Thống kê cơ sở .
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-100 shadow-xl space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Tên đăng nhập</label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 font-medium placeholder-slate-400"
                    placeholder="Nhập tên tài khoản (vd: admin, phong_th, tkph,...)"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Mật khẩu</label>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 font-mono"
                    placeholder="Mật khẩu (mặc định: 123)"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="font-medium text-[11px] leading-snug">{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-sans text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Đang kiểm tra thông tin...</span>
              ) : (
                <span>Đăng nhập hệ thống</span>
              )}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}
