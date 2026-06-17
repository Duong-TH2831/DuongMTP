'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDB, Room, RoomType } from '@/lib/db';
import { ChevronRight, ArrowLeft, Plus, X, Upload, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditRoom() {
  const params = useParams();
  const router = useRouter();
  const db = getDB();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const roomTypes = db.getRoomTypes();

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomTypeId, setRoomTypeId] = useState('');
  const [status, setStatus] = useState<any>('AVAILABLE');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Realtime view count simulator
  const [viewerCount, setViewerCount] = useState(1);

  useEffect(() => {
    if (roomId) {
      const data = db.getRoom(roomId);
      if (data) {
        setRoom(data);
        setRoomNumber(data.roomNumber);
        setFloor(data.floor);
        setRoomTypeId(data.roomTypeId);
        setStatus(data.status);
        setDescription(data.description || '');
        setImage(data.images?.[0] || null);

        const type = roomTypes.find(rt => rt.id === data.roomTypeId);
        if (type) {
          setPrice(type.basePrice);
          setAmenities(type.amenities || []);
        }
      } else {
        toast.error('Không tìm thấy phòng yêu cầu.');
        router.push('/admin/rooms');
      }
    }

    // Simulate viewers count randomly
    setViewerCount(Math.floor(1 + Math.random() * 3));
  }, [roomId, db, router]);

  // Sync price when room type changes
  useEffect(() => {
    if (roomTypeId) {
      const selectedType = roomTypes.find(rt => rt.id === roomTypeId);
      if (selectedType) {
        setPrice(selectedType.basePrice);
      }
    }
  }, [roomTypeId, roomTypes]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const updated = db.updateRoom(roomId, {
        status,
        floor,
        roomTypeId,
        description,
        images: image ? [image] : []
      });

      // Update room type amenities
      const type = roomTypes.find(rt => rt.id === roomTypeId);
      if (type) {
        type.amenities = amenities;
        type.basePrice = price; // Also update base price in type
        db.save();
      }

      setLoading(false);
      if (updated) {
        toast.success(`Cập nhật thông tin phòng ${roomNumber} thành công!`);
        router.push('/admin/rooms/grid');
      } else {
        toast.error('Lỗi khi lưu dữ liệu buồng phòng.');
      }
    }, 1000);
  };

  if (!room) return null;

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f]">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Link href="/admin" className="hover:text-gold transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/admin/rooms" className="hover:text-gold transition-colors">Phòng</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-600">Cập nhật thông tin phòng</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/rooms" className="p-1.5 hover:bg-[#1a1a24] rounded-lg text-stone-450 border border-gold/5 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Cập Nhật Thông Tin Phòng</h1>
            <p className="text-xs text-stone-400 mt-1">Quản lý trạng thái buồng phòng, tiện nghi và giá niêm yết.</p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/rooms/grid"
            className="px-5 py-2.5 bg-[#07070a] border border-gold/10 hover:bg-[#1a1a24] text-stone-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Hủy bỏ
          </Link>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column (1/3): Image & Status radios */}
        <div className="flex flex-col gap-6">
          
          {/* Room Image box */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-md flex flex-col items-center gap-4 text-center">
            <h3 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold self-start">Ảnh đại diện phòng</h3>
            <div className="relative w-full h-44 rounded-xl bg-[#07070a] border border-gold/15 flex items-center justify-center overflow-hidden group hover:opacity-90 transition-opacity">
              {image ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
              ) : (
                <div className="flex flex-col items-center text-stone-500">
                  <Upload className="w-8 h-8 mb-1.5 text-gold" />
                  <span className="text-xs font-semibold text-stone-450">Tải ảnh phòng lên</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                <Upload className="w-4 h-4 text-gold" />
                <span>Nhấn để thay đổi</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Status Radio Buttons */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-md flex flex-col gap-4">
            <h3 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Trạng thái buồng phòng</h3>
            
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-emerald-550/20 bg-emerald-950/10 cursor-pointer">
                <input
                  type="radio"
                  name="roomStatus"
                  value="AVAILABLE"
                  checked={status === 'AVAILABLE'}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-emerald-500/20 bg-[#07070a]"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-400">Sẵn sàng (AVAILABLE)</span>
                  <p className="text-[9px] text-emerald-500/80 mt-0.5 font-light">Phòng sạch sẽ, trống và sẵn đón khách mới.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gold/10 bg-[#07070a]/50 opacity-60 cursor-not-allowed">
                <input
                  type="radio"
                  name="roomStatus"
                  value="OCCUPIED"
                  checked={status === 'OCCUPIED' || status === 'BOOKED'}
                  disabled
                  className="h-4 w-4 text-gold focus:ring-gold border-gold/10 bg-[#07070a]"
                />
                <div>
                  <span className="text-xs font-bold text-stone-400">Đang hoạt động (OCCUPIED / BOOKED)</span>
                  <p className="text-[9px] text-stone-500 mt-0.5 font-light">Đang có khách lưu trú hoặc sắp check-in (Readonly).</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-red-500/20 bg-red-950/15 cursor-pointer">
                <input
                  type="radio"
                  name="roomStatus"
                  value="MAINTENANCE"
                  checked={status === 'MAINTENANCE'}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-4 w-4 text-red-500 focus:ring-red-500 border-red-500/20 bg-[#07070a]"
                />
                <div>
                  <span className="text-xs font-bold text-red-400">Bảo trì (MAINTENANCE)</span>
                  <p className="text-[9px] text-red-500/80 mt-0.5 font-light">Khóa phòng để sửa chữa trang thiết bị hỏng hóc.</p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right column (2/3): Room Info fields & amenities tag chips */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-md lg:col-span-2 flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Identifier (Readonly) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Mã phòng * (Readonly)</label>
              <input
                type="text"
                readOnly
                value={`Phòng ${roomNumber}`}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs outline-none text-stone-500 font-bold"
              />
              <p className="text-[9px] text-stone-500 mt-0.5 italic">Mã định danh duy nhất không thể thay đổi.</p>
            </div>

            {/* Room Type select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Loại hạng phòng *</label>
              <select
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors font-bold cursor-pointer"
              >
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id} className="bg-[#111118] text-stone-200">
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Price input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Đơn giá phòng nghỉ (VNĐ/Đêm) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors font-bold"
              />
            </div>

            {/* Floor input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Tầng vị trí *</label>
              <input
                type="number"
                required
                min={1}
                max={5}
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Mô tả chi tiết phòng</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2.5 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors resize-none font-light leading-relaxed placeholder-stone-600"
            />
          </div>

          {/* Amenities dynamic tags */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Tiện nghi có sẵn</label>
            
            {/* Tag Chips list */}
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="pl-3 pr-2 py-1 bg-gold/10 text-gold border border-gold/20 rounded-full text-[10px] font-bold inline-flex items-center gap-1 hover:bg-gold/15 transition-colors"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenity)}
                    className="p-0.5 rounded-full hover:bg-red-950 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Input tag */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Thêm tiện nghi mới (ví dụ: Smart TV 4K)..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                className="flex-1 bg-[#07070a] border border-gold/15 focus:border-gold/30 py-1.5 px-3 rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-650"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-3 py-1.5 bg-[#07070a] border border-gold/10 hover:bg-[#1a1a24] text-stone-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Thêm tiện nghi
              </button>
            </div>
          </div>

          {/* Footer view info simulation */}
          <div className="mt-8 pt-4 border-t border-gold/10 flex flex-col md:flex-row justify-between text-[10px] text-stone-500 font-medium leading-relaxed gap-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold" />
              Cập nhật lần cuối bởi Nguyễn Minh Trí vào 10:24 - Hôm nay
            </span>
            <span className="flex items-center gap-1.5 text-gold font-bold animate-pulse">
              <Eye className="w-3.5 h-3.5 text-gold shrink-0 animate-pulse" />
              Đang được xem bởi {viewerCount} người dùng khác (realtime)
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
