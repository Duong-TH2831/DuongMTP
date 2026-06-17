'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, ChevronDown, Plus, Minus, Info,
  MapPin, Phone, Mail, Star, ArrowRight, Waves,
  Utensils, Activity, Car, Trees, Check, ShieldCheck,
  Sparkles, Loader2, Heart, Award, X
} from 'lucide-react';
import { getDB, Room, RoomType } from '@/lib/db';
import { useAppState } from '@/store';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import GoldParticles from '@/components/landing/GoldParticles';
import CustomCursor from '@/components/landing/CustomCursor';
import { toast } from 'sonner';

export default function LandingPage() {
  const { language, bookingCart, setBookingCart, resetBookingCart } = useAppState();
  const db = getDB();
  const roomTypes = db.getRoomTypes();

  // Local state for availability check
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Video Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD'>('TRANSFER');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBookingCode, setCreatedBookingCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [qrPaymentStatus, setQrPaymentStatus] = useState<'PENDING' | 'SUCCESS'>('PENDING');

  // Form errors
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  const t = {
    VI: {
      heroTitle: 'Nơi Thời Gian Đứng Lại',
      heroSubtitle: 'Kỳ quan nghỉ dưỡng biệt lập đẳng cấp 5 sao tại đảo ngọc Phú Quốc.',
      discoverNow: 'Khám Phá Ngay',
      watchVideo: 'Xem Video Resort',
      bookingTitle: 'Đặt Phòng Nghỉ Dưỡng',
      checkIn: 'Ngày Nhận Phòng',
      checkOut: 'Ngày Trả Phòng',
      adults: 'Người lớn',
      children: 'Trẻ em',
      roomType: 'Hạng Phòng',
      promoCode: 'Mã Ưu Đãi',
      checkAvailability: 'Kiểm Tra Phòng Trống',
      checkingText: 'Đang kiểm tra dữ liệu...',
      availableRoomsTitle: 'Lựa chọn phòng trống phù hợp',
      selectRoomBtn: 'Chọn phòng này',
      selectedRoomText: 'Đã chọn phòng',
      bookConfirmBtn: 'Tiếp Tục Đặt Phòng',
      noRoomsAvailable: 'Rất tiếc, hạng phòng này đã hết phòng trống trong khoảng thời gian đã chọn.',
      nights: 'đêm',
      priceDetail: 'Chi tiết giá phòng',
      roomPrice: 'Tiền phòng',
      vat: 'Thuế VAT (10%)',
      svcCharge: 'Phí dịch vụ (5%)',
      discount: 'Ưu đãi giảm giá',
      totalAmount: 'TỔNG CỘNG',
      modalTitle: 'Hoàn Tất Đặt Phòng',
      modalSubtitle: 'Vui lòng cung cấp thông tin liên hệ của bạn để chúng tôi gửi xác nhận đặt phòng.',
      fullName: 'Họ và tên khách hàng',
      phone: 'Số điện thoại liên lạc',
      email: 'Địa chỉ Email',
      requests: 'Yêu cầu đặc biệt (hút thuốc, cũi trẻ em...)',
      payMethod: 'Phương thức thanh toán',
      payCash: 'Tiền mặt tại quầy',
      payTransfer: 'Chuyển khoản Ngân hàng',
      payCard: 'Thẻ tín dụng trực tuyến',
      confirmBookingBtn: 'Xác Nhận & Đặt Phòng',
      successTitle: 'ĐẶT PHÒNG THÀNH CÔNG!',
      successSubtitle: 'Mã đặt phòng của bạn là:',
      successDesc: 'Thông tin xác nhận chi tiết đã được gửi đến email của bạn. Hân hạnh được phục vụ bạn tại Horizon Grand Resort.',
      successBtn: 'Về Trang Chủ',
      viewAllGallery: 'Xem toàn bộ thư viện',
      statsRooms: 'Phòng nghỉ hạng sang',
      statsExp: 'Năm kinh nghiệm phục vụ',
      statsGuests: 'Lượt khách hài lòng',
      statsRating: 'Đánh giá xếp hạng'
    },
    EN: {
      heroTitle: 'Where Time Stands Still',
      heroSubtitle: 'An exclusive 5-star sanctuary tucked away in Phu Quoc paradise island.',
      discoverNow: 'Discover Now',
      watchVideo: 'Watch Video',
      bookingTitle: 'Book Your Stay',
      checkIn: 'Check-In Date',
      checkOut: 'Check-Out Date',
      adults: 'Adults',
      children: 'Children',
      roomType: 'Room Type',
      promoCode: 'Promo Code',
      checkAvailability: 'Check Availability',
      checkingText: 'Checking room database...',
      availableRoomsTitle: 'Select an available suite',
      selectRoomBtn: 'Select this room',
      selectedRoomText: 'Selected Room',
      bookConfirmBtn: 'Proceed to Checkout',
      noRoomsAvailable: 'We apologize, but this room type is fully booked for the selected dates.',
      nights: 'nights',
      priceDetail: 'Rate Breakdown',
      roomPrice: 'Room Rate',
      vat: 'VAT Tax (10%)',
      svcCharge: 'Service Fee (5%)',
      discount: 'Discount',
      totalAmount: 'TOTAL AMOUNT',
      modalTitle: 'Complete Booking',
      modalSubtitle: 'Please provide your details to receive booking confirmations.',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      requests: 'Special Requests (early check-in, dietary...)',
      payMethod: 'Payment Method',
      payCash: 'Cash at Counter',
      payTransfer: 'Bank Transfer',
      payCard: 'Credit Card Online',
      confirmBookingBtn: 'Confirm & Book Now',
      successTitle: 'BOOKING CONFIRMED!',
      successSubtitle: 'Your booking code is:',
      successDesc: 'A confirmation email with itinerary has been dispatched. We look forward to welcoming you to Horizon.',
      successBtn: 'Return to Home',
      viewAllGallery: 'View Full Gallery',
      statsRooms: 'Luxury Suites',
      statsExp: 'Years of Excellence',
      statsGuests: 'Happy Guests',
      statsRating: 'Star Rating'
    }
  }[language];

  // Staggered letters animation for Hero Headline
  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        staggerChildren: 0.08
      }
    }
  };

  const letter = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  // Computations
  const selectedType = roomTypes.find(rt => rt.id === bookingCart.roomTypeId) || roomTypes[0];

  const dIn = new Date(bookingCart.checkInDate);
  const dOut = new Date(bookingCart.checkOutDate);
  const nights = Math.max(1, Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));

  const roomPriceSubtotal = selectedType.basePrice * nights;
  const vatAmount = roomPriceSubtotal * 0.1;
  const serviceCharge = roomPriceSubtotal * 0.05;

  const totalBeforeDiscount = roomPriceSubtotal + vatAmount + serviceCharge;
  const finalPrice = Math.max(0, totalBeforeDiscount - bookingCart.discountAmount);

  // Validate dates
  useEffect(() => {
    if (bookingCart.checkInDate && bookingCart.checkOutDate) {
      if (new Date(bookingCart.checkInDate) >= new Date(bookingCart.checkOutDate)) {
        const nextDay = new Date(bookingCart.checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setBookingCart({ checkOutDate: nextDay.toISOString().split('T')[0] });
      }
    }
  }, [bookingCart.checkInDate, bookingCart.checkOutDate, setBookingCart]);

  // Apply promo codes
  useEffect(() => {
    setPromoError('');
    if (!bookingCart.promoCode) {
      setBookingCart({ discountAmount: 0 });
      return;
    }
    const coupon = db.getCouponByCode(bookingCart.promoCode);
    if (coupon) {
      if (roomPriceSubtotal < coupon.minOrderValue) {
        setPromoError(language === 'VI'
          ? `Giá trị phòng tối thiểu phải từ ${coupon.minOrderValue.toLocaleString('vi-VN')}đ`
          : `Minimum booking value of ${coupon.minOrderValue.toLocaleString('vi-VN')}đ required`);
        setBookingCart({ discountAmount: 0 });
        return;
      }
      let discountVal = 0;
      if (coupon.discountType === 'PERCENT') {
        discountVal = totalBeforeDiscount * (coupon.discountValue / 100);
      } else {
        discountVal = coupon.discountValue;
      }
      setBookingCart({ discountAmount: discountVal });
      toast.success(language === 'VI' ? 'Áp dụng mã giảm giá thành công!' : 'Promo code applied successfully!');
    } else {
      setPromoError(language === 'VI' ? 'Mã ưu đãi không hợp lệ hoặc hết hạn' : 'Invalid or expired promo code');
      setBookingCart({ discountAmount: 0 });
    }
  }, [bookingCart.promoCode, roomPriceSubtotal, totalBeforeDiscount, setBookingCart, language]);

  const handleCheckAvailability = () => {
    setChecking(true);
    setChecked(false);
    setSelectedRoom(null);

    setTimeout(() => {
      // Find rooms of selected RoomType that are AVAILABLE
      const foundRooms = db.getRooms().filter(
        r => r.roomTypeId === bookingCart.roomTypeId && r.status === 'AVAILABLE'
      );
      setAvailableRooms(foundRooms);
      setChecking(false);
      setChecked(true);
      if (foundRooms.length > 0) {
        setSelectedRoom(foundRooms[0]);
        toast.success(language === 'VI'
          ? `Tìm thấy ${foundRooms.length} phòng trống!`
          : `Found ${foundRooms.length} available suites!`);
      } else {
        toast.error(language === 'VI'
          ? 'Hạng phòng này tạm hết trong khoảng thời gian đã chọn.'
          : 'No available rooms found for this suite type.');
      }
    }, 1500);
  };

  const handleOpenCheckout = () => {
    if (!selectedRoom) return;
    setCheckoutModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple Validation
    const errors: { name?: string; phone?: string } = {};
    if (!custName.trim()) {
      errors.name = language === 'VI' ? 'Vui lòng nhập họ tên' : 'Name is required';
    }
    if (!custPhone.trim()) {
      errors.phone = language === 'VI' ? 'Vui lòng nhập số điện thoại' : 'Phone is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Register customer in DB (or find existing)
    let customer = db.getCustomers().find(c => c.phone === custPhone);
    if (!customer) {
      customer = db.createCustomer({
        fullName: custName,
        email: custEmail || undefined,
        phone: custPhone,
        cccd: Math.floor(100000000000 + Math.random() * 899999999999).toString(), // Random mock CCCD
        isActive: true,
        memberType: 'REGULAR',
      });
    }

    // Create the booking in DB
    const newBooking = db.createBooking({
      customerId: customer.id,
      roomId: selectedRoom!.id,
      checkInDate: new Date(bookingCart.checkInDate).toISOString(),
      checkOutDate: new Date(bookingCart.checkOutDate).toISOString(),
      numberOfNights: nights,
      numberOfAdults: bookingCart.numberOfAdults,
      numberOfChildren: bookingCart.numberOfChildren,
      status: 'PENDING',
      totalPrice: finalPrice,
      depositAmount: paymentMethod === 'TRANSFER' ? finalPrice * 0.5 : 0,
      paymentMethod: paymentMethod === 'TRANSFER' ? 'VNPAY' : paymentMethod,
      paymentStatus: 'UNPAID',
      specialRequests: specialRequests || undefined,
      createdById: 'usr-staff-1' // Staff simulated
    });

    if (paymentMethod === 'TRANSFER') {
      try {
        const toastId = toast.loading(language === 'VI' ? 'Đang khởi tạo thanh toán VNPay...' : 'Initializing VNPay...');
        
        sessionStorage.setItem('public_vnpay_booking_code', newBooking.bookingCode);

        const response = await fetch('/api/vnpay/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalPrice,
            orderDescription: `Thanh toan dat phong Horizon - ${newBooking.bookingCode}`,
            language: language === 'VI' ? 'vn' : 'en',
            returnUrl: `${window.location.origin}/vnpay_return`
          })
        });

        const data = await response.json();
        
        if (data.redirectUrl) {
          toast.dismiss(toastId);
          window.location.href = data.redirectUrl; 
        } else {
          toast.dismiss(toastId);
          toast.error(data.error || 'Lỗi khởi tạo URL thanh toán');
        }
      } catch (e) {
        toast.error('Có lỗi xảy ra khi kết nối VNPAY.');
      }
      return;
    }

    setCreatedBookingCode(newBooking.bookingCode);
    setQrPaymentStatus('PENDING');
    setBookingSuccess(true);
  };



  const handleSimulatePaymentSuccess = () => {
    if (!createdBookingCode) return;
    const targetBooking = db.getBookings().find(b => b.bookingCode === createdBookingCode);
    if (targetBooking) {
      db.updateBookingStatus(targetBooking.id, 'CONFIRMED');
      const idx = db.getBookings().findIndex(b => b.id === targetBooking.id);
      if (idx !== -1) {
        db.getBookings()[idx].paymentStatus = 'PAID';
        db.save();
      }
      setQrPaymentStatus('SUCCESS');
      toast.success(language === 'VI' 
        ? 'Thanh toán chuyển khoản thành công! Mã đặt phòng đã được xác nhận.' 
        : 'Bank transfer payment successful! Booking confirmed.');
    }
  };

  const handleCloseSuccess = () => {
    setBookingSuccess(false);
    setCheckoutModalOpen(false);
    setChecked(false);
    setSelectedRoom(null);
    resetBookingCart();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen font-dmsans overflow-hidden text-stone-200">
      <CustomCursor />
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#060608] via-[#0b0b10] to-[#0a0a0f] overflow-hidden">
        <GoldParticles />

        {/* Parallax Landscape Outline / Mist layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 fog-layer opacity-40 pointer-events-none" />

        {/* Floating dust canvas / CSS keyframe ambient light beam */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-navy-light/5 blur-[140px] pointer-events-none animate-pulse duration-[10000ms]" />

        {/* Central Content */}
        <div className="relative z-20 text-center max-w-4xl px-6 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="w-12 h-[1px] bg-gold/60" />
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-semibold">Horizon Grand Resort</span>
            <span className="w-12 h-[1px] bg-gold/60" />
          </motion.div>

          {/* Headline stagger reveal */}
          <motion.h1
            variants={sentence}
            initial="hidden"
            animate="visible"
            className="font-cormorant text-5xl md:text-7xl lg:text-8xl text-stone-100 tracking-wide font-normal mb-8 leading-[1.1] selection:bg-gold/40"
          >
            {language === 'VI' ? (
              <>
                <motion.span variants={letter}>N</motion.span>
                <motion.span variants={letter}>ơ</motion.span>
                <motion.span variants={letter}>i</motion.span>
                <span className="mx-2 md:mx-4" />
                <motion.span variants={letter} className="text-gold">T</motion.span>
                <motion.span variants={letter} className="text-gold">h</motion.span>
                <motion.span variants={letter} className="text-gold">ờ</motion.span>
                <motion.span variants={letter} className="text-gold">i</motion.span>
                <span className="mx-2 md:mx-4" />
                <motion.span variants={letter} className="text-gold">G</motion.span>
                <motion.span variants={letter} className="text-gold">i</motion.span>
                <motion.span variants={letter} className="text-gold">a</motion.span>
                <motion.span variants={letter} className="text-gold">n</motion.span>
                <span className="mx-2 md:mx-4" />
                <motion.span variants={letter}>Đ</motion.span>
                <motion.span variants={letter}>ứ</motion.span>
                <motion.span variants={letter}>n</motion.span>
                <motion.span variants={letter}>g</motion.span>
                <span className="mx-2" />
                <motion.span variants={letter}>L</motion.span>
                <motion.span variants={letter}>ạ</motion.span>
                <motion.span variants={letter}>i</motion.span>
              </>
            ) : (
              <>
                Where Time Stands Still
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-stone-300/80 text-base md:text-xl font-light tracking-wide max-w-2xl mb-12"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <a
              href="#booking-widget"
              className="px-8 py-4 text-xs font-semibold tracking-widest uppercase text-black bg-gold hover:bg-gold-light transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] hover:-translate-y-0.5"
            >
              {t.discoverNow}
            </a>
            <button
              onClick={() => setVideoModalOpen(true)}
              className="px-8 py-4 text-xs font-semibold tracking-widest uppercase text-stone-100 border border-stone-100/25 hover:border-gold hover:text-gold bg-transparent transition-all duration-300 animate-pulse-subtle"
            >
              {t.watchVideo}
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator bouncing chevron */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-[9px] tracking-[0.3em] uppercase text-gold">SCROLL</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-gold to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gold animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 py-10 bg-[#07070a] border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          <div className="flex flex-col gap-2">
            <span className="font-cormorant text-3xl md:text-5xl text-gold font-bold">120+</span>
            <span className="text-[10px] md:text-xs tracking-wider uppercase text-[#9a9080]">{t.statsRooms}</span>
          </div>
          <div className="flex flex-col gap-2 border-l border-gold/10">
            <span className="font-cormorant text-3xl md:text-5xl text-gold font-bold">15+</span>
            <span className="text-[10px] md:text-xs tracking-wider uppercase text-[#9a9080]">{t.statsExp}</span>
          </div>
          <div className="flex flex-col gap-2 border-l border-gold/10">
            <span className="font-cormorant text-3xl md:text-5xl text-gold font-bold">50,000+</span>
            <span className="text-[10px] md:text-xs tracking-wider uppercase text-[#9a9080]">{t.statsGuests}</span>
          </div>
          <div className="flex flex-col gap-2 border-l border-gold/10">
            <span className="font-cormorant text-3xl md:text-5xl text-gold font-bold">4.9★</span>
            <span className="text-[10px] md:text-xs tracking-wider uppercase text-[#9a9080]">{t.statsRating}</span>
          </div>
        </div>
      </section>

      {/* Main Booking Widget Section */}
      <section id="booking-widget" className="relative z-20 py-24 bg-[#0a0a0f] px-6">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="font-cormorant text-3xl md:text-5xl text-stone-100 tracking-wide font-normal mb-3">
              {t.bookingTitle}
            </h2>
            <div className="w-16 h-[1px] bg-gold mx-auto" />
          </div>

          {/* Glassmorphism Panel */}
          <div className="bg-[#111118]/60 backdrop-blur-md border border-gold/15 p-6 md:p-8 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Check-In */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider text-gold flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {t.checkIn}
                </label>
                <input
                  type="date"
                  value={bookingCart.checkInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingCart({ checkInDate: e.target.value })}
                  className="w-full bg-black/40 border border-gold/20 focus:border-gold py-3 px-4 rounded-lg text-stone-100 outline-none transition-colors"
                />
              </div>

              {/* Check-Out */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider text-gold flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {t.checkOut}
                </label>
                <input
                  type="date"
                  value={bookingCart.checkOutDate}
                  min={bookingCart.checkInDate}
                  onChange={(e) => setBookingCart({ checkOutDate: e.target.value })}
                  className="w-full bg-black/40 border border-gold/20 focus:border-gold py-3 px-4 rounded-lg text-stone-100 outline-none transition-colors"
                />
              </div>

              {/* Hạng phòng */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider text-gold flex items-center gap-1.5 font-semibold">
                  <Waves className="w-3.5 h-3.5" />
                  {t.roomType}
                </label>
                <div className="relative">
                  <select
                    value={bookingCart.roomTypeId}
                    onChange={(e) => setBookingCart({ roomTypeId: e.target.value })}
                    className="w-full appearance-none bg-black/40 border border-gold/20 focus:border-gold py-3 px-4 pr-10 rounded-lg text-stone-100 outline-none transition-colors"
                  >
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id} className="bg-[#111118] text-stone-200">
                        {type.name} - từ {type.basePrice.toLocaleString('vi-VN')}đ
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gold/75 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Adults Stepper */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider text-gold flex items-center gap-1.5 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  {t.adults}
                </label>
                <div className="flex items-center justify-between bg-black/40 border border-gold/20 py-2 px-4 rounded-lg">
                  <button
                    onClick={() => setBookingCart({ numberOfAdults: Math.max(1, bookingCart.numberOfAdults - 1) })}
                    className="p-1 rounded bg-white/5 hover:bg-gold hover:text-black transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-stone-200 font-semibold">{bookingCart.numberOfAdults}</span>
                  <button
                    onClick={() => setBookingCart({ numberOfAdults: Math.min(6, bookingCart.numberOfAdults + 1) })}
                    className="p-1 rounded bg-white/5 hover:bg-gold hover:text-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Children Stepper */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider text-gold flex items-center gap-1.5 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  {t.children}
                </label>
                <div className="flex items-center justify-between bg-black/40 border border-gold/20 py-2 px-4 rounded-lg">
                  <button
                    onClick={() => setBookingCart({ numberOfChildren: Math.max(0, bookingCart.numberOfChildren - 1) })}
                    className="p-1 rounded bg-white/5 hover:bg-gold hover:text-black transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-stone-200 font-semibold">{bookingCart.numberOfChildren}</span>
                  <button
                    onClick={() => setBookingCart({ numberOfChildren: Math.min(6, bookingCart.numberOfChildren + 1) })}
                    className="p-1 rounded bg-white/5 hover:bg-gold hover:text-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider text-gold flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.promoCode}
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: WELCOME5"
                  value={bookingCart.promoCode}
                  onChange={(e) => setBookingCart({ promoCode: e.target.value.toUpperCase() })}
                  className="w-full bg-black/40 border border-gold/20 focus:border-gold py-3 px-4 rounded-lg text-stone-100 outline-none transition-colors uppercase"
                />
                {promoError && <p className="text-[10px] text-red-500 font-medium">{promoError}</p>}
              </div>

            </div>

            {/* Price breakdown summary */}
            <div className="mt-8 border-t border-gold/15 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-1.5 text-sm text-stone-300/80">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold/80">
                  <Info className="w-3.5 h-3.5" />
                  {t.priceDetail} ({nights} {t.nights})
                </p>
                <div className="grid grid-cols-2 gap-x-6 text-xs gap-y-1">
                  <span>{t.roomPrice}:</span>
                  <span className="text-right font-medium">{roomPriceSubtotal.toLocaleString('vi-VN')}đ</span>
                  <span>{t.vat}:</span>
                  <span className="text-right font-medium">{vatAmount.toLocaleString('vi-VN')}đ</span>
                  <span>{t.svcCharge}:</span>
                  <span className="text-right font-medium">{serviceCharge.toLocaleString('vi-VN')}đ</span>
                  {bookingCart.discountAmount > 0 && (
                    <>
                      <span className="text-amber-500 font-medium">{t.discount}:</span>
                      <span className="text-right text-amber-500 font-semibold">-{bookingCart.discountAmount.toLocaleString('vi-VN')}đ</span>
                    </>
                  )}
                </div>
                <div className="h-[1px] bg-gold/10 my-1" />
                <div className="flex items-center gap-2">
                  <span className="text-stone-300 font-semibold uppercase text-xs">{t.totalAmount}:</span>
                  <span className="text-xl md:text-2xl text-gold font-bold">{finalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Main Checker Trigger */}
              <button
                onClick={handleCheckAvailability}
                disabled={checking}
                className="w-full md:w-auto px-8 py-4 bg-gold text-black font-semibold text-xs tracking-widest uppercase hover:bg-gold-light hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all duration-300 rounded-lg flex items-center justify-center gap-2 self-stretch md:self-auto cursor-pointer"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.checkingText}</span>
                  </>
                ) : (
                  <span>{t.checkAvailability}</span>
                )}
              </button>
            </div>
          </div>

          {/* Availability Results */}
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-10 overflow-hidden"
              >
                {availableRooms.length > 0 ? (
                  <div className="bg-[#111118]/80 border border-gold/10 p-6 rounded-xl">
                    <h3 className="text-sm font-semibold tracking-wider uppercase text-gold mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4.5 h-4.5 text-green-500" />
                      {t.availableRoomsTitle}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {availableRooms.map((room) => {
                        let roomImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300';
                        if (room.roomTypeId === 'rt-deluxe') {
                          roomImg = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=300';
                        } else if (room.roomTypeId === 'rt-ocean') {
                          roomImg = 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=300';
                        } else if (room.roomTypeId === 'rt-penthouse') {
                          roomImg = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=300';
                        }

                        return (
                          <div
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex gap-4 items-center ${selectedRoom?.id === room.id
                                ? 'bg-gold/10 border-gold shadow-[0_0_15px_rgba(201,168,76,0.15)]'
                                : 'bg-black/30 border-white/5 hover:border-gold/45'
                              }`}
                          >
                            <div className="w-20 h-14 rounded-md overflow-hidden bg-slate-800 shrink-0 relative border border-white/5">
                              <img
                                src={roomImg}
                                alt={`Phòng ${room.roomNumber}`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 flex justify-between items-center min-w-0">
                              <div className="min-w-0">
                                <p className="text-stone-100 font-bold text-sm">Phòng {room.roomNumber}</p>
                                <p className="text-[11px] text-stone-400 mt-0.5 truncate font-medium">Tầng {room.floor} • {selectedType.name}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {selectedRoom?.id === room.id ? (
                                  <span className="px-2.5 py-1 bg-gold text-black rounded text-[9px] font-bold tracking-wider uppercase flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                    {t.selectedRoomText}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-white/5 text-stone-300 rounded text-[9px] font-semibold tracking-wider uppercase hover:bg-gold hover:text-black transition-colors">
                                    {t.selectRoomBtn}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleOpenCheckout}
                      className="w-full py-4 bg-gold hover:bg-gold-light text-black font-bold uppercase text-xs tracking-widest transition-all rounded-lg flex items-center justify-center gap-2"
                    >
                      <span>{t.bookConfirmBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center">
                    <p className="text-red-400 text-sm font-medium">{t.noRoomsAvailable}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* Room Categories Section */}
      <section id="rooms" className="relative z-20 py-24 bg-[#0d0d13]">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.35em] text-gold font-semibold block mb-3">Chỗ ở Thượng hạng</span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-stone-100 tracking-wide font-normal mb-3">
              Không Gian Của Bạn
            </h2>
            <div className="w-20 h-[1px] bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Card 1: Deluxe Suite */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#111118] border border-gold/10 rounded-2xl overflow-hidden group hover:border-gold/40 hover:shadow-[0_15px_30px_rgba(201,168,76,0.1)] transition-all duration-500"
            >
              {/* CSS Art Image Placeholder */}
              <div className="relative h-64 bg-gradient-to-br from-[#1c274a] to-[#0a0a0f] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: 'url("/rooms/deluxe-bg.png")' }} />
                <div className="absolute inset-0 bg-black/20" />
                <span className="font-cormorant text-2xl text-gold/80 italic font-semibold z-10">Deluxe Suite</span>
                {/* Gold Shimmer effect on hover */}
                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-25 group-hover:left-200% transition-all duration-1000" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="font-cormorant text-2xl text-stone-100 font-semibold">Deluxe Suite</h3>
                  <span className="text-gold font-bold">2,500,000đ<span className="text-stone-400 text-xs font-light">/đêm</span></span>
                </div>
                <p className="text-xs text-[#9a9080] leading-relaxed mb-6">
                  Không gian 42m² hướng vườn yên tĩnh, trang bị bồn tắm nằm cao cấp và ban công ngắm hoàng hôn.
                </p>
                <div className="flex items-center gap-4 text-[10px] text-stone-400 border-t border-white/5 pt-4 mb-6">
                  <span>Diện tích: 42m²</span>
                  <span>Sức chứa: 2 người</span>
                  <span>View: Hướng sân vườn</span>
                </div>
                <a
                  href="#booking-widget"
                  onClick={() => setBookingCart({ roomTypeId: 'rt-deluxe' })}
                  className="w-full py-3 block text-center text-xs tracking-widest uppercase font-semibold text-gold border border-gold/40 hover:border-gold hover:bg-gold hover:text-black transition-all rounded"
                >
                  Đặt Hạng Phòng Này
                </a>
              </div>
            </motion.div>

            {/* Card 2: Executive Ocean View */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#111118] border border-gold/10 rounded-2xl overflow-hidden group hover:border-gold/40 hover:shadow-[0_15px_30px_rgba(201,168,76,0.1)] transition-all duration-500"
            >
              {/* CSS Art Image Placeholder */}
              <div className="relative h-64 bg-gradient-to-br from-[#123049] to-[#0a0a0f] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: 'url("/rooms/ocean-bg.png")' }} />
                <div className="absolute inset-0 bg-black/20" />
                <span className="font-cormorant text-2xl text-gold/80 italic font-semibold z-10">Ocean View Suite</span>
                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-25 group-hover:left-200% transition-all duration-1000" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="font-cormorant text-2xl text-stone-100 font-semibold">Executive Ocean View</h3>
                  <span className="text-gold font-bold">3,500,000đ<span className="text-stone-400 text-xs font-light">/đêm</span></span>
                </div>
                <p className="text-xs text-[#9a9080] leading-relaxed mb-6">
                  Tầm nhìn ôm trọn bờ biển Phú Quốc hoang sơ rộng lớn. Tận hưởng trà chiều miễn phí và dịch vụ đưa đón.
                </p>
                <div className="flex items-center gap-4 text-[10px] text-stone-400 border-t border-white/5 pt-4 mb-6">
                  <span>Diện tích: 56m²</span>
                  <span>Sức chứa: 2 người</span>
                  <span>View: Hướng biển trực diện</span>
                </div>
                <a
                  href="#booking-widget"
                  onClick={() => setBookingCart({ roomTypeId: 'rt-ocean' })}
                  className="w-full py-3 block text-center text-xs tracking-widest uppercase font-semibold text-gold border border-gold/40 hover:border-gold hover:bg-gold hover:text-black transition-all rounded"
                >
                  Đặt Hạng Phòng Này
                </a>
              </div>
            </motion.div>

            {/* Card 3: Presidential Penthouse */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#111118] border border-gold/10 rounded-2xl overflow-hidden group hover:border-gold/40 hover:shadow-[0_15px_30px_rgba(201,168,76,0.1)] transition-all duration-500"
            >
              {/* CSS Art Image Placeholder */}
              <div className="relative h-64 bg-gradient-to-br from-[#2f193a] to-[#0a0a0f] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: 'url("/rooms/penthouse-bg.png")' }} />
                <div className="absolute inset-0 bg-black/20" />
                <span className="font-cormorant text-2xl text-gold/80 italic font-semibold z-10">Presidential Penthouse</span>
                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-25 group-hover:left-200% transition-all duration-1000" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="font-cormorant text-2xl text-stone-100 font-semibold">Presidential Penthouse</h3>
                  <span className="text-gold font-bold">12,000,000đ<span className="text-stone-400 text-xs font-light">/đêm</span></span>
                </div>
                <p className="text-xs text-[#9a9080] leading-relaxed mb-6">
                  Căn hộ áp mái thượng hạng 250m² với bể bơi vô cực ngoài ban công, phòng xông hơi riêng và quản gia 24/7.
                </p>
                <div className="flex items-center gap-4 text-[10px] text-stone-400 border-t border-white/5 pt-4 mb-6">
                  <span>Diện tích: 250m²</span>
                  <span>Sức chứa: 4 người</span>
                  <span>View: Toàn cảnh đại dương</span>
                </div>
                <a
                  href="#booking-widget"
                  onClick={() => setBookingCart({ roomTypeId: 'rt-penthouse' })}
                  className="w-full py-3 block text-center text-xs tracking-widest uppercase font-semibold text-gold border border-gold/40 hover:border-gold hover:bg-gold hover:text-black transition-all rounded"
                >
                  Đặt Hạng Phòng Này
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="relative z-20 py-24 bg-[#0a0a0f] border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.35em] text-gold font-semibold block mb-3">Dịch vụ & Trải nghiệm</span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-stone-100 tracking-wide font-normal mb-3">
              Tiện Nghi Đẳng Cấp
            </h2>
            <div className="w-20 h-[1px] bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <div className="p-8 bg-[#111118] border border-gold/5 rounded-xl hover:border-gold/20 transition-all flex gap-5 group">
              <div className="p-3 bg-gold/10 text-gold rounded-lg group-hover:bg-gold group-hover:text-black transition-all h-fit shrink-0">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl text-stone-200 mb-2 font-semibold">Bể Bơi Vô Cực</h3>
                <p className="text-xs text-[#9a9080] leading-relaxed">
                  Ngâm mình trong dòng nước ấm ngắm hoàng hôn buông xuống mặt biển rộng lớn.
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#111118] border border-gold/5 rounded-xl hover:border-gold/20 transition-all flex gap-5 group">
              <div className="p-3 bg-gold/10 text-gold rounded-lg group-hover:bg-gold group-hover:text-black transition-all h-fit shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl text-stone-200 mb-2 font-semibold">Horizon Spa & Wellness</h3>
                <p className="text-xs text-[#9a9080] leading-relaxed">
                  Các liệu pháp massage đá nóng và xông hơi thảo dược giúp tái tạo năng lượng thể xác và tinh thần.
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#111118] border border-gold/5 rounded-xl hover:border-gold/20 transition-all flex gap-5 group">
              <div className="p-3 bg-gold/10 text-gold rounded-lg group-hover:bg-gold group-hover:text-black transition-all h-fit shrink-0">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl text-stone-200 mb-2 font-semibold">Ẩm Thực Fine Dining</h3>
                <p className="text-xs text-[#9a9080] leading-relaxed">
                  Trải nghiệm ẩm thực thượng hạng từ các đầu bếp 3 sao Michelin lừng danh thế giới.
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#111118] border border-gold/5 rounded-xl hover:border-gold/20 transition-all flex gap-5 group">
              <div className="p-3 bg-gold/10 text-gold rounded-lg group-hover:bg-gold group-hover:text-black transition-all h-fit shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl text-stone-200 mb-2 font-semibold">Trung Tâm Thể Hình</h3>
                <p className="text-xs text-[#9a9080] leading-relaxed">
                  Trang thiết bị luyện tập hiện đại đạt tiêu chuẩn Olympic giúp nâng cao sức khỏe mỗi ngày.
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#111118] border border-gold/5 rounded-xl hover:border-gold/20 transition-all flex gap-5 group">
              <div className="p-3 bg-gold/10 text-gold rounded-lg group-hover:bg-gold group-hover:text-black transition-all h-fit shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl text-stone-200 mb-2 font-semibold">Đưa Đón Sân Bay</h3>
                <p className="text-xs text-[#9a9080] leading-relaxed">
                  Dịch vụ đón tiễn sân bay bằng chuyên cơ limousine hạng sang đón tiếp nồng hậu.
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#111118] border border-gold/5 rounded-xl hover:border-gold/20 transition-all flex gap-5 group">
              <div className="p-3 bg-gold/10 text-gold rounded-lg group-hover:bg-gold group-hover:text-black transition-all h-fit shrink-0">
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl text-stone-200 mb-2 font-semibold">Khu Vườn Nhiệt Đới</h3>
                <p className="text-xs text-[#9a9080] leading-relaxed">
                  Tản bộ dưới bóng dừa rợp mát bên đường dạo ven biển tuyệt đẹp ngập tràn bóng hoa.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Section with Quotes */}
      <section id="about" className="relative z-20 py-24 bg-[#07070a]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Text */}
          <div className="flex flex-col gap-6">
            <span className="text-xs uppercase tracking-[0.35em] text-gold font-semibold">Giới Thiệu Resort</span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-stone-100 tracking-wide font-normal leading-tight">
              Tuyệt tác thiên nhiên &<br />Kiến trúc đẳng cấp
            </h2>
            <div className="w-16 h-[1px] bg-gold my-2" />
            <p className="text-sm text-[#9a9080] leading-relaxed font-light">
              Tọa lạc tại vị trí đắc địa nhất bên bờ cát mịn của Bãi Trường, Phú Quốc, Horizon Grand Resort được kiến tạo như một vương quốc biệt lập nâng niu từng giác quan của bạn.
            </p>
            <p className="text-sm text-[#9a9080] leading-relaxed font-light">
              Thiết kế của chúng tôi tôn vinh sự tối giản đương đại kết hợp tinh tế cùng văn hóa bản địa mộc mạc, tạo nên một không gian mở khoáng đạt, đón trọn gió biển và ánh nắng ấm.
            </p>

            {/* Quote Block */}
            <div className="border-l-2 border-gold pl-5 py-2 my-4 bg-gold/5 italic text-sm text-stone-300 font-light leading-relaxed">
              &ldquo;Mỗi khoảnh khắc tại Horizon là một ký ức không thể quên, nơi thời gian ngưng lại nhường chỗ cho sự bình yên tĩnh tại lan tỏa.&rdquo;
            </div>

            <a
              href="#booking-widget"
              className="text-xs font-bold tracking-widest text-gold uppercase flex items-center gap-2 group hover:text-gold-light transition-all w-fit mt-4"
            >
              Đặt phòng trải nghiệm ngay
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Right Visual CSS Art Landscape */}
          <div className="relative h-[480px] bg-gradient-to-br from-[#121c33] to-[#0a0a0f] rounded-2xl border border-gold/15 overflow-hidden flex items-center justify-center group">
            {/* Ambient gold spotlight behind */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gold/10 blur-[80px] pointer-events-none" />

            {/* Silhouette landscape representational art */}
            <div className="absolute inset-0 opacity-85 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("/resort-landscape.png")' }} />
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 text-center p-8 border border-gold/20 backdrop-blur-md bg-black/50 rounded-xl max-w-sm flex flex-col items-center gap-3 shadow-2xl">
              <Award className="w-10 h-10 text-gold animate-pulse" />
              <h3 className="font-cormorant text-xl text-stone-250 font-semibold tracking-wider">World Luxury Hotel Awards</h3>
              <p className="text-[10px] text-gold/80 tracking-widest uppercase font-semibold">Best Luxury Beach Resort 2025</p>
            </div>

            {/* Pure CSS Geometric pattern */}
            <div className="absolute bottom-6 right-6 w-20 h-20 opacity-30 border-r border-b border-gold" />
            <div className="absolute top-6 left-6 w-20 h-20 opacity-30 border-l border-t border-gold" />
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-20 py-24 bg-[#0a0a0f] border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.35em] text-gold font-semibold block mb-3">Đánh giá thực tế</span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-stone-100 tracking-wide font-normal mb-3">
              Khách Hàng Nói Về Chúng Tôi
            </h2>
            <div className="w-20 h-[1px] bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Review 1 */}
            <div className="p-8 bg-[#111118]/60 backdrop-blur-sm border border-gold/10 rounded-2xl flex flex-col gap-5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-xs text-[#9a9080] leading-relaxed italic">
                &ldquo;Trải nghiệm tuyệt vời chưa từng có. Phòng President Suite quá đẳng cấp, quản gia riêng chăm sóc chu đáo từng chi tiết nhỏ nhất. Nhất định sẽ quay lại!&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-auto">
                <span className="text-xl">🇻🇳</span>
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">Trần Đức Anh</h4>
                  <p className="text-[10px] text-stone-400">Khách du lịch tự túc • Tháng 05/2026</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-8 bg-[#111118]/60 backdrop-blur-sm border border-gold/10 rounded-2xl flex flex-col gap-5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-xs text-[#9a9080] leading-relaxed italic">
                &ldquo;A wonderful romantic getaway! The Honeymoon Villa is incredibly private. We loved the floating jacuzzi breakfast and the Michelin restaurant.&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-auto">
                <span className="text-xl">🇬🇧</span>
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">Emma Watson</h4>
                  <p className="text-[10px] text-stone-400">Couple vacation • May 2026</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-8 bg-[#111118]/60 backdrop-blur-sm border border-gold/10 rounded-2xl flex flex-col gap-5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-xs text-[#9a9080] leading-relaxed italic">
                &ldquo;Khách sạn có dịch vụ giặt là nhanh và spa đá nóng tuyệt cú mèo. Ẩm thực ăn sáng buffet rất phong phú các món Việt Nam truyền thống và phương Tây.&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-auto">
                <span className="text-xl">🇻🇳</span>
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">Phạm Mai Phương</h4>
                  <p className="text-[10px] text-stone-400">Gia đình 4 người • Tháng 04/2026</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Gallery Teaser */}
      <section className="relative z-20 py-24 bg-[#0d0d13]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.35em] text-gold font-semibold block mb-2">Khoảnh khắc đáng nhớ</span>
              <h2 className="font-cormorant text-3xl md:text-5xl text-stone-100 tracking-wide font-normal">
                Thư Viện Ảnh Horizon
              </h2>
            </div>
          </div>

          {/* Masonry CSS Art placeholders grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 h-[400px]">
            <div className="bg-gradient-to-br from-[#1b1c24] to-[#07070a] border border-gold/10 hover:border-gold/40 rounded-xl overflow-hidden relative group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: 'url("/gallery/sunset.png")' }} />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-gold uppercase tracking-wider font-semibold">Sunset Beach</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#12283a] to-[#07070a] border border-gold/10 hover:border-gold/40 rounded-xl overflow-hidden relative group hover:scale-[1.02] transition-all duration-300 lg:col-span-2">
              <div className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: 'url("/gallery/pool.png")' }} />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-gold uppercase tracking-wider font-semibold">Infinity Pool Side</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#2b1928] to-[#07070a] border border-gold/10 hover:border-gold/40 rounded-xl overflow-hidden relative group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: 'url("/gallery/bathroom.png")' }} />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-gold uppercase tracking-wider font-semibold">Luxury Bathroom</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section with Mock Map */}
      <section id="contact" className="relative z-20 py-24 bg-[#0a0a0f] border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Info */}
          <div className="flex flex-col gap-6">
            <span className="text-xs uppercase tracking-[0.35em] text-gold font-semibold">Liên Hệ</span>
            <h2 className="font-cormorant text-3xl md:text-5xl text-stone-100 tracking-wide font-normal">
              Kết Nối Cùng Horizon
            </h2>
            <div className="w-16 h-[1px] bg-gold my-1" />
            <p className="text-sm text-[#9a9080] leading-relaxed font-light">
              Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp và giải đáp mọi thắc mắc của bạn về dịch vụ đặt phòng cũng như các chương trình ưu đãi đặc biệt.
            </p>

            <div className="flex flex-col gap-5 mt-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">Địa chỉ / Address</h4>
                  <p className="text-xs text-stone-400 mt-1">Trường KD và CN Hà Nội, 29A Ngõ 124 Phố Vĩnh Tuy, Vĩnh Hưng, Hà Nội, Việt Nam</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">Điện thoại / Hotline</h4>
                  <a href="tel:0399078931" className="text-xs text-stone-400 hover:text-gold transition-colors mt-1 block">0399 078 931</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">Email hỗ trợ</h4>
                  <a href="mailto:MTP@MTP.vn" className="text-xs text-stone-400 hover:text-gold transition-colors mt-1 block">MTP@MTP.vn</a>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Map */}
          <div className="relative h-80 lg:h-full min-h-[300px] bg-gradient-to-br from-[#121c29] to-[#07070a] border border-gold/15 rounded-2xl overflow-hidden flex items-center justify-center p-6 text-center">
            {/* Grid Pattern background */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#c9a84c 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 max-w-sm flex flex-col items-center gap-3 bg-black/60 p-6 rounded-xl border border-gold/15 backdrop-blur-md">
              <MapPin className="w-8 h-8 text-gold animate-bounce" />
              <h3 className="text-stone-200 font-bold text-sm">Bản Đồ Chỉ Đường</h3>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Tọa lạc tại khu vực Vĩnh Tuy, quận Hai Bà Trưng, Hà Nội, thuận tiện kết nối và di chuyển trong trung tâm thủ đô.
              </p>
              <button
                onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng%20KD%20v%C3%A0%20CN%20H%C3%A0%20N%E1%BB%99i,%2029A%20Ng%C3%B5%20124%20Ph%E1%BB%91%20V%C4%A9nh%20Tuy,%20V%C4%A9nh%20H%C6%B0ng,%20H%C3%A0%20N%E1%BB%99i', '_blank')}
                className="mt-2 text-[10px] tracking-widest font-semibold uppercase text-gold hover:text-gold-light border-b border-gold hover:border-gold-light pb-1 transition-all"
              >
                Mở Google Maps
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Floating consult chat bubble (Zalo/Hotline) */}
      <a
        href="tel:0399078931"
        className="fixed z-50 p-4 rounded-full bg-gold hover:bg-gold-light text-black shadow-lg cursor-pointer right-6 bottom-6 flex items-center justify-center group"
        title="Gọi điện tư vấn trực tiếp"
      >
        <Phone className="w-5 h-5 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-xs font-bold tracking-wider uppercase pl-0 group-hover:pl-2">
          Hotline
        </span>
      </a>

      {/* Footer component */}
      <Footer />

      {/* VIDEO TOUR MODAL OVERLAY */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 bg-[#111118] border border-gold/20 w-full max-w-4xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(201,168,76,0.3)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gold/15 bg-black/40">
                <span className="font-cormorant text-base text-gold font-bold tracking-wider uppercase">Horizon Grand Resort - Video Tour</span>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="p-1.5 text-[#a89d8d] hover:text-gold hover:bg-gold/10 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black">
                <video
                  src="/resort-video.mp4"
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT MODAL OVERLAY */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => !bookingSuccess && setCheckoutModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 bg-[#111118] border border-gold/20 w-full max-w-xl rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >

              {!bookingSuccess ? (
                <>
                  <h3 className="font-cormorant text-2xl md:text-3xl text-gold font-semibold mb-2">
                    {t.modalTitle}
                  </h3>
                  <p className="text-xs text-stone-400 mb-6">{t.modalSubtitle}</p>

                  {/* Summary Card */}
                  <div className="bg-black/40 border border-gold/10 rounded-xl mb-6 overflow-hidden">
                    {/* Room Category Image Banner */}
                    <div className="h-40 relative bg-slate-900 overflow-hidden">
                      <img
                        src={
                          selectedRoom?.roomTypeId === 'rt-deluxe'
                            ? 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600'
                            : selectedRoom?.roomTypeId === 'rt-ocean'
                              ? 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=600'
                              : selectedRoom?.roomTypeId === 'rt-penthouse'
                                ? 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600'
                                : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600'
                        }
                        alt={selectedType.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <span className="px-2 py-0.5 bg-gold text-black rounded text-[9px] font-extrabold tracking-wider uppercase">
                          {selectedRoom?.roomNumber ? `Phòng ${selectedRoom.roomNumber}` : 'Chưa chọn phòng'}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{selectedType.name}</h4>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-gold">
                        <Sparkles className="w-3.5 h-3.5" />
                        Tóm tắt đặt phòng / Booking Itinerary
                      </p>
                      <div className="grid grid-cols-2 text-xs gap-y-2 text-stone-400 font-medium">
                        <span>Hạng phòng / Category:</span>
                        <span className="text-right text-stone-200 font-semibold">{selectedType.name}</span>
                        <span>Mã số phòng / Room Number:</span>
                        <span className="text-right text-stone-200 font-bold">Phòng {selectedRoom?.roomNumber}</span>
                        <span>Thời gian / Duration:</span>
                        <span className="text-right text-stone-200">{bookingCart.checkInDate} &rarr; {bookingCart.checkOutDate} ({nights} {t.nights})</span>
                        <span>Số lượng khách / Guests:</span>
                        <span className="text-right text-stone-200">{bookingCart.numberOfAdults} người lớn, {bookingCart.numberOfChildren} trẻ em</span>
                        <div className="col-span-2 border-t border-white/5 my-1" />
                        <span className="text-gold font-medium">TỔNG TIỀN / TOTAL:</span>
                        <span className="text-right text-gold font-bold text-sm">{finalPrice.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleConfirmBooking} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-gold font-semibold">
                        {t.fullName} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn An"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className={`w-full bg-black/40 border ${formErrors.name ? 'border-red-500' : 'border-gold/20'} focus:border-gold py-2.5 px-4 rounded-lg text-stone-200 outline-none transition-colors text-xs`}
                      />
                      {formErrors.name && <p className="text-[10px] text-red-500 font-medium">{formErrors.name}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-gold font-semibold">
                        {t.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0901234567"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className={`w-full bg-black/40 border ${formErrors.phone ? 'border-red-500' : 'border-gold/20'} focus:border-gold py-2.5 px-4 rounded-lg text-stone-200 outline-none transition-colors text-xs`}
                      />
                      {formErrors.phone && <p className="text-[10px] text-red-500 font-medium">{formErrors.phone}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-gold font-semibold">
                        {t.email}
                      </label>
                      <input
                        type="email"
                        placeholder="an.nguyen@gmail.com"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="w-full bg-black/40 border border-gold/20 focus:border-gold py-2.5 px-4 rounded-lg text-stone-200 outline-none transition-colors text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-gold font-semibold">
                        {t.requests}
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Thêm ghi chú nếu có..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full bg-black/40 border border-gold/20 focus:border-gold py-2.5 px-4 rounded-lg text-stone-200 outline-none transition-colors text-xs resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-wider text-gold font-semibold">
                        {t.payMethod}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('TRANSFER')}
                          className={`p-3 rounded-lg border text-center transition-all ${paymentMethod === 'TRANSFER'
                              ? 'bg-gold/15 border-gold text-gold font-semibold'
                              : 'bg-black/35 border-white/5 text-stone-400 hover:border-gold/30'
                            }`}
                        >
                          <span className="text-[10px] block uppercase tracking-wider">{t.payTransfer}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CARD')}
                          className={`p-3 rounded-lg border text-center transition-all ${paymentMethod === 'CARD'
                              ? 'bg-gold/15 border-gold text-gold font-semibold'
                              : 'bg-black/35 border-white/5 text-stone-400 hover:border-gold/30'
                            }`}
                        >
                          <span className="text-[10px] block uppercase tracking-wider">{t.payCard}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CASH')}
                          className={`p-3 rounded-lg border text-center transition-all ${paymentMethod === 'CASH'
                              ? 'bg-gold/15 border-gold text-gold font-semibold'
                              : 'bg-black/35 border-white/5 text-stone-400 hover:border-gold/30'
                            }`}
                        >
                          <span className="text-[10px] block uppercase tracking-wider">{t.payCash}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gold hover:bg-gold-light text-black font-bold uppercase text-xs tracking-widest transition-all rounded-lg mt-4 cursor-pointer"
                    >
                      {t.confirmBookingBtn}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 flex flex-col items-center max-w-md mx-auto">
                  {/* Confetti simulation (glowing gold icon) */}
                  <div className="p-3 bg-gold/10 text-gold rounded-full w-fit mb-4 border border-gold/25">
                    <Sparkles className="w-10 h-10" />
                  </div>

                  <h3 className="font-cormorant text-2xl text-gold font-bold mb-1.5">
                    {t.successTitle}
                  </h3>
                  <p className="text-[11px] text-stone-300 mb-4 px-4 leading-relaxed">
                    {t.successDesc}
                  </p>

                  <div className="w-full bg-black/50 border border-gold/20 p-3 rounded-xl mb-4 select-all">
                    <p className="text-[9px] uppercase tracking-widest text-[#9a9080] mb-0.5">{t.successSubtitle}</p>
                    <p className="text-xl font-bold text-gold tracking-widest font-mono">{createdBookingCode}</p>
                  </div>

                  {paymentMethod === 'TRANSFER' && (
                    <div className="w-full bg-[#111118]/90 border border-gold/15 p-4 rounded-xl mb-6 flex flex-col items-center gap-3">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Thanh Toán Chuyển Khoản VietQR</h4>
                      
                      <div className="relative w-64 h-80 bg-white p-2.5 rounded-lg border-2 border-gold/30 shadow-2xl">
                        <img
                          src={`https://img.vietqr.io/image/mbbank-0399078931-print.png?amount=${finalPrice}&addInfo=HORIZON%20${createdBookingCode}&accountName=CONG%20TY%20HORIZON%20MTP`}
                          alt="VietQR Code"
                          className="w-full h-full object-contain"
                        />
                        {qrPaymentStatus === 'SUCCESS' && (
                          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-3 animate-in fade-in duration-300">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Đã Thanh Toán</span>
                          </div>
                        )}
                      </div>

                      <div className="w-full text-left bg-black/40 p-3 rounded-lg text-[10px] text-stone-400 flex flex-col gap-1.5 border border-white/5">
                        <div>Ngân hàng: <strong className="text-stone-200">MBBank (Ngân hàng Quân Đội)</strong></div>
                        <div>Số tài khoản: <strong className="text-stone-200">0399078931</strong></div>
                        <div>Tên tài khoản: <strong className="text-stone-200">CONG TY HORIZON MTP</strong></div>
                        <div>Số tiền: <strong className="text-gold font-bold">{finalPrice.toLocaleString('vi-VN')}đ</strong></div>
                        <div>Nội dung CK: <strong className="text-gold font-mono font-bold">HORIZON {createdBookingCode}</strong></div>
                      </div>

                      <div className="w-full flex flex-col items-center gap-2 border-t border-white/5 pt-3">
                        {qrPaymentStatus === 'PENDING' ? (
                          <>
                            <div className="flex items-center gap-2 text-[10px] text-stone-350 mb-1">
                              <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Vui lòng quét mã trên bằng ứng dụng Ngân hàng để thanh toán, sau đó nhấn xác nhận bên dưới:</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleSimulatePaymentSuccess}
                              className="w-full py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors shadow-md text-center"
                            >
                              Tôi đã chuyển khoản thành công
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>Giao dịch thành công! Trạng thái: CONFIRMED</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCloseSuccess}
                    className="px-8 py-3 bg-gold hover:bg-gold-light text-black font-bold uppercase text-xs tracking-widest transition-all rounded-lg cursor-pointer"
                  >
                    {t.successBtn}
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
