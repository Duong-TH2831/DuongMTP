'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getDB } from '@/lib/db';
import { toast } from 'sonner';
import Link from 'next/link';

function VNPayReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      // Extract VNPay params
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
          // Read pending checkout from session storage
          const intentData = sessionStorage.getItem('vnpay_checkout_intent');
          if (intentData) {
            const { stayId, notes, staffId, discountVal } = JSON.parse(intentData);
            
            const db = getDB();
            // Call mock DB to complete the checkout
            // Note: Since db.ts is client-side mock, we do it here. 
            // In a real app, the server would verify vnp_SecureHash and update DB via an IPN webhook.
            const invoice = db.checkOut(stayId, notes + ` (Thanh toán qua VNPAY mã GD: ${vnp_TxnRef})`, staffId, 'VNPAY', discountVal);
            
            if (invoice) {
              setInvoiceId(invoice.id);
              setStatus('success');
              toast.success('Thanh toán VNPay thành công!');
              
              // Clear intent
              sessionStorage.removeItem('vnpay_checkout_intent');
              
              // Auto redirect to invoice after 3 seconds
              setTimeout(() => {
                router.push(`/admin/payment/${invoice.id}`);
              }, 3000);
            } else {
              setStatus('error');
              setErrorMessage('Lỗi ghi nhận hóa đơn vào hệ thống.');
            }
          } else {
            setStatus('error');
            setErrorMessage('Không tìm thấy thông tin phiên giao dịch trên trình duyệt.');
          }
        } catch (error) {
          setStatus('error');
          setErrorMessage('Lỗi hệ thống khi xử lý hóa đơn.');
        }
      } else {
        // Payment Failed
        setStatus('error');
        setErrorMessage(`Thanh toán bị hủy hoặc có lỗi xảy ra (Mã lỗi: ${vnp_ResponseCode})`);
      }
    };

    processPayment();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-stone-200">
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
            <h2 className="text-2xl font-bold font-cormorant text-emerald-450">Giao dịch thành công</h2>
            <p className="text-sm text-stone-300 mt-2">Hóa đơn đã được ghi nhận. Hệ thống sẽ tự động chuyển hướng đến chi tiết hóa đơn trong giây lát.</p>
            {invoiceId && (
              <Link 
                href={`/admin/payment/${invoiceId}`}
                className="mt-6 px-6 py-2.5 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider rounded text-xs transition-colors"
              >
                Xem Hóa Đơn Ngay
              </Link>
            )}
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
              href="/admin/payment"
              className="mt-6 px-6 py-2.5 bg-[#1a1a24] border border-gold/20 hover:border-gold/50 text-stone-200 font-bold uppercase tracking-wider rounded text-xs transition-colors"
            >
              Thử Thanh Toán Lại
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-10 h-10 animate-spin text-gold" /></div>}>
      <VNPayReturnContent />
    </Suspense>
  );
}
