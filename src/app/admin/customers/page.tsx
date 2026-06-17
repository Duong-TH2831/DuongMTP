'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, SlidersHorizontal, ArrowUpDown, 
  Trash2, Edit, ChevronLeft, ChevronRight, UserPlus
} from 'lucide-react';
import { getDB, Customer } from '@/lib/db';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function CustomerList() {
  const db = getDB();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL'); // ALL, VIP, FREQUENT, REGULAR
  const [sortBy, setSortBy] = useState<string>('newest'); // newest, totalSpent, totalStays
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Fetch customer list, including soft deleted
    setCustomers(db.getCustomers().filter(c => c.isActive));
  }, [db]);

  // Filter & Search logic
  const filtered = customers.filter(c => {
    const matchSearch = 
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.cccd.includes(search) ||
      c.id.toLowerCase().includes(search.toLowerCase());
      
    const matchType = filterType === 'ALL' || c.memberType === filterType;
    
    return matchSearch && matchType;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'totalSpent') {
      return b.totalSpent - a.totalSpent;
    }
    if (sortBy === 'totalStays') {
      return b.totalStays - a.totalStays;
    }
    return 0;
  });

  // Pagination
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khách hàng ${name} khỏi hệ thống?`)) {
      const success = db.deleteCustomer(id);
      if (success) {
        toast.success(`Đã xóa thành công khách hàng ${name}.`);
        setCustomers(db.getCustomers().filter(c => c.isActive));
      }
    }
  };

  // Stats
  const totalCount = customers.length;
  const vipCount = customers.filter(c => c.memberType === 'VIP').length;
  const regularCount = customers.filter(c => c.memberType === 'REGULAR').length;
  const frequentCount = customers.filter(c => c.memberType === 'FREQUENT').length;

  return (
    <div className="flex flex-col gap-6 relative min-h-[calc(100vh-100px)] pb-20 text-stone-200 bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Danh Sách Khách Hàng</h1>
          <p className="text-xs text-[#9a9080] mt-1">Quản lý hồ sơ thông tin liên lạc, mã định danh CCCD/Passport và phân hạng thành viên khách sạn.</p>
        </div>
        <Link
          href="/admin/customers/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gold hover:bg-gold-light text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-black" />
          <span>Thêm khách hàng</span>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Tổng khách hàng</p>
          <p className="text-2xl font-bold text-stone-100 mt-1">{totalCount}</p>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Thành viên VIP</p>
          <p className="text-2xl font-bold text-gold mt-1">{vipCount}</p>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Thành viên thân thiết</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{frequentCount}</p>
        </div>
        <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] text-[#9a9080] font-bold uppercase tracking-wider">Khách vãng lai</p>
          <p className="text-2xl font-bold text-stone-400 mt-1">{regularCount}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, CCCD..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] rounded-lg text-xs text-stone-300 outline-none placeholder-stone-600 transition-colors"
          />
        </div>

        {/* Filter selectors */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          
          {/* Member tier filter */}
          <div className="flex items-center gap-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9a9080] shrink-0" />
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="bg-[#07070a] border border-gold/15 py-1.5 px-3.5 rounded-lg text-xs font-semibold text-stone-300 outline-none cursor-pointer focus:border-gold/30"
            >
              <option value="ALL">Tất cả thành viên</option>
              <option value="VIP">Thành viên VIP</option>
              <option value="FREQUENT">Thân thiết</option>
              <option value="REGULAR">Thường</option>
            </select>
          </div>

          {/* Sort order selection */}
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#9a9080] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#07070a] border border-gold/15 py-1.5 px-3.5 rounded-lg text-xs font-semibold text-stone-300 outline-none cursor-pointer focus:border-gold/30"
            >
              <option value="newest">Ngày gia nhập mới nhất</option>
              <option value="totalSpent">Chi tiêu nhiều nhất</option>
              <option value="totalStays">Lượt ở nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-[#111118] rounded-xl border border-gold/10 shadow-2xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gold/10 text-[#9a9080] font-semibold bg-[#07070a]/50">
                <th className="py-3 pl-4">Mã KH</th>
                <th className="py-3">Họ và tên</th>
                <th className="py-3">Số CCCD/Passport</th>
                <th className="py-3">Số điện thoại</th>
                <th className="py-3">Tổng chi tiêu</th>
                <th className="py-3">Lượt ở</th>
                <th className="py-3">Hạng thành viên</th>
                <th className="py-3 pr-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((customer) => (
                  <tr key={customer.id} className="border-b border-gold/5 hover:bg-[#1a1a24]/50 transition-colors text-stone-300 font-medium">
                    <td className="py-3 pl-4 font-mono font-bold text-stone-500">{customer.id}</td>
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#07070a] text-gold font-bold flex items-center justify-center border border-gold/15 text-[11px] uppercase">
                        {customer.fullName.split(' ').pop()?.slice(0,2)}
                      </div>
                      <span className="text-stone-200 font-bold text-xs">{customer.fullName}</span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-stone-400">{customer.cccd}</td>
                    <td className="py-3 font-mono text-[11px] text-stone-400">{customer.phone}</td>
                    <td className="py-3 text-gold font-semibold">{customer.totalSpent.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 text-stone-300">{customer.totalStays} lần</td>
                    <td className="py-3">
                      <StatusBadge status={customer.memberType} />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/admin/customers/${customer.id}/edit`}
                          className="p-1.5 text-gold hover:bg-gold/10 rounded transition-colors"
                          title="Sửa thông tin"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id, customer.fullName)}
                          className="p-1.5 text-red-400 hover:bg-red-950/20 rounded transition-colors"
                          title="Vô hiệu hóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#9a9080]">
                    Không tìm thấy kết quả phù hợp.
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
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} trên tổng số {totalItems} khách hàng
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

      {/* FAB button for quick customer addition */}
      <Link
        href="/admin/customers/new"
        className="fixed z-40 right-24 bottom-20 w-12 h-12 bg-gold hover:bg-gold-light text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-[1.05] transition-all cursor-pointer border border-gold/20"
        title="Thêm khách hàng mới"
      >
        <Plus className="w-6 h-6 text-black" />
      </Link>
    </div>
  );
}
