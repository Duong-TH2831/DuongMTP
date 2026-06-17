'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppState } from '@/store';
import { ArrowUp, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { language } = useAppState();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const t = {
    VI: {
      tagline: 'Kiệt tác nghỉ dưỡng 5 sao giữa lòng đại dương, mang lại những khoảnh khắc trường tồn cùng thời gian.',
      contact: 'Thông tin liên hệ',
      quickLinks: 'Liên kết nhanh',
      rooms: 'Hạng phòng',
      legal: 'Chính sách',
      privacy: 'Chính sách bảo mật',
      terms: 'Điều khoản sử dụng',
      bookingPolicy: 'Chính sách đặt phòng',
      copyright: '© 2026 Horizon Grand Resort. Bảo lưu mọi quyền.',
      address: 'Trường KD và CN Hà Nội, 29A Ngõ 124 Phố Vĩnh Tuy, Vĩnh Hưng, Hà Nội, Việt Nam',
    },
    EN: {
      tagline: 'A 5-star resort masterpiece in the heart of the ocean, offering timeless moments that stay forever.',
      contact: 'Contact Info',
      quickLinks: 'Quick Links',
      rooms: 'Room Categories',
      legal: 'Legal Policies',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      bookingPolicy: 'Booking Policy',
      copyright: '© 2026 Horizon Grand Resort. All rights reserved.',
      address: 'Hanoi University of Business and Technology, 29A Alley 124 Vinh Tuy Street, Vinh Hung, Hanoi, Vietnam',
    }
  }[language];

  return (
    <footer className="relative bg-[#07070a] text-[#9a9080]/80 border-t border-gold/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Col 1: Brand & Socials */}
        <div className="flex flex-col gap-6">
          <Link href="/">
            <span className="font-cormorant text-3xl font-semibold tracking-[0.2em] text-gold">
              HORIZON
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-[#9a9080]/70">
            {t.tagline}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-gold hover:text-black transition-all duration-300 border border-gold/10" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-gold hover:text-black transition-all duration-300 border border-gold/10" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-gold hover:text-black transition-all duration-300 border border-gold/10" aria-label="TripAdvisor">
              <span className="text-xs font-bold leading-none">TA</span>
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="flex flex-col gap-5">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-gold">
            {t.quickLinks}
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a href="#about" className="hover:text-gold transition-colors">Về chúng tôi / About</a>
            </li>
            <li>
              <a href="#amenities" className="hover:text-gold transition-colors">Trải nghiệm / Experiences</a>
            </li>
            <li>
              <a href="#rooms" className="hover:text-gold transition-colors">Tìm phòng / Find Rooms</a>
            </li>
            <li>
              <Link href="/login" className="hover:text-gold transition-colors">Đăng nhập Quản trị / HMS Portal</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Room types */}
        <div className="flex flex-col gap-5">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-gold">
            {t.rooms}
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a href="#rooms" className="hover:text-gold transition-colors">Deluxe Suite</a>
            </li>
            <li>
              <a href="#rooms" className="hover:text-gold transition-colors">Executive Ocean View</a>
            </li>
            <li>
              <a href="#rooms" className="hover:text-gold transition-colors">Presidential Penthouse</a>
            </li>
            <li>
              <a href="#rooms" className="hover:text-gold transition-colors">Honeymoon Villa</a>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact info */}
        <div className="flex flex-col gap-5">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-gold">
            {t.contact}
          </h4>
          <ul className="flex flex-col gap-4 text-sm text-[#9a9080]/70">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span>{t.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gold shrink-0" />
              <a href="tel:0399078931" className="hover:text-gold transition-colors">
                0399 078 931
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gold shrink-0" />
              <a href="mailto:MTP@MTP.vn" className="hover:text-gold transition-colors">
                MTP@MTP.vn
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 border-t border-gold/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <p>{t.copyright}</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-gold transition-colors">{t.privacy}</a>
          <a href="#" className="hover:text-gold transition-colors">{t.terms}</a>
        </div>
      </div>

      {/* Back to top button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed z-50 p-3 rounded-full bg-gold text-black border border-gold hover:bg-black hover:text-gold transition-all duration-500 shadow-lg cursor-pointer right-24 bottom-6 animate-bounce"
          title="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
}
