'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDB, Invoice, Customer, StayRecord, Booking } from '@/lib/db';
import { Printer, FileText, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InvoiceDetail() {
  const params = useParams();
  const router = useRouter();
  const db = getDB();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [stay, setStay] = useState<StayRecord | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (invoiceId) {
      const inv = db.getInvoice(invoiceId);
      if (inv) {
        setInvoice(inv);
        const cust = db.getCustomer(inv.customerId);
        if (cust) setCustomer(cust);
        
        const st = db.getStay(inv.stayId);
        if (st) {
          setStay(st);
          const bk = db.getBooking(st.bookingId);
          if (bk) setBooking(bk);
        }
      } else {
        toast.error('Không tìm thấy hóa đơn yêu cầu.');
        router.push('/admin/payment');
      }
    }
  }, [invoiceId, db, router]);

  const handlePrint = () => {
    window.print();
  };

  // Helper to convert number to words in Vietnamese (simplified for resort price ranges)
  const numberToWords = (num: number): string => {
    if (num <= 0) return 'Không đồng chẵn';
    
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    
    if (num >= 1000000 && num < 100000000) {
      const millions = Math.floor(num / 1000000);
      const thousands = Math.floor((num % 1000000) / 1000);
      
      let str = `${units[Math.floor(millions / 10)] ? units[Math.floor(millions / 10)] + ' mươi ' : ''}${units[millions % 10] ? units[millions % 10] : ''} triệu`;
      if (thousands > 0) {
        str += ` ${thousands} nghìn`;
      }
      str += ' đồng chẵn';
      return str.charAt(0).toUpperCase() + str.slice(1).replace(/\s+/g, ' ');
    }
    
    return `${num.toLocaleString('vi-VN')} đồng chẵn`;
  };

  if (!invoice || !customer || !stay || !booking) return null;

  const room = db.getRoom(stay.roomId);
  const roomType = db.getRoomTypes().find(rt => rt.id === room?.roomTypeId);

  // Generate dynamic invoice items from totals
  const invoiceItems = [
    {
      description: `Tiền thuê phòng ${room?.roomNumber} - Hạng phòng ${roomType?.name} (${booking.numberOfNights} đêm)`,
      quantity: booking.numberOfNights,
      unitPrice: booking.totalPrice / booking.numberOfNights,
      amount: booking.totalPrice
    }
  ];

  stay.extraServices.forEach(svc => {
    invoiceItems.push({
      description: svc.name,
      quantity: svc.quantity,
      unitPrice: svc.price,
      amount: svc.amount
    });
  });

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f] print:bg-white print:text-black print:p-0">
      
      {/* Breadcrumbs (Hidden in print) */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 print:hidden">
        <Link href="/admin" className="hover:text-gold transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/admin/payment" className="hover:text-gold transition-colors">Thanh toán</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-600">Hóa đơn {invoice.invoiceCode}</span>
      </div>

      {/* Action Header Panel (Hidden in print) */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/admin/payment" className="p-1.5 hover:bg-[#1a1a24] rounded-lg text-stone-450 border border-gold/5 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-450" />
            <div>
              <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Chi Tiết Hóa Đơn</h1>
              <p className="text-xs text-stone-400 mt-0.5">Thanh toán hoàn tất vào lúc {new Date(invoice.issueDate).toLocaleTimeString('vi-VN')} ngày {new Date(invoice.issueDate).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Tính năng xuất PDF đang được tải...')}
            className="px-5 py-2.5 bg-[#111118] text-stone-200 border border-gold/15 rounded-lg text-xs font-bold transition-all hover:bg-[#1a1a24] hover:text-gold cursor-pointer"
          >
            Xuất file PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-gold hover:bg-gold-light text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-black shrink-0" />
            <span>In hóa đơn (A4 Format)</span>
          </button>
        </div>
      </div>

      {/* A4 PRINT VIEW PAGE CONTAINER */}
      <div className="bg-[#111118] p-8 md:p-12 rounded-2xl border border-gold/10 shadow-2xl text-stone-200 max-w-4xl mx-auto w-full print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:mx-0">
        
        {/* Invoice Letterhead */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-gold/15 pb-8 mb-8 gap-6 print:border-black print:pb-4 print:mb-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-cormorant text-3xl font-extrabold text-gold tracking-[0.15em] leading-none mb-1 print:text-black">HORIZON GRAND RESORT</h2>
            <p className="text-[10px] text-gold/60 font-bold uppercase tracking-wider print:text-black/60">Masterpiece of Luxury Hospitality</p>
            <p className="text-xs text-stone-400 mt-2 print:text-black/80">Địa chỉ: Trường KD và CN Hà Nội, 29A Ngõ 124 Phố Vĩnh Tuy, Vĩnh Hưng, Hà Nội</p>
            <p className="text-xs text-stone-400 print:text-black/80">SĐT: 0399 078 931 | Email: MTP@MTP.vn</p>
          </div>

          <div className="text-left md:text-right flex flex-col gap-1 md:items-end">
            <h1 className="text-3xl font-cormorant font-bold text-gold tracking-widest leading-none mb-2 print:text-black">INVOICE</h1>
            <div className="text-xs text-stone-400 flex flex-col gap-0.5 font-medium print:text-black/80">
              <p>Mã hóa đơn: <strong className="text-gold font-mono font-extrabold print:text-black">{invoice.invoiceCode}</strong></p>
              <p>Ngày lập: {new Date(invoice.issueDate).toLocaleDateString('vi-VN')}</p>
              <p>Hình thức: {invoice.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : (invoice.paymentMethod === 'CARD' ? 'Thẻ tín dụng' : 'Tiền mặt')}</p>
              <p className="text-emerald-450 font-bold uppercase tracking-wider mt-1 text-[10px] print:text-emerald-600">Tình trạng: ĐÃ THANH TOÁN</p>
            </div>
          </div>
        </div>

        {/* Guest & Room Details Grid (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-xs font-semibold print:mb-6 print:gap-4">
          
          {/* Guest Info */}
          <div className="bg-[#07070a]/50 p-4 rounded-xl border border-gold/10 flex flex-col gap-2 print:bg-white print:border-black/25 print:text-black">
            <h3 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold print:text-black/55">Thông tin khách hàng</h3>
            <div className="flex flex-col gap-1 text-stone-300 font-medium print:text-black/90">
              <p className="font-bold text-stone-100 text-sm print:text-black">{customer.fullName}</p>
              <p>Số CCCD / Passport: {customer.cccd}</p>
              <p>Số điện thoại: {customer.phone}</p>
              {customer.email && <p>Email: {customer.email}</p>}
              {customer.address && <p className="truncate" title={customer.address}>Địa chỉ: {customer.address}</p>}
            </div>
          </div>

          {/* Stay Info */}
          <div className="bg-[#07070a]/50 p-4 rounded-xl border border-gold/10 flex flex-col gap-2 print:bg-white print:border-black/25 print:text-black">
            <h3 className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold print:text-black/55">Thông tin phòng nghỉ</h3>
            <div className="flex flex-col gap-1 text-stone-300 font-medium print:text-black/90">
              <p className="font-bold text-stone-100 text-sm print:text-black">Phòng {room?.roomNumber}</p>
              <p>Hạng phòng: {roomType?.name}</p>
              <p>Thời gian: {new Date(booking.checkInDate).toLocaleDateString('vi-VN')} &rarr; {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')} ({booking.numberOfNights} đêm)</p>
              <p>Số lượng khách: {booking.numberOfAdults} người lớn {booking.numberOfChildren > 0 && `, ${booking.numberOfChildren} trẻ em`}</p>
            </div>
          </div>

        </div>

        {/* Invoice Itemized table */}
        <div className="border border-gold/10 rounded-xl overflow-hidden mb-10 print:border-black print:mb-6 print:rounded-none">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gold/15 text-[#9a9080] font-bold bg-[#07070a]/50 print:border-b print:border-black print:bg-slate-100 print:text-black">
                <th className="py-3 pl-4">STT</th>
                <th className="py-3">Mô tả dịch vụ / Chi phí</th>
                <th className="py-3 w-16 text-center">SL</th>
                <th className="py-3 w-32 text-right">Đơn giá (VNĐ)</th>
                <th className="py-3 pr-4 w-36 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gold/10 hover:bg-[#1a1a24]/50 transition-colors text-stone-300 font-semibold print:border-b print:border-black/20 print:text-black">
                  <td className="py-3 pl-4 font-mono font-bold text-stone-500 print:text-black/60">{idx + 1}</td>
                  <td className="py-3 text-stone-200 font-bold print:text-black">{item.description}</td>
                  <td className="py-3 text-center font-mono print:text-black">{item.quantity}</td>
                  <td className="py-3 text-right font-mono print:text-black">{item.unitPrice.toLocaleString('vi-VN')}đ</td>
                  <td className="py-3 pr-4 text-right font-bold text-stone-200 font-mono print:text-black">{(item.quantity * item.unitPrice).toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Billing details calculation with Mock QR Code */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-gold/15 pb-8 mb-8 print:border-black print:pb-4 print:mb-4">
          
          {/* QR Code and Written words (Left) */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 items-center md:items-start text-xs font-semibold print:gap-4">
            {/* Mock QR Code */}
            <div className="w-24 h-24 bg-[#07070a] border border-gold/15 p-2.5 rounded-lg shrink-0 flex items-center justify-center relative shadow-inner print:bg-white print:border-black">
              <div className="absolute inset-2 border-2 border-gold/50 flex items-center justify-center p-1 print:border-black">
                <div className="w-full h-full bg-gold/80 border-2 border-black/80 print:bg-black" style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 50%, 100% 50%, 100% 100%, 0% 100%)' }} />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 text-center md:text-left">
              <p className="text-[10px] text-[#9a9080] uppercase tracking-wider font-bold print:text-black/60">Mã tra cứu e-invoice</p>
              <p className="font-mono font-bold text-stone-300 print:text-black">{invoice.id.slice(0, 16)}</p>
              <p className="text-stone-455 italic font-light mt-2 max-w-xs leading-normal print:text-black/80">
                {numberToWords(invoice.totalAmount)}
              </p>
            </div>
          </div>

          {/* Pricing breakdowns (Right) */}
          <div className="w-full md:w-80 flex flex-col gap-2 text-xs font-semibold text-stone-400 print:text-black/80">
            <div className="flex justify-between">
              <span>Tạm tính (Subtotal):</span>
              <span className="font-bold text-stone-200 font-mono print:text-black">{invoice.subTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phụ phí thuế VAT (10%):</span>
              <span className="font-bold text-stone-200 font-mono print:text-black">{((invoice.subTotal) * 0.1).toLocaleString('vi-VN')}đ</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-red-400 print:text-red-650">
                <span>Ưu đãi giảm giá (Discount):</span>
                <span className="font-bold font-mono">-{invoice.discount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="h-[1px] bg-gold/15 my-2 print:bg-black" />
            <div className="flex justify-between items-center text-sm font-bold text-gold print:text-black">
              <span>TỔNG CỘNG (TOTAL):</span>
              <span className="text-lg font-extrabold text-gold font-mono print:text-black">{invoice.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

        </div>

        {/* Double-column Signatures */}
        <div className="grid grid-cols-2 text-center text-xs font-bold text-stone-400 pt-6 pb-12 mb-6 print:text-black print:pb-6 print:mb-4">
          <div className="flex flex-col gap-1.5">
            <p className="uppercase tracking-wider text-stone-300 print:text-black">Khách Hàng Ký Nhận</p>
            <p className="text-[9px] text-stone-500 font-normal italic print:text-black/60">(Ký và ghi rõ họ tên / Guest Signature)</p>
            <div className="h-16 print:h-12" />
            <p className="text-stone-200 font-bold print:text-black">{customer.fullName}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="uppercase tracking-wider text-stone-300 print:text-black">Nhân Viên Thu Ngân</p>
            <p className="text-[9px] text-stone-500 font-normal italic print:text-black/60">(Ký và đóng dấu xác nhận / Cashier)</p>
            <div className="h-16 print:h-12" />
            <p className="text-stone-200 font-bold print:text-black">Nguyễn Minh Trí</p>
          </div>
        </div>

        {/* Thank You Banner */}
        <div className="bg-gold/10 border border-gold/15 text-stone-200 p-4 rounded-xl text-center flex flex-col gap-1 shadow-inner print:bg-slate-100 print:text-black print:border-black">
          <h4 className="font-cormorant text-base font-bold text-gold tracking-widest uppercase print:text-black">CẢM ƠN QUÝ KHÁCH ĐÃ LỰA CHỌN HORIZON!</h4>
          <p className="text-[9px] text-stone-300 tracking-wider print:text-black/80">Thank you for staying at Horizon Grand Resort. Have a safe journey!</p>
        </div>

      </div>

    </div>
  );
}
