import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, bankCode, orderDescription, orderType, language, returnUrl: reqReturnUrl } = body;

    // TODO: In production, these should be securely stored in .env
    const tmnCode = process.env.NEXT_PUBLIC_VNP_TMNCODE || '6Q1CW0XM';
    const secretKey = process.env.VNP_HASHSECRET || 'OLCR1D7YUC4E0G21QRSCNOR7PBOBYUL2';
    const vnpUrl = process.env.NEXT_PUBLIC_VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    
    // For demo purposes, figure out the base URL from the request if possible, or fallback to localhost
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = reqReturnUrl || process.env.NEXT_PUBLIC_VNP_RETURN_URL || `${origin}/admin/payment/vnpay_return`;

    const date = new Date();
    const createDate = date.getFullYear().toString() + 
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0') +
      date.getHours().toString().padStart(2, '0') +
      date.getMinutes().toString().padStart(2, '0') +
      date.getSeconds().toString().padStart(2, '0');

    const ipAddr = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // We use current timestamp as TxnRef to be unique
    const txnRef = date.getTime().toString();

    let vnp_Params: Record<string, string | number> = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = language || 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = orderDescription || 'Thanh toan hoa don Horizon';
    vnp_Params['vnp_OrderType'] = orderType || 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sort parameters alphabetically
    vnp_Params = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {} as Record<string, string | number>);

    // Create query string for signature
    const signData = new URLSearchParams(vnp_Params as Record<string, string>).toString();
    
    // Hash signature using HMAC-SHA512
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex'); 
    
    vnp_Params['vnp_SecureHash'] = signed;
    const finalUrl = vnpUrl + '?' + new URLSearchParams(vnp_Params as Record<string, string>).toString();

    return NextResponse.json({ redirectUrl: finalUrl });
  } catch (error) {
    console.error('VNPay API Error:', error);
    return NextResponse.json({ error: 'Lỗi tạo URL thanh toán VNPay' }, { status: 500 });
  }
}
