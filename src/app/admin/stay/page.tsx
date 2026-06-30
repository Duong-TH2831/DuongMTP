'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDB, StayRecord, Booking, Customer, Room } from '@/lib/db';
import { 
  Hotel, Search, AlertCircle, Plus, CheckCircle, 
  Calendar, Users, User, ArrowRight, ClipboardList, Edit2, Trash2, X
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function StayManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = getDB();
  const rooms = db.getRooms();
  const roomTypes = db.getRoomTypes();
  const customers = db.getCustomers();

  const [stays, setStays] = useState<StayRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const initialTab = (searchParams.get('tab') as any) || 'ALL';
  const initialSearch = searchParams.get('search') || '';
  
  const [tab, setTab] = useState<'ALL' | 'STAYING' | 'CHECKED_OUT' | 'PENDING_IN'>(initialTab);
  const [search, setSearch] = useState(initialSearch);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingStayId, setEditingStayId] = useState('');
  
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  const [formCheckIn, setFormCheckIn] = useState('');
  const [formStatus, setFormStatus] = useState<'STAYING' | 'CHECKED_OUT'>('STAYING');

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
  const pendingCheckInBookings = bookings.filter(b => {
    if (b.status !== 'CONFIRMED') return false;
    const cust = getCustomerInfo(b.customerId);
    return cust.fullName.toLowerCase().includes(search.toLowerCase()) || 
           cust.phone.includes(search);
  });

  // Combined active list depending on selected Tab
  const filteredStays = stays.filter(s => {
    const cust = getCustomerInfo(s.customerId);
    const matchSearch = 
      cust.fullName.toLowerCase().includes(search.toLowerCase()) || 
      s.stayCode.toLowerCase().includes(search.toLowerCase()) ||
      cust.phone.includes(search);
      
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

  const handleViewInvoice = (stayId: string) => {
    const invoice = db.getInvoices().find(inv => inv.stayId === stayId);
    if (invoice) {
      router.push(`/admin/payment/${invoice.id}`);
    } else {
      router.push(`/admin/payment?stayId=${stayId}`);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormCustomerId('');
    setFormRoomId('');
    setFormCheckIn(new Date().toISOString().split('T')[0]);
    setFormStatus('STAYING');
    setIsModalOpen(true);
  };

  const openEditModal = (stay: StayRecord) => {
    setModalMode('edit');
    setEditingStayId(stay.id);
    setFormCustomerId(stay.customerId);
    setFormRoomId(stay.roomId);
    setFormCheckIn(new Date(stay.actualCheckIn).toISOString().split('T')[0]);
    setFormStatus(stay.status as any);
    setIsModalOpen(true);
  };

  const handleDeleteStay = (stayId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ lưu trú này? Hành động này không thể hoàn tác.')) {
      const success = db.deleteStay(stayId);
      if (success) {
        toast.success('Xóa hồ sơ lưu trú thành công!');
        setStays([...db.getStays()]);
      } else {
        toast.error('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const handleSaveStay = () => {
    if (!formCustomerId || !formRoomId || !formCheckIn) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    
    if (modalMode === 'add') {
      db.addStay({
        bookingId: `walk-in-${Date.now()}`,
        customerId: formCustomerId,
        roomId: formRoomId,
        actualCheckIn: new Date(formCheckIn).toISOString(),
        status: formStatus,
        staffId: 'usr-admin-1'
      });
      toast.success('Thêm hồ sơ lưu trú thành công!');
    } else {
      db.updateStay(editingStayId, {
        customerId: formCustomerId,
        roomId: formRoomId,
        actualCheckIn: new Date(formCheckIn).toISOString(),
        status: formStatus
      });
      toast.success('Cập nhật hồ sơ lưu trú thành công!');
    }
    setStays([...db.getStays()]);
    setIsModalOpen(false);
  };

  // Stats
  const checkInCount = pendingCheckInBookings.length;
  // Rooms needing checkout today
  const activeStays = stays.filter(s => s.status === 'STAYING');
  const checkOutCount = activeStays.length > 5 ? 5 : activeStays.length;

  // Dynamic Chart Data Calculation
  const chartLabels: string[] = [];
  const occupiedData: number[] = [];
  const availableData: number[] = [];

  roomTypes.forEach(rt => {
    const roomsOfType = rooms.filter(r => r.roomTypeId === rt.id);
    const total = roomsOfType.length;
    if (total === 0) return;
    const occupied = roomsOfType.filter(r => r.status === 'OCCUPIED').length;
    const available = total - occupied;

    chartLabels.push(rt.name);
    occupiedData.push(occupied);
    availableData.push(available);
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Đang sử dụng',
        data: occupiedData,
        backgroundColor: 'rgba(234, 179, 8, 0.9)',
        borderRadius: 4,
      },
      {
        label: 'Phòng trống',
        data: availableData,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#a8a29e',
          font: { family: 'Inter', size: 10, weight: 600 as const }
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: '#a8a29e', font: { size: 10, weight: 600 as const } },
        grid: { color: 'rgba(234, 179, 8, 0.05)' }
      },
      y: {
        stacked: true,
        ticks: { color: '#a8a29e', stepSize: 1, font: { size: 10 } },
        grid: { color: 'rgba(234, 179, 8, 0.05)' }
      }
    }
  };

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
      <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto pb-1 xl:pb-0 scrollbar-hide">
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

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full xl:max-w-xs shrink-0">
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
                                onClick={() => handleViewInvoice(s.id)}
                                className="px-3 py-1 bg-[#07070a] border border-gold/5 hover:bg-[#1a1a24] text-stone-450 rounded text-[9px] font-semibold transition-colors cursor-pointer"
                              >
                                Xem Hóa Đơn
                              </button>
                            )}
                            
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1 hover:bg-[#1a1a24] text-stone-400 hover:text-gold rounded transition-colors cursor-pointer"
                              title="Sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStay(s.id)}
                              className="p-1 hover:bg-[#1a1a24] text-stone-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
          <div className="h-48 w-full mt-2">
            <Bar data={chartData} options={chartOptions} />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111118] border border-gold/20 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gold/10 bg-[#07070a]">
              <h3 className="font-bold text-gold text-sm tracking-wide uppercase">
                {modalMode === 'add' ? 'Thêm Mới Lưu Trú' : 'Chỉnh Sửa Lưu Trú'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Khách Hàng *</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 rounded-lg py-2 px-3 text-stone-200 outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Chọn Khách Hàng --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Buồng Phòng *</label>
                <select
                  value={formRoomId}
                  onChange={(e) => setFormRoomId(e.target.value)}
                  className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 rounded-lg py-2 px-3 text-stone-200 outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Chọn Phòng --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Phòng {r.roomNumber} - {r.status}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Ngày Nhận Phòng *</label>
                <input
                  type="date"
                  value={formCheckIn}
                  onChange={(e) => setFormCheckIn(e.target.value)}
                  className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 rounded-lg py-2 px-3 text-stone-200 outline-none [color-scheme:dark]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Trạng Thái *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 rounded-lg py-2 px-3 text-stone-200 outline-none cursor-pointer"
                >
                  <option value="STAYING">Đang lưu trú</option>
                  <option value="CHECKED_OUT">Đã trả phòng</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-gold/10 bg-[#0a0a0f] flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveStay}
                className="px-4 py-2 text-xs font-bold bg-gold text-black rounded-lg hover:bg-gold-light transition-colors cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
