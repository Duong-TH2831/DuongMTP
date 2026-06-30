'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDB, StayRecord, Customer, Booking, PaymentMethod } from '@/lib/db';
import {
  CreditCard, Search, Plus, Trash2, Printer,
  Check, Percent, HelpCircle, DollarSign, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface BillItem {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export default function CheckoutPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = getDB();
  const stays = db.getStays();
  const customers = db.getCustomers();
  const bookings = db.getBookings();

  // Selected stay from URL query
  const queryStayId = searchParams.get('stayId');

  // Form states
  const [invoiceCode, setInvoiceCode] = useState('');
  const [selectedStayId, setSelectedStayId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFER');
  const [discountCode, setDiscountCode] = useState('');
  const [discountVal, setDiscountVal] = useState(0);
  const [notes, setNotes] = useState('');

  // List billing items
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [prePaidAmount, setPrePaidAmount] = useState(0);

  // Metadata display
  const [stayPeriod, setStayPeriod] = useState('Chưa có thông tin');
  const [roomNumber, setRoomNumber] = useState('Chưa có thông tin');
  const [customerName, setCustomerName] = useState('Chưa chọn khách');

  // Autocomplete stays search dropdown
  const [staySearchQuery, setStaySearchQuery] = useState('');
  const [showStayDropdown, setShowStayDropdown] = useState(false);

  // Generate Invoice code on mount
  useEffect(() => {
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    setInvoiceCode(`INV-2026-${codeNum}`);
  }, []);

  // Pre-load from URL query param
  useEffect(() => {
    if (queryStayId) {
      const stay = db.getStay(queryStayId);
      if (stay) {
        handleSelectStay(stay);
      }
    }
  }, [queryStayId, db]);

  const handleSelectStay = (stay: StayRecord) => {
    setSelectedStayId(stay.id);

    const customer = customers.find(c => c.id === stay.customerId);
    const booking = bookings.find(b => b.id === stay.bookingId);
    const room = db.getRoom(stay.roomId);

    setCustomerName(customer ? customer.fullName : 'Khách vãng lai');
    setRoomNumber(room ? `Phòng ${room.roomNumber} (${db.getRoomTypes().find(rt => rt.id === room.roomTypeId)?.name})` : 'N/A');
    setStaySearchQuery(customer ? `${customer.fullName} - P.${room?.roomNumber}` : 'N/A');

    if (booking) {
      setStayPeriod(`${new Date(booking.checkInDate).toLocaleDateString('vi-VN')} đến ${new Date(booking.checkOutDate).toLocaleDateString('vi-VN')} (${booking.numberOfNights} đêm)`);

      const roomWithVat = booking.totalPrice * 1.1;
      
      // Nếu trạng thái là PAID hoặc phương thức là VNPAY, ngầm định là đã trả đủ tiền phòng + VAT (trừ khi depositAmount lớn hơn)
      if (booking.paymentStatus === 'PAID' || booking.paymentMethod === 'VNPAY') {
        setPrePaidAmount(Math.max(booking.depositAmount || 0, roomWithVat)); 
      } else {
        // Nếu chỉ là đặt cọc (PARTIAL) hoặc chưa trả (PENDING), thì lấy đúng số tiền đã cọc
        setPrePaidAmount(booking.depositAmount || 0);
      }

      if (booking.paymentMethod) {
        setPaymentMethod(booking.paymentMethod as any);
      }

      // Load billing items: Room stays + extra services from stay record
      const items: BillItem[] = [
        {
          id: 'room-fee',
          description: `Tiền thuê phòng (${booking.numberOfNights} đêm)`,
          unitPrice: booking.totalPrice / booking.numberOfNights,
          quantity: booking.numberOfNights,
          amount: booking.totalPrice
        }
      ];

      stay.extraServices.forEach(svc => {
        items.push({
          id: svc.id,
          description: svc.name,
          unitPrice: svc.price,
          quantity: svc.quantity,
          amount: svc.amount
        });
      });

      setBillItems(items);
    } else {
      // Fallback for cases where the original booking was deleted but the stay still exists
      setStayPeriod(`${new Date(stay.actualCheckIn).toLocaleDateString('vi-VN')} đến Hiện tại`);
      setPrePaidAmount(0);
      
      const items: BillItem[] = [];
      stay.extraServices.forEach(svc => {
        items.push({
          id: svc.id,
          description: svc.name,
          unitPrice: svc.price,
          quantity: svc.quantity,
          amount: svc.amount
        });
      });
      setBillItems(items);
    }
    setShowStayDropdown(false);
  };

  // Add customized bill item row
  const handleAddRow = () => {
    const newItem: BillItem = {
      id: `custom-${Date.now()}`,
      description: 'Dịch vụ phát sinh thêm...',
      unitPrice: 0,
      quantity: 1,
      amount: 0
    };
    setBillItems([...billItems, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'description' | 'unitPrice' | 'quantity', value: any) => {
    const updated = billItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'unitPrice' || field === 'quantity') {
          updatedItem.amount = Number(updatedItem.unitPrice) * Number(updatedItem.quantity);
        }
        return updatedItem;
      }
      return item;
    });
    setBillItems(updated);
  };

  // Autocomplete filter stays that are ACTIVE (STAYING)
  const filteredActiveStays = stays.filter(s => {
    if (s.status !== 'STAYING') return false;
    const customer = customers.find(c => c.id === s.customerId);
    const room = db.getRoom(s.roomId);

    const query = staySearchQuery.toLowerCase();
    return (
      (customer?.fullName.toLowerCase().includes(query) || false) ||
      (room?.roomNumber.includes(query) || false) ||
      s.stayCode.toLowerCase().includes(query)
    );
  });

  // Calculate totals
  const subTotal = billItems.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = subTotal * 0.1;
  const totalCharged = Math.max(0, subTotal + vatAmount - discountVal - prePaidAmount);

  const applyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountVal(0);
      return;
    }
    const coupon = db.getCouponByCode(discountCode);
    if (coupon) {
      if (subTotal < coupon.minOrderValue) {
        toast.error(`Giá trị đơn hàng tối thiểu phải từ ${coupon.minOrderValue.toLocaleString('vi-VN')}đ`);
        setDiscountVal(0);
        return;
      }
      let disc = 0;
      if (coupon.discountType === 'PERCENT') {
        disc = (subTotal + vatAmount) * (coupon.discountValue / 100);
      } else {
        disc = coupon.discountValue;
      }
      setDiscountVal(disc);
      toast.success('Áp dụng mã voucher giảm giá thành công!');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc hết hạn.');
      setDiscountVal(0);
    }
  };

  const handleCheckoutPaymentConfirm = async () => {
    if (!selectedStayId) {
      toast.error('Vui lòng chọn hồ sơ khách lưu trú cần thanh toán.');
      return;
    }

    if (paymentMethod === 'VNPAY' && totalCharged > 0) {
      try {
        const toastId = toast.loading('Đang khởi tạo thanh toán VNPay...');

        // Save checkout intent to sessionStorage so we can complete it after redirect
        sessionStorage.setItem('vnpay_checkout_intent', JSON.stringify({
          stayId: selectedStayId,
          notes,
          staffId: 'usr-staff-1',
          discountVal,
          totalCharged
        }));

        const response = await fetch('/api/vnpay/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalCharged,
            orderDescription: `Thanh toan hoa don resort phong`,
            language: 'vn'
          })
        });

        const data = await response.json();

        if (data.redirectUrl) {
          toast.dismiss(toastId);
          window.location.href = data.redirectUrl; // Redirect to VNPAY Sandbox
        } else {
          toast.dismiss(toastId);
          toast.error(data.error || 'Lỗi khởi tạo URL thanh toán');
        }
      } catch (e) {
        toast.error('Có lỗi xảy ra khi kết nối VNPAY.');
      }
      return;
    }

    // Call checkout DB logic
    const invoice = db.checkOut(selectedStayId, notes, 'usr-staff-1', paymentMethod, discountVal);
    if (invoice) {
      toast.success('Hóa đơn đã được xác nhận thanh toán thành công!');
      // Navigate directly to A4 printed invoice detail view!
      router.push(`/admin/payment/${invoice.id}`);
    } else {
      toast.error('Lỗi thanh toán hóa đơn.');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide">Thanh Toán Hóa Đơn</h1>
          <p className="text-xs text-stone-400 mt-1">Xác nhận và kết toán chi phí thuê phòng nghỉ cùng phụ phí phát sinh cho khách lưu trú.</p>
        </div>
        <button
          onClick={() => {
            if (selectedStayId) {
              toast.info('Đang in hóa đơn tạm tính...');
            } else {
              toast.error('Vui lòng chọn phòng để in hóa đơn tạm tính.');
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111118] text-stone-200 border border-gold/15 rounded-lg text-xs font-bold transition-all hover:bg-[#1a1a24] hover:text-gold cursor-pointer"
        >
          <Printer className="w-4 h-4 text-gold shrink-0" />
          <span>In hóa đơn tạm tính</span>
        </button>
      </div>

      {/* Main Grid Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Form billing left (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Metadata Section */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 relative">

            {/* Invoice Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Mã số hóa đơn (Auto-gen)</label>
              <input
                type="text"
                readOnly
                value={invoiceCode}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs outline-none text-stone-500 font-mono font-bold"
              />
            </div>

            {/* Stays Search select autocomplete */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Chọn Phòng / Khách Đang Ở *</label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-550 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Gõ tìm tên khách, số phòng..."
                  value={staySearchQuery}
                  onChange={(e) => {
                    setStaySearchQuery(e.target.value);
                    setSelectedStayId('');
                    setShowStayDropdown(true);
                  }}
                  onFocus={() => setShowStayDropdown(true)}
                  className="w-full pl-9 pr-4 py-2 bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] rounded-lg text-xs outline-none text-stone-200 transition-colors placeholder-stone-600"
                />
              </div>

              {/* Stays dropdown */}
              {showStayDropdown && (
                <div className="absolute top-[54px] left-0 right-0 z-40 bg-[#0a0a0f] border border-gold/15 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredActiveStays.length > 0 ? (
                    filteredActiveStays.map(s => {
                      const cust = customers.find(c => c.id === s.customerId);
                      const room = db.getRoom(s.roomId);
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectStay(s)}
                          className="p-2.5 hover:bg-[#111118] cursor-pointer text-xs flex justify-between items-center text-stone-300 border-b border-gold/10"
                        >
                          <span className="font-bold text-gold">P.{room?.roomNumber} - {cust?.fullName}</span>
                          <span className="font-mono text-[#9a9080]">Stay: {s.stayCode}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-stone-500 text-xs">
                      Không tìm thấy phòng có khách đang ở phù hợp.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer name info */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Khách hàng thanh toán</label>
              <input
                type="text"
                readOnly
                value={customerName}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs outline-none text-stone-500 font-bold"
              />
            </div>

            {/* Room details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Buồng phòng & Hạng phòng</label>
              <input
                type="text"
                readOnly
                value={roomNumber}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs outline-none text-stone-500 font-bold"
              />
            </div>

            {/* Stay period duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Thời gian lưu trú thực tế</label>
              <input
                type="text"
                readOnly
                value={stayPeriod}
                className="w-full bg-[#07070a] border border-gold/15 py-2 px-4 rounded-lg text-xs outline-none text-stone-500 font-bold"
              />
            </div>

            {/* Payment method selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#9a9080] font-bold">Phương thức thanh toán *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] py-2 px-4 rounded-lg text-xs outline-none text-stone-200 transition-colors font-semibold cursor-pointer"
              >
                <option value="TRANSFER" className="bg-[#111118]">Chuyển khoản Ngân hàng (TRANSFER)</option>
                <option value="CARD" className="bg-[#111118]">Thẻ tín dụng (CARD)</option>
                <option value="CASH" className="bg-[#111118]">Tiền mặt tại quầy (CASH)</option>
                <option value="VNPAY" className="bg-[#111118]">Ví điện tử VNPay (Sandbox)</option>
              </select>
            </div>

          </div>

          {/* Editable Service Line Items table */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-100">Chi tiết dịch vụ & Phụ phí</h3>
              <button
                type="button"
                onClick={handleAddRow}
                disabled={!selectedStayId}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07070a] border border-gold/10 hover:bg-[#1a1a24] text-stone-300 rounded text-[10px] font-bold uppercase disabled:opacity-40 disabled:hover:bg-[#07070a] cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dịch vụ (+ Add Row)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gold/15 text-[#9a9080] font-semibold bg-[#07070a]/50">
                    <th className="py-2.5 pl-3">Nội dung chi phí</th>
                    <th className="py-2.5 w-28">Đơn giá (VNĐ)</th>
                    <th className="py-2.5 w-20">Số lượng</th>
                    <th className="py-2.5 w-32 text-right">Thành tiền</th>
                    <th className="py-2.5 w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.length > 0 ? (
                    billItems.map((item) => (
                      <tr key={item.id} className="border-b border-gold/10 hover:bg-[#1a1a24]/50 transition-colors">

                        {/* Description */}
                        <td className="py-3 pl-3">
                          <input
                            type="text"
                            value={item.description}
                            disabled={item.id === 'room-fee'}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent focus:border-gold/30 py-1 font-semibold text-stone-200 outline-none text-xs disabled:text-stone-500"
                          />
                        </td>

                        {/* Unit price */}
                        <td className="py-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            disabled={item.id === 'room-fee'}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                            className="w-full bg-transparent border-b border-transparent focus:border-gold/30 py-1 font-mono text-stone-300 outline-none text-xs"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="py-3">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            disabled={item.id === 'room-fee'}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full bg-transparent border-b border-transparent focus:border-gold/30 py-1 font-mono text-stone-300 outline-none text-xs"
                          />
                        </td>

                        {/* Amount */}
                        <td className="py-3 text-right pr-3 font-bold text-stone-200 font-mono">
                          {item.amount.toLocaleString('vi-VN')}đ
                        </td>

                        {/* Remove */}
                        <td className="py-3 text-center">
                          <button
                            type="button"
                            disabled={item.id === 'room-fee'}
                            onClick={() => handleRemoveRow(item.id)}
                            className="p-1 text-stone-500 hover:text-red-400 hover:bg-red-950/30 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-500 bg-[#111118] italic">Vui lòng chọn phòng để tải bảng kê chi phí chi tiết.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Panel Sticky "Tóm tắt thanh toán" */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-4">

          <div className="bg-[#111118] p-6 rounded-2xl border border-gold/10 shadow-md flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-100">Tóm tắt thanh toán</h3>

            <div className="flex flex-col gap-3.5 text-xs text-stone-400 font-medium">
              <div className="flex justify-between">
                <span>Tiền dịch vụ & Phòng:</span>
                <span className="font-bold text-stone-250">{subTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế VAT (10%):</span>
                <span>{vatAmount.toLocaleString('vi-VN')}đ</span>
              </div>

              {/* Voucher apply */}
              <div className="flex flex-col gap-2 bg-[#07070a] p-3 rounded-lg border border-gold/10 mt-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#9a9080]">Mã Voucher (Giảm giá)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã ưu đãi..."
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#111118] border border-gold/15 p-1 px-2.5 rounded text-[11px] outline-none font-semibold uppercase text-stone-200 placeholder-stone-600 focus:border-gold/30"
                  />
                  <button
                    type="button"
                    onClick={applyDiscount}
                    className="px-2.5 py-1 bg-gold text-black text-[10px] font-bold rounded hover:bg-gold-light cursor-pointer transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
                {discountVal > 0 && (
                  <p className="text-[10px] text-emerald-450 font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-450" />
                    Giảm trừ: -{discountVal.toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>

              {prePaidAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-400 font-bold border-t border-gold/10 pt-3 mt-1 border-dashed">
                  <span>Đã thanh toán trước/Đặt cọc:</span>
                  <span>- {prePaidAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>

            {/* Total price inside gold border/bg banner */}
            <div className="bg-gold/10 border border-gold/15 text-stone-200 p-4 rounded-xl mt-2 flex flex-col gap-1 items-center text-center shadow-inner">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#9a9080] font-bold">Tổng tiền cần thanh toán</span>
              <span className="text-xl md:text-2xl font-extrabold text-gold font-mono">{totalCharged.toLocaleString('vi-VN')}đ</span>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[9px] uppercase tracking-wider text-[#9a9080] font-bold">Ghi chú thanh toán</span>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú hóa đơn (vd: Đã nhận phòng trễ, giảm tiền nước...)"
                className="w-full bg-[#07070a] border border-gold/15 focus:border-gold/30 focus:bg-[#07070a] p-2 rounded text-[11px] outline-none text-stone-200 resize-none font-light placeholder-stone-600"
              />
            </div>

            {/* Checkout buttons */}
            <button
              onClick={handleCheckoutPaymentConfirm}
              disabled={!selectedStayId}
              className="w-full py-3.5 bg-gold hover:bg-gold-light disabled:opacity-40 disabled:hover:bg-gold text-black font-bold uppercase text-xs tracking-widest transition-all rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Xác Nhận Thanh Toán</span>
            </button>

            <p className="text-[9.5px] text-stone-500 font-light text-center leading-normal">
              Hóa đơn điện tử sẽ được hệ thống tự động gửi qua email cho khách hàng ngay sau khi xác nhận kết toán.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
