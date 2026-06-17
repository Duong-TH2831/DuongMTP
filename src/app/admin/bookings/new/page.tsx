'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDB, Room, RoomType, Customer } from '@/lib/db';
import { ChevronRight, ArrowLeft, Search, Calendar, Info, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewBooking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = getDB();
  const roomTypes = db.getRoomTypes();
  const rooms = db.getRooms();
  const customers = db.getCustomers();

  // URL pre-filled options
  const urlRoomId = searchParams.get('roomId');
  const urlAction = searchParams.get('action'); // checkin or book

  // Form states
  const [bookingCode, setBookingCode] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('rt-deluxe');
  const [searchCustQuery, setSearchCustQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [custPhone, setCustPhone] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [numberOfAdults, setNumberOfAdults] = useState(2);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Autocomplete dropdown display state
  const [showCustDropdown, setShowCustDropdown] = useState(false);

  // Generate code on mount
  useEffect(() => {
    const codeNum = Math.floor(10000 + Math.random() * 90000);
    setBookingCode(`BK-2026-${codeNum}`);

    // If pre-filled room in URL
    if (urlRoomId) {
      const preRoom = db.getRoom(urlRoomId);
      if (preRoom) {
        setRoomTypeId(preRoom.roomTypeId);
        setSelectedRoomId(preRoom.id);
      }
    }
  }, [urlRoomId, db]);

  // Sync available rooms list based on room type
  const availableRoomsList = rooms.filter(
    r => r.roomTypeId === roomTypeId && (r.status === 'AVAILABLE' || r.id === selectedRoomId)
  );

  // Filter customers for autocomplete
  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchCustQuery.toLowerCase()) || 
    c.phone.includes(searchCustQuery) ||
    c.cccd.includes(searchCustQuery)
  ).slice(0, 5);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCust(c);
    setSearchCustQuery(c.fullName);
    setCustPhone(c.phone);
    setShowCustDropdown(false);
  };

  // Computations
  const selectedType = roomTypes.find(rt => rt.id === roomTypeId) || roomTypes[0];
  const dIn = new Date(checkInDate);
  const dOut = new Date(checkOutDate);
  const nights = Math.max(1, Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));
  
  const roomPriceSubtotal = selectedType.basePrice * nights;
  const vatAmount = roomPriceSubtotal * 0.1;
  const serviceCharge = roomPriceSubtotal * 0.05;
  const totalAmount = roomPriceSubtotal + vatAmount + serviceCharge;

  // Validate dates
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay.toISOString().split('T')[0]);
      }
    }
  }, [checkInDate, checkOutDate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCust) {
      toast.error('Vui lòng chọn hoặc tìm kiếm hồ sơ khách hàng.');
      return;
    }
    if (!selectedRoomId) {
      toast.error('Vui lòng chọn số phòng trống.');
      return;
    }

    const newBooking = db.createBooking({
      customerId: selectedCust.id,
      roomId: selectedRoomId,
      checkInDate: new Date(checkInDate).toISOString(),
      checkOutDate: new Date(checkOutDate).toISOString(),
      numberOfNights: nights,
      numberOfAdults,
      numberOfChildren,
      status: urlAction === 'checkin' ? 'CHECKED_IN' : 'CONFIRMED',
      totalPrice: totalAmount,
      depositAmount: urlAction === 'checkin' ? totalAmount : totalAmount * 0.3,
      paymentMethod: 'CASH',
      paymentStatus: urlAction === 'checkin' ? 'PAID' : 'UNPAID',
      specialRequests: specialRequests || undefined,
      createdById: 'usr-staff-1'
    });

    if (newBooking) {
      toast.success(urlAction === 'checkin' ? 'Nhận phòng check-in thành công!' : 'Tạo phiếu đặt phòng thành công!');
      router.push('/admin/bookings');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-stone-200">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Link href="/admin" className="hover:text-gold transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/admin/bookings" className="hover:text-gold transition-colors">Phiếu đặt phòng</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-600">Đặt phiếu mới</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/bookings" className="p-1.5 hover:bg-[#1a1a24] rounded-lg text-stone-450 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Đặt Phiếu Phòng Mới</h1>
            <p className="text-xs text-[#9a9080] mt-1">Lập hóa đơn đặt trước buồng phòng trực tiếp tại quầy lễ tân.</p>
          </div>
        </div>
      </div>

      {/* Grid forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Container (2/3 width) */}
        <form onSubmit={handleCreate} className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl lg:col-span-2 flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Booking Code (Readonly) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Mã đặt phòng (Auto-gen)</label>
              <input
                type="text"
                readOnly
                value={bookingCode}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs outline-none text-stone-400 font-bold font-mono"
              />
            </div>

            {/* Room type select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Chọn loại hạng phòng *</label>
              <select
                value={roomTypeId}
                onChange={(e) => { setRoomTypeId(e.target.value); setSelectedRoomId(''); }}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors font-semibold cursor-pointer"
              >
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id} className="bg-[#111118] text-stone-200">
                    {type.name} ({type.basePrice.toLocaleString('vi-VN')}đ / đêm)
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Search Autocomplete */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Tìm kiếm Khách hàng *</label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Gõ tên, SĐT hoặc CCCD..."
                  value={searchCustQuery}
                  onChange={(e) => {
                    setSearchCustQuery(e.target.value);
                    setSelectedCust(null);
                    setCustPhone('');
                    setShowCustDropdown(true);
                  }}
                  onFocus={() => setShowCustDropdown(true)}
                  className="w-full pl-9 pr-4 py-2 bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] rounded-lg text-xs text-stone-200 outline-none placeholder-stone-600 transition-colors"
                />
              </div>

              {/* Autocomplete Dropdown list */}
              {showCustDropdown && searchCustQuery.length > 0 && (
                <div className="absolute top-[54px] left-0 right-0 z-40 bg-[#111118] border border-gold/15 rounded-lg shadow-2xl max-h-40 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="p-2.5 hover:bg-[#1a1a24] cursor-pointer text-xs flex justify-between items-center text-stone-300 border-b border-gold/5"
                      >
                        <span className="font-bold">{c.fullName}</span>
                        <span className="font-mono text-[#9a9080]">{c.phone} • {c.cccd.slice(-4)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[#9a9080] text-xs">
                      Không tìm thấy khách hàng. <Link href="/admin/customers/new" className="text-gold font-bold hover:underline">Thêm mới?</Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Phone (auto filled) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Số điện thoại liên lạc</label>
              <input
                type="text"
                readOnly
                placeholder="Tự động điền"
                value={custPhone}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs outline-none text-stone-400 font-mono font-semibold"
              />
            </div>

            {/* Dates */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Ngày nhận phòng (Check-in)</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs text-stone-200 outline-none transition-colors cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Ngày trả phòng (Check-out)</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs text-stone-200 outline-none transition-colors cursor-pointer"
              />
            </div>

            {/* Guest count */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Số người lớn</label>
              <input
                type="number"
                min={1}
                max={6}
                value={numberOfAdults}
                onChange={(e) => setNumberOfAdults(Number(e.target.value))}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs text-stone-200 outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Số trẻ em</label>
              <input
                type="number"
                min={0}
                max={6}
                value={numberOfChildren}
                onChange={(e) => setNumberOfChildren(Number(e.target.value))}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs text-stone-200 outline-none transition-colors"
              />
            </div>

          </div>

          {/* Select available room from grid */}
          <div className="flex flex-col gap-2 border-t border-gold/10 pt-4">
            <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Chọn số phòng trống có sẵn *</label>
            {availableRoomsList.length > 0 ? (
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
                {availableRoomsList.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`py-2 text-center rounded border font-mono text-xs font-bold transition-all cursor-pointer ${
                      selectedRoomId === room.id
                        ? 'bg-gold border-gold text-black shadow-md'
                        : 'bg-[#07070a] border-gold/15 text-stone-300 hover:border-gold/50'
                    }`}
                  >
                    {room.roomNumber}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-red-400 font-semibold italic">Không có phòng trống nào thuộc hạng phòng này sẵn sàng trong thời gian đã chọn.</p>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Ghi chú & Yêu cầu đặc biệt</label>
            <textarea
              rows={3}
              placeholder="Ghi chú thêm: Hướng biển, phòng không hút thuốc, cũi trẻ em..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs text-stone-200 outline-none transition-colors resize-none placeholder-stone-600"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gold/10 pt-4">
            <Link
              href="/admin/bookings"
              className="px-6 py-2.5 bg-[#07070a] border border-gold/10 hover:bg-[#1a1a24] text-stone-300 rounded-lg text-xs font-bold transition-colors"
            >
              Hủy
            </Link>
            <button
              type="button"
              onClick={() => {
                setSelectedCust(null);
                setSearchCustQuery('');
                setCustPhone('');
                setSelectedRoomId('');
                setSpecialRequests('');
              }}
              className="px-6 py-2.5 bg-[#07070a] border border-gold/15 hover:bg-[#1a1a24] text-stone-300 rounded-lg text-xs font-bold transition-colors"
            >
              Làm mới
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {urlAction === 'checkin' ? 'Check-in Nhanh' : 'Đặt phòng'}
            </button>
          </div>

        </form>

        {/* Panel Right (1/3 width, sticky) */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-4">
          
          {/* Summary price breakdown */}
          <div className="bg-gradient-to-br from-amber-950/20 to-stone-950/40 border border-gold/20 shadow-2xl p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-gold" />
              Tóm tắt chi phí dự kiến
            </h3>

            <div className="flex flex-col gap-2.5 border-y border-gold/10 py-4 text-xs font-light text-stone-350">
              <div className="flex justify-between">
                <span>Đơn giá/Đêm:</span>
                <span className="font-bold text-stone-100">{selectedType.basePrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Số đêm nghỉ:</span>
                <span className="font-bold text-stone-100">{nights} đêm</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế VAT (10%):</span>
                <span className="text-stone-200">{vatAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí dịch vụ (5%):</span>
                <span className="text-stone-200">{serviceCharge.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-gold">
              <span>TỔNG TIỀN:</span>
              <span className="text-xl font-extrabold text-gold">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Room type preview image */}
          <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl flex flex-col gap-3">
            <h4 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Xem trước loại phòng</h4>
            <div className="h-32 bg-slate-100 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url('/rooms/deluxe-bg.jpg')` }} />
            <p className="text-[10px] font-bold text-stone-100 uppercase">{selectedType.name}</p>
            <p className="text-[9px] text-[#9a9080] leading-normal font-light">
              Diện tích rộng rãi • Hệ thống điều hòa 2 chiều • Smart TV 4K kết nối internet • Mini bar đồ uống miễn phí.
            </p>
          </div>

          {/* Guidelines checklist */}
          <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl flex flex-col gap-3">
            <h4 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Quy định nghiệp vụ lễ tân</h4>
            <ul className="text-[9px] font-light leading-relaxed text-[#9a9080] list-decimal pl-4 flex flex-col gap-2">
              <li>Xác minh căn cước công dân hoặc hộ chiếu khi khách nhận phòng trực tiếp.</li>
              <li>Thu tiền đặt cọc tối thiểu <strong>30%</strong> đối với khách đặt trước để giữ phòng.</li>
              <li>Thông báo chính sách hủy phòng: hoàn tiền trước 24h nhận phòng dự kiến.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
