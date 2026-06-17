'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/store';
import { Globe, Menu, X, Hotel, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { language, setLanguage, theme, toggleTheme } = useAppState();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = {
    VI: {
      rooms: 'Phòng nghỉ',
      amenities: 'Tiện nghi',
      dining: 'Ẩm thực',
      spa: 'Spa & Wellness',
      about: 'Giới thiệu',
      contact: 'Liên hệ',
      bookNow: 'Đặt Phòng Ngay',
      adminPortal: 'Quản trị'
    },
    EN: {
      rooms: 'Rooms',
      amenities: 'Amenities',
      dining: 'Dining',
      spa: 'Spa & Wellness',
      about: 'About',
      contact: 'Contact',
      bookNow: 'Book Now',
      adminPortal: 'Admin Portal'
    }
  }[language];

  const toggleLanguage = () => {
    setLanguage(language === 'VI' ? 'EN' : 'VI');
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0a0a0f]/80 backdrop-blur-md border-b border-gold/15 py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-cormorant text-2xl lg:text-3xl font-semibold tracking-[0.2em] text-gold group-hover:text-gold-light transition-colors">
            HORIZON
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <a
            href="#rooms"
            onClick={(e) => handleNavClick(e, 'rooms')}
            className="text-xs uppercase tracking-widest text-[#f5f0e8]/80 hover:text-gold transition-colors relative group py-2"
          >
            {t.rooms}
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </a>
          <a
            href="#amenities"
            onClick={(e) => handleNavClick(e, 'amenities')}
            className="text-xs uppercase tracking-widest text-[#f5f0e8]/80 hover:text-gold transition-colors relative group py-2"
          >
            {t.amenities}
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 'about')}
            className="text-xs uppercase tracking-widest text-[#f5f0e8]/80 hover:text-gold transition-colors relative group py-2"
          >
            {t.about}
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </a>
          <a
            href="#testimonials"
            onClick={(e) => handleNavClick(e, 'testimonials')}
            className="text-xs uppercase tracking-widest text-[#f5f0e8]/80 hover:text-gold transition-colors relative group py-2"
          >
            Review
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className="text-xs uppercase tracking-widest text-[#f5f0e8]/80 hover:text-gold transition-colors relative group py-2"
          >
            {t.contact}
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </a>
        </nav>

        {/* Right Buttons */}
        <div className="hidden lg:flex items-center gap-5">
          {/* Admin gateway link */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#f5f0e8]/60 hover:text-gold transition-colors"
            title="Đăng nhập quản trị"
          >
            <Hotel className="w-3.5 h-3.5" />
            <span>{t.adminPortal}</span>
          </Link>

          {/* Lang Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs text-[#f5f0e8]/80 hover:text-gold transition-colors"
          >
            <Globe className="w-4 h-4 text-gold/80" />
            <span className="font-semibold">{language}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-1.5 rounded-lg text-[#f5f0e8]/80 hover:text-gold hover:bg-white/5 transition-all cursor-pointer"
            title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-stone-700" /> : <Sun className="w-4 h-4 text-gold" />}
          </button>

          {/* Book CTA */}
          <a
            href="#booking-widget"
            onClick={(e) => handleNavClick(e, 'booking-widget')}
            className="px-5 py-2 text-xs uppercase tracking-widest font-medium text-gold border border-gold hover:bg-gold hover:text-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)]"
          >
            {t.bookNow}
          </a>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex items-center gap-4 lg:hidden">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-1.5 rounded-lg text-[#f5f0e8]/80 hover:text-gold cursor-pointer"
            title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-gold" />}
          </button>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs text-[#f5f0e8]/80 hover:text-gold"
          >
            <Globe className="w-4 h-4 text-gold/80" />
            <span>{language}</span>
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#f5f0e8]/90 hover:text-gold transition-colors p-1"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <div
        className={`fixed inset-0 top-[60px] bg-[#0a0a0f]/95 backdrop-blur-lg z-40 transition-transform duration-500 lg:hidden flex flex-col justify-start border-t border-gold/10 p-6 gap-6 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-4 text-left">
          <a
            href="#rooms"
            onClick={(e) => handleNavClick(e, 'rooms')}
            className="text-lg font-cormorant tracking-widest text-[#f5f0e8] hover:text-gold border-b border-white/5 pb-2"
          >
            {t.rooms}
          </a>
          <a
            href="#amenities"
            onClick={(e) => handleNavClick(e, 'amenities')}
            className="text-lg font-cormorant tracking-widest text-[#f5f0e8] hover:text-gold border-b border-white/5 pb-2"
          >
            {t.amenities}
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 'about')}
            className="text-lg font-cormorant tracking-widest text-[#f5f0e8] hover:text-gold border-b border-white/5 pb-2"
          >
            {t.about}
          </a>
          <a
            href="#testimonials"
            onClick={(e) => handleNavClick(e, 'testimonials')}
            className="text-lg font-cormorant tracking-widest text-[#f5f0e8] hover:text-gold border-b border-white/5 pb-2"
          >
            Review
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className="text-lg font-cormorant tracking-widest text-[#f5f0e8] hover:text-gold border-b border-white/5 pb-2"
          >
            {t.contact}
          </a>
        </nav>
        
        <div className="flex flex-col gap-4 mt-auto">
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3 text-center text-sm tracking-wider uppercase text-[#f5f0e8]/80 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            {t.adminPortal}
          </Link>
          
          <a
            href="#booking-widget"
            onClick={(e) => handleNavClick(e, 'booking-widget')}
            className="w-full py-3.5 text-center text-sm font-medium uppercase tracking-widest text-black bg-gold hover:bg-gold-light rounded-md transition-colors"
          >
            {t.bookNow}
          </a>
        </div>
      </div>
    </header>
  );
}
