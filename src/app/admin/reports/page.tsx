'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  BedDouble, Users, CalendarCheck, Download,
  FileSpreadsheet, Printer, ArrowUpRight, ArrowDownRight,
  Filter, ChevronDown, Sparkles, PieChart, Activity,
  Search, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getDB } from '@/lib/db';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeRange = '7days' | '30days' | '90days' | 'year';

function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return amount.toLocaleString('vi-VN');
}

export default function ReportsPage() {
  const db = getDB();
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [mounted, setMounted] = useState(false);

  // States for detailed reporting section
  const [activeDetailTab, setActiveDetailTab] = useState<'invoices' | 'bookings' | 'customers'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset filter and search on tab change
  useEffect(() => {
    setSearchQuery('');
    setFilterValue('all');
    setCurrentPage(1);
  }, [activeDetailTab]);

  // Reset page when search, filter, or time range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterValue, timeRange]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to check if a date string falls within the selected time range
  const isWithinTimeRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    // For 7 days, 30 days, 90 days, we compare differences in days
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (timeRange === '7days') return diffDays <= 7;
    if (timeRange === '30days') return diffDays <= 30;
    if (timeRange === '90days') return diffDays <= 90;
    if (timeRange === 'year') return date.getFullYear() === now.getFullYear();
    return true;
  };

  // Detailed data source mappings
  const invoiceDetails = useMemo(() => {
    if (!mounted) return [];
    const rawInvoices = db.getInvoices();
    const rawCustomers = db.getCustomers();
    
    return rawInvoices.map(inv => {
      const customer = rawCustomers.find(c => c.id === inv.customerId);
      return {
        ...inv,
        customerName: customer ? customer.fullName : 'Chưa rõ',
        customerPhone: customer ? customer.phone : '',
      };
    });
  }, [mounted, db]);

  const bookingDetails = useMemo(() => {
    if (!mounted) return [];
    const rawBookings = db.getBookings();
    const rawCustomers = db.getCustomers();
    const rawRooms = db.getRooms();
    
    return rawBookings.map(bk => {
      const customer = rawCustomers.find(c => c.id === bk.customerId);
      const room = rawRooms.find(r => r.id === bk.roomId);
      return {
        ...bk,
        customerName: customer ? customer.fullName : 'Chưa rõ',
        customerPhone: customer ? customer.phone : '',
        roomNumber: room ? room.roomNumber : 'Chưa rõ',
      };
    });
  }, [mounted, db]);

  const customerDetails = useMemo(() => {
    if (!mounted) return [];
    return db.getCustomers();
  }, [mounted, db]);

  // Filtered detailed lists
  const filteredInvoices = useMemo(() => {
    return invoiceDetails.filter(inv => {
      if (!isWithinTimeRange(inv.issueDate)) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const codeMatch = inv.invoiceCode.toLowerCase().includes(query);
        const nameMatch = inv.customerName.toLowerCase().includes(query);
        const phoneMatch = inv.customerPhone.includes(query);
        if (!codeMatch && !nameMatch && !phoneMatch) return false;
      }
      
      if (filterValue !== 'all') {
        if (inv.paymentMethod !== filterValue) return false;
      }
      
      return true;
    });
  }, [invoiceDetails, searchQuery, filterValue, timeRange]);

  const filteredBookings = useMemo(() => {
    return bookingDetails.filter(bk => {
      if (!isWithinTimeRange(bk.checkInDate)) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const codeMatch = bk.bookingCode.toLowerCase().includes(query);
        const nameMatch = bk.customerName.toLowerCase().includes(query);
        const phoneMatch = bk.customerPhone.includes(query);
        const roomMatch = bk.roomNumber.toLowerCase().includes(query);
        if (!codeMatch && !nameMatch && !phoneMatch && !roomMatch) return false;
      }
      
      if (filterValue !== 'all') {
        if (bk.status !== filterValue) return false;
      }
      
      return true;
    });
  }, [bookingDetails, searchQuery, filterValue, timeRange]);

  const filteredCustomers = useMemo(() => {
    return customerDetails.filter(cus => {
      if (!isWithinTimeRange(cus.joinDate)) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = cus.fullName.toLowerCase().includes(query);
        const phoneMatch = cus.phone.includes(query);
        const cccdMatch = cus.cccd.includes(query);
        if (!nameMatch && !phoneMatch && !cccdMatch) return false;
      }
      
      if (filterValue !== 'all') {
        if (cus.memberType !== filterValue) return false;
      }
      
      return true;
    });
  }, [customerDetails, searchQuery, filterValue, timeRange]);

  const itemsPerPage = 5;

  const currentFilteredData = useMemo(() => {
    if (activeDetailTab === 'invoices') return filteredInvoices;
    if (activeDetailTab === 'bookings') return filteredBookings;
    return filteredCustomers;
  }, [activeDetailTab, filteredInvoices, filteredBookings, filteredCustomers]);

  const totalItems = currentFilteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  
  const paginatedData = useMemo(() => {
    return currentFilteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentFilteredData, startIndex]);

  const handleExportCSV = () => {
    let csvRows: string[] = [];
    let filename = "";
    
    if (activeDetailTab === 'invoices') {
      filename = `bao_cao_hoa_don_${timeRange}.csv`;
      csvRows.push(["Mã Hóa Đơn", "Khách Hàng", "Ngày Phát Hành", "Giá Trị Gốc (VND)", "VAT (%)", "Giảm Giá (VND)", "Tổng Cộng (VND)", "Phương Thức"].join(","));
      
      filteredInvoices.forEach(inv => {
        csvRows.push([
          inv.invoiceCode,
          `"${inv.customerName}"`,
          new Date(inv.issueDate).toLocaleDateString('vi-VN'),
          inv.subTotal,
          inv.vat,
          inv.discount,
          inv.totalAmount,
          inv.paymentMethod
        ].join(","));
      });
    } else if (activeDetailTab === 'bookings') {
      filename = `bao_cao_dat_phong_${timeRange}.csv`;
      csvRows.push(["Mã Booking", "Khách Hàng", "Phòng", "Check-in", "Check-out", "Số Đêm", "Trạng Thái", "Tổng Tiền (VND)", "Đặt Cọc (VND)"].join(","));
      
      filteredBookings.forEach(bk => {
        csvRows.push([
          bk.bookingCode,
          `"${bk.customerName}"`,
          bk.roomNumber,
          new Date(bk.checkInDate).toLocaleDateString('vi-VN'),
          new Date(bk.checkOutDate).toLocaleDateString('vi-VN'),
          bk.numberOfNights,
          bk.status,
          bk.totalPrice,
          bk.depositAmount
        ].join(","));
      });
    } else {
      filename = `bao_cao_khach_hang_${timeRange}.csv`;
      csvRows.push(["Mã KH", "Khách Hàng", "Số Điện Thoại", "CCCD", "Hạng Thành Viên", "Tổng Chi Tiêu (VND)", "Lượt Ở", "Ngày Tham Gia"].join(","));
      
      filteredCustomers.forEach(cus => {
        csvRows.push([
          cus.id,
          `"${cus.fullName}"`,
          `'${cus.phone}`,
          `'${cus.cccd}`,
          cus.memberType,
          cus.totalSpent,
          cus.totalStays,
          new Date(cus.joinDate).toLocaleDateString('vi-VN')
        ].join(","));
      });
    }
    
    // Add UTF-8 BOM for Excel Vietnamese characters compatibility
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Computed data from mock DB ───────────────────────────────
  const computedData = useMemo(() => {
    if (!mounted) return null;

    const bookings = db.getBookings();
    const rooms = db.getRooms();
    const roomTypes = db.getRoomTypes();
    const invoices = db.getInvoices();
    const customers = db.getCustomers();
    const stays = db.getStays();

    // Total revenue
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Active bookings revenue
    const activeBookingsRevenue = bookings
      .filter(b => b.status === 'CHECKED_IN' || b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    // Occupancy rate
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    // ADR (Average Daily Rate) 
    const checkedOutBookings = bookings.filter(b => b.status === 'CHECKED_OUT');
    const totalNights = checkedOutBookings.reduce((sum, b) => sum + b.numberOfNights, 0);
    const adr = totalNights > 0 ? checkedOutBookings.reduce((sum, b) => sum + b.totalPrice, 0) / totalNights : 0;

    // RevPAR
    const revpar = adr * (occupancyRate / 100);

    // Room type breakdown
    const roomTypeRevenue: Record<string, number> = {};
    const roomTypeBookingCount: Record<string, number> = {};
    bookings.forEach(b => {
      const room = rooms.find(r => r.id === b.roomId);
      if (room) {
        const rt = roomTypes.find(t => t.id === room.roomTypeId);
        if (rt) {
          roomTypeRevenue[rt.name] = (roomTypeRevenue[rt.name] || 0) + b.totalPrice;
          roomTypeBookingCount[rt.name] = (roomTypeBookingCount[rt.name] || 0) + 1;
        }
      }
    });

    // Top room types sorted by revenue
    const topRoomTypes = Object.entries(roomTypeRevenue)
      .map(([name, revenue]) => ({
        name,
        revenue,
        bookings: roomTypeBookingCount[name] || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Monthly Revenue (last 12 months synthetic data)
    const monthLabels: string[] = [];
    const monthRevenues: number[] = [];
    const monthOccupancy: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthLabels.push(d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }));
      // Generate realistic synthetic monthly data
      const baseRevenue = totalRevenue > 0 ? totalRevenue * (0.7 + Math.sin(i * 0.5) * 0.3) : (800 + Math.random() * 400) * 1_000_000;
      monthRevenues.push(Math.round(baseRevenue));
      monthOccupancy.push(Math.round(55 + Math.sin(i * 0.4) * 25 + Math.random() * 10));
    }

    // Weekly Revenue (daily for last 7 days)
    const weekLabels: string[] = [];
    const weekRevenues: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      weekLabels.push(d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }));
      const dayRevenue = invoices
        .filter(inv => inv.issueDate.startsWith(d.toISOString().split('T')[0]))
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      weekRevenues.push(dayRevenue || Math.round((50 + Math.random() * 150) * 1_000_000));
    }

    // Room status distribution
    const statusCounts = {
      available: rooms.filter(r => r.status === 'AVAILABLE').length,
      occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
      booked: rooms.filter(r => r.status === 'BOOKED').length,
      maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
      cleaning: rooms.filter(r => r.status === 'CLEANING').length,
    };

    // Occupancy by floor
    const floors = [1, 2, 3, 4, 5];
    const floorOccupancy = floors.map(floor => {
      const floorRooms = rooms.filter(r => r.floor === floor);
      const floorOccupied = floorRooms.filter(r => r.status === 'OCCUPIED').length;
      return { floor, total: floorRooms.length, occupied: floorOccupied, rate: Math.round((floorOccupied / floorRooms.length) * 100) };
    });

    // Customer stats
    const vipCustomers = customers.filter(c => c.memberType === 'VIP').length;
    const frequentCustomers = customers.filter(c => c.memberType === 'FREQUENT').length;
    const totalCustomers = customers.length;
    const avgSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers;

    // Booking status breakdown
    const bookingStatusCounts = {
      checkedIn: bookings.filter(b => b.status === 'CHECKED_IN').length,
      confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
      checkedOut: bookings.filter(b => b.status === 'CHECKED_OUT').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
    };

    // Payment method breakdown
    const paymentMethods = {
      card: bookings.filter(b => b.paymentMethod === 'CARD').length,
      transfer: bookings.filter(b => b.paymentMethod === 'TRANSFER').length,
      cash: bookings.filter(b => b.paymentMethod === 'CASH').length,
    };

    return {
      totalRevenue,
      activeBookingsRevenue,
      occupancyRate,
      adr,
      revpar,
      topRoomTypes,
      monthLabels,
      monthRevenues,
      monthOccupancy,
      weekLabels,
      weekRevenues,
      statusCounts,
      floorOccupancy,
      vipCustomers,
      frequentCustomers,
      totalCustomers,
      avgSpend,
      bookingStatusCounts,
      paymentMethods,
      totalBookings: bookings.length,
      totalStays: stays.length,
    };
  }, [mounted, db]);

  if (!mounted || !computedData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0a0a0f]">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  // ─── Chart Configurations ─────────────────────────────────────

  // Revenue Line Chart
  const revenueLineData = {
    labels: timeRange === '7days' ? computedData.weekLabels : computedData.monthLabels,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: timeRange === '7days' ? computedData.weekRevenues : computedData.monthRevenues,
        borderColor: '#c9a84c',
        backgroundColor: 'rgba(201, 168, 76, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#c9a84c',
        pointBorderColor: '#0a0a0f',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const revenueLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111118',
        titleFont: { size: 11, weight: 'bold' as const },
        titleColor: '#fff',
        bodyFont: { size: 11 },
        bodyColor: '#c9a84c',
        padding: 10,
        cornerRadius: 8,
        borderColor: 'rgba(201, 168, 76, 0.15)',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => `${(ctx.raw / 1_000_000).toFixed(1)} triệu VNĐ`,
        },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(201, 168, 76, 0.08)' },
        ticks: {
          color: '#9a9080',
          font: { size: 10 },
          callback: (value: any) => `${(value / 1_000_000).toFixed(0)}tr`,
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9a9080', font: { size: 10 } },
      },
    },
  };

  // Occupancy Bar Chart
  const occupancyBarData = {
    labels: computedData.monthLabels.slice(-6),
    datasets: [
      {
        label: 'Tỷ lệ lấp đầy (%)',
        data: computedData.monthOccupancy.slice(-6),
        backgroundColor: computedData.monthOccupancy.slice(-6).map(v =>
          v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444'
        ),
        borderRadius: 8,
        maxBarThickness: 40,
      },
    ],
  };

  const occupancyBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111118',
        titleColor: '#fff',
        bodyColor: '#c9a84c',
        borderColor: 'rgba(201, 168, 76, 0.15)',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => `${ctx.raw}% công suất`,
        },
      },
    },
    scales: {
      y: {
        max: 100,
        grid: { color: 'rgba(201, 168, 76, 0.08)' },
        ticks: {
          color: '#9a9080',
          font: { size: 10 },
          callback: (value: any) => `${value}%`,
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9a9080', font: { size: 10 } },
      },
    },
  };

  // Room Status Doughnut
  const roomStatusDoughnutData = {
    labels: ['Trống', 'Đang ở', 'Đã đặt', 'Bảo trì', 'Dọn dẹp'],
    datasets: [
      {
        data: [
          computedData.statusCounts.available,
          computedData.statusCounts.occupied,
          computedData.statusCounts.booked,
          computedData.statusCounts.maintenance,
          computedData.statusCounts.cleaning,
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
        cutout: '72%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9a9080',
          font: { size: 10, weight: 'bold' as const },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
    },
  };

  // Payment method Doughnut
  const paymentDoughnutData = {
    labels: ['Thẻ tín dụng', 'Chuyển khoản', 'Tiền mặt'],
    datasets: [
      {
        data: [
          computedData.paymentMethods.card,
          computedData.paymentMethods.transfer,
          computedData.paymentMethods.cash,
        ],
        backgroundColor: ['#6366f1', '#06b6d4', '#f97316'],
        borderWidth: 0,
        cutout: '68%',
      },
    ],
  };

  const totalPayments = computedData.paymentMethods.card + computedData.paymentMethods.transfer + computedData.paymentMethods.cash;

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-gold" />
            Báo cáo & Thống kê
          </h1>
          <p className="text-xs text-[#9a9080] mt-1">
            Tổng hợp doanh thu, công suất buồng phòng và các chỉ số kinh doanh trọng yếu của Horizon Grand Resort.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="appearance-none bg-[#111118] border border-gold/15 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 cursor-pointer"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9a9080] pointer-events-none" />
          </div>
          
          {/* Export Buttons */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#111118] border border-gold/15 rounded-lg text-xs font-semibold text-stone-300 hover:bg-[#1a1a24] hover:text-gold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-gold hover:bg-gold-light text-black rounded-lg text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            In báo cáo
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-amber-950/40 to-amber-900/10 text-white p-5 rounded-2xl border border-gold/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gold/5 rounded-full -translate-y-6 translate-x-6" />
          <p className="text-[10px] uppercase tracking-wider text-gold font-bold">Tổng doanh thu</p>
          <h3 className="text-3xl font-black font-mono mt-2.5 text-stone-100">{formatVND(computedData.totalRevenue)}</h3>
          <span className="inline-flex items-center gap-1 text-[10px] text-gold font-bold mt-2">
            <ArrowUpRight className="w-3 h-3" />
            +12.4% so với kỳ trước
          </span>
        </div>

        {/* Active Bookings Revenue */}
        <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">DT đặt phòng active</p>
          <h3 className="text-3xl font-black font-mono text-stone-100 mt-2.5">{formatVND(computedData.activeBookingsRevenue)}</h3>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-450" />
            {computedData.totalBookings} đặt phòng
          </span>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Công suất phòng</p>
          <h3 className="text-3xl font-black font-mono text-stone-100 mt-2.5">{computedData.occupancyRate}%</h3>
          <div className="w-full bg-[#07070a] rounded-full h-1.5 mt-3">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${computedData.occupancyRate}%`,
                backgroundColor: computedData.occupancyRate >= 80 ? '#10b981' : computedData.occupancyRate >= 60 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* ADR */}
        <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">ADR (Giá TB/đêm)</p>
          <h3 className="text-3xl font-black font-mono text-stone-100 mt-2.5">{formatVND(computedData.adr)}</h3>
          <span className="inline-flex items-center gap-1 text-[10px] text-gold font-bold mt-2">
            <Activity className="w-3 h-3" />
            Average Daily Rate
          </span>
        </div>

        {/* RevPAR */}
        <div className="bg-[#111118] p-5 rounded-2xl border border-gold/10 shadow-2xl">
          <p className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">RevPAR</p>
          <h3 className="text-3xl font-black font-mono text-stone-100 mt-2.5">{formatVND(computedData.revpar)}</h3>
          <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 font-bold mt-2">
            <Sparkles className="w-3 h-3 text-gold" />
            Rev per Available Room
          </span>
        </div>
      </div>

      {/* ─── Revenue & Occupancy Charts ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Line (2/3) */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-200">Biểu đồ doanh thu</h3>
              <p className="text-[11px] text-[#9a9080] mt-0.5">
                {timeRange === '7days' ? 'Doanh thu 7 ngày gần nhất' : 'Xu hướng doanh thu 12 tháng qua'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gold inline-block" />
              <span className="text-[10px] font-bold text-stone-400">Doanh thu</span>
            </div>
          </div>
          <div className="h-72">
            <Line data={revenueLineData} options={revenueLineOptions} />
          </div>
        </div>

        {/* Room Status Doughnut (1/3) */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
          <h3 className="text-sm font-bold text-stone-200 mb-1">Phân bố trạng thái phòng</h3>
          <p className="text-[11px] text-[#9a9080] mb-4">Tổng quan 120 phòng khách sạn</p>
          <div className="h-56 flex items-center justify-center">
            <Doughnut data={roomStatusDoughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* ─── Occupancy Bar + Top Room Types ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Occupancy Bar Chart */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-200">Tỷ lệ lấp đầy theo tháng</h3>
              <p className="text-[11px] text-[#9a9080] mt-0.5">Occupancy rate 6 tháng gần nhất</p>
            </div>
            <div className="px-2 py-1 bg-emerald-950/40 text-emerald-450 rounded-lg text-[10px] font-bold border border-emerald-500/20">
              TB: {Math.round(computedData.monthOccupancy.reduce((a, b) => a + b, 0) / computedData.monthOccupancy.length)}%
            </div>
          </div>
          <div className="h-60">
            <Bar data={occupancyBarData} options={occupancyBarOptions} />
          </div>
        </div>

        {/* Top Room Types by Revenue */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
          <h3 className="text-sm font-bold text-stone-200 mb-1">Doanh thu theo hạng phòng</h3>
          <p className="text-[11px] text-[#9a9080] mb-4">Xếp hạng hạng phòng theo tổng doanh thu booking</p>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {computedData.topRoomTypes.map((rt, idx) => {
              const maxRevenue = computedData.topRoomTypes[0]?.revenue || 1;
              const pct = Math.round((rt.revenue / maxRevenue) * 100);
              const colors = [
                'bg-gold', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
                'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
                'bg-orange-500', 'bg-pink-500'
              ];

              return (
                <div key={rt.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold text-gold/40 w-5 text-right">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-200 truncate">{rt.name}</span>
                      <span className="text-[10px] font-bold text-[#9a9080] ml-2 shrink-0">
                        {formatVND(rt.revenue)} · {rt.bookings} booking
                      </span>
                    </div>
                    <div className="w-full bg-[#07070a] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[idx % colors.length]} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Floor Heatmap + Payment + Customer ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Floor Occupancy Heatmap */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
          <h3 className="text-sm font-bold text-stone-200 mb-1">Công suất theo tầng</h3>
          <p className="text-[11px] text-[#9a9080] mb-4">Occupancy heatmap theo tầng lầu</p>
          
          <div className="space-y-3">
            {computedData.floorOccupancy.map(fl => (
              <div key={fl.floor} className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-400 w-14 shrink-0">Tầng {fl.floor}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-stone-500">
                      {fl.occupied}/{fl.total} phòng
                    </span>
                    <span className={`text-[10px] font-extrabold ${
                      fl.rate >= 80 ? 'text-red-400' : fl.rate >= 50 ? 'text-amber-400' : 'text-emerald-450'
                    }`}>
                      {fl.rate}%
                    </span>
                  </div>
                  <div className="w-full bg-[#07070a] rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${fl.rate}%`,
                        background: fl.rate >= 80
                          ? 'linear-gradient(90deg, #ef4444, #f87171)'
                          : fl.rate >= 50
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #10b981, #34d399)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-[#07070a] rounded-lg border border-gold/5">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#9a9080]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> {'<'}50% Thấp
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 50-80% TB
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> {'>'}80% Cao
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
          <h3 className="text-sm font-bold text-stone-200 mb-1">Phương thức thanh toán</h3>
          <p className="text-[11px] text-[#9a9080] mb-4">Tỷ lệ hình thức thanh toán ({totalPayments} giao dịch)</p>
          <div className="h-44 flex items-center justify-center">
            <Doughnut data={paymentDoughnutData} options={doughnutOptions} />
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Thẻ tín dụng', count: computedData.paymentMethods.card, color: 'bg-indigo-500' },
              { label: 'Chuyển khoản', count: computedData.paymentMethods.transfer, color: 'bg-cyan-500' },
              { label: 'Tiền mặt', count: computedData.paymentMethods.cash, color: 'bg-orange-500' },
            ].map(pm => (
              <div key={pm.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${pm.color}`} />
                  <span className="text-stone-300 font-medium">{pm.label}</span>
                </span>
                <span className="font-bold text-stone-200">
                  {pm.count} ({totalPayments > 0 ? Math.round((pm.count / totalPayments) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
          <h3 className="text-sm font-bold text-stone-200 mb-1">Phân tích khách hàng</h3>
          <p className="text-[11px] text-[#9a9080] mb-4">Hồ sơ khách hàng và hành vi tiêu dùng</p>

          <div className="space-y-4">
            {/* Customer totals */}
            <div className="p-4 bg-[#07070a] rounded-xl border border-gold/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#9a9080] font-bold uppercase">Tổng khách hàng</p>
                  <h4 className="text-xl font-extrabold text-stone-100">{computedData.totalCustomers}</h4>
                </div>
                <Users className="w-8 h-8 text-gold/40" />
              </div>
            </div>

            {/* VIP */}
            <div className="flex items-center justify-between p-3 bg-amber-950/20 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-gold text-[9px] font-extrabold rounded uppercase border border-gold/30">VIP</span>
                <span className="text-xs font-bold text-stone-300">Khách VIP</span>
              </div>
              <span className="text-sm font-extrabold text-gold">{computedData.vipCustomers}</span>
            </div>

            {/* Frequent */}
            <div className="flex items-center justify-between p-3 bg-purple-950/20 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-extrabold rounded uppercase border border-purple-500/30">Frequent</span>
                <span className="text-xs font-bold text-stone-300">Khách thường xuyên</span>
              </div>
              <span className="text-sm font-extrabold text-purple-400">{computedData.frequentCustomers}</span>
            </div>

            {/* Average spend */}
            <div className="flex items-center justify-between p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-450" />
                <span className="text-xs font-bold text-stone-300">Chi tiêu TB/khách</span>
              </div>
              <span className="text-sm font-extrabold text-emerald-450">{formatVND(computedData.avgSpend)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Booking Summary ──────────────────────────────────────── */}
      <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
        <h3 className="text-sm font-bold text-stone-200 mb-4">Tổng hợp trạng thái Booking</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Đang lưu trú', value: computedData.bookingStatusCounts.checkedIn, color: 'bg-blue-950/30 text-blue-400 border-blue-500/20', icon: <BedDouble className="w-4 h-4" /> },
            { label: 'Đã xác nhận', value: computedData.bookingStatusCounts.confirmed, color: 'bg-emerald-950/30 text-emerald-450 border-emerald-500/20', icon: <CalendarCheck className="w-4 h-4" /> },
            { label: 'Đã trả phòng', value: computedData.bookingStatusCounts.checkedOut, color: 'bg-stone-900/30 text-stone-400 border-stone-700/20', icon: <ArrowUpRight className="w-4 h-4" /> },
            { label: 'Đã hủy', value: computedData.bookingStatusCounts.cancelled, color: 'bg-red-950/30 text-red-400 border-red-500/20', icon: <ArrowDownRight className="w-4 h-4" /> },
            { label: 'Chờ duyệt', value: computedData.bookingStatusCounts.pending, color: 'bg-amber-950/30 text-gold border-gold/20', icon: <Activity className="w-4 h-4" /> },
          ].map(item => (
            <div key={item.label} className={`p-4 rounded-xl border ${item.color} flex items-center gap-3`}>
              <div className="p-2 rounded-lg bg-[#07070a]/60">{item.icon}</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{item.label}</p>
                <h4 className="text-lg font-extrabold">{item.value}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Detailed Report Section ──────────────────────────────── */}
      <div id="detail" className="scroll-mt-6 bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gold/10 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-gold" />
              Báo cáo chi tiết
            </h3>
            <p className="text-[11px] text-[#9a9080] mt-0.5">
              Danh sách dữ liệu chi tiết tương ứng với khoảng thời gian đã chọn.
            </p>
          </div>
          
          {/* Tab Buttons */}
          <div className="flex bg-[#07070a] p-1 rounded-lg border border-gold/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveDetailTab('invoices')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeDetailTab === 'invoices'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Hóa đơn & Doanh thu
            </button>
            <button
              onClick={() => setActiveDetailTab('bookings')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeDetailTab === 'bookings'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Phiếu đặt phòng
            </button>
            <button
              onClick={() => setActiveDetailTab('customers')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeDetailTab === 'customers'
                  ? 'bg-gold text-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Khách hàng
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder={
                activeDetailTab === 'invoices' ? "Tìm theo mã hóa đơn, tên khách hàng..." :
                activeDetailTab === 'bookings' ? "Tìm theo mã đặt phòng, tên, số phòng..." :
                "Tìm theo tên khách hàng, số điện thoại, CCCD..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07070a] border border-gold/15 rounded-lg pl-9 pr-8 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-gold/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-500 hover:text-stone-300 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#9a9080]" />
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="bg-[#07070a] border border-gold/15 py-1.5 px-3 rounded-lg text-xs font-semibold text-stone-300 outline-none cursor-pointer focus:border-gold/30"
            >
              {activeDetailTab === 'invoices' ? (
                <>
                  <option value="all">Tất cả thanh toán</option>
                  <option value="CARD">Thẻ tín dụng (CARD)</option>
                  <option value="TRANSFER">Chuyển khoản (TRANSFER)</option>
                  <option value="CASH">Tiền mặt (CASH)</option>
                </>
              ) : activeDetailTab === 'bookings' ? (
                <>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="CHECKED_IN">Đã nhận phòng</option>
                  <option value="CHECKED_OUT">Đã trả phòng</option>
                  <option value="CANCELLED">Đã hủy</option>
                </>
              ) : (
                <>
                  <option value="all">Tất cả hạng thành viên</option>
                  <option value="VIP">VIP Member</option>
                  <option value="FREQUENT">Thân thiết</option>
                  <option value="REGULAR">Thành viên</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Tab Content Tables */}
        {activeDetailTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gold/10 text-[#9a9080] font-semibold bg-[#07070a]/50">
                  <th className="py-3 pl-4">Mã Hóa Đơn</th>
                  <th className="py-3">Khách hàng</th>
                  <th className="py-3">Ngày thanh toán</th>
                  <th className="py-3">Giá trị gốc</th>
                  <th className="py-3">VAT</th>
                  <th className="py-3">Giảm giá</th>
                  <th className="py-3 font-bold text-gold">Tổng cộng</th>
                  <th className="py-3 pr-4">Phương thức</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((inv: any) => (
                    <tr key={inv.id} className="border-b border-gold/5 hover:bg-[#1a1a24]/30 transition-colors text-stone-300 font-medium">
                      <td className="py-3.5 pl-4 font-mono font-bold text-stone-500">{inv.invoiceCode}</td>
                      <td className="py-3.5 font-bold text-stone-200">{inv.customerName}</td>
                      <td className="py-3.5 text-stone-400">
                        {new Date(inv.issueDate).toLocaleDateString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="py-3.5 text-stone-400">{inv.subTotal.toLocaleString('vi-VN')}đ</td>
                      <td className="py-3.5 text-stone-500">{inv.vat}%</td>
                      <td className="py-3.5 text-red-400">-{inv.discount.toLocaleString('vi-VN')}đ</td>
                      <td className="py-3.5 text-gold font-extrabold text-xs">{inv.totalAmount.toLocaleString('vi-VN')}đ</td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.paymentMethod === 'CARD' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/20' :
                          inv.paymentMethod === 'TRANSFER' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' :
                          'bg-orange-950/40 text-orange-400 border border-orange-500/20'
                        }`}>
                          {inv.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#9a9080] font-semibold">
                      Không tìm thấy hóa đơn nào trong khoảng thời gian này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeDetailTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gold/10 text-[#9a9080] font-semibold bg-[#07070a]/50">
                  <th className="py-3 pl-4">Mã Booking</th>
                  <th className="py-3">Khách hàng</th>
                  <th className="py-3">Số phòng</th>
                  <th className="py-3">Thời gian</th>
                  <th className="py-3">Số đêm</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="py-3 font-bold text-gold">Tổng tiền</th>
                  <th className="py-3 pr-4">Đặt cọc</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((bk: any) => (
                    <tr key={bk.id} className="border-b border-gold/5 hover:bg-[#1a1a24]/30 transition-colors text-stone-300 font-medium">
                      <td className="py-3.5 pl-4 font-mono font-bold text-stone-500">{bk.bookingCode}</td>
                      <td className="py-3.5 font-bold text-stone-200">{bk.customerName}</td>
                      <td className="py-3.5 font-mono font-bold text-blue-400">Phòng {bk.roomNumber}</td>
                      <td className="py-3.5 text-stone-400">
                        {new Date(bk.checkInDate).toLocaleDateString('vi-VN')} - {new Date(bk.checkOutDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 text-stone-350">{bk.numberOfNights} đêm</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          bk.status === 'CONFIRMED' ? 'bg-green-950/40 text-emerald-450 border border-green-500/20' :
                          bk.status === 'CHECKED_IN' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/20' :
                          bk.status === 'CHECKED_OUT' ? 'bg-stone-900/40 text-stone-400 border border-stone-700/20' :
                          bk.status === 'CANCELLED' ? 'bg-red-950/40 text-red-400 border border-red-500/20' :
                          'bg-amber-950/40 text-gold border border-gold/20'
                        }`}>
                          {bk.status === 'CONFIRMED' ? 'Đã xác nhận' :
                           bk.status === 'CHECKED_IN' ? 'Đã check-in' :
                           bk.status === 'CHECKED_OUT' ? 'Đã check-out' :
                           bk.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ duyệt'}
                        </span>
                      </td>
                      <td className="py-3.5 text-gold font-extrabold text-xs">{bk.totalPrice.toLocaleString('vi-VN')}đ</td>
                      <td className="py-3.5 pr-4 text-emerald-455 font-semibold">{bk.depositAmount.toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#9a9080] font-semibold">
                      Không tìm thấy đặt phòng nào trong khoảng thời gian này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeDetailTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gold/10 text-[#9a9080] font-semibold bg-[#07070a]/50">
                  <th className="py-3 pl-4">Mã KH</th>
                  <th className="py-3">Họ và tên</th>
                  <th className="py-3">Số điện thoại</th>
                  <th className="py-3">Số CCCD</th>
                  <th className="py-3">Hạng thành viên</th>
                  <th className="py-3 font-bold text-gold">Đã chi tiêu</th>
                  <th className="py-3">Lượt lưu trú</th>
                  <th className="py-3 pr-4">Ngày gia nhập</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((cus: any) => (
                    <tr key={cus.id} className="border-b border-gold/5 hover:bg-[#1a1a24]/30 transition-colors text-stone-300 font-medium">
                      <td className="py-3.5 pl-4 font-mono font-bold text-stone-500">{cus.id}</td>
                      <td className="py-3.5 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#07070a] text-gold font-bold flex items-center justify-center border border-gold/15 text-[10px] uppercase">
                          {cus.fullName.split(' ').pop()?.slice(0, 2)}
                        </div>
                        <span className="text-stone-200 font-bold">{cus.fullName}</span>
                      </td>
                      <td className="py-3.5 font-mono text-stone-400">{cus.phone}</td>
                      <td className="py-3.5 font-mono text-stone-400">{cus.cccd}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cus.memberType === 'VIP' ? 'bg-amber-950/40 text-gold border border-gold/25' :
                          cus.memberType === 'FREQUENT' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/20' :
                          'bg-stone-900/40 text-stone-400 border border-stone-700/20'
                        }`}>
                          {cus.memberType === 'VIP' ? 'VIP' :
                           cus.memberType === 'FREQUENT' ? 'Thân thiết' : 'Thành viên'}
                        </span>
                      </td>
                      <td className="py-3.5 text-gold font-extrabold text-xs">{cus.totalSpent.toLocaleString('vi-VN')}đ</td>
                      <td className="py-3.5 text-stone-300">{cus.totalStays} lần</td>
                      <td className="py-3.5 pr-4 text-stone-400">{new Date(cus.joinDate).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#9a9080] font-semibold">
                      Không tìm thấy khách hàng nào gia nhập trong khoảng thời gian này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-gold/10 flex items-center justify-between text-xs text-[#9a9080] font-semibold bg-[#07070a]/50 px-4 py-3 rounded-xl">
            <span>
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} trên tổng số {totalItems} bản ghi
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gold/15 rounded hover:bg-[#1a1a24] text-stone-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">Trang {currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gold/15 rounded hover:bg-[#1a1a24] text-stone-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

