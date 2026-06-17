'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, List, Grid, LayoutGrid, Check, 
  RefreshCw, Wrench, ShieldCheck, User, CalendarDays, Layers
} from 'lucide-react';
import { getDB, Room, RoomType, Customer, Booking } from '@/lib/db';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function RoomGrid() {
  const router = useRouter();
  const db = getDB();
  const roomTypes = db.getRoomTypes();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Filter states
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, AVAILABLE, OCCUPIED, CLEANING_MAINTENANCE

  useEffect(() => {
    setRooms([...db.getRooms()]);
    setBookings([...db.getBookings()]);
    setCustomers([...db.getCustomers()]);
  }, [db]);

  // Statistics calculation
  const totalCount = rooms.length;
  const availableCount = rooms.filter(r => r.status === 'AVAILABLE').length;
  const dirtyCount = rooms.filter(r => r.status === 'CLEANING').length;
  const bookedCount = rooms.filter(r => r.status === 'BOOKED').length;
  const occupiedCount = rooms.filter(r => r.status === 'OCCUPIED').length;
  const maintenanceCount = rooms.filter(r => r.status === 'MAINTENANCE').length;

  // Filter rooms
  const filteredRooms = rooms.filter(r => {
    const matchFloor = selectedFloor === 'ALL' || r.floor === selectedFloor;
    let matchStatus = true;
    if (statusFilter === 'AVAILABLE') {
      matchStatus = r.status === 'AVAILABLE';
    } else if (statusFilter === 'OCCUPIED') {
      matchStatus = r.status === 'OCCUPIED' || r.status === 'BOOKED';
    } else if (statusFilter === 'CLEANING_MAINTENANCE') {
      matchStatus = r.status === 'CLEANING' || r.status === 'MAINTENANCE';
    }
    return matchFloor && matchStatus;
  });

  // Group filtered rooms by floor
  const floors = [5, 4, 3, 2, 1].filter(f => selectedFloor === 'ALL' || f === selectedFloor);

  // Helper to find customer name in occupied/booked rooms
  const getRoomGuestName = (roomId: string, status: string) => {
    if (status !== 'OCCUPIED' && status !== 'BOOKED') return null;
    
    // Find booking
    const activeBooking = bookings.find(
      b => b.roomId === roomId && 
      (b.status === 'CHECKED_IN' || b.status === 'CONFIRMED')
    );
    if (activeBooking) {
      const customer = customers.find(c => c.id === activeBooking.customerId);
      return customer ? customer.fullName : 'Khách đoàn';
    }
    return null;
  };

  // Actions trigger
  const handleRoomAction = (room: Room, action: string) => {
    if (action === 'CLEAN') {
      db.updateRoom(room.id, { status: 'AVAILABLE' });
      toast.success(`Phòng ${room.roomNumber} đã dọn dẹp sạch sẽ, sẵn sàng đón khách!`);
    } else if (action === 'MAINTAIN') {
      db.updateRoom(room.id, { status: 'AVAILABLE' });
      toast.success(`Đã hoàn tất bảo trì phòng ${room.roomNumber}.`);
    } else if (action === 'BOOK') {
      // Pre-set room type and go to booking new
      router.push(`/admin/bookings/new?roomId=${room.id}`);
    } else if (action === 'CHECK_IN') {
      // Find booking code for this booked room
      const booking = bookings.find(b => b.roomId === room.id && b.status === 'CONFIRMED');
      if (booking) {
        db.updateBookingStatus(booking.id, 'CHECKED_IN');
        toast.success(`Đã làm thủ tục Check-in nhanh cho phòng ${room.roomNumber}!`);
      } else {
        router.push(`/admin/bookings/new?roomId=${room.id}&action=checkin`);
      }
    }
    
    // Refresh states
    setRooms([...db.getRooms()]);
    setBookings([...db.getBookings()]);
  };

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Quản Lý Sơ Đồ Phòng</h1>
          <p className="text-xs text-stone-400 mt-1">
            Tổng {totalCount} phòng | <strong className="text-emerald-450">{availableCount} trống</strong> | <strong className="text-blue-400">{occupiedCount} có khách</strong> | <strong className="text-amber-500">{bookedCount} đã đặt</strong> | <strong className="text-yellow-500">{dirtyCount} bẩn</strong> | <strong className="text-red-400">{maintenanceCount} bảo trì</strong>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rooms"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111118] text-stone-200 border border-gold/15 rounded-lg text-xs font-bold transition-all hover:bg-[#1a1a24] hover:text-gold"
          >
            <List className="w-4 h-4 text-gold" />
            <span>Chế độ Danh sách</span>
          </Link>
          <button
            onClick={() => {
              if (confirm('Khởi tạo lại trạng thái dọn dẹp hàng loạt?')) {
                rooms.forEach(r => {
                  if (r.status === 'CLEANING') db.updateRoom(r.id, { status: 'AVAILABLE' });
                });
                setRooms([...db.getRooms()]);
                toast.success('Đã hoàn tất dọn phòng hàng loạt!');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gold hover:bg-gold-light text-black rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-black" />
            <span>Dọn phòng nhanh</span>
          </button>
        </div>
      </div>

      {/* Grid Filters */}
      <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Floor Selection */}
        <div className="flex items-center gap-2 text-xs w-full md:w-auto">
          <Layers className="w-4 h-4 text-[#9a9080] shrink-0" />
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-[#07070a] border border-gold/15 py-1.5 px-3 rounded-lg text-xs font-semibold text-stone-250 outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#111118]">Tất cả tầng</option>
            <option value="1" className="bg-[#111118]">Tầng 01</option>
            <option value="2" className="bg-[#111118]">Tầng 02</option>
            <option value="3" className="bg-[#111118]">Tầng 03</option>
            <option value="4" className="bg-[#111118]">Tầng 04</option>
            <option value="5" className="bg-[#111118]">Tầng 05</option>
          </select>
        </div>

        {/* Room State Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto justify-end">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-gold text-black border border-gold shadow-md'
                : 'bg-[#07070a] border border-gold/5 text-stone-400 hover:bg-[#1a1a24]'
            }`}
          >
            Tất cả phòng
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600/30 text-emerald-250 border border-emerald-500/30'
                : 'bg-[#07070a] border border-gold/5 text-stone-400 hover:bg-[#1a1a24]'
            }`}
          >
            Còn trống ({availableCount})
          </button>
          <button
            onClick={() => setStatusFilter('OCCUPIED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'OCCUPIED'
                ? 'bg-blue-900/35 text-blue-200 border border-blue-500/30'
                : 'bg-[#07070a] border border-gold/5 text-stone-400 hover:bg-[#1a1a24]'
            }`}
          >
            Có khách/Đặt ({occupiedCount + bookedCount})
          </button>
          <button
            onClick={() => setStatusFilter('CLEANING_MAINTENANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'CLEANING_MAINTENANCE'
                ? 'bg-yellow-600/30 text-yellow-250 border border-yellow-500/30'
                : 'bg-[#07070a] border border-gold/5 text-stone-400 hover:bg-[#1a1a24]'
            }`}
          >
            Bẩn/Sửa chữa ({dirtyCount + maintenanceCount})
          </button>
        </div>

      </div>

      {/* Floors Display */}
      <div className="flex flex-col gap-8">
        {floors.map((floorNum) => {
          const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
          if (floorRooms.length === 0) return null;

          return (
            <div key={floorNum} className="flex flex-col gap-4 bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-md">
              <h3 className="text-xs font-extrabold uppercase text-gold font-cormorant border-l-2 border-gold pl-3 tracking-wider text-sm">
                TẦNG {floorNum.toString().padStart(2, '0')} ({floorRooms.length} phòng)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {floorRooms.map((room) => {
                  const type = roomTypes.find(rt => rt.id === room.roomTypeId)!;
                  const guestName = getRoomGuestName(room.id, room.status);
                  
                  // Status border colors
                  let cardBorder = 'border-gold/10';
                  let statusBg = 'bg-[#07070a]/40';
                  
                  if (room.status === 'AVAILABLE') {
                    cardBorder = 'border-emerald-500/20 hover:border-emerald-500/40';
                    statusBg = 'bg-emerald-950/10 text-emerald-350';
                  } else if (room.status === 'OCCUPIED') {
                    cardBorder = 'border-blue-500/20 hover:border-blue-500/40';
                    statusBg = 'bg-blue-950/10 text-blue-350';
                  } else if (room.status === 'BOOKED') {
                    cardBorder = 'border-amber-500/20 hover:border-amber-500/40';
                    statusBg = 'bg-amber-950/10 text-amber-350';
                  } else if (room.status === 'CLEANING') {
                    cardBorder = 'border-yellow-500/20 hover:border-yellow-500/40';
                    statusBg = 'bg-yellow-950/10 text-yellow-350';
                  } else if (room.status === 'MAINTENANCE') {
                    cardBorder = 'border-red-500/25 hover:border-red-500/50';
                    statusBg = 'bg-red-950/10 text-red-350';
                  }

                  return (
                    <div
                      key={room.id}
                      className={`border-2 rounded-xl p-3.5 flex flex-col justify-between min-h-[140px] transition-all hover:-translate-y-0.5 hover:shadow-md ${cardBorder} ${statusBg}`}
                    >
                      {/* Room Number & Status badge */}
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-base font-extrabold text-stone-100">P.{room.roomNumber}</span>
                        <StatusBadge status={room.status} className="px-1.5 py-0.5 text-[8px] font-bold" />
                      </div>

                      {/* Room Type */}
                      <p className="text-[10px] text-[#9a9080] font-semibold truncate leading-none mb-2">{type.name}</p>

                      {/* Guest details if occupied */}
                      <div className="my-2 min-h-[30px] flex flex-col justify-center">
                        {guestName ? (
                          <p className="text-[10px] text-stone-200 font-bold flex items-center gap-1">
                            <User className="w-3 h-3 text-gold shrink-0" />
                            <span className="truncate">{guestName}</span>
                          </p>
                        ) : room.notes ? (
                          <p className="text-[9px] text-stone-400 font-light truncate italic">&ldquo;{room.notes}&rdquo;</p>
                        ) : (
                          <p className="text-[9px] text-stone-600 font-light italic">Không có khách</p>
                        )}
                      </div>

                      {/* Action buttons depending on state */}
                      <div className="mt-3 pt-2.5 border-t border-gold/10 flex items-center justify-between gap-1.5">
                        {room.status === 'AVAILABLE' && (
                          <>
                            <button
                              onClick={() => handleRoomAction(room, 'BOOK')}
                              className="flex-1 py-1 rounded bg-gold hover:bg-gold-light text-black text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer"
                            >
                              BOOK
                            </button>
                            <Link
                              href={`/admin/rooms/${room.id}/edit`}
                              className="px-2 py-1 rounded bg-[#07070a] border border-gold/10 text-stone-300 hover:bg-[#1a1a24] hover:text-gold text-[9px] font-bold text-center transition-colors"
                            >
                              Sửa
                            </Link>
                          </>
                        )}

                        {room.status === 'BOOKED' && (
                          <button
                            onClick={() => handleRoomAction(room, 'CHECK_IN')}
                            className="w-full py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer"
                          >
                            CHECK-IN
                          </button>
                        )}

                        {room.status === 'OCCUPIED' && (
                          <Link
                            href="/admin/stay"
                            className="w-full py-1.5 rounded bg-blue-905 border border-blue-500/20 hover:bg-blue-800/40 text-blue-300 text-[9px] font-bold uppercase tracking-wider text-center transition-colors"
                          >
                            CHI TIẾT khách ở
                          </Link>
                        )}

                        {room.status === 'CLEANING' && (
                          <button
                            onClick={() => handleRoomAction(room, 'CLEAN')}
                            className="w-full py-1.5 rounded bg-emerald-600/40 border border-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer flex items-center justify-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            ĐÃ DỌN XONG
                          </button>
                        )}

                        {room.status === 'MAINTENANCE' && (
                          <button
                            onClick={() => handleRoomAction(room, 'MAINTAIN')}
                            className="w-full py-1.5 rounded bg-red-950/40 border border-red-500/20 hover:bg-red-900/45 text-red-400 text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer flex items-center justify-center gap-1 transition-colors"
                          >
                            <Wrench className="w-3 h-3" />
                            MỞ KHÓA PHÒNG
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
