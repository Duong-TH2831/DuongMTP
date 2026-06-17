import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  let bgClass = 'bg-gray-100 text-gray-800';
  let label = status;

  switch (status.toUpperCase()) {
    // Room Status
    case 'AVAILABLE':
      bgClass = 'bg-green-100 text-green-700 border border-green-200';
      label = 'Sẵn sàng';
      break;
    case 'BOOKED':
      bgClass = 'bg-orange-100 text-orange-700 border border-orange-200';
      label = 'Đã đặt';
      break;
    case 'OCCUPIED':
      bgClass = 'bg-blue-100 text-blue-700 border border-blue-200';
      label = 'Đang sử dụng';
      break;
    case 'MAINTENANCE':
      bgClass = 'bg-red-100 text-red-700 border border-red-200';
      label = 'Bảo trì';
      break;
    case 'CLEANING':
      bgClass = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      label = 'Cần dọn dẹp';
      break;

    // Booking Status
    case 'PENDING':
      bgClass = 'bg-amber-100 text-amber-700 border border-amber-200';
      label = 'Chờ xác nhận';
      break;
    case 'CONFIRMED':
      bgClass = 'bg-green-100 text-green-700 border border-green-200';
      label = 'Đã xác nhận';
      break;
    case 'CHECKED_IN':
      bgClass = 'bg-blue-100 text-blue-700 border border-blue-200';
      label = 'Đã nhận phòng';
      break;
    case 'CHECKED_OUT':
      bgClass = 'bg-gray-100 text-gray-700 border border-gray-200';
      label = 'Đã trả phòng';
      break;
    case 'CANCELLED':
      bgClass = 'bg-rose-100 text-rose-700 border border-rose-200';
      label = 'Đã hủy';
      break;

    // Customer tiers
    case 'VIP':
      bgClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold';
      label = 'VIP Member';
      break;
    case 'FREQUENT':
      bgClass = 'bg-blue-50 text-blue-600 border border-blue-100';
      label = 'Thân thiết';
      break;
    case 'REGULAR':
      bgClass = 'bg-gray-100 text-gray-600 border border-gray-200';
      label = 'Thành viên';
      break;

    // Payment Status
    case 'UNPAID':
      bgClass = 'bg-red-100 text-red-700 border border-red-200';
      label = 'Chưa thanh toán';
      break;
    case 'PARTIAL':
      bgClass = 'bg-orange-100 text-orange-700 border border-orange-200';
      label = 'Thanh toán một phần';
      break;
    case 'PAID':
      bgClass = 'bg-green-100 text-green-700 border border-green-200';
      label = 'Đã thanh toán';
      break;

    // Stay Status
    case 'STAYING':
      bgClass = 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      label = 'Đang lưu trú';
      break;
    case 'EARLY_CHECKOUT':
      bgClass = 'bg-slate-100 text-slate-700 border border-slate-200';
      label = 'Trả phòng sớm';
      break;

    // General Active/Inactive
    case 'ACTIVE':
    case 'TRUE':
      bgClass = 'bg-green-100 text-green-700 border border-green-200';
      label = 'Hoạt động';
      break;
    case 'INACTIVE':
    case 'FALSE':
      bgClass = 'bg-red-100 text-red-700 border border-red-200';
      label = 'Khóa';
      break;
    
    // Blog states
    case 'PUBLISHED':
      bgClass = 'bg-green-100 text-green-700 border border-green-200';
      label = 'Đã đăng';
      break;
    case 'DRAFT':
      bgClass = 'bg-gray-100 text-gray-700 border border-gray-200';
      label = 'Bản nháp';
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center justify-center ${bgClass} ${className}`}>
      {label}
    </span>
  );
}
