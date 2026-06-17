'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/store';
import Sidebar from '@/components/admin/Sidebar';
import { Loader2, ArrowUp, MessageSquare, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { adminSession, fetchNotifications } = useAppState();
  const [mounted, setMounted] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();

    // Scroll listener for top-level window
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNotifications]);

  // Auth Guard redirect
  useEffect(() => {
    if (mounted && !adminSession.isLoggedIn) {
      toast.error('Vui lòng đăng nhập để truy cập hệ thống quản trị.');
      router.push('/login');
    }
  }, [adminSession.isLoggedIn, mounted, router]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  // Redirecting state
  if (!adminSession.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Đang xác thực thông tin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-stone-200 relative flex flex-col">
      
      {/* Admin Layout Container (100% scale for readability and clarity) */}
      <div className="admin-container flex-1 flex w-full">
        <Sidebar />
        
        {/* Main Content Pane */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#0a0a0f]">
          {children}
        </main>
      </div>

      {/* Floating Elements (Placed OUTSIDE the zoom wrapper so they don't scale down) */}
      <div className="fixed z-40 right-6 bottom-6 flex flex-col gap-3 pointer-events-auto">
        
        {/* Zalo/Hotline consultation bubble */}
        <a
          href="tel:0399078931"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gold hover:bg-gold-light text-black shadow-xl hover:-translate-y-1 transition-all"
          title="Hotline Tư Vấn"
        >
          <PhoneCall className="w-5 h-5" />
        </a>

        {/* Scroll To Top button */}
        {showScroll && (
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#111118] border border-gold/20 hover:bg-[#1a1a24] text-white shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            title="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-5 h-5 text-gold" />
          </button>
        )}
      </div>

    </div>
  );
}
