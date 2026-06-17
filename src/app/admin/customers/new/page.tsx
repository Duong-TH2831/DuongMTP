'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDB } from '@/lib/db';
import { ChevronRight, ArrowLeft, Info, MapPin, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewCustomer() {
  const router = useRouter();
  const db = getDB();

  // Form states
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Nam');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [cccd, setCccd] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh đại diện vượt quá 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const errs: Record<string, string> = {};

    // Basic fields validation
    if (!fullName.trim()) errs.fullName = 'Họ tên bắt buộc phải nhập.';
    if (!cccd.trim()) errs.cccd = 'Số định danh CCCD/Passport bắt buộc phải nhập.';
    if (!phone.trim()) errs.phone = 'Số điện thoại liên hệ bắt buộc phải nhập.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Vui lòng kiểm tra lại thông tin nhập liệu.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        db.createCustomer({
          fullName,
          email: email || undefined,
          phone,
          cccd,
          dateOfBirth: dateOfBirth || undefined,
          gender,
          address: address || undefined,
          avatar: avatar || undefined,
          memberType: 'REGULAR',
          isActive: true
        });
        setLoading(false);
        toast.success('Thêm mới hồ sơ khách hàng thành công!');
        router.push('/admin/customers');
      } catch (err: any) {
        setLoading(false);
        toast.error('Lỗi khi thêm mới khách hàng.');
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f]">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Link href="/admin" className="hover:text-gold transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/admin/customers" className="hover:text-gold transition-colors">Khách hàng</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-600">Thêm mới</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers" className="p-1.5 hover:bg-[#1a1a24] rounded-lg text-stone-450 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Đăng Ký Khách Hàng Mới</h1>
            <p className="text-xs text-[#9a9080] mt-1">Lập hồ sơ khách hàng lưu trữ mới vào cơ sở dữ liệu.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form left, Widget/guidelines right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Container (2/3 width) */}
        <form onSubmit={handleSave} className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl lg:col-span-2 flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">
                Họ và Tên khách hàng *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn An"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full bg-[#07070a] border ${errors.fullName ? 'border-red-500' : 'border-gold/15'} focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600`}
              />
              {errors.fullName && <p className="text-[10px] text-red-500 font-semibold">{errors.fullName}</p>}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors cursor-pointer"
              >
                <option value="Nam" className="bg-[#111118] text-stone-200">Nam</option>
                <option value="Nữ" className="bg-[#111118] text-stone-200">Nữ</option>
                <option value="Khác" className="bg-[#111118] text-stone-200">Khác</option>
              </select>
            </div>

            {/* Date of birth */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">
                Ngày sinh
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors cursor-pointer"
              />
            </div>

            {/* CCCD / Passport */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">
                Số CCCD / Hộ chiếu *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 030100234567"
                value={cccd}
                onChange={(e) => setCccd(e.target.value)}
                className={`w-full bg-[#07070a] border ${errors.cccd ? 'border-red-500' : 'border-gold/15'} focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600`}
              />
              {errors.cccd && <p className="text-[10px] text-red-500 font-semibold">{errors.cccd}</p>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">
                Số điện thoại liên hệ *
              </label>
              <input
                type="tel"
                required
                placeholder="Ví dụ: 0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full bg-[#07070a] border ${errors.phone ? 'border-red-500' : 'border-gold/15'} focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600`}
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-semibold">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">
                Địa chỉ Email (Nếu có)
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs text-stone-200 outline-none transition-colors placeholder-stone-600"
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">
              Địa chỉ thường trú
            </label>
            <textarea
              rows={3}
              placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2.5 px-4 rounded-lg text-xs text-stone-200 outline-none transition-colors resize-none placeholder-stone-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gold/10">
            <Link
              href="/admin/customers"
              className="px-6 py-2.5 bg-[#07070a] border border-gold/10 hover:bg-[#1a1a24] text-stone-300 rounded-lg text-xs font-bold transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {loading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>

        </form>

        {/* Panel Right (1/3 width): Guidelines & Avatar upload */}
        <div className="flex flex-col gap-6">
          
          {/* Avatar Upload Container */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex flex-col items-center gap-4 text-center">
            <h3 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold self-start">Ảnh đại diện khách hàng</h3>
            <div className="relative w-28 h-28 rounded-full bg-[#07070a] border-2 border-dashed border-gold/20 flex items-center justify-center overflow-hidden group hover:border-gold transition-colors">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-stone-400">
                  <Upload className="w-6 h-6 mb-1 text-gold/60" />
                  <span className="text-[9px]">Tải ảnh lên</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-stone-450 font-light leading-normal">
              Định dạng ảnh hỗ trợ: JPG, PNG. Dung lượng tối đa 2MB. Nhấn trực tiếp để thay đổi.
            </p>
          </div>

          {/* Tips checklist - dark gold/black gradient card */}
          <div className="bg-gradient-to-br from-amber-950/20 to-stone-950/40 text-stone-200 p-6 rounded-2xl border border-gold/15 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gold font-bold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Hướng dẫn nghiệp vụ</h3>
            </div>
            <ul className="text-[10px] font-light leading-relaxed flex flex-col gap-2.5 list-disc pl-4 text-[#9a9080]">
              <li>Mã định danh CCCD hoặc Hộ chiếu (Passport) là <strong>bắt buộc</strong> để làm thủ tục nhận phòng (Check-in) đúng quy định.</li>
              <li>Nhập số điện thoại chính xác để liên kết lịch sử đặt phòng tự động trên hệ thống.</li>
              <li>Địa chỉ khách hàng sẽ được hiển thị trên bản đồ định vị thông minh bên dưới để tính toán hành trình đón tiễn nếu cần.</li>
            </ul>
          </div>

          {/* Map Location Widget */}
          <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gold">
              <MapPin className="w-4.5 h-4.5 text-gold shrink-0" />
              <h4 className="text-xs font-bold text-stone-200">Định Vị Vị Trí Khách Hàng</h4>
            </div>
            <div className="h-32 bg-[#07070a] border border-gold/15 rounded-lg flex items-center justify-center text-center p-4 relative overflow-hidden">
              {address ? (
                <div className="z-10">
                  <p className="text-[10px] font-bold text-stone-100">Đã xác định vị trí</p>
                  <p className="text-[9px] text-[#9a9080] mt-1 max-w-[200px] truncate mx-auto">{address}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gold/10 text-gold rounded border border-gold/20 text-[8px] font-semibold">GPS: Active</span>
                </div>
              ) : (
                <p className="text-[10px] text-[#9a9080] font-light">Chưa có thông tin địa chỉ để kích hoạt định vị vệ tinh.</p>
              )}
              {/* Decorative grid pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #c9a84c 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
