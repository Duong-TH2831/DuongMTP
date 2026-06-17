'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/store';
import { Hotel, Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { adminSession, loginAdmin } = useAppState();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load remembered credentials on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('horizon_hms_remember_email');
      const savedPassword = localStorage.getItem('horizon_hms_remember_password');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (adminSession.isLoggedIn) {
      router.push('/admin');
    }
  }, [adminSession.isLoggedIn, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Login using Zustand store which references our DB layer
      const success = loginAdmin(email, password);
      setLoading(false);

      if (success) {
        if (rememberMe) {
          localStorage.setItem('horizon_hms_remember_email', email);
          localStorage.setItem('horizon_hms_remember_password', password);
        } else {
          localStorage.removeItem('horizon_hms_remember_email');
          localStorage.removeItem('horizon_hms_remember_password');
        }
        toast.success('Đăng nhập quản trị thành công!');
        router.push('/admin');
      } else {
        toast.error('Tài khoản không tồn tại hoặc thông tin không chính xác.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      
      {/* Left Panel: Branding (50%) */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-navy-dark via-navy to-black p-8 md:p-16 flex flex-col justify-between relative overflow-hidden border-r border-gold/15">
        {/* Ambient background blur */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
        
        {/* Header Logo */}
        <Link href="/" className="flex items-center gap-3 z-10 w-fit group">
          <ArrowLeft className="w-5 h-5 text-gold group-hover:-translate-x-1 transition-transform" />
          <span className="font-cormorant text-3xl font-semibold tracking-wider text-gold">HORIZON GRAND</span>
        </Link>

        {/* Brand Text */}
        <div className="my-auto py-12 z-10 flex flex-col gap-6 max-w-md">
          <div className="p-3 bg-gold/10 text-gold rounded-xl w-fit border border-gold/20">
            <Hotel className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-cormorant font-bold text-stone-100 tracking-wide leading-tight mb-3">
              Horizon HMS Enterprise Suite
            </h1>
            <p className="text-sm uppercase tracking-[0.2em] text-gold font-semibold mb-4">
              Quản trị khách sạn tiêu chuẩn quốc tế
            </p>
            <p className="text-sm text-stone-300 leading-relaxed font-normal">
              Hệ thống tích hợp tối ưu hóa toàn diện công suất phòng, dịch vụ lưu trú thực tế, quản lý danh sách khách hàng VIP và kiểm soát doanh thu hóa đơn tự động tức thì.
            </p>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 border-t border-white/10 pt-6 mt-4">
            <div className="flex -space-x-2.5 overflow-hidden">
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-slate-800 text-xs flex items-center justify-center font-bold">M</span>
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-slate-700 text-xs flex items-center justify-center font-bold">T</span>
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-slate-600 text-xs flex items-center justify-center font-bold">V</span>
            </div>
            <p className="text-xs text-stone-300 font-normal">
              Tin dùng bởi hơn <strong>500+ tập đoàn khách sạn</strong> chuẩn quốc tế.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-stone-400 z-10">
          © 2026 Horizon HMS Enterprise. All rights reserved.
        </p>
      </div>

      {/* Right Panel: Login form (50%) */}
      <div className="w-full md:w-1/2 bg-[#f0f4ff] text-slate-800 p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-md flex flex-col gap-8 bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100">
          <div>
            <h2 className="text-3xl font-extrabold text-navy-dark tracking-tight">Chào mừng trở lại</h2>
            <p className="text-sm text-slate-600 mt-1.5 font-medium">Đăng nhập tài khoản nhân viên để truy cập hệ thống.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-600 font-bold flex items-center gap-2">
                <Mail className="w-4.5 h-4.5 text-navy" />
                Tên đăng nhập (Email)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@horizon.vn"
                className="w-full bg-slate-50 border border-slate-350 focus:border-navy focus:bg-white py-3.5 px-4 rounded-lg text-slate-800 text-sm outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-600 font-bold flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-navy" />
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-50 border border-slate-350 focus:border-navy focus:bg-white py-3.5 px-4 pr-11 rounded-lg text-slate-800 text-sm outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-650 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-navy focus:ring-navy h-4 w-4 cursor-pointer"
                />
                Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                onClick={() => toast.info('Vui lòng liên hệ Admin hệ thống để đặt lại mật khẩu.')}
                className="text-navy hover:underline font-bold"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-navy hover:bg-navy-dark text-white font-bold text-sm tracking-wider uppercase rounded-lg transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP →'}
            </button>

            {/* Exit button */}
            <Link
              href="/"
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm tracking-wider uppercase rounded-lg transition-colors text-center flex items-center justify-center"
            >
              Thoát ra ngoài
            </Link>
          </form>

          {/* Footer links */}
          <div className="text-xs text-slate-500 text-center flex items-center justify-center gap-4 border-t border-slate-200 pt-5">
            <span>© 2026 Horizon HMS</span>
            <a href="#" className="hover:underline font-medium">Hỗ trợ</a>
            <a href="#" className="hover:underline font-medium">Bảo mật</a>
          </div>
        </div>
      </div>

    </div>
  );
}
