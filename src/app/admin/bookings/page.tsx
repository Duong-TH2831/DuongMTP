'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Search, SlidersHorizontal, Plus, Check, 
  ChevronLeft, ChevronRight, MessageSquare, AlertTriangle, Trash2
} from 'lucide-react';
import { getDB, Booking, Customer, Room, RoomType } from '@/lib/db';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function BookingList() {
  const db = getDB();
  const roomTypes = db.getRoomTypes();
  const rooms = db.getRooms();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tab, setTab] = useState<'ALL' | 'TODAY' | 'PENDING'>('ALL');
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setBookings([...db.getBookings()]);
    setCustomers([...db.getCustomers()]);
  }, [db]);

  const getCustomerInfo = (customerId: string) => {
    return customers.find(c => c.id === customerId) || {
      fullName: 'Khách vãng lai',
      phone: 'Chưa cập nhật'
    };
  };

  const getRoomInfo = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return { roomNumber: 'N/A', typeName: 'Chưa rõ' };
    const type = roomTypes.find(rt => rt.id === room.roomTypeId);
    return {
      roomNumber: room.roomNumber,
      typeName: type ? type.name : 'Chưa rõ'
    };
  };

  // Filter Bookings
  const filtered = bookings.filter(b => {
    const cust = getCustomerInfo(b.customerId);
    const roomInfo = getRoomInfo(b.roomId);
    
    const matchSearch = 
      cust.fullName.toLowerCase().includes(search.toLowerCase()) ||
      cust.phone.includes(search) ||
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      roomInfo.roomNumber.includes(search);

    let matchTab = true;
    if (tab === 'PENDING') {
      matchTab = b.status === 'PENDING';
    } else if (tab === 'TODAY') {
      const todayStr = new Date().toISOString().split('T')[0];
      matchTab = b.checkInDate.startsWith(todayStr);
    }

    return matchSearch && matchTab;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination bounds
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage);

  const handleConfirm = (id: string, code: string) => {
    const updated = db.updateBookingStatus(id, 'CONFIRMED');
    if (updated) {
      toast.success(`Đã phê duyệt xác nhận phiếu đặt phòng ${code}!`);
      setBookings([...db.getBookings()]);
    }
  };

  const handleCancel = (id: string, code: string) => {
    if (confirm(`Bạn có chắc chắn muốn hủy đặt phòng ${code}?`)) {
      const updated = db.updateBookingStatus(id, 'CANCELLED');
      if (updated) {
        toast.success(`Đã hủy phiếu đặt phòng ${code}.`);
        setBookings([...db.getBookings()]);
      }
    }
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn lịch sử đặt phòng của phiếu ${code}?`)) {
      const success = db.deleteBooking(id);
      if (success) {
        toast.success(`Đã xóa thành công lịch sử phiếu đặt phòng ${code}.`);
        setBookings([...db.getBookings()]);
      } else {
        toast.error('Có lỗi xảy ra, không thể xóa lịch sử.');
      }
    }
  };

  // Stats rows (preloaded totals as requested)
  const totalCount = 1284;
  const awaitingCount = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedToday = bookings.filter(b => b.status === 'CONFIRMED').length;
  const canceledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  return (
    <div className="flex flex-col gap-6 text-stone-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Booking Management</h1>
          <p className="text-xs text-[#9a9080] mt-1">Hệ thống xử lý phê duyệt đặt buồng phòng nghỉ dưỡng Horizon Grand Resort.</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gold hover:bg-gold-light text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Tạo phiếu phòng mới</span>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Total Bookings</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-100">{totalCount}</span>
            <span className="text-[9px] text-emerald-450 font-bold">+12%</span>
          </div>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Chờ xác nhận</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-500">{awaitingCount}</span>
            <span className="text-[9px] text-amber-400 font-bold">Cần duyệt</span>
          </div>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Xác nhận hôm nay</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-450">{confirmedToday}</span>
            <span className="text-[9px] text-emerald-400 font-bold">+3%</span>
          </div>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Đơn đã hủy</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-red-400">{canceledCount}</span>
            <span className="text-[9px] text-red-500 font-light">Tháng này</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Tabs */}
      <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Tab selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => { setTab('ALL'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              tab === 'ALL' ? 'bg-gold text-black shadow-lg' : 'bg-[#07070a] border border-gold/10 hover:bg-[#1a1a24] text-stone-300'
            }`}
          >
            Tất cả phiếu
          </button>
          <button
            onClick={() => { setTab('TODAY'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              tab === 'TODAY' ? 'bg-gold text-black shadow-lg' : 'bg-[#07070a] border border-gold/10 hover:bg-[#1a1a24] text-stone-300'
            }`}
          >
            Nhận phòng hôm nay
          </button>
          <button
            onClick={() => { setTab('PENDING'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              tab === 'PENDING' ? 'bg-gold text-black shadow-lg' : 'bg-[#07070a] border border-gold/10 hover:bg-[#1a1a24] text-stone-300'
            }`}
          >
            Đang chờ duyệt ({awaitingCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên khách, mã đặt phòng..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-1.5 bg-[#07070a] border border-gold/15 rounded-lg text-xs text-stone-300 focus:border-gold/30 outline-none placeholder-stone-600 transition-colors"
          />
        </div>

      </div>

      {/* Live Reservations Table */}
      <div className="bg-[#111118] rounded-xl border border-gold/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gold/10 text-[#9a9080] font-semibold bg-[#07070a]/50">
                <th className="py-3 pl-4">Mã Booking</th>
                <th className="py-3">Thông tin khách</th>
                <th className="py-3">Phòng nghỉ</th>
                <th className="py-3">Thời gian lưu trú</th>
                <th className="py-3">Thanh toán</th>
                <th className="py-3">Trạng thái</th>
                <th className="py-3 pr-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((b) => {
                  const cust = getCustomerInfo(b.customerId);
                  const room = getRoomInfo(b.roomId);
                  return (
                    <tr key={b.id} className="border-b border-gold/5 hover:bg-[#1a1a24]/50 transition-colors text-stone-300 font-medium">
                      
                      {/* Booking Code */}
                      <td className="py-4 pl-4 font-mono font-bold text-stone-100">{b.bookingCode}</td>
                      
                      {/* Guest Info */}
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-200">{cust.fullName}</span>
                          <span className="text-[10px] text-[#9a9080] font-mono mt-0.5">{cust.phone}</span>
                        </div>
                      </td>

                      {/* Room number */}
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-stone-100">Phòng {room.roomNumber}</span>
                          <span className="text-[10px] text-stone-400 font-medium mt-0.5">{room.typeName}</span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-4 text-stone-350">
                        <div className="flex flex-col">
                          <span>{new Date(b.checkInDate).toLocaleDateString('vi-VN')} &rarr; {new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</span>
                          <span className="text-[10px] text-stone-500 font-medium mt-0.5">{b.numberOfNights} đêm • {b.numberOfAdults}L / {b.numberOfChildren}T</span>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gold">{b.totalPrice.toLocaleString('vi-VN')}đ</span>
                          <span className={`text-[9px] font-bold ${b.paymentStatus === 'PAID' ? 'text-emerald-450' : 'text-red-400'} mt-0.5`}>
                            {b.paymentStatus === 'PAID' ? 'Đã thu tiền' : 'Chưa thanh toán'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirm(b.id, b.bookingCode)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                              title="Xác nhận đặt phòng"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Duyệt
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT' && (
                            <button
                              onClick={() => handleCancel(b.id, b.bookingCode)}
                              className="px-2.5 py-1 bg-red-950/30 hover:bg-red-900/40 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                              title="Hủy đơn đặt phòng"
                            >
                              Hủy đặt
                            </button>
                          )}
                          {b.status === 'CANCELLED' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-500 italic">Hủy bỏ</span>
                              <button
                                onClick={() => handleDelete(b.id, b.bookingCode)}
                                className="px-2.5 py-1 bg-red-950/30 hover:bg-red-900/40 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-all"
                                title="Xóa lịch sử"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </button>
                            </div>
                          )}
                          {b.status === 'CHECKED_OUT' && (
                            <button
                              onClick={() => handleDelete(b.id, b.bookingCode)}
                              className="px-2.5 py-1 bg-red-950/30 hover:bg-red-900/40 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-all"
                              title="Xóa lịch sử"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa lịch sử
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9a9080]">
                    Không tìm thấy lịch trình đặt phòng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gold/10 flex items-center justify-between text-xs text-[#9a9080] font-semibold bg-[#07070a]/50">
            <span>
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} trên tổng số {totalItems} phiếu đặt phòng
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 border border-gold/15 rounded hover:bg-[#1a1a24] text-stone-300 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">Trang {currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 border border-gold/15 rounded hover:bg-[#1a1a24] text-stone-300 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Occupancy Peak Notice */}
        <div className="bg-amber-950/20 text-stone-250 border border-amber-500/20 p-6 rounded-2xl flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-555 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Occupancy Peak Notice</h3>
            <p className="text-[10px] text-[#9a9080] leading-relaxed font-light">
              Cuối tuần tới dự kiến công suất lấp đầy phòng đạt mức <strong>98%</strong>. Khuyến cáo nhân viên lễ tân ưu tiên xác nhận nhanh các phiếu đặt cọc và bố trí nhân viên tăng ca.
            </p>
            <button
              onClick={() => toast.info('Đã gửi thông báo bố trí trực ca cho nhân viên.')}
              className="mt-2 py-1 px-3 bg-amber-600 text-white rounded text-[10px] font-bold uppercase tracking-wider w-fit hover:bg-amber-500 transition-colors"
            >
              Optimize Staffing
            </button>
          </div>
        </div>

        {/* Live support chat panel link */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex gap-4">
          <div className="p-3 bg-blue-950/30 text-blue-400 border border-blue-500/20 rounded-xl h-fit shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-250">Live Chat Support</h3>
            <p className="text-[10px] text-[#9a9080] leading-normal font-light">
              Liên kết đến kênh hỗ trợ khách hàng đặt phòng trực tuyến. Trực tiếp giải quyết các tranh chấp hủy phòng hoặc gia hạn ngày lưu trú từ cổng resort.
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); toast.success('Đang khởi tạo cổng Live Chat hỗ trợ...'); }}
              className="text-[10px] text-gold hover:text-gold-light font-bold hover:underline mt-1"
            >
              Mở cổng Live Chat trực tuyến &rarr;
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
