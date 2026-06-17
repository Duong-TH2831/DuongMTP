'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDB, Customer, Booking } from '@/lib/db';
import { ChevronRight, ArrowLeft, Trash2, Award, Calendar, DollarSign, Hotel } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditCustomer() {
  const params = useParams();
  const router = useRouter();
  const db = getDB();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Nam');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [cccd, setCccd] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [memberType, setMemberType] = useState<'REGULAR' | 'VIP' | 'FREQUENT'>('REGULAR');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      const data = db.getCustomer(customerId);
      if (data) {
        setCustomer(data);
        setFullName(data.fullName);
        setGender(data.gender || 'Nam');
        setDateOfBirth(data.dateOfBirth || '');
        setCccd(data.cccd);
        setPhone(data.phone);
        setEmail(data.email || '');
        setAddress(data.address || '');
        setAvatar(data.avatar || null);
        setMemberType(data.memberType);

        // Check if currently checked in
        const currentStay = db.getStays().find(s => s.customerId === data.id && s.status === 'STAYING');
        if (currentStay) {
          const booking = db.getBooking(currentStay.bookingId);
          if (booking) setActiveBooking(booking);
        }
      } else {
        toast.error('Không tìm thấy khách hàng yêu cầu.');
        router.push('/admin/customers');
      }
    }
  }, [customerId, db, router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Họ tên bắt buộc phải nhập.';
    if (!cccd.trim()) errs.cccd = 'CCCD/Passport bắt buộc phải nhập.';
    if (!phone.trim()) errs.phone = 'SĐT liên hệ bắt buộc phải nhập.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Vui lòng kiểm tra lại thông tin nhập liệu.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const updated = db.updateCustomer(customerId, {
        fullName,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        cccd,
        phone,
        email: email || undefined,
        address: address || undefined,
        avatar: avatar || undefined,
        memberType
      });
      setLoading(false);
      if (updated) {
        toast.success('Cập nhật hồ sơ khách hàng thành công!');
        router.push('/admin/customers');
      } else {
        toast.error('Có lỗi xảy ra trong quá trình lưu dữ liệu.');
      }
    }, 1000);
  };

  const handleDelete = () => {
    if (confirm(`Cảnh báo: Bạn có chắc chắn muốn xóa khách hàng ${fullName} (Mã số: ${customerId})? Hành động này sẽ vô hiệu hóa tài khoản của khách.`)) {
      const success = db.deleteCustomer(customerId);
      if (success) {
        toast.success('Đã xóa khách hàng thành công!');
        router.push('/admin/customers');
      } else {
        toast.error('Có lỗi xảy ra khi xóa khách hàng.');
      }
    }
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-stone-400 bg-[#0a0a0f]">
        Đang tải thông tin khách hàng...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f]">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Link href="/admin" className="hover:text-gold transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/admin/customers" className="hover:text-gold transition-colors">Khách hàng</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-600">Sửa thông tin</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers" className="p-1.5 hover:bg-[#1a1a24] rounded-lg text-stone-450 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Cập Nhật Hồ Sơ Khách Hàng</h1>
            <p className="text-xs text-[#9a9080] mt-1">Mã số khách hàng: <strong className="font-mono text-gold">{customer.id}</strong></p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-red-450" />
          <span>Xóa khách hàng</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Container (2/3 width) */}
        <form onSubmit={handleSave} className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl lg:col-span-2 flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Họ và Tên khách hàng *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full bg-[#07070a] border ${errors.fullName ? 'border-red-500' : 'border-gold/15'} focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600`}
              />
              {errors.fullName && <p className="text-[10px] text-red-500 font-semibold">{errors.fullName}</p>}
            </div>

            {/* Member Type Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Hạng thành viên</label>
              <select
                value={memberType}
                onChange={(e) => setMemberType(e.target.value as any)}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors cursor-pointer"
              >
                <option value="REGULAR" className="bg-[#111118] text-stone-200">Thường (Regular)</option>
                <option value="FREQUENT" className="bg-[#111118] text-stone-200">Thân thiết (Frequent)</option>
                <option value="VIP" className="bg-[#111118] text-stone-200">VIP Member</option>
              </select>
            </div>

            {/* SĐT */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Số điện thoại liên hệ *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full bg-[#07070a] border ${errors.phone ? 'border-red-500' : 'border-gold/15'} focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors`}
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-semibold">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Địa chỉ Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600"
              />
            </div>

            {/* CCCD */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Số CCCD / Passport *</label>
              <input
                type="text"
                required
                value={cccd}
                onChange={(e) => setCccd(e.target.value)}
                className={`w-full bg-[#07070a] border ${errors.cccd ? 'border-red-500' : 'border-gold/15'} focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600`}
              />
              {errors.cccd && <p className="text-[10px] text-red-500 font-semibold">{errors.cccd}</p>}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Giới tính</label>
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
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Địa chỉ thường trú</label>
            <textarea
              rows={3}
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
              {loading ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>

        </form>

        {/* Panel Right (1/3 width): Profiles stats & stays info */}
        <div className="flex flex-col gap-6">
          
          {/* Avatar Profile card */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 rounded-full bg-[#07070a] border border-gold/15 flex items-center justify-center font-bold text-gold text-2xl uppercase">
              {fullName.split(' ').pop()?.slice(0, 2)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-200">{fullName}</h3>
              <p className="text-[10px] text-[#9a9080] font-mono mt-0.5">{phone}</p>
            </div>
            
            {/* VIP Badge */}
            {memberType === 'VIP' && (
              <span className="px-3 py-1 bg-gold/10 text-gold border border-gold/20 font-bold rounded-full text-[9px] uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                VIP Member
              </span>
            )}
          </div>

          {/* Customer stats row */}
          <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl flex flex-col gap-3.5">
            <h4 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Thống kê lưu trú</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#07070a] p-3 rounded-xl border border-gold/5">
                <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[9px] uppercase tracking-wider font-bold">Tổng lượt ở</span>
                </div>
                <p className="text-base font-bold text-stone-100">{customer.totalStays} lần</p>
              </div>
              
              <div className="bg-[#07070a] p-3 rounded-xl border border-gold/5">
                <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-450" />
                  <span className="text-[9px] uppercase tracking-wider font-bold">Tổng chi tiêu</span>
                </div>
                <p className="text-sm font-bold text-gold truncate" title={customer.totalSpent.toLocaleString('vi-VN') + 'đ'}>
                  {customer.totalSpent.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            <div className="h-[1px] bg-gold/10 my-1" />
            
            <div className="text-[9px] text-[#9a9080] leading-normal flex justify-between">
              <span>Ngày đăng ký gia nhập:</span>
              <span className="font-semibold text-stone-300">{new Date(customer.joinDate).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          {/* Active room stay info */}
          <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl flex flex-col gap-3">
            <h4 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Trạng thái lưu trú hiện tại</h4>
            
            {activeBooking ? (
              <div className="bg-blue-950/20 p-4 rounded-xl border border-blue-500/20 text-blue-300 flex items-start gap-3">
                <Hotel className="w-5 h-5 text-blue-450 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Đang ở phòng nghỉ</p>
                  <p className="text-xs font-extrabold text-stone-100 mt-1">Phòng {db.getRoom(activeBooking.roomId)?.roomNumber}</p>
                  <p className="text-[9px] text-[#9a9080] mt-1">Check-in: {new Date(activeBooking.checkInDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#07070a] p-4 rounded-xl border border-gold/5 text-stone-400 text-center">
                <p className="text-[10px] font-medium">Hiện không có phòng lưu trú nào đang mở cho khách hàng này.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
