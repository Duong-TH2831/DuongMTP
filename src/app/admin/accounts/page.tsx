'use client';

import React, { useState, useEffect } from 'react';
import { getDB, User, Role } from '@/lib/db';
import { 
  Plus, Settings, Lock, ShieldAlert, Key, 
  Trash2, ToggleLeft, ShieldCheck, Download, ChevronRight
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAppState } from '@/store';

export default function AccountManagement() {
  const db = getDB();
  const { adminSession } = useAppState();
  const currentUser = adminSession.user;

  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('STAFF');
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setUsers([...db.getUsers()]);
  }, [db]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('STAFF');
    setIsActive(true);
    setPassword('');
    setConfirmPassword('');
    setSelectedUser(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role);
    setIsActive(user.isActive);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    if (currentUser && currentUser.id === user.id) {
      toast.error('Bạn không thể xóa tài khoản của chính mình!');
      return;
    }
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openChangePasswordModal = (user: User) => {
    setSelectedUser(user);
    setPassword('');
    setConfirmPassword('');
    setIsChangePasswordModalOpen(true);
  };

  const handleToggleLock = (id: string, name: string, currentStatus: boolean) => {
    // If toggling lock for current logged-in user, prevent lock if they lock themselves out
    if (currentUser && currentUser.id === id && currentStatus) {
      toast.error('Bạn không thể khóa tài khoản của chính mình!');
      return;
    }
    const updated = db.updateUser(id, { isActive: !currentStatus });
    if (updated) {
      toast.success(`Đã ${currentStatus ? 'khóa' : 'mở khóa'} thành công tài khoản của ${name}.`);
      setUsers([...db.getUsers()]);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ tên và Email.');
      return;
    }
    // Check if email already exists
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      toast.error('Email này đã được sử dụng bởi một tài khoản khác.');
      return;
    }

    db.createUser({
      name,
      email,
      phone,
      role,
      isActive,
      password: password.trim() || undefined
    });

    toast.success('Đã tạo tài khoản nhân viên mới thành công.');
    setUsers([...db.getUsers()]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!name.trim() || !email.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ tên và Email.');
      return;
    }
    // Check if email already exists (excluding current selectedUser)
    const exists = users.some(u => u.id !== selectedUser.id && u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      toast.error('Email này đã được sử dụng bởi một tài khoản khác.');
      return;
    }

    db.updateUser(selectedUser.id, {
      name,
      email,
      phone,
      role,
      isActive
    });

    toast.success('Cập nhật thông tin tài khoản thành công.');
    setUsers([...db.getUsers()]);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    const success = db.deleteUser(selectedUser.id);
    if (success) {
      toast.success(`Đã xóa thành công tài khoản của ${selectedUser.name}.`);
      setUsers([...db.getUsers()]);
    } else {
      toast.error('Có lỗi xảy ra, không thể xóa tài khoản.');
    }
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (password.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    const updated = db.updateUser(selectedUser.id, { password });
    if (updated) {
      toast.success(`Đã đổi mật khẩu thành công cho tài khoản ${selectedUser.name}.`);
      setUsers([...db.getUsers()]);
    } else {
      toast.error('Không thể cập nhật mật khẩu.');
    }
    setIsChangePasswordModalOpen(false);
    resetForm();
  };

  // Filter
  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && u.isActive) || 
      (statusFilter === 'LOCKED' && !u.isActive);
    return matchRole && matchStatus;
  });

  // Calculated stats (preloaded values matching prompt)
  const totalCount = users.length;
  const activeCount = users.filter(u => u.isActive).length;
  const lockedCount = users.filter(u => !u.isActive).length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  return (
    <div className="flex flex-col gap-6 text-stone-200">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Link href="/admin" className="hover:text-gold transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-600">Quản lý tài khoản</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-stone-100 font-cormorant tracking-wide">Quản Lý Tài Khoản</h1>
          <p className="text-sm text-[#a89d8d] mt-1.5 font-medium">Cập phát quyền hạn truy cập, đổi mật khẩu và giám sát đăng nhập nhân viên.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-3 bg-gold hover:bg-gold-light text-black rounded-lg text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5 text-black" />
            <span>Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-xs text-[#a89d8d] font-extrabold uppercase tracking-wider">Tổng tài khoản</p>
          <p className="text-5xl font-extrabold font-mono text-stone-100 mt-1.5">{totalCount}</p>
        </div>
        <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-xs text-[#a89d8d] font-extrabold uppercase tracking-wider">Đang hoạt động</p>
          <p className="text-5xl font-extrabold font-mono text-emerald-450 mt-1.5">{activeCount}</p>
        </div>
        <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-xs text-[#a89d8d] font-extrabold uppercase tracking-wider">Đã khóa</p>
          <p className="text-5xl font-extrabold font-mono text-red-400 mt-1.5">{lockedCount}</p>
        </div>
        <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-xs text-[#a89d8d] font-extrabold uppercase tracking-wider">Quản trị viên (Admin)</p>
          <p className="text-5xl font-extrabold font-mono text-blue-400 mt-1.5">{adminCount}</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-sm font-semibold text-[#a89d8d] outline-none cursor-pointer focus:border-gold/30"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
            <option value="STAFF">Nhân viên (STAFF)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-sm font-semibold text-[#a89d8d] outline-none cursor-pointer focus:border-gold/30"
          >
            <option value="ALL">Mọi trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111118] rounded-xl border border-gold/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gold/10 text-[#a89d8d] font-bold uppercase tracking-wider text-xs bg-[#07070a]/50">
                <th className="py-3.5 pl-4">Mã số TK</th>
                <th className="py-3.5">Tên đăng nhập (Email)</th>
                <th className="py-3.5">Họ và tên nhân viên</th>
                <th className="py-3.5">Vai trò hệ thống</th>
                <th className="py-3.5">Trạng thái bảo mật</th>
                <th className="py-3.5 pr-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gold/5 hover:bg-[#1a1a24]/50 transition-colors text-stone-300 font-medium">
                  <td className="py-4 pl-4 font-mono font-bold text-stone-500">{user.id}</td>
                  <td className="py-4 font-mono font-bold text-stone-100">{user.email}</td>
                  <td className="py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#07070a] text-gold font-bold flex items-center justify-center border border-gold/15 text-xs uppercase">
                      {user.name.split(' ').pop()?.slice(0, 2)}
                    </div>
                    <span className="font-bold text-stone-200">{user.name}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.role === 'ADMIN' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-stone-900 text-stone-400 border border-stone-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gold hover:bg-gold/10 rounded transition-colors cursor-pointer"
                        title="Sửa tài khoản"
                      >
                        <Settings className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleToggleLock(user.id, user.name, user.isActive)}
                        className={`p-2 rounded transition-all cursor-pointer ${
                          user.isActive 
                            ? 'text-red-400 hover:bg-red-950/20' 
                            : 'text-emerald-450 hover:bg-emerald-950/20'
                        }`}
                        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        <Lock className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => openChangePasswordModal(user)}
                        className="p-2 text-blue-400 hover:bg-blue-950/20 rounded transition-colors cursor-pointer"
                        title="Đổi mật khẩu"
                      >
                        <Key className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className={`p-2 rounded transition-all cursor-pointer text-red-500 hover:bg-red-950/30 ${
                          currentUser?.id === user.id ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                        disabled={currentUser?.id === user.id}
                        title={currentUser?.id === user.id ? 'Không thể tự xóa' : 'Xóa tài khoản'}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Descriptions & Security Warning Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Role descriptions */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Mô tả vai trò hệ thống</h3>
          
          <div className="flex flex-col gap-3">
            <div className="p-3.5 bg-[#07070a] rounded-xl border border-gold/5 flex gap-3.5">
              <ShieldCheck className="w-5.5 h-5.5 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">QUẢN TRỊ VIÊN (ADMIN)</span>
                <p className="text-xs text-[#a89d8d] mt-1 leading-relaxed font-normal">Toàn quyền kiểm soát hệ thống, phê duyệt đặt phòng, thanh toán hóa đơn, chỉnh sửa hạng phòng và phân bổ sơ đồ.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#07070a] rounded-xl border border-gold/5 flex gap-3.5">
              <Settings className="w-5.5 h-5.5 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-stone-450 uppercase tracking-wider">NHÂN VIÊN (STAFF)</span>
                <p className="text-xs text-[#a89d8d] mt-1 leading-relaxed font-normal">Lập hồ sơ khách hàng, check-in, check-out lưu trú thực tế, thêm dịch vụ phát sinh, không truy cập cài đặt cấu hình hệ thống.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security checklist */}
        <div className="bg-gradient-to-br from-amber-950/20 to-stone-950/40 text-stone-200 p-6 rounded-2xl shadow-2xl flex flex-col justify-between gap-4 border border-gold/15">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-gold" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Bảo mật hệ thống</h3>
          </div>
          
          <p className="text-xs text-stone-300 leading-relaxed font-normal">
            Khuyến cáo bắt buộc tất cả nhân viên thay đổi mật khẩu định kỳ <strong>90 ngày</strong> một lần để giảm thiểu nguy cơ rò rỉ thông tin khách hàng VIP.
          </p>

          <button
            onClick={() => toast.success('Đang chuẩn bị tải về tệp Nhật ký truy cập (Access Log)...')}
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Tải báo cáo truy cập
          </button>
        </div>

      </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-gold/20 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-stone-100 font-cormorant tracking-wide border-b border-gold/10 pb-3 mb-4">
              Thêm Tài Khoản Mới
            </h3>
            
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Họ và tên nhân viên</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Tên đăng nhập (Email)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@horizon.vn"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Mật khẩu khởi tạo</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mặc định là 123456 nếu bỏ trống"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Vai trò hệ thống</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-[#a89d8d] outline-none cursor-pointer focus:border-gold/30"
                >
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="MANAGER">Quản lý (MANAGER)</option>
                  <option value="STAFF">Nhân viên (STAFF)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isActiveAdd"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gold/15 text-gold focus:ring-gold bg-[#07070a] cursor-pointer"
                />
                <label htmlFor="isActiveAdd" className="text-sm font-semibold text-stone-200 cursor-pointer">
                  Kích hoạt tài khoản khi khởi tạo
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gold/10 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-light text-black text-sm font-bold transition-all shadow-md cursor-pointer"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-gold/20 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-stone-100 font-cormorant tracking-wide border-b border-gold/10 pb-3 mb-4">
              Cập Nhật Tài Khoản
            </h3>
            
            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Họ và tên nhân viên</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Tên đăng nhập (Email)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@horizon.vn"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Vai trò hệ thống</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-[#a89d8d] outline-none cursor-pointer focus:border-gold/30"
                >
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="MANAGER">Quản lý (MANAGER)</option>
                  <option value="STAFF">Nhân viên (STAFF)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gold/15 text-gold focus:ring-gold bg-[#07070a] cursor-pointer"
                />
                <label htmlFor="isActiveEdit" className="text-sm font-semibold text-stone-200 cursor-pointer">
                  Tài khoản đang hoạt động
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gold/10 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-light text-black text-sm font-bold transition-all shadow-md cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-red-400 font-cormorant tracking-wide border-b border-red-500/10 pb-3 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Xác Nhận Xóa Tài Khoản
            </h3>
            
            <div className="mb-6">
              <p className="text-sm text-stone-300 leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <strong>{selectedUser.name}</strong> ({selectedUser.email}) khỏi hệ thống? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gold/10 pt-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-sm font-semibold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-md cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isChangePasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-gold/20 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-stone-100 font-cormorant tracking-wide border-b border-gold/10 pb-3 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-gold" />
              Đổi Mật Khẩu
            </h3>
            
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="mb-2">
                <p className="text-xs text-[#a89d8d]">
                  Thay đổi mật khẩu đăng nhập cho tài khoản của <strong>{selectedUser.name}</strong> ({selectedUser.email}).
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#a89d8d] uppercase tracking-wider">Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="bg-[#07070a] border border-gold/15 py-2 px-3.5 rounded-lg text-sm text-stone-200 outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gold/10 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-light text-black text-sm font-bold transition-all shadow-md cursor-pointer"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
