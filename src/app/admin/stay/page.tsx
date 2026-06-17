'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDB, StayRecord, Booking, Customer, Room } from '@/lib/db';
import { 
  Hotel, Search, AlertCircle, Plus, CheckCircle, 
  Calendar, Users, User, ArrowRight, ClipboardList
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function StayManagement() {
  const router = useRouter();
  const db = getDB();
  const rooms = db.getRooms();
  const roomTypes = db.getRoomTypes();
  const customers = db.getCustomers();

  const [stays, setStays] = useState<StayRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<'ALL' | 'STAYING' | 'CHECKED_OUT' | 'PENDING_IN'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setStays([...db.getStays()]);
    setBookings([...db.getBookings()]);
  }, [db]);

  const getCustomerInfo = (customerId: string) => {
    return customers.find(c => c.id === customerId) || {
      fullName: 'Khách vãng lai',
      phone: 'N/A',
      memberType: 'REGULAR'
    };
  };

  const getRoomInfo = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 'Chưa có phòng';
    const type = roomTypes.find(rt => rt.id === room.roomTypeId);
    return `P.${room.roomNumber} (${type ? type.name : 'Chưa rõ'})`;
  };

  // Filter stays & bookings that are pending check-in
  const pendingCheckInBookings = bookings.filter(b => b.status === 'CONFIRMED');

  // Combined active list depending on selected Tab
  const filteredStays = stays.filter(s => {
    const cust = getCustomerInfo(s.customerId);
    const matchSearch = 
      cust.fullName.toLowerCase().includes(search.toLowerCase()) || 
      s.stayCode.toLowerCase().includes(search.toLowerCase());
      
    if (tab === 'STAYING') {
      return s.status === 'STAYING' && matchSearch;
    }
    if (tab === 'CHECKED_OUT') {
      return s.status === 'CHECKED_OUT' && matchSearch;
    }
    return matchSearch;
  });

  const handleCheckIn = (bookingId: string) => {
    const booking = db.getBooking(bookingId);
    if (booking) {
      db.updateBookingStatus(bookingId, 'CHECKED_IN');
      toast.success(`Check-in thành công cho khách hàng!`);
      // Refresh
      setStays([...db.getStays()]);
      setBookings([...db.getBookings()]);
    }
  };

  const handleCheckOut = (stayId: string) => {
    // Redirect receptionist directly to payment screen with preloaded stay id!
    router.push(`/admin/payment?stayId=${stayId}`);
  };

  // Stats
  const checkInCount = pendingCheckInBookings.length;
  // Rooms needing checkout today
  const activeStays = stays.filter(s => s.status === 'STAYING');
  const checkOutCount = activeStays.length > 5 ? 5 : activeStays.length;

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f]">
      
      {/* Hero Welcome Card */}
      <div className="bg-[#111118] text-stone-200 p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-gold/15">
        <div className="absolute top-[-40%] left-[-20%] w-[50%] h-[150%] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
        <div className="z-10 flex flex-col gap-1">
          <h2 className="font-cormorant text-xl font-bold tracking-wide text-gold animate-fade-in">Chào buổi sáng!</h2>
          <p className="text-xs text-stone-300 font-light">
            Hiện tại đang có <strong className="text-gold">{checkInCount} khách</strong> đang chờ check-in và <strong className="text-gold">{checkOutCount} phòng</strong> cần làm thủ tục trả phòng hôm nay.
          </p>
        </div>
        <button
          onClick={() => {
            if (pendingCheckInBookings.length > 0) {
              handleCheckIn(pendingCheckInBookings[0].id);
            } else {
              toast.info('Không có lượt check-in nào đang chờ duyệt.');
            }
          }}
          className="z-10 px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer"
        >
          Check-in Nhanh
        </button>
      </div>

      {/* Stats indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Cần Check-In Hôm nay</p>
            <p className="text-4xl font-extrabold font-mono text-blue-400 mt-1.5">{checkInCount}</p>
          </div>
          <div className="p-3 bg-blue-900/20 text-blue-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Cần Check-Out Hôm nay</p>
            <p className="text-4xl font-extrabold font-mono text-stone-100 mt-1.5">{checkOutCount}</p>
          </div>
          <div className="p-3 bg-gold/10 text-gold rounded-lg">
            <Hotel className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs / Controls */}
      <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all border cursor-pointer ${
              tab === 'ALL'
                ? 'bg-gold text-black border-gold shadow-md'
                : 'bg-[#07070a] border-gold/5 hover:bg-[#1a1a24] text-stone-400'
            }`}
          >
            Tất cả lượt ở
          </button>
          <button
            onClick={() => setTab('STAYING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all border cursor-pointer ${
              tab === 'STAYING'
                ? 'bg-gold text-black border-gold shadow-md'
                : 'bg-[#07070a] border-gold/5 hover:bg-[#1a1a24] text-stone-400'
            }`}
          >
            Đang ở ({activeStays.length})
          </button>
          <button
            onClick={() => setTab('CHECKED_OUT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all border cursor-pointer ${
              tab === 'CHECKED_OUT'
                ? 'bg-gold text-black border-gold shadow-md'
                : 'bg-[#07070a] border-gold/5 hover:bg-[#1a1a24] text-stone-400'
            }`}
          >
            Đã trả phòng
          </button>
          <button
            onClick={() => setTab('PENDING_IN')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all border cursor-pointer ${
              tab === 'PENDING_IN'
                ? 'bg-gold text-black border-gold shadow-md'
                : 'bg-[#07070a] border-gold/5 hover:bg-[#1a1a24] text-stone-400'
            }`}
          >
            Đang chờ check-in ({checkInCount})
          </button>
        </div>

        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="w-4 h-4 text-stone-550 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã lưu trú, khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600"
          />
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-[#111118] rounded-xl border border-gold/10 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gold/15 text-[#9a9080] font-semibold bg-[#07070a]/50">
                <th className="py-3 pl-4">Mã hồ sơ</th>
                <th className="py-3">Họ và tên khách</th>
                <th className="py-3">Buồng phòng</th>
                <th className="py-3">Ngày nhận phòng</th>
                <th className="py-3">Ngày trả phòng</th>
                <th className="py-3">Phụ thu dịch vụ</th>
                <th className="py-3">Trạng thái</th>
                <th className="py-3 pr-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tab === 'PENDING_IN' ? (
                // Render pending check-ins
                pendingCheckInBookings.length > 0 ? (
                  pendingCheckInBookings.map((b) => {
                    const cust = getCustomerInfo(b.customerId);
                    return (
                      <tr key={b.id} className="border-b border-gold/10 hover:bg-[#1a1a24]/50 transition-colors text-stone-300 font-medium">
                        <td className="py-4 pl-4 font-mono font-bold text-stone-500">WAITING</td>
                        <td className="py-4 flex items-center gap-2">
                          <span className="font-bold text-stone-100">{cust.fullName}</span>
                          <StatusBadge status={cust.memberType} className="px-1.5 py-0 text-[7px]" />
                        </td>
                        <td className="py-4 font-bold text-stone-250">{getRoomInfo(b.roomId)}</td>
                        <td className="py-4 text-stone-400">{new Date(b.checkInDate).toLocaleDateString('vi-VN')}</td>
                        <td className="py-4 text-stone-400">{new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</td>
                        <td className="py-4 text-stone-300">0đ</td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-semibold">Chờ Check-in</span>
                        </td>
                        <td className="py-4 pr-4">
                          <button
                            onClick={() => handleCheckIn(b.id)}
                            className="w-full py-1 rounded bg-gold hover:bg-gold-light text-black text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer transition-colors"
                          >
                            Check-In
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-500 bg-[#111118]">Không có khách hàng nào chờ Check-in hôm nay.</td>
                  </tr>
                )
              ) : (
                // Render stay records
                filteredStays.length > 0 ? (
                  filteredStays.map((s) => {
                    const cust = getCustomerInfo(s.customerId);
                    return (
                      <tr key={s.id} className="border-b border-gold/10 hover:bg-[#1a1a24]/50 transition-colors text-stone-300 font-medium">
                        
                        {/* Stay Code */}
                        <td className="py-4 pl-4 font-mono font-bold text-gold">{s.stayCode}</td>
                        
                        {/* Customer */}
                        <td className="py-4 flex items-center gap-2">
                          <span className="font-bold text-stone-100">{cust.fullName}</span>
                          <StatusBadge status={cust.memberType} className="px-1.5 py-0 text-[7px]" />
                        </td>

                        {/* Room */}
                        <td className="py-4 font-bold text-stone-250">{getRoomInfo(s.roomId)}</td>

                        {/* Check-in */}
                        <td className="py-4 text-stone-400">{new Date(s.actualCheckIn).toLocaleDateString('vi-VN')}</td>

                        {/* Check-out */}
                        <td className="py-4 text-stone-400">
                          {s.actualCheckOut ? new Date(s.actualCheckOut).toLocaleDateString('vi-VN') : 'Đang ở'}
                        </td>

                        {/* Services charged */}
                        <td className="py-4 text-stone-200 font-semibold">{s.totalCharged.toLocaleString('vi-VN')}đ</td>

                        {/* Status */}
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            s.status === 'STAYING' 
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                              : 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                          }`}>
                            {s.status === 'STAYING' ? 'Đang lưu trú' : 'Đã trả phòng'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {s.status === 'STAYING' ? (
                              <button
                                onClick={() => handleCheckOut(s.id)}
                                className="px-3 py-1 bg-[#07070a] border border-gold/15 hover:bg-[#1a1a24] text-stone-300 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                              >
                                Check-Out
                              </button>
                            ) : (
                              <button
                                onClick={() => router.push(`/admin/payment?stayId=${s.id}`)}
                                className="px-3 py-1 bg-[#07070a] border border-gold/5 hover:bg-[#1a1a24] text-stone-450 rounded text-[9px] font-semibold transition-colors cursor-pointer"
                              >
                                Xem Hóa Đơn
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-500 bg-[#111118]">Không tìm thấy thông tin lưu trú nào phù hợp.</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Layout widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Allocation widget (2/3 width) */}
        <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-md lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-4">Phân bổ phòng hôm nay</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-[#07070a] rounded-xl border border-gold/10">
              <span className="text-[9px] text-[#9a9080] font-bold uppercase tracking-wider">Deluxe Suite</span>
              <p className="text-lg font-bold text-stone-250 mt-1">42 / 60 phòng</p>
              <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 relative overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
            
            <div className="p-3 bg-[#07070a] rounded-xl border border-gold/10">
              <span className="text-[9px] text-[#9a9080] font-bold uppercase tracking-wider">Ocean View</span>
              <p className="text-lg font-bold text-stone-250 mt-1">16 / 24 phòng</p>
              <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 relative overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '66%' }} />
              </div>
            </div>

            <div className="p-3 bg-[#07070a] rounded-xl border border-gold/10">
              <span className="text-[9px] text-[#9a9080] font-bold uppercase tracking-wider">Villa Suite</span>
              <p className="text-lg font-bold text-stone-250 mt-1">4 / 6 phòng</p>
              <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 relative overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '66%' }} />
              </div>
            </div>

            <div className="p-3 bg-[#07070a] rounded-xl border border-gold/10">
              <span className="text-[9px] text-[#9a9080] font-bold uppercase tracking-wider">Penthouse</span>
              <p className="text-lg font-bold text-stone-250 mt-1">1 / 2 phòng</p>
              <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 relative overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Important notice checklist (1/3 width) */}
        <div className="bg-[#111118] text-stone-250 p-5 rounded-2xl shadow-md flex flex-col gap-3.5 border border-gold/15">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gold shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Ghi chú quan trọng</h3>
          </div>
          <ul className="text-[10px] font-light leading-relaxed flex flex-col gap-2.5 list-disc pl-4 text-stone-300">
            <li>Đoàn khách 12 người của <strong>Tập đoàn Vingroup</strong> dự kiến check-in lúc 14:00 (Yêu cầu hỗ trợ đón tiễn).</li>
            <li>Có 2 phòng (Phòng 312 và 405) đang bảo trì điều hòa chưa mở khóa.</li>
          </ul>
          <button
            onClick={() => toast.info('Đang mở trang lịch trình biểu đồ điều hành...')}
            className="text-[9px] text-gold hover:text-gold-light font-bold hover:underline self-end flex items-center gap-1 mt-1 cursor-pointer transition-colors"
          >
            Xem tất cả lịch trình
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
