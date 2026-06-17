'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Grid, List, Layers, ShieldCheck, 
  Sparkles, DollarSign, PenTool, CheckCircle, Flame, Edit, Eye,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { getDB, Room, RoomType } from '@/lib/db';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function RoomList() {
  const db = getDB();
  const roomTypes = db.getRoomTypes();
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // States
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Bulk update states
  const [bulkTargetStatus, setBulkTargetStatus] = useState<string>('AVAILABLE');
  const [bulkFloor, setBulkFloor] = useState<number | 'ALL'>('ALL');

  // Pagination (exactly 5 rooms per page as requested)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setRooms([...db.getRooms()]);
  }, [db]);

  // Filters
  const filtered = rooms.filter(r => {
    const matchFloor = selectedFloor === 'ALL' || r.floor === selectedFloor;
    const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const matchSearch = r.roomNumber.includes(search) || 
      (roomTypes.find(rt => rt.id === r.roomTypeId)?.name || '').toLowerCase().includes(search.toLowerCase());
    
    return matchFloor && matchStatus && matchSearch;
  });

  // Pagination bounds
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleBulkUpdate = () => {
    let affectedCount = 0;
    const updatedRooms = rooms.map(r => {
      const matchFloor = bulkFloor === 'ALL' || r.floor === bulkFloor;
      // Only change rooms that are available, cleaning, or maintenance to avoid messing up active guest rooms
      const isEligible = r.status === 'AVAILABLE' || r.status === 'CLEANING' || r.status === 'MAINTENANCE';
      
      if (matchFloor && isEligible) {
        affectedCount++;
        const updated = db.updateRoom(r.id, { status: bulkTargetStatus as any });
        return updated || r;
      }
      return r;
    });

    if (affectedCount > 0) {
      setRooms([...db.getRooms()]);
      toast.success(`Cập nhật hàng loạt thành công cho ${affectedCount} phòng tầng ${bulkFloor}!`);
    } else {
      toast.warning('Không tìm thấy phòng phù hợp (không thể thay đổi phòng có khách đang ở).');
    }
  };

  // Stats
  const totalRooms = rooms.length;
  const availableCount = rooms.filter(r => r.status === 'AVAILABLE').length;
  const bookedCount = rooms.filter(r => r.status === 'BOOKED').length;
  const occupiedCount = rooms.filter(r => r.status === 'OCCUPIED').length;

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Danh Sách Phòng Nghỉ</h1>
          <p className="text-xs text-stone-400 mt-1">Tra cứu buồng phòng, thông tin cấu hình tầng và tình trạng sẵn có.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rooms/grid"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111118] text-stone-200 border border-gold/15 rounded-lg text-xs font-bold transition-all hover:bg-[#1a1a24] hover:text-gold"
          >
            <Grid className="w-4 h-4 text-gold" />
            <span>Chế độ Lưới (Sơ đồ)</span>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Tổng số phòng</p>
          <p className="text-4xl font-extrabold font-mono text-stone-100 mt-1.5">{totalRooms}</p>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Phòng còn trống</p>
          <p className="text-4xl font-extrabold font-mono text-emerald-450 mt-1.5">{availableCount}</p>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Phòng đã đặt</p>
          <p className="text-4xl font-extrabold font-mono text-amber-500 mt-1.5">{bookedCount}</p>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Đang sử dụng</p>
          <p className="text-4xl font-extrabold font-mono text-blue-400 mt-1.5">{occupiedCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Floor selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['ALL', 1, 2, 3, 4, 5] as const).map((floor) => (
            <button
              key={floor}
              onClick={() => { setSelectedFloor(floor); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                selectedFloor === floor
                  ? 'bg-gold text-black border-gold shadow-md'
                  : 'bg-[#07070a] border-gold/5 hover:bg-[#1a1a24] text-stone-400'
              }`}
            >
              {floor === 'ALL' ? 'Tất cả tầng' : `Tầng ${floor}`}
            </button>
          ))}
        </div>

        {/* Search & Status select */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-48">
            <Search className="w-4 h-4 text-stone-550 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Số phòng, loại..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-1.5 bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="bg-[#07070a] border border-gold/15 py-1.5 px-3.5 rounded-lg text-xs font-semibold text-stone-200 outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#111118]">Tất cả trạng thái</option>
            <option value="AVAILABLE" className="bg-[#111118]">AVAILABLE (Trống)</option>
            <option value="BOOKED" className="bg-[#111118]">BOOKED (Đã đặt)</option>
            <option value="OCCUPIED" className="bg-[#111118]">OCCUPIED (Đang ở)</option>
            <option value="MAINTENANCE" className="bg-[#111118]">MAINTENANCE (Bảo trì)</option>
            <option value="CLEANING" className="bg-[#111118]">CLEANING (Dọn dẹp)</option>
          </select>
        </div>

      </div>

      {/* Table view (exactly 5 items per page) */}
      <div className="bg-[#111118] rounded-xl border border-gold/10 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gold/15 text-[#9a9080] font-semibold bg-[#07070a]/50">
                <th className="py-3 pl-4">Mã phòng</th>
                <th className="py-3">Hạng phòng</th>
                <th className="py-3">Vị trí tầng</th>
                <th className="py-3">Đơn giá / Đêm</th>
                <th className="py-3">Tình trạng buồng</th>
                <th className="py-3 pr-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((room) => {
                  const type = roomTypes.find(rt => rt.id === room.roomTypeId)!;
                  return (
                    <tr key={room.id} className="border-b border-gold/10 hover:bg-[#1a1a24]/50 transition-colors text-stone-300 font-medium">
                      <td className="py-4 pl-4 font-mono font-bold text-gold">Room {room.roomNumber}</td>
                      <td className="py-4 font-bold text-stone-200">{type.name}</td>
                      <td className="py-4">Tầng {room.floor}</td>
                      <td className="py-4 font-bold text-stone-200">{type.basePrice.toLocaleString('vi-VN')}đ</td>
                      <td className="py-4">
                        <StatusBadge status={room.status} />
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/rooms/${room.id}/edit`}
                            className="p-1.5 text-gold hover:bg-gold/10 rounded transition-colors"
                            title="Sửa thông tin phòng"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/rooms/grid`}
                            className="p-1.5 text-stone-400 hover:bg-[#1a1a24] hover:text-stone-200 rounded transition-colors"
                            title="Xem trên sơ đồ"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 bg-[#111118]">
                    Không tìm thấy phòng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gold/10 flex items-center justify-between text-xs text-stone-400 font-semibold bg-[#07070a]/50">
            <span>
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} trên tổng số {totalItems} phòng nghỉ
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 border border-gold/15 bg-[#07070a] rounded text-stone-300 hover:bg-[#1a1a24] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">Trang {currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 border border-gold/15 bg-[#07070a] rounded text-stone-300 hover:bg-[#1a1a24] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Cards: Revenue Optimization & Quick Live Update */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Revenue optimization tip card */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-md flex gap-4">
          <div className="p-3 bg-gold/10 text-gold rounded-xl h-fit shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">Tối ưu hóa doanh thu buồng</h3>
            <p className="text-[10px] text-stone-400 leading-normal font-light">
              Dự báo công suất buồng phòng cuối tuần này đạt mức <strong className="text-gold">98%</strong>. Khuyến nghị điều chỉnh giá nền hạng phòng <strong className="text-stone-300 font-semibold">Presidential Penthouse</strong> tăng 10% và tăng cường nhân sự dọn dẹp trực tại sảnh để đẩy nhanh tốc độ quay vòng phòng trống.
            </p>
          </div>
        </div>

        {/* Live Quick Action Card: Bulk status updates */}
        <div className="bg-[#111118] text-stone-200 p-6 rounded-2xl border border-gold/15 shadow-md flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Cập nhật hàng loạt (Quick Action LIVE)
            </h3>
            <p className="text-[10px] text-stone-400 font-light leading-normal mt-1">
              Thực hiện chuyển đổi trạng thái nhanh cho các phòng trống/bẩn/bảo trì.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 items-center">
            {/* Target Floor select */}
            <select
              value={bulkFloor}
              onChange={(e) => setBulkFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-[#07070a] border border-gold/15 hover:bg-[#1a1a24] p-2 rounded text-[10px] text-stone-200 outline-none font-semibold cursor-pointer"
            >
              <option value="ALL" className="bg-[#111118]">Tất cả tầng</option>
              <option value="1" className="bg-[#111118]">Tầng 1</option>
              <option value="2" className="bg-[#111118]">Tầng 2</option>
              <option value="3" className="bg-[#111118]">Tầng 3</option>
              <option value="4" className="bg-[#111118]">Tầng 4</option>
              <option value="5" className="bg-[#111118]">Tầng 5</option>
            </select>

            {/* Target Status select */}
            <select
              value={bulkTargetStatus}
              onChange={(e) => setBulkTargetStatus(e.target.value)}
              className="bg-[#07070a] border border-gold/15 hover:bg-[#1a1a24] p-2 rounded text-[10px] text-stone-200 outline-none font-semibold cursor-pointer"
            >
              <option value="AVAILABLE" className="bg-[#111118]">AVAILABLE (Trống)</option>
              <option value="CLEANING" className="bg-[#111118]">CLEANING (Dọn dẹp)</option>
              <option value="MAINTENANCE" className="bg-[#111118]">MAINTENANCE (Bảo trì)</option>
            </select>

            <button
              onClick={handleBulkUpdate}
              className="py-2 px-3 bg-gold hover:bg-gold-light text-black font-bold uppercase text-[9px] tracking-wider rounded transition-all cursor-pointer text-center"
            >
              Cập nhật ngay
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
