'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, BedDouble, CalendarCheck, CreditCard, 
  TrendingUp, TrendingDown, ArrowRight, Activity, 
  Clock, ShieldAlert, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { getDB } from '@/lib/db';
import StatusBadge from '@/components/ui/StatusBadge';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminOverview() {
  const db = getDB();
  const [stats, setStats] = useState({
    totalRooms: 120,
    occupiedRooms: 34,
    availableRooms: 42,
    cleaningRooms: 6,
    activeStays: 10,
    totalGuests: 24
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    // Load live statistics from our mock database client
    const overview = db.getOverviewStats();
    setStats(overview);
    setRecentLogs(db.getActivityLogs().slice(0, 5));
  }, [db]);

  // Chart data setup
  const chartData = {
    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'],
    datasets: [
      {
        label: 'Số phòng lưu trú',
        data: [28, 32, stats.occupiedRooms, stats.occupiedRooms + 5, stats.occupiedRooms + 12, 82, 85],
        backgroundColor: '#c9a84c',
        borderRadius: 6,
      },
      {
        label: 'Phòng trống dự kiến',
        data: [92, 88, stats.availableRooms, stats.availableRooms - 5, stats.availableRooms - 12, 38, 35],
        backgroundColor: '#111e42',
        borderColor: '#c9a84c30',
        borderWidth: 1,
        borderRadius: 6,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9a9080',
          font: { size: 10, weight: 'bold' as const }
        }
      },
      title: {
        display: false
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(201, 168, 76, 0.08)' },
        ticks: { color: '#9a9080', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9a9080', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 bg-[#0a0a0f] text-stone-200">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-stone-100 font-cormorant tracking-wide">Property Overview</h1>
          <p className="text-sm text-[#a89d8d] mt-1.5 font-medium">Trực quan hóa trạng thái khách sạn, công suất buồng phòng và doanh thu tổng quan.</p>
        </div>
        <div className="flex items-center gap-2.5 bg-[#111118] px-4 py-2.5 rounded-lg border border-gold/15 shadow-sm text-sm font-semibold text-stone-300">
          <Clock className="w-4.5 h-4.5 text-gold shrink-0" />
          <span>Hệ thống: Live Syncing</span>
        </div>
      </div>

      {/* Stats row: 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Rooms */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex items-center justify-between hover:border-gold/25 transition-all duration-300">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#a89d8d] font-extrabold">Tổng Số Phòng</p>
            <h3 className="text-5xl font-black font-mono text-stone-100 mt-1.5">{stats.totalRooms}</h3>
            <span className="inline-flex items-center gap-1 text-xs text-green-400 font-bold mt-2.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +2% so với tháng trước
            </span>
          </div>
          <div className="p-4 bg-blue-950/40 text-blue-400 rounded-xl border border-blue-500/20">
            <BedDouble className="w-7 h-7" />
          </div>
        </div>

        {/* Occupied */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex items-center justify-between hover:border-gold/25 transition-all duration-300">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#a89d8d] font-extrabold">Phòng Đang Ở</p>
            <h3 className="text-5xl font-black font-mono text-stone-100 mt-1.5">{stats.occupiedRooms}</h3>
            <span className="inline-flex items-center gap-1 text-xs text-orange-400 font-bold mt-2.5">
              Công suất: {Math.round((stats.occupiedRooms / stats.totalRooms) * 100)}%
            </span>
          </div>
          <div className="p-4 bg-orange-950/40 text-orange-400 rounded-xl border border-orange-500/20">
            <CalendarCheck className="w-7 h-7" />
          </div>
        </div>

        {/* Available */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex items-center justify-between hover:border-gold/25 transition-all duration-300">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#a89d8d] font-extrabold">Phòng Còn Trống</p>
            <h3 className="text-5xl font-black font-mono text-emerald-450 mt-1.5">{stats.availableRooms}</h3>
            <span className="inline-flex items-center gap-1 text-xs text-green-400 font-bold mt-2.5">
              Sẵn sàng đón khách
            </span>
          </div>
          <div className="p-4 bg-green-950/40 text-green-400 rounded-xl border border-green-500/20">
            <BedDouble className="w-7 h-7" />
          </div>
        </div>

        {/* Staying guests */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex items-center justify-between hover:border-gold/25 transition-all duration-300">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#a89d8d] font-extrabold">Khách Lưu Trú</p>
            <h3 className="text-5xl font-black font-mono text-stone-100 mt-1.5">{stats.totalGuests}</h3>
            <span className="inline-flex items-center gap-1 text-xs text-purple-400 font-bold mt-2.5">
              {stats.activeStays} lượt check-in đang mở
            </span>
          </div>
          <div className="p-4 bg-purple-950/40 text-purple-400 rounded-xl border border-purple-500/20">
            <Users className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* Main Grid: Chart + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly stays chart (2/3 width) */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-stone-200">Stay Management Status</h3>
              <p className="text-xs text-[#a89d8d] mt-1 font-medium">Biểu đồ công suất buồng phòng 7 ngày tiếp theo.</p>
            </div>
            <Link href="/admin/reports#detail" className="flex items-center gap-1.5 text-sm text-gold font-bold hover:underline cursor-pointer">
              <span>Xem chi tiết báo cáo</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Actions (1/3 width) */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-200 mb-1">Thao Tác Nhanh</h3>
            <p className="text-xs text-[#a89d8d] mb-6 font-medium">Đi tắt nhanh đến các phân hệ quản trị nghiệp vụ.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/customers"
              className="p-4 rounded-xl bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/20 text-center flex flex-col items-center gap-2 transition-all hover:scale-[1.03]"
            >
              <Users className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-bold text-stone-300">Khách Hàng</span>
            </Link>
            
            <Link
              href="/admin/rooms"
              className="p-4 rounded-xl bg-orange-950/20 hover:bg-orange-950/40 border border-orange-500/20 text-center flex flex-col items-center gap-2 transition-all hover:scale-[1.03]"
            >
              <BedDouble className="w-6 h-6 text-orange-400" />
              <span className="text-xs font-bold text-stone-300">Sơ đồ Phòng</span>
            </Link>

            <Link
              href="/admin/bookings/new"
              className="p-4 rounded-xl bg-green-950/20 hover:bg-green-950/40 border border-green-500/20 text-center flex flex-col items-center gap-2 transition-all hover:scale-[1.03]"
            >
              <CalendarCheck className="w-6 h-6 text-green-400" />
              <span className="text-xs font-bold text-stone-300">Đặt phòng mới</span>
            </Link>

            <Link
              href="/admin/payment"
              className="p-4 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 text-center flex flex-col items-center gap-2 transition-all hover:scale-[1.03]"
            >
              <CreditCard className="w-6 h-6 text-purple-400" />
              <span className="text-xs font-bold text-stone-300">Thanh toán</span>
            </Link>
          </div>

          <div className="mt-6 border-t border-gold/10 pt-4 flex gap-2 items-center bg-amber-950/20 p-3 rounded-lg border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
            <span className="text-sm">⚠️</span>
            <span>Có <strong>12 buồng phòng bẩn</strong> cần phân công dọn dẹp vệ sinh.</span>
          </div>
        </div>

      </div>

      {/* Recent activity log table */}
      <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-4.5 h-4.5 text-gold shrink-0" />
          <h3 className="text-base font-bold text-stone-200">Nhật ký hoạt động gần đây (Audit Logs)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gold/15 text-[#a89d8d] font-bold uppercase tracking-wider text-xs bg-[#07070a]/50">
                <th className="py-3.5 pl-3">Hoạt động</th>
                <th className="py-3.5">Phân hệ</th>
                <th className="py-3.5">Nội dung</th>
                <th className="py-3.5">IP Address</th>
                <th className="py-3.5 pr-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-gold/5 hover:bg-[#1a1a24]/30 transition-colors text-stone-300 font-medium">
                  <td className="py-4 pl-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.action === 'LOGIN' ? 'bg-blue-950/50 text-blue-300 border border-blue-500/20' :
                      log.action === 'CHECK_IN' ? 'bg-purple-950/50 text-purple-300 border border-purple-500/20' :
                      log.action === 'CREATE' ? 'bg-green-950/50 text-green-300 border border-green-500/20' :
                      'bg-stone-900 text-stone-300 border border-stone-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4">{log.entityType}</td>
                  <td className="py-4 text-stone-200">{log.description}</td>
                  <td className="py-4 font-mono text-xs text-stone-400">{log.ipAddress}</td>
                  <td className="py-4 pr-3 text-right text-stone-300">{new Date(log.createdAt).toLocaleTimeString('vi-VN')} {new Date(log.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
