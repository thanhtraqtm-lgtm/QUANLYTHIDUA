/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ShieldAlert, KeyRound, CheckSquare, Eye, EyeOff, Trophy, Info } from 'lucide-react';
import { User as UserType, Unit } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
  units: Unit[];
}

export default function Login({ onLoginSuccess, units }: LoginProps) {
  const [activeRole, setActiveRole] = useState<'admin' | 'tkcs'>('admin');
  
  // Admin inputs
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  
  // TKCS inputs
  const [selectedUnitCode, setSelectedUnitCode] = useState(units[0]?.Ma_DV || '');
  const [tkcsPassword, setTkcsPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    // Retrieve custom accounts from localStorage
    const cachedUsersRaw = localStorage.getItem('emulation_users');
    let customUsers: UserType[] = [];
    if (cachedUsersRaw) {
      try {
        customUsers = JSON.parse(cachedUsersRaw);
      } catch (err) {}
    }

    // Simulate network authentication delay
    setTimeout(() => {
      if (activeRole === 'admin') {
        const matchedCustom = customUsers.find(
          u => u.username.toLowerCase() === adminUsername.trim().toLowerCase() && u.password === adminPassword
        );

        if (adminUsername.trim().toLowerCase() === 'admin' && adminPassword === '123') {
          onLoginSuccess({
            username: 'admin',
            role: 'admin',
            displayName: 'Quản trị viên Hệ thống (Toàn quyền)',
            permissions: ['view_reports', 'grade_reports', 'upload_excel', 'manage_accounts']
          });
        } else if (matchedCustom && (matchedCustom.role === 'admin' || matchedCustom.role === 'room')) {
          onLoginSuccess(matchedCustom);
        } else {
          setErrorMsg('Tài khoản hoặc mật khẩu Quản lý/Phòng ban không chính xác. Gợi ý: admin / 123 hoặc phong_th / 123');
          setIsLoading(false);
        }
      } else {
        // TKCS county subunits login
        const matchedCustom = customUsers.find(
          u => u.username.toLowerCase() === selectedUnitCode.toLowerCase() && u.password === tkcsPassword
        );

        if (tkcsPassword === '123') {
          const selectedUnit = units.find(u => u.Ma_DV === selectedUnitCode);
          onLoginSuccess({
            username: selectedUnitCode.toLowerCase(),
            role: 'tkcs',
            unitCode: selectedUnitCode,
            displayName: selectedUnit ? selectedUnit.Ten_Don_Vi : `Thống kê Cơ Sở ${selectedUnitCode}`,
            permissions: ['view_reports']
          });
        } else if (matchedCustom && matchedCustom.role === 'tkcs') {
          onLoginSuccess(matchedCustom);
        } else {
          setErrorMsg('Mật khẩu đăng nhập đơn vị thống kê cơ sở không đúng hoặc chưa được tạo. Gợi ý mặc định: 123');
          setIsLoading(false);
        }
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" id="login-layout-wrapper">
      
      {/* Decorative vectors matches top bar */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-sky-100/50 via-indigo-50/20 to-transparent pointer-events-none select-none" />
      <div className="absolute left-10 top-10 w-96 h-96 rounded-full bg-sky-200/20 blur-3xl pointer-events-none select-none" />
      <div className="absolute right-10 bottom-10 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none select-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Logo and Ministry subtitle */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-3.5 rounded-2xl text-white shadow-xl shadow-sky-500/10 mb-4 scale-105">
            <Trophy className="h-7 w-7" />
          </div>
          <span className="text-[10px] text-sky-600 uppercase tracking-widest font-extrabold bg-sky-50 border border-sky-150 px-3 py-1 rounded-full font-sans">
            Thống kê Tỉnh Hưng Yên
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
            ĐĂNG NHẬP HỆ THỐNG THI ĐUA BÁO CÁO
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm font-sans px-4">
            Hệ thống quản lý, giao chỉ tiêu số liệu và đánh giá thời hạn chấm điểm các đơn vị thống kê cơ sở.
          </p>
        </div>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-100 shadow-xl space-y-6">
          
          {/* Role Switching Selector tab */}
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button 
              type="button"
              onClick={() => { setActiveRole('admin'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeRole === 'admin' 
                  ? 'bg-white shadow text-slate-800' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>BQL & PHÒNG CHUYÊN MÔN</span>
            </button>
            <button 
              type="button"
              onClick={() => { setActiveRole('tkcs'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeRole === 'tkcs' 
                  ? 'bg-white shadow text-slate-800' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Đơn vị nộp (TKCS)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {activeRole === 'admin' ? (
              // ADMIN & ROOM FORM
              <div className="space-y-4">
                <div className="space-y-1.5 bg-sky-50/50 p-2.5 rounded-lg border border-sky-100 mb-2">
                  <div className="flex items-start space-x-1.5 text-sky-800 text-[10.5px]">
                    <Info className="w-3.5 h-3.5 shrink-0 text-sky-500 mt-0.5" />
                    <p className="leading-relaxed">
                      Dành cho <strong className="font-bold">Quản trị viên (admin)</strong> và cán bộ của <strong className="font-bold">5 phòng chuyên môn</strong> gồm tổng hợp, công nghiệp, nông nghiệp & xã hội, thương mại, tổ chức hành chính (gợi ý: <code>phong_th</code>, <code>phong_cn</code>, <code>phong_nnxh</code>,... mật khẩu <code>123</code>).
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Tài khoản Quản lý / Phòng</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20"
                      placeholder="admin hoặc tên tài khoản phòng..."
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Mật khẩu</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20"
                      placeholder="Mật khẩu của bạn..."
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
            ) : (
              // TKCS FORM
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Lựa chọn Đơn Vị</label>
                  <select 
                    value={selectedUnitCode}
                    onChange={(e) => setSelectedUnitCode(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    {units.map((unit) => (
                      <option key={unit.Ma_DV} value={unit.Ma_DV}>
                        {unit.Ten_Don_Vi} ({unit.Ma_DV} - {unit.Vung})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Mật khẩu đăng nhập</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={tkcsPassword}
                      onChange={(e) => setTkcsPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20"
                      placeholder="Mật khẩu phục vụ..."
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 slot-cursor pointer-events-auto"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error logs notice */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-sans text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Đang bảo mật kiểm tra...</span>
              ) : (
                <>
                  <span>Xác minh danh tính</span>
                </>
              )}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}
