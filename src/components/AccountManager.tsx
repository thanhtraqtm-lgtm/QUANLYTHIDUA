/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Key, 
  Lock, 
  Check, 
  AlertCircle, 
  Search, 
  Filter,
  UserCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { User, Unit, Department } from '../types';
import { DEPARTMENTS_DATA } from '../data/emulationData';

interface AccountManagerProps {
  accounts: User[];
  onAddAccount: (newAcc: User) => void;
  onUpdateAccount: (username: string, updatedFields: Partial<User>) => void;
  onDeleteAccount: (username: string) => void;
  onResetAccounts: () => void;
  units: Unit[];
  currentUser: User;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_reports', label: 'Xem báo cáo (View Reports)', desc: 'Cho phép truy cập tab Tổng quan, Xếp hạng và Trình duyệt báo cáo.' },
  { id: 'grade_reports', label: 'Chấm điểm thi đua (Grade & Audit)', desc: 'Thẩm định chất lượng báo cáo, cộng hoặc trừ điểm nộp trễ.' },
  { id: 'upload_excel', label: 'Nạp dữ liệu Excel (Excel Upload)', desc: 'Cổng truyền nạp tệp Excel để cập nhật số liệu chỉ tiêu.' },
  { id: 'manage_accounts', label: 'Quản trị tài khoản (Account & Privileges)', desc: 'Khởi tạo tài khoản khác và phân quyền hệ thống.' }
];

export default function AccountManager({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onResetAccounts,
  units,
  currentUser
}: AccountManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'admin' | 'room' | 'tkcs'>('ALL');
  
  // Create Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<'admin' | 'room' | 'tkcs'>('tkcs');
  const [selectedUnitCode, setSelectedUnitCode] = useState(units[0]?.Ma_DV || '');
  const [selectedDeptCode, setSelectedDeptCode] = useState(DEPARTMENTS_DATA[0]?.Ma_Phong || 'P_TH');
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['view_reports']);
  const [formError, setFormError] = useState('');

  // Password reset modal state
  const [editingPasswordUser, setEditingPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleRoleChange = (newRole: 'admin' | 'room' | 'tkcs') => {
    setRole(newRole);
    if (newRole === 'admin') {
      setSelectedPerms(['view_reports', 'grade_reports', 'upload_excel', 'manage_accounts']);
    } else if (newRole === 'room') {
      setSelectedPerms(['view_reports', 'grade_reports']);
    } else {
      setSelectedPerms(['view_reports']);
    }
  };

  const handleTogglePermInForm = (permId: string) => {
    if (selectedPerms.includes(permId)) {
      setSelectedPerms(selectedPerms.filter(p => p !== permId));
    } else {
      setSelectedPerms([...selectedPerms, permId]);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const normalizedUser = username.trim().toLowerCase();
    if (!normalizedUser) {
      setFormError('Vui lòng nhập tên tài khoản.');
      return;
    }

    if (accounts.some(acc => acc.username.toLowerCase() === normalizedUser)) {
      setFormError('Tên tài khoản này đã tồn tại trong hệ thống.');
      return;
    }

    if (!displayName.trim()) {
      setFormError('Vui lòng nhập tên hiển thị.');
      return;
    }

    if (!password) {
      setFormError('Vui lòng nhập mật khẩu.');
      return;
    }

    const newAcc: User = {
      username: normalizedUser,
      displayName: displayName.trim(),
      role,
      password,
      permissions: selectedPerms
    };

    if (role === 'tkcs') {
      newAcc.unitCode = selectedUnitCode;
    } else if (role === 'room') {
      newAcc.deptCode = selectedDeptCode;
    }

    onAddAccount(newAcc);
    
    // Reset Form
    setUsername('');
    setDisplayName('');
    setPassword('123');
    setRole('tkcs');
    setSelectedPerms(['view_reports']);
    setShowAddForm(false);
  };

  const handleTogglePermissionOnUser = (user: User, permId: string) => {
    if (user.username === 'admin') {
      alert('Không thể thay đổi quyền hạn của tài khoản Quản trị viên hệ thống!');
      return;
    }
    
    const currentPerms = user.permissions || [];
    let updatedPerms: string[];
    
    if (currentPerms.includes(permId)) {
      updatedPerms = currentPerms.filter(p => p !== permId);
    } else {
      updatedPerms = [...currentPerms, permId];
    }
    
    onUpdateAccount(user.username, { permissions: updatedPerms });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasswordUser || !newPassword) return;

    onUpdateAccount(editingPasswordUser.username, { password: newPassword });
    setNewPassword('');
    setEditingPasswordUser(null);
    alert(`Đã đổi mật khẩu cho tài khoản ${editingPasswordUser.username} thành công!`);
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchSearch = 
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.unitCode && acc.unitCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchRole = roleFilter === 'ALL' || acc.role === roleFilter;
    
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6" id="account-manager-view-root">
      
      {/* Banner introduction card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white rounded-2xl border border-indigo-500/20 p-6 relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-sky-300 via-white to-transparent blur-2xl" />
        </div>
        
        <div className="relative z-15 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-[10px] text-sky-100 font-mono tracking-widest font-extrabold uppercase bg-white/10 border border-white/20 px-2.5 py-1 rounded">
              BẢO MẬT & PHÂN QUYỀN TRUY CẬP
            </span>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-200" /> PHÂN QUYỀN TÀI KHOẢN NGƯỜI DÙNG & NGƯỜI CHẤM
            </h3>
            <p className="text-[11px] text-indigo-50 leading-relaxed font-sans">
              Công cụ Quản lý Hệ thống: Thiết lập tài khoản riêng biệt cho các cán bộ phụ trách thi đua (Quyền giám khảo/Người chấm) và đại diện các Chi cục Thống kê cấp huyện (đơn vị báo cáo). Cấp hoặc thu hồi các quyền truy cập, đặt lại khóa mật khẩu nhanh chóng.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-sans text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tạo tài khoản mới</span>
            </button>
            <button
              onClick={() => {
                if(confirm('Bạn có chắc chắn muốn khôi phục danh sách tài khoản mặc định không?')) {
                  onResetAccounts();
                }
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors"
              title="Đặt lại tài khoản mặc định"
            >
              Khôi phục mặc định
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateAccount} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-900 font-sans uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-sky-500 animate-bounce" /> Khởi tạo tài khoản & lập quyền truy cập
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Đóng lại
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* ID & Display fields */}
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Tên đăng nhập (Username)</label>
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="vd: canbo01, thaituy, tk_donghung"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Tên hiển thị (Display Name)</label>
                    <input 
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="vd: Nguyễn Văn A (Phòng Thống kê)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Mật khẩu đăng nhập</label>
                    <input 
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mật khẩu bảo mật..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 focus:ring-2 focus:ring-sky-500/20 font-mono"
                    />
                  </div>
                </div>

                {/* Role and Unit select fields */}
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button 
                        type="button"
                        onClick={() => handleRoleChange('admin')}
                        className={`py-2 text-center text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                          role === 'admin' 
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/10' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-150'
                        }`}
                      >
                        Quản trị (Admin)
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRoleChange('room')}
                        className={`py-2 text-center text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                          role === 'room' 
                            ? 'bg-sky-50 border-sky-300 text-sky-700 ring-2 ring-sky-500/10' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-150'
                        }`}
                      >
                        Cán bộ Phòng
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRoleChange('tkcs')}
                        className={`py-2 text-center text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                          role === 'tkcs' 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-500/10' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-150'
                        }`}
                      >
                        Đơn vị nộp (TKCS)
                      </button>
                    </div>
                  </div>

                  {role === 'room' && (
                    <div className="space-y-1.5 animate-in fade-in duration-250">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Phòng chuyên môn phụ trách</label>
                      <select 
                        value={selectedDeptCode}
                        onChange={(e) => setSelectedDeptCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20"
                      >
                        {DEPARTMENTS_DATA.map((d) => (
                          <option key={d.Ma_Phong} value={d.Ma_Phong}>
                            {d.Ten_Phong}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {role === 'tkcs' && (
                    <div className="space-y-1.5 animate-in fade-in duration-250">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Đơn vị Thống kê Cơ Sở trực thuộc</label>
                      <select 
                        value={selectedUnitCode}
                        onChange={(e) => setSelectedUnitCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20"
                      >
                        {units.map((unit) => (
                          <option key={unit.Ma_DV} value={unit.Ma_DV}>
                            {unit.Ten_Don_Vi} ({unit.Ma_DV})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1 text-[10px] text-indigo-700 leading-normal">
                    <p className="font-bold uppercase tracking-wider block">Ghi chú phân quyền:</p>
                    <p>
                      - <span className="font-semibold">Quản trị tối cao (Admin)</span>: Có toàn quyền cài đặt tài khoản và kiểm soát tất cả báo cáo.
                    </p>
                    <p>
                      - <span className="font-semibold">Cán bộ Phòng ban</span>: Xem, chấm điểm, sửa và chỉ định báo cáo cho các huyện theo Phòng phụ trách.
                    </p>
                    <p>
                      - <span className="font-semibold">Đơn vị báo cáo (TKCS)</span>: Chỉ được xem tổng quan, nộp tờ trình báo cáo đúng thời hạn quy định.
                    </p>
                  </div>
                </div>

                {/* Specific permissions Checklist */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Phân quyền chức năng cụ thể (Permissions)</label>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-[190px] overflow-y-auto">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = selectedPerms.includes(perm.id);
                      return (
                        <div 
                          key={perm.id}
                          onClick={() => handleTogglePermInForm(perm.id)}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-start gap-2 ${
                            isChecked 
                              ? 'bg-white border-sky-200 shadow-xs' 
                              : 'border-slate-200/60 hover:bg-slate-100/50'
                          }`}
                        >
                          <div className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center text-white text-[9px] ${
                            isChecked ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <div className="font-sans leading-none">
                            <p className={`text-[11px] font-bold ${isChecked ? 'text-slate-800' : 'text-slate-500'}`}>{perm.label}</p>
                            <p className="text-[9px] text-slate-400 mt-1 leading-normal">{perm.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Tạo & Lưu lại
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main accounts lists screen */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Search and filters toolbelt */}
        <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              placeholder="Tìm tài khoản, tên, mã địa bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400 font-sans"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Hiển thị nhóm:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
              <button 
                type="button" 
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                  roleFilter === 'ALL' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả ({accounts.length})
              </button>
              <button 
                type="button" 
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                  roleFilter === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Quản trị / Admin
              </button>
              <button 
                type="button" 
                onClick={() => setRoleFilter('room')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                  roleFilter === 'room' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cán bộ Phòng
              </button>
              <button 
                type="button" 
                onClick={() => setRoleFilter('tkcs')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                  roleFilter === 'tkcs' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đơn vị nộp
              </button>
            </div>
          </div>
        </div>

        {/* Master Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-4 px-6">Tài khoản & Tên</th>
                <th className="py-4 px-5">Vai trò hệ thống</th>
                <th className="py-4 px-5">Phạm vi địa bàn / Phòng ban</th>
                <th className="py-4 px-5">Phân quyền hành động (Tích bật/tắt)</th>
                <th className="py-4 px-5 text-center">Bảo mật</th>
                <th className="py-4 px-6 text-right">Lựa chọn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAccounts.map((acc) => {
                const isAdmin = acc.role === 'admin';
                const isRoom = acc.role === 'room';
                const isSuperAdminUser = acc.username === 'admin';

                return (
                  <tr key={acc.username} className="hover:bg-slate-50/30 transition-all">
                    
                    {/* User display */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs uppercase text-white shadow-xs ${
                          isAdmin 
                            ? 'bg-gradient-to-tr from-indigo-500 to-indigo-700' 
                            : isRoom
                              ? 'bg-gradient-to-tr from-sky-500 to-indigo-500'
                              : 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                        }`}>
                          {acc.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 tracking-tight leading-none">
                            {acc.displayName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 leading-none font-bold">
                            @{acc.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Status Tag */}
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center space-x-1 text-[9px] font-bold font-sans uppercase px-2 py-0.5 rounded-full ${
                        isAdmin 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' 
                          : isRoom
                            ? 'bg-sky-50 text-sky-700 border border-sky-150'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                      }`}>
                        <Shield className="w-2.5 h-2.5" />
                        <span>{isAdmin ? 'Quản trị (Admin)' : isRoom ? 'Cán bộ Phòng' : 'Đơn vị nộp (TKCS)'}</span>
                      </span>
                    </td>

                    {/* Unit Scope */}
                    <td className="py-4 px-5 text-xs text-slate-600 font-sans">
                      {acc.role === 'tkcs' && acc.unitCode ? (
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="bg-slate-100 text-slate-705 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {acc.unitCode}
                          </span>
                          <span className="text-slate-500 text-[11px] truncate max-w-[150px]">
                            {units.find(u => u.Ma_DV === acc.unitCode)?.Ten_Don_Vi || 'Đơn vị phụ thuộc'}
                          </span>
                        </div>
                      ) : acc.role === 'room' && acc.deptCode ? (
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {acc.deptCode}
                          </span>
                          <span className="text-slate-500 text-[11px] truncate max-w-[150px]">
                            {DEPARTMENTS_DATA.find(d => d.Ma_Phong === acc.deptCode)?.Ten_Phong || 'Bộ phận chuyên môn'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-semibold">Toàn quyền hệ thống</span>
                      )}
                    </td>

                    {/* Checkbox action list for direct permissions editing */}
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_PERMISSIONS.map((perm) => {
                          const hasPerm = (acc.permissions || []).includes(perm.id);

                          return (
                            <button
                              key={perm.id}
                              onClick={() => handleTogglePermissionOnUser(acc, perm.id)}
                              type="button"
                              disabled={isSuperAdminUser}
                              className={`px-2 py-1 text-[9px] font-sans rounded-md border transition-all cursor-pointer flex items-center space-x-1 select-none ${
                                isSuperAdminUser 
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 opacity-80'
                                  : hasPerm
                                    ? 'bg-white border-sky-300 text-sky-700 font-bold shadow-2xs'
                                    : 'bg-slate-50/50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                              title={perm.desc}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${hasPerm ? 'bg-sky-500' : 'bg-slate-300'}`} />
                              <span>{perm.id === 'view_reports' ? 'Xem' : perm.id === 'grade_reports' ? 'Chấm Điểm' : perm.id === 'upload_excel' ? 'Nạp Excel' : 'Phân Quyền'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Security credentials helper */}
                    <td className="py-4 px-5 text-center">
                      <button 
                        onClick={() => {
                          setEditingPasswordUser(acc);
                          setNewPassword(acc.password || '123');
                        }}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-150 border border-slate-200 font-sans text-[10px] text-slate-600 hover:text-slate-800 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Đổi mật khẩu"
                      >
                        <Key className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">***</span>
                      </button>
                    </td>

                    {/* Actions tools */}
                    <td className="py-4 px-6 text-right">
                      {isSuperAdminUser ? (
                        <span className="text-[10px] text-indigo-500 font-mono tracking-wider font-extrabold uppercase bg-indigo-50 px-2 py-1 rounded">
                          Hệ thống gốc
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản @${acc.username} không?`)) {
                              onDeleteAccount(acc.username);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors inline-block"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center font-sans text-slate-400 text-xs">
                    Không tìm thấy tài khoản người dùng hoặc người chấm nào trùng khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overriding Password Reset Modal Drawer */}
      {editingPasswordUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-900 font-black uppercase text-xs tracking-wider pb-2 border-b border-slate-100">
              <Lock className="w-4.5 h-4.5 text-indigo-600" />
              <span>Thay đổi khóa mật khẩu</span>
            </div>

            <div className="space-y-1.5 text-xs font-sans">
              <p className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Chủ tài khoản</p>
              <h5 className="font-bold text-slate-800 text-sm leading-tight">{editingPasswordUser.displayName}</h5>
              <p className="text-slate-400 font-mono">@{editingPasswordUser?.username}</p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold font-sans uppercase block">Đặt Mật Khẩu Mới</label>
                <input 
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-bold text-slate-800"
                  placeholder="Nhập khóa bí mật mới..."
                />
              </div>

              <div className="flex gap-2 pt-2 text-xs font-sans">
                <button 
                  type="button"
                  onClick={() => setEditingPasswordUser(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                >
                  Bỏ qua
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
