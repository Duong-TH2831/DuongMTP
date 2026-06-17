'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '@/store';
import { 
  LayoutDashboard, Users, BedDouble, CalendarCheck, 
  Hotel, CreditCard, BarChart2, Settings, FileText, 
  LogOut, ShieldAlert, Sun, Moon
} from 'lucide-react';
import { toast } from 'sonner';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { adminSession, logoutAdmin, theme, toggleTheme } = useAppState();

  const user = adminSession.user || {
    name: 'Nguyễn Minh Trí',
    email: 'tri.nguyen@horizon.vn',
    role: 'ADMIN' as const,
    avatar: '/avatars/admin-1.jpg'
  };

  const handleLogout = () => {
    logoutAdmin();
    toast.success('Đã đăng xuất khỏi hệ thống.');
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Khách hàng', path: '/admin/customers', icon: Users },
    { name: 'Sơ đồ Phòng', path: '/admin/rooms', icon: BedDouble },
    { name: 'Phiếu đặt phòng', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Quản lý Lưu trú', path: '/admin/stay', icon: Hotel },
    { name: 'Thanh toán hóa đơn', path: '/admin/payment', icon: CreditCard },
    { name: 'Quản lý tài khoản', path: '/admin/accounts', icon: Settings },
    { name: 'Báo cáo & Thống kê', path: '/admin/reports', icon: BarChart2 },
    { name: 'Bài viết Blog CMS', path: '/admin/blogs', icon: FileText }
  ];

  return (
    <aside className="w-[280px] shrink-0 min-h-screen bg-[#07070a] text-white flex flex-col justify-between border-r border-gold/15 relative z-30 shadow-2xl">
      
      {/* Sidebar Header */}
      <div>
        <div className="p-6 py-7 border-b border-gold/10 flex flex-col gap-1 bg-[#111118]/50">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-cormorant text-2xl font-bold tracking-wider text-gold">HORIZON HMS</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#9a9080] font-bold">Enterprise Suite</span>
        </div>
 
        {/* Navigation Links */}
        <nav className="p-4 flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Exact match for '/admin' and prefix match for other routes
            const isActive = item.path === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.path);
 
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gold text-black shadow-md shadow-gold/20 scale-[1.02]'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gold/80'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
 
      {/* Sidebar Footer User Card */}
      <div className="p-5 border-t border-gold/10 bg-[#111118]/30">
        
        {/* User Info */}
        <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
          <div className="h-10 w-10 rounded-full bg-gold/10 border border-gold/30 overflow-hidden flex items-center justify-center font-bold text-gold text-base shrink-0">
            {user.name.split(' ').pop()?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate text-stone-100">{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase ${
                user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
 
        {/* Theme switch in sidebar */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 mb-1 rounded-lg text-sm font-semibold text-stone-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer bg-transparent border-0 outline-none shadow-none"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-5 h-5 text-gold/80" />
              <span>Chế độ Tối</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5 text-gold" />
              <span>Chế độ Sáng</span>
            </>
          )}
        </button>

        {/* Separator line */}
        <div className="h-[1px] bg-gold/5 my-2" />
 
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-red-300 hover:text-red-100 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent border-0 outline-none shadow-none"
        >
          <LogOut className="w-5 h-5 text-red-450" />
          <span>Đăng xuất</span>
        </button>
      </div>
 
    </aside>
  );
}
