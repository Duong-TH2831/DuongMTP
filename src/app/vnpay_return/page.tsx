'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getDB } from '@/lib/db';
import Link from 'next/link';

function PublicVNPayReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
      const vnp_TxnRef = searchParams.get('vnp_TxnRef');
      
      if (!vnp_ResponseCode || !vnp_TxnRef) {
        setStatus('error');
        setErrorMessage('Dữ liệu trả về từ VNPay không hợp lệ.');
        return;
      }

      if (vnp_ResponseCode === '00') {
        // Payment Success!
        try {
          const storedBookingCode = sessionStorage.getItem('public_vnpay_booking_code');
          if (storedBookingCode) {
            const db = getDB();
            const targetBooking = db.getBookings().find(b => b.bookingCode === storedBookingCode);
            
            if (targetBooking) {
              db.updateBookingStatus(targetBooking.id, 'CONFIRMED');
              const idx = db.getBookings().findIndex(b => b.id === targetBooking.id);
              if (idx !== -1) {
                db.getBookings()[idx].paymentStatus = 'PAID';
                
                // Add Blockchain Transaction for this Booking payment
                let hash = 0;
                const str = targetBooking.id + new Date().toISOString() + "HorizonHMS";
                for (let i = 0; i < str.length; i++) {
                  hash = ((hash << 5) - hash) + str.charCodeAt(i);
                  hash = hash & hash;
                }
                const hex = Math.abs(hash).toString(16);
                const txHash = `0x${hex}000000000000000000000000000000000000000000000000`.slice(0, 42);
                
                db.addBlockchainTransaction({
                  id: `tx-${Date.now()}`,
                  txHash,
                  invoiceId: targetBooking.id, // Using booking ID
                  invoiceCode: targetBooking.bookingCode, // Using booking code
                  paymentMethod: 'VNPAY',
                  amount: targetBooking.totalPrice,
                  timestamp: new Date().toISOString(),
                  status: 'Confirmed',
                  blockNumber: 120000 + db.getBlockchainTransactions().length + 1
                });
                
                db.save();
              }
              
              setBookingCode(storedBookingCode);
              setStatus('success');
              sessionStorage.removeItem('public_vnpay_booking_code');
            } else {
              setStatus('error');
              setErrorMessage('Không tìm thấy mã đặt phòng trong hệ thống.');
            }
          } else {
            setStatus('error');
            setErrorMessage('Không tìm thấy phiên đặt phòng.');
          }
        } catch (error) {
          setStatus('error');
          setErrorMessage('Lỗi hệ thống khi cập nhật trạng thái.');
        }
      } else {
        // Payment Failed
        setStatus('error');
        setErrorMessage(`Thanh toán bị hủy hoặc có lỗi (Mã lỗi: ${vnp_ResponseCode})`);
      }
    };

    processPayment();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-stone-200 bg-[#060608]">
      <div className="bg-[#111118] p-8 md:p-12 rounded-2xl border border-gold/15 shadow-2xl flex flex-col items-center text-center max-w-md w-full relative overflow-hidden">
        
        {/* Top edge glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-gold animate-spin mb-4" />
            <h2 className="text-2xl font-bold font-cormorant text-stone-100">Đang xử lý kết quả...</h2>
            <p className="text-sm text-stone-400 mt-2">Vui lòng không đóng trình duyệt lúc này.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-950/30 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-450" />
            </div>
            <h2 className="text-2xl font-bold font-cormorant text-emerald-450">THANH TOÁN THÀNH CÔNG!</h2>
            <p className="text-sm text-stone-300 mt-2 mb-2">Đơn đặt phòng của bạn đã được thanh toán và xác nhận.</p>
            {bookingCode && (
              <div className="bg-[#07070a] p-3 rounded-lg border border-gold/20 w-full mb-6">
                <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Mã Đặt Phòng Của Bạn</p>
                <p className="font-mono text-xl text-gold font-bold">{bookingCode}</p>
              </div>
            )}
            <Link 
              href="/"
              className="px-8 py-3.5 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-widest rounded text-xs transition-colors w-full"
            >
              Về Trang Chủ
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-950/30 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold font-cormorant text-red-400">Giao dịch thất bại</h2>
            <p className="text-sm text-stone-300 mt-2">{errorMessage}</p>
            <Link 
              href="/"
              className="mt-6 px-6 py-2.5 bg-[#1a1a24] border border-gold/20 hover:border-gold/50 text-stone-200 font-bold uppercase tracking-wider rounded text-xs transition-colors"
            >
              Quay lại Đặt Phòng
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PublicVNPayReturnPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-[#060608]"><Loader2 className="w-10 h-10 animate-spin text-gold" /></div>}>
      <PublicVNPayReturnContent />
    </Suspense>
  );
}
