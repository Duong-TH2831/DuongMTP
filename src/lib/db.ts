// Database connection client and Mock DB layer for Horizon HMS

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';
export type RoomStatus = 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING';
export type CustomerMemberType = 'REGULAR' | 'VIP' | 'FREQUENT';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'VNPAY';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type StayStatus = 'STAYING' | 'CHECKED_OUT' | 'EARLY_CHECKOUT';
export type CouponDiscountType = 'PERCENT' | 'FIXED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  password?: string;
  createdAt: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string[];
  images: string[];
  createdAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  status: RoomStatus;
  description?: string;
  images: string[];
  lastCleaned?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  cccd: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatar?: string;
  memberType: CustomerMemberType;
  isActive: boolean;
  joinDate: string;
  totalStays: number;
  totalSpent: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfAdults: number;
  numberOfChildren: number;
  status: BookingStatus;
  totalPrice: number;
  depositAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
}

export interface ExtraServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  amount: number;
}

export interface StayRecord {
  id: string;
  stayCode: string;
  bookingId: string;
  customerId: string;
  roomId: string;
  actualCheckIn: string;
  actualCheckOut?: string;
  status: StayStatus;
  extraServices: ExtraServiceItem[];
  totalCharged: number;
  staffId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  stayId: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  subTotal: number;
  vat: number; // e.g. 10 (%)
  discount: number;
  totalAmount: number;
  isPaid: boolean;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdById: string;
}

export interface ExtraService {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxUsage: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  customerId: string;
  roomId: string;
  stayId: string;
  rating: number;
  comment?: string;
  adminReply?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // info, warning, success, booking
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  views: number;
  isPublished: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// SEED MOCK DATA GENERATOR
// -------------------------------------------------------------

const ROOM_TYPES: RoomType[] = [
  {
    id: 'rt-deluxe',
    name: 'Deluxe Suite',
    description: 'Hạng phòng cao cấp với thiết kế sang trọng, tầm nhìn hướng biển tuyệt đẹp và trang bị bồn tắm nằm cao cấp.',
    basePrice: 2500000,
    maxOccupancy: 2,
    amenities: ['Wi-Fi 6', 'Điều hòa', 'Smart TV 4K', 'Mini bar', 'Bồn tắm', 'Ban công'],
    images: ['/rooms/deluxe-1.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-ocean',
    name: 'Executive Ocean View',
    description: 'Trải nghiệm đỉnh cao với ban công góc ngắm toàn cảnh đại dương rộng lớn, dịch vụ phòng 24/7 và trà chiều miễn phí.',
    basePrice: 3500000,
    maxOccupancy: 2,
    amenities: ['Wi-Fi 6', 'Điều hòa', 'Smart TV 4K', 'Mini bar', 'Bồn tắm đứng', 'Máy pha cà phê', 'Đưa đón sân bay'],
    images: ['/rooms/ocean-1.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-penthouse',
    name: 'Presidential Penthouse',
    description: 'Biểu tượng của sự xa hoa rộng 250m² tại tầng cao nhất của resort. Có hồ bơi riêng biệt ngoài ban công, phòng khách rộng lớn và quản gia phục vụ riêng.',
    basePrice: 12000000,
    maxOccupancy: 4,
    amenities: ['Wi-Fi 6', 'Hồ bơi riêng', 'Phòng bếp', 'Hệ thống âm thanh hi-end', 'Quản gia riêng', 'Quầy bar', 'Smart TV 4K', 'Mini bar'],
    images: ['/rooms/penthouse-1.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-std-double',
    name: 'Standard Double',
    description: 'Phòng tiêu chuẩn ấm cúng dành cho hai người, đầy đủ tiện nghi thiết yếu cho kỳ nghỉ thoải mái.',
    basePrice: 1500000,
    maxOccupancy: 2,
    amenities: ['Wi-Fi 6', 'Điều hòa', 'Smart TV', 'Mini bar', 'Bàn làm việc'],
    images: ['/rooms/std-double.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-std-single',
    name: 'Standard Single',
    description: 'Lựa chọn lý tưởng cho khách đi công tác hoặc du lịch một mình, tiết kiệm và đầy đủ công năng.',
    basePrice: 1200000,
    maxOccupancy: 1,
    amenities: ['Wi-Fi 6', 'Điều hòa', 'Smart TV', 'Bàn làm việc'],
    images: ['/rooms/std-single.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-family',
    name: 'Family Suite',
    description: 'Không gian rộng rãi kết nối 2 phòng ngủ riêng biệt, hoàn hảo cho gia đình nhỏ nghỉ dưỡng.',
    basePrice: 4000000,
    maxOccupancy: 4,
    amenities: ['Wi-Fi 6', 'Điều hòa', 'Smart TV 4K', 'Mini bar', 'Khu vực bếp nấu', 'Bàn ăn gia đình'],
    images: ['/rooms/family.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-king',
    name: 'Luxury King Room',
    description: 'Phòng King sang trọng với giường cỡ lớn 2m2, nội thất gỗ óc chó cao cấp cùng ánh sáng ấm áp.',
    basePrice: 3000000,
    maxOccupancy: 2,
    amenities: ['Wi-Fi 6', 'Giường King size', 'Điều hòa', 'Smart TV 4K', 'Mini bar', 'Bồn tắm'],
    images: ['/rooms/king.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-junior',
    name: 'Junior Suite',
    description: 'Phòng Suite cỡ nhỏ tích hợp góc tiếp khách tinh tế, mang lại không gian sống tiện lợi.',
    basePrice: 2200000,
    maxOccupancy: 2,
    amenities: ['Wi-Fi 6', 'Điều hòa', 'Góc sofa', 'Mini bar', 'Smart TV'],
    images: ['/rooms/junior.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-villa',
    name: 'Honeymoon Villa',
    description: 'Biệt thự sân vườn tách biệt với lối trang trí lãng mạn, bồn hoa và hồ Jacuzzi dành riêng cho các cặp đôi.',
    basePrice: 7500000,
    maxOccupancy: 2,
    amenities: ['Wi-Fi 6', 'Bể sục Jacuzzi', 'Sân vườn riêng', 'Bữa sáng tại phòng', 'Nến và Hoa', 'Smart TV 4K'],
    images: ['/rooms/villa.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'rt-bungalow',
    name: 'Royal Garden Bungalow',
    description: 'Bungalow gỗ phong cách hoàng gia nép mình bên khu vườn nhiệt đới xanh mát, nghe tiếng sóng vỗ rì rào.',
    basePrice: 5500000,
    maxOccupancy: 3,
    amenities: ['Wi-Fi 6', 'Sân hiên phơi nắng', 'Điều hòa', 'Smart TV 4K', 'Mini bar', 'Máy pha cà phê'],
    images: ['/rooms/bungalow.jpg'],
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

const EXTRA_SERVICES: ExtraService[] = [
  { id: 'svc-spa', name: 'Trị liệu Spa toàn thân 60p', price: 850000, unit: 'Lượt', category: 'Spa & Wellness', isActive: true },
  { id: 'svc-minibar-beer', name: 'Bia Heineken lon (Minibar)', price: 45000, unit: 'Lon', category: 'Minibar', isActive: true },
  { id: 'svc-minibar-water', name: 'Nước suối khoáng (Minibar)', price: 20000, unit: 'Chai', category: 'Minibar', isActive: true },
  { id: 'svc-dining', name: 'Bữa tối Fine Dining tại phòng', price: 1500000, unit: 'Set', category: 'Ăn uống', isActive: true },
  { id: 'svc-airport', name: 'Đón tiễn sân bay bằng xe Limousine', price: 600000, unit: 'Lượt', category: 'Vận chuyển', isActive: true },
  { id: 'svc-laundry', name: 'Giặt là cao tốc (quần áo)', price: 120000, unit: 'Lượt', category: 'Giặt là', isActive: true }
];

const COUPONS: Coupon[] = [
  { id: 'cp-welcome', code: 'WELCOME5', discountType: 'PERCENT', discountValue: 5, minOrderValue: 0, maxUsage: 1000, usedCount: 142, expiryDate: '2027-12-31T23:59:59.000Z', isActive: true },
  { id: 'cp-luxury', code: 'LUXURY2M', discountType: 'FIXED', discountValue: 2000000, minOrderValue: 10000000, maxUsage: 100, usedCount: 18, expiryDate: '2026-12-31T23:59:59.000Z', isActive: true },
  { id: 'cp-vip', code: 'HORIZONVIP', discountType: 'PERCENT', discountValue: 15, minOrderValue: 0, maxUsage: 500, usedCount: 78, expiryDate: '2027-06-30T23:59:59.000Z', isActive: true }
];

const USERS: User[] = [
  { id: 'usr-admin-1', name: 'Nguyễn Minh Trí', email: 'tri.nguyen@horizon.vn', role: 'ADMIN', avatar: '/avatars/admin-1.jpg', phone: '0901234567', isActive: true, password: '123456', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'usr-admin-2', name: 'Phạm Hồng Vân', email: 'van.pham@horizon.vn', role: 'ADMIN', avatar: '/avatars/admin-2.jpg', phone: '0912345678', isActive: true, password: '123456', createdAt: '2025-01-02T00:00:00.000Z' },
  { id: 'usr-staff-1', name: 'Trần Thanh Sơn', email: 'son.tran@horizon.vn', role: 'STAFF', avatar: '/avatars/staff-1.jpg', phone: '0987654321', isActive: true, password: '123456', createdAt: '2025-02-10T00:00:00.000Z' },
  { id: 'usr-staff-2', name: 'Lê Quỳnh Anh', email: 'anh.le@horizon.vn', role: 'STAFF', avatar: '/avatars/staff-2.jpg', phone: '0977889900', isActive: true, password: '123456', createdAt: '2025-03-01T00:00:00.000Z' },
  { id: 'usr-staff-3', name: 'Hoàng Quốc Việt', email: 'viet.hoang@horizon.vn', role: 'STAFF', avatar: '/avatars/staff-3.jpg', phone: '0966554433', isActive: true, password: '123456', createdAt: '2025-03-15T00:00:00.000Z' }
];

const BLOGS: Blog[] = [
  {
    id: 'blog-1',
    title: 'Top 5 hoạt động chăm sóc sức khỏe toàn diện tại Horizon Spa mùa hè này',
    slug: 'top-5-hoat-dong-cham-soc-suc-khoe-tai-horizon-spa',
    excerpt: 'Tìm lại sự cân bằng trong tâm hồn và thể chất với các liệu pháp massage đá nóng và xông hơi thảo dược độc quyền tại Horizon Grand Resort.',
    content: 'Chăm sóc sức khỏe tinh thần và thể chất là ưu tiên hàng đầu của nhiều du khách khi ghé thăm Horizon Grand Resort. Tại đây, chúng tôi mang tới 5 hoạt động đặc quyền: 1. Trị liệu chuyên sâu với đá muối Himalaya, giúp thải độc cơ thể. 2. Xông hơi ướt thảo dược tự nhiên được hái từ thung lũng sinh thái của resort. 3. Các lớp thiền định ngắm bình minh trên bãi biển. 4. Detox dinh dưỡng cá nhân hóa. 5. Trị liệu giấc ngủ sâu giúp tái tạo năng lượng.',
    image: '/blogs/spa.jpg',
    views: 1240,
    isPublished: true,
    authorId: 'usr-admin-2',
    createdAt: '2026-05-10T08:30:00.000Z',
    updatedAt: '2026-05-10T08:30:00.000Z'
  },
  {
    id: 'blog-2',
    title: 'Hành trình ẩm thực Michelin tại nhà hàng Fine Dining Horizon Ocean',
    slug: 'hanh-trinh-am-thuc-michelin-tai-nha-hang-horizon-ocean',
    excerpt: 'Khám phá sự kết hợp tài hoa giữa hải sản Phú Quốc tươi sống và tinh hoa ẩm thực Pháp cổ điển từ Đầu bếp 3 sao Michelin.',
    content: 'Chào mừng các thực khách đến với bữa tiệc của các giác quan. Nhà hàng Horizon Ocean tự hào giới thiệu thực đơn Signature đặc biệt kết hợp nguyên liệu đánh bắt tươi sống tại đảo ngọc Phú Quốc cùng kỹ thuật chế biến Pháp đỉnh cao. Món sò điệp áp chảo sốt bơ tỏi và tôm hùm đút lò phô mai Gruyère sẽ đánh thức mọi tế bào vị giác của bạn.',
    image: '/blogs/dining.jpg',
    views: 948,
    isPublished: true,
    authorId: 'usr-admin-2',
    createdAt: '2026-05-15T14:20:00.000Z',
    updatedAt: '2026-05-15T14:20:00.000Z'
  },
  {
    id: 'blog-3',
    title: 'Kỳ nghỉ lãng mạn trọn vẹn dành cho cặp đôi tại Honeymoon Villa',
    slug: 'ky-nghi-lang-man-danh-cho-cap-doi-tai-honeymoon-villa',
    excerpt: 'Những chi tiết nhỏ tạo nên ký ức lớn: jacuzzi ngập hoa hồng, nến thơm dịu nhẹ và bữa sáng nổi lãng mạn trên hồ bơi.',
    content: 'Biệt thự trăng mật tại Horizon Grand Resort được bao bọc bởi hàng rào cây xanh biệt lập mang đến không gian riêng tư tối đa. Gói kỳ nghỉ tình yêu bao gồm xe đưa đón đón tiễn limousine, quà chào mừng là rượu vang cao cấp, giường trải đầy cánh hoa hồng và bữa sáng phục vụ nổi trên khay jacuzzi bồng bềnh dưới ánh nắng sớm.',
    image: '/blogs/villa.jpg',
    views: 752,
    isPublished: true,
    authorId: 'usr-staff-2',
    createdAt: '2026-05-20T09:00:00.000Z',
    updatedAt: '2026-05-20T09:00:00.000Z'
  }
];

// Helper to generate deterministic records
function generateMockRooms(): Room[] {
  const rooms: Room[] = [];
  const roomTypes = ROOM_TYPES;
  
  // Status allocation: 120 rooms total
  // 42 AVAILABLE, 32 BOOKED, 34 OCCUPIED, 6 MAINTENANCE, 6 CLEANING
  const statuses: RoomStatus[] = [];
  for (let i = 0; i < 42; i++) statuses.push('AVAILABLE');
  for (let i = 0; i < 32; i++) statuses.push('BOOKED');
  for (let i = 0; i < 34; i++) statuses.push('OCCUPIED');
  for (let i = 0; i < 6; i++) statuses.push('MAINTENANCE');
  for (let i = 0; i < 6; i++) statuses.push('CLEANING');
  
  // Shuffle deterministically using a simple LCG pseudorandom generator
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = statuses.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = statuses[i];
    statuses[i] = statuses[j];
    statuses[j] = temp;
  }
  
  let statusIndex = 0;
  
  // Generate 24 rooms per floor for 5 floors
  for (let floor = 1; floor <= 5; floor++) {
    for (let r = 1; r <= 24; r++) {
      const roomNum = floor * 100 + r;
      const roomNumber = roomNum.toString().padStart(3, '0');
      
      // Select room type based on index
      // Floor 5: Penthouse (1-2), Villa (3-5), Bungalow (6-8), and Deluxe
      // Other floors: Distributed
      let roomType = roomTypes[3]; // Default Standard Double
      
      if (floor === 5 && r <= 2) {
        roomType = roomTypes[2]; // Penthouse
      } else if (floor === 5 && r <= 6) {
        roomType = roomTypes[8]; // Villa
      } else if (floor === 4 && r <= 4) {
        roomType = roomTypes[1]; // Ocean View
      } else if (r % 6 === 0) {
        roomType = roomTypes[0]; // Deluxe
      } else if (r % 6 === 1) {
        roomType = roomTypes[6]; // King
      } else if (r % 6 === 2) {
        roomType = roomTypes[7]; // Junior
      } else if (r % 6 === 3) {
        roomType = roomTypes[9]; // Bungalow
      } else if (r % 6 === 4) {
        roomType = roomTypes[4]; // Single
      } else if (r % 6 === 5) {
        roomType = roomTypes[5]; // Family
      }
      
      const status = statuses[statusIndex++];
      
      rooms.push({
        id: `rm-${roomNumber}`,
        roomNumber,
        floor,
        roomTypeId: roomType.id,
        status,
        description: `Phòng ${roomNumber} thuộc hạng phòng ${roomType.name} tại tầng ${floor.toString().padStart(2, '0')}. Được dọn dẹp thường xuyên và đầy đủ dịch vụ tiện nghi đạt chuẩn 5 sao quốc tế.`,
        images: roomType.images,
        lastCleaned: new Date(Date.now() - Math.floor(random() * 5) * 24 * 3600 * 1000).toISOString()
      });
    }
  }
  
  return rooms;
}

const VIETNAMESE_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức', 'Hoàng Thu Thảo',
  'Vũ Huy Hoàng', 'Đặng Thị Mai', 'Bùi Quốc Anh', 'Đỗ Kim Chi', 'Lý Hoài Nam',
  'Nguyễn Thị Lan', 'Trần Minh Quang', 'Phạm Thanh Thủy', 'Lê Hữu Đạt', 'Hoàng Bảo Ngọc',
  'Vũ Ngọc Lan', 'Nguyễn Tiến Dũng', 'Đặng Minh Khôi', 'Trịnh Hữu Phước', 'Bùi Thị Hà',
  'Đỗ Gia Bảo', 'Ngô Quốc Khánh', 'Phan Văn Hải', 'Dương Thúy Hằng', 'Phùng Thế Vinh',
  'Nguyễn Xuân Sơn', 'Đinh Thị Trang', 'Lâm Hoài Thu', 'Tạ Minh Triết', 'Vũ Cẩm Tú',
  'Trần Anh Tuấn', 'Nguyễn Hoài Thương', 'Phạm Văn Nam', 'Đỗ Thị Quyên', 'Vũ Văn Hùng',
  'Nguyễn Thị Kim Anh', 'Lê Trường Giang', 'Phan Hoàng Long', 'Nguyễn Thanh Tùng', 'Trần Hồng Quân',
  'Lê Mai Hương', 'Hoàng Trọng Nghĩa', 'Bùi Ngọc Hân', 'Phạm Quang Minh', 'Nguyễn Huy Tâm',
  'Trần Thị Mỹ Lệ', 'Nguyễn Đình Phong', 'Lê Hữu Phước', 'Vũ Mai Chi', 'Đặng Hữu Nhân'
];

function generateMockCustomers(): Customer[] {
  const customers: Customer[] = [];
  
  let seed = 100;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = 0; i < 50; i++) {
    const isVIP = i < 10;
    const isFrequent = i >= 10 && i < 25;
    const memberType: CustomerMemberType = isVIP ? 'VIP' : (isFrequent ? 'FREQUENT' : 'REGULAR');
    
    const id = `cus-${(i + 1).toString().padStart(6, '0')}`;
    const name = VIETNAMESE_NAMES[i];
    const email = `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '')}@gmail.com`;
    const phone = `09${Math.floor(10000000 + random() * 90000000)}`;
    const cccd = `${301000000000 + Math.floor(random() * 9999999999)}`;
    const totalStays = isVIP ? Math.floor(15 + random() * 20) : (isFrequent ? Math.floor(5 + random() * 10) : Math.floor(1 + random() * 4));
    const totalSpent = isVIP ? Math.floor(35000000 + random() * 150000000) : (isFrequent ? Math.floor(12000000 + random() * 30000000) : Math.floor(2000000 + random() * 8000000));
    
    customers.push({
      id,
      fullName: name,
      email,
      phone,
      cccd,
      dateOfBirth: new Date(1975 + Math.floor(random() * 25), Math.floor(random() * 12), Math.floor(random() * 28) + 1).toISOString().split('T')[0],
      gender: random() > 0.5 ? 'Nam' : 'Nữ',
      address: `${Math.floor(1 + random() * 200)} Đường Lê Lợi, Quận ${Math.floor(1 + random() * 10)}, TP. Hồ Chí Minh`,
      memberType,
      isActive: true,
      joinDate: new Date(2023, Math.floor(random() * 12), Math.floor(random() * 28) + 1).toISOString(),
      totalStays,
      totalSpent,
      createdAt: new Date(2023, Math.floor(random() * 12), Math.floor(random() * 28) + 1).toISOString()
    });
  }
  
  return customers;
}

function generateMockBookings(rooms: Room[], customers: Customer[]): Booking[] {
  const bookings: Booking[] = [];
  
  let seed = 500;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED');
  const bookedRooms = rooms.filter(r => r.status === 'BOOKED');
  
  // Create 20 mock bookings
  // 10 active bookings (matching occupied rooms)
  // 5 upcoming bookings (matching booked rooms)
  // 5 completed bookings (past)
  
  // 1. Stays currently active (CHECKED_IN / OCCUPIED)
  for (let i = 0; i < Math.min(10, occupiedRooms.length); i++) {
    const room = occupiedRooms[i];
    const customer = customers[i % customers.length];
    const nights = Math.floor(2 + random() * 5);
    const roomType = ROOM_TYPES.find(rt => rt.id === room.roomTypeId)!;
    const totalPrice = nights * roomType.basePrice;
    
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() - Math.floor(1 + random() * 3));
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    
    const id = `bk-active-${i + 1}`;
    bookings.push({
      id,
      bookingCode: `BK-2026-${(10000 + i).toString().slice(1)}`,
      customerId: customer.id,
      roomId: room.id,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      numberOfNights: nights,
      numberOfAdults: Math.floor(1 + random() * roomType.maxOccupancy),
      numberOfChildren: random() > 0.5 ? 0 : 1,
      status: 'CHECKED_IN',
      totalPrice,
      depositAmount: totalPrice * 0.3,
      paymentMethod: i % 3 === 0 ? 'CARD' : (i % 3 === 1 ? 'TRANSFER' : 'CASH'),
      paymentStatus: 'PARTIAL',
      specialRequests: i % 4 === 0 ? 'Phòng yên tĩnh, hỗ trợ nhận phòng sớm.' : undefined,
      createdById: 'usr-staff-1',
      createdAt: new Date(checkIn.getTime() - 5 * 24 * 3600 * 1000).toISOString()
    });
  }
  
  // 2. Upcoming reservations (CONFIRMED / BOOKED)
  for (let i = 0; i < Math.min(5, bookedRooms.length); i++) {
    const room = bookedRooms[i];
    const customer = customers[(i + 10) % customers.length];
    const nights = Math.floor(1 + random() * 3);
    const roomType = ROOM_TYPES.find(rt => rt.id === room.roomTypeId)!;
    const totalPrice = nights * roomType.basePrice;
    
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + Math.floor(1 + random() * 4));
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    
    const id = `bk-booked-${i + 1}`;
    bookings.push({
      id,
      bookingCode: `BK-2026-${(20000 + i).toString().slice(1)}`,
      customerId: customer.id,
      roomId: room.id,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      numberOfNights: nights,
      numberOfAdults: Math.floor(1 + random() * roomType.maxOccupancy),
      numberOfChildren: 0,
      status: 'CONFIRMED',
      totalPrice,
      depositAmount: totalPrice * 0.5,
      paymentMethod: 'TRANSFER',
      paymentStatus: 'PARTIAL',
      specialRequests: undefined,
      createdById: 'usr-staff-2',
      createdAt: new Date().toISOString()
    });
  }
  
  // 3. Past completed bookings (CHECKED_OUT)
  for (let i = 0; i < 5; i++) {
    const room = rooms[i * 4];
    const customer = customers[(i + 15) % customers.length];
    const nights = Math.floor(1 + random() * 4);
    const roomType = ROOM_TYPES.find(rt => rt.id === room.roomTypeId)!;
    const totalPrice = nights * roomType.basePrice;
    
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() - Math.floor(10 + random() * 10));
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    
    const id = `bk-past-${i + 1}`;
    bookings.push({
      id,
      bookingCode: `BK-2026-${(30000 + i).toString().slice(1)}`,
      customerId: customer.id,
      roomId: room.id,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      numberOfNights: nights,
      numberOfAdults: 2,
      numberOfChildren: 0,
      status: 'CHECKED_OUT',
      totalPrice,
      depositAmount: totalPrice,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      createdById: 'usr-staff-3',
      createdAt: new Date(checkIn.getTime() - 15 * 24 * 3600 * 1000).toISOString()
    });
  }
  
  return bookings;
}

function generateMockStays(bookings: Booking[]): StayRecord[] {
  const stays: StayRecord[] = [];
  const checkedInBookings = bookings.filter(b => b.status === 'CHECKED_IN');
  const pastBookings = bookings.filter(b => b.status === 'CHECKED_OUT');
  
  // Stays currently staying
  checkedInBookings.forEach((b, idx) => {
    stays.push({
      id: `stay-active-${idx + 1}`,
      stayCode: `STAY-${(1000 + idx).toString()}`,
      bookingId: b.id,
      customerId: b.customerId,
      roomId: b.roomId,
      actualCheckIn: b.checkInDate,
      status: 'STAYING',
      extraServices: idx % 2 === 0 ? [
        { id: 'svc-minibar-beer', name: 'Bia Heineken lon (Minibar)', price: 45000, quantity: 2, amount: 90000 },
        { id: 'svc-minibar-water', name: 'Nước suối khoáng (Minibar)', price: 20000, quantity: 3, amount: 60000 }
      ] : [
        { id: 'svc-spa', name: 'Trị liệu Spa toàn thân 60p', price: 850000, quantity: 1, amount: 850000 }
      ],
      totalCharged: idx % 2 === 0 ? 150000 : 850000,
      staffId: b.createdById
    });
  });
  
  // Past stays checked out
  pastBookings.forEach((b, idx) => {
    stays.push({
      id: `stay-past-${idx + 1}`,
      stayCode: `STAY-${(2000 + idx).toString()}`,
      bookingId: b.id,
      customerId: b.customerId,
      roomId: b.roomId,
      actualCheckIn: b.checkInDate,
      actualCheckOut: b.checkOutDate,
      status: 'CHECKED_OUT',
      extraServices: [
        { id: 'svc-airport', name: 'Đón tiễn sân bay bằng xe Limousine', price: 600000, quantity: 1, amount: 600000 }
      ],
      totalCharged: 600000,
      staffId: b.createdById
    });
  });
  
  return stays;
}

function generateMockInvoices(stays: StayRecord[], bookings: Booking[], customers: Customer[]): Invoice[] {
  const invoices: Invoice[] = [];
  const completedStays = stays.filter(s => s.status === 'CHECKED_OUT');
  
  completedStays.forEach((s, idx) => {
    const booking = bookings.find(b => b.id === s.bookingId)!;
    const customer = customers.find(c => c.id === s.customerId)!;
    
    const subTotal = booking.totalPrice + s.totalCharged;
    const vat = subTotal * 0.1;
    const totalAmount = subTotal + vat;
    
    invoices.push({
      id: `inv-${idx + 1}`,
      invoiceCode: `INV-2026-${(10000 + idx).toString().slice(1)}`,
      stayId: s.id,
      customerId: s.customerId,
      issueDate: s.actualCheckOut!,
      dueDate: s.actualCheckOut!,
      subTotal,
      vat: 10,
      discount: 0,
      totalAmount,
      isPaid: true,
      paymentMethod: booking.paymentMethod,
      notes: 'Hóa đơn đã bao gồm phí lưu trú và dịch vụ phát sinh.',
      createdById: s.staffId
    });
  });
  
  return invoices;
}

// -------------------------------------------------------------
// IN-MEMORY / LOCAL STORAGE DATABASE ENGINE
// -------------------------------------------------------------

class MockDatabase {
  private rooms: Room[] = [];
  private customers: Customer[] = [];
  private bookings: Booking[] = [];
  private stays: StayRecord[] = [];
  private invoices: Invoice[] = [];
  private users: User[] = USERS;
  private roomTypes: RoomType[] = ROOM_TYPES;
  private extraServices: ExtraService[] = EXTRA_SERVICES;
  private coupons: Coupon[] = COUPONS;
  private blogs: Blog[] = BLOGS;
  private notifications: Notification[] = [];
  private logs: ActivityLog[] = [];
  
  constructor() {
    this.init();
  }
  
  private init() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('horizon_hms_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.rooms = parsed.rooms || [];
          this.customers = parsed.customers || [];
          this.bookings = parsed.bookings || [];
          this.stays = parsed.stays || [];
          this.invoices = parsed.invoices || [];
          this.users = parsed.users || USERS;
          this.roomTypes = parsed.roomTypes || ROOM_TYPES;
          this.extraServices = parsed.extraServices || EXTRA_SERVICES;
          this.coupons = parsed.coupons || COUPONS;
          this.blogs = parsed.blogs || BLOGS;
          this.notifications = parsed.notifications || [];
          this.logs = parsed.logs || [];
          return;
        } catch (e) {
          console.error("Failed to parse stored mock data", e);
        }
      }
    }
    
    // First time init / Fallback
    this.rooms = generateMockRooms();
    this.customers = generateMockCustomers();
    this.bookings = generateMockBookings(this.rooms, this.customers);
    this.stays = generateMockStays(this.bookings);
    this.invoices = generateMockInvoices(this.stays, this.bookings, this.customers);
    
    // Create initial notifications
    this.notifications = [
      { id: 'not-1', userId: 'usr-admin-1', title: 'Yêu cầu dọn dẹp', message: 'Phòng 102 vừa check-out, cần nhân viên dọn dẹp ngay.', type: 'warning', isRead: false, createdAt: new Date().toISOString() },
      { id: 'not-2', userId: 'usr-admin-1', title: 'Đặt phòng mới', message: 'Đã nhận yêu cầu đặt phòng VIP từ khách hàng Nguyễn Văn An.', type: 'booking', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'not-3', userId: 'usr-admin-1', title: 'Cảnh báo bảo trì', message: 'Điều hòa phòng 315 gặp sự cố, đã chuyển sang trạng thái bảo trì.', type: 'info', isRead: true, createdAt: new Date(Date.now() - 7200000).toISOString() }
    ];
    
    // Activity logs
    this.logs = [
      { id: 'log-1', userId: 'usr-admin-1', action: 'LOGIN', entityType: 'User', entityId: 'usr-admin-1', description: 'Đăng nhập hệ thống quản lý.', ipAddress: '192.168.1.10', createdAt: new Date(Date.now() - 36000000).toISOString() },
      { id: 'log-2', userId: 'usr-staff-1', action: 'CHECK_IN', entityType: 'StayRecord', entityId: 'stay-active-1', description: 'Thực hiện nhận phòng cho khách hàng Nguyễn Văn An.', ipAddress: '192.168.1.15', createdAt: new Date(Date.now() - 24000000).toISOString() }
    ];
    
    this.save();
  }
  
  public save() {
    if (typeof window !== 'undefined') {
      const data = {
        rooms: this.rooms,
        customers: this.customers,
        bookings: this.bookings,
        stays: this.stays,
        invoices: this.invoices,
        users: this.users,
        roomTypes: this.roomTypes,
        extraServices: this.extraServices,
        coupons: this.coupons,
        blogs: this.blogs,
        notifications: this.notifications,
        logs: this.logs
      };
      localStorage.setItem('horizon_hms_data', JSON.stringify(data));
    }
  }

  // ROOMS API
  public getRooms() { return this.rooms; }
  public getRoom(id: string) { return this.rooms.find(r => r.id === id || r.roomNumber === id); }
  public getRoomTypes() { return this.roomTypes; }
  public createRoom(room: Omit<Room, 'id'>) {
    const newRoom: Room = {
      id: `rm-${room.roomNumber}`,
      ...room
    };
    this.rooms.push(newRoom);
    this.logAction('usr-admin-1', 'CREATE', 'Room', newRoom.id, `Thêm phòng mới ${newRoom.roomNumber}`);
    this.save();
    return newRoom;
  }
  public updateRoom(id: string, data: Partial<Room>) {
    const idx = this.rooms.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.rooms[idx] = { ...this.rooms[idx], ...data };
      this.logAction('usr-admin-1', 'UPDATE', 'Room', id, `Cập nhật thông tin phòng ${this.rooms[idx].roomNumber}`);
      this.save();
      return this.rooms[idx];
    }
    return null;
  }

  // CUSTOMERS API
  public getCustomers() { return this.customers; }
  public getCustomer(id: string) { return this.customers.find(c => c.id === id); }
  public createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'joinDate' | 'totalStays' | 'totalSpent'>) {
    const newCustomer: Customer = {
      id: `cus-${(this.customers.length + 1).toString().padStart(6, '0')}`,
      ...customer,
      joinDate: new Date().toISOString(),
      totalStays: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString()
    };
    this.customers.push(newCustomer);
    this.logAction('usr-admin-1', 'CREATE', 'Customer', newCustomer.id, `Đăng ký khách hàng mới: ${newCustomer.fullName}`);
    this.save();
    return newCustomer;
  }
  public updateCustomer(id: string, data: Partial<Customer>) {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.customers[idx] = { ...this.customers[idx], ...data };
      this.logAction('usr-admin-1', 'UPDATE', 'Customer', id, `Cập nhật thông tin khách hàng ${this.customers[idx].fullName}`);
      this.save();
      return this.customers[idx];
    }
    return null;
  }
  public deleteCustomer(id: string) {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      const customerName = this.customers[idx].fullName;
      this.customers[idx].isActive = false; // Soft delete
      this.logAction('usr-admin-1', 'DELETE', 'Customer', id, `Vô hiệu hóa khách hàng ${customerName}`);
      this.save();
      return true;
    }
    return false;
  }

  // BOOKINGS API
  public getBookings() { return this.bookings; }
  public getBooking(id: string) { return this.bookings.find(b => b.id === id || b.bookingCode === id); }
  public createBooking(booking: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>) {
    const codeNum = Math.floor(100000 + Math.random() * 900000);
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingCode: `BK-2026-${codeNum}`,
      ...booking,
      createdAt: new Date().toISOString()
    };
    
    // Update Room status
    const room = this.getRoom(booking.roomId);
    if (room && room.status === 'AVAILABLE') {
      this.updateRoom(room.id, { status: booking.status === 'CHECKED_IN' ? 'OCCUPIED' : 'BOOKED' });
    }
    
    this.bookings.push(newBooking);
    this.logAction(booking.createdById, 'CREATE', 'Booking', newBooking.id, `Tạo phiếu đặt phòng ${newBooking.bookingCode}`);
    
    // Add notification
    this.addNotification(booking.createdById, 'Đặt phòng mới', `Nhận yêu cầu đặt phòng ${newBooking.bookingCode} cho hạng phòng ${room ? this.roomTypes.find(rt => rt.id === room.roomTypeId)?.name : 'chưa rõ'}.`, 'booking');
    
    this.save();
    return newBooking;
  }
  public updateBookingStatus(id: string, status: BookingStatus) {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      const oldStatus = this.bookings[idx].status;
      this.bookings[idx].status = status;
      
      const booking = this.bookings[idx];
      const room = this.getRoom(booking.roomId);
      
      if (room) {
        if (status === 'CONFIRMED') {
          this.updateRoom(room.id, { status: 'BOOKED' });
        } else if (status === 'CHECKED_IN') {
          this.updateRoom(room.id, { status: 'OCCUPIED' });
          // Auto create a stay record
          this.createStayRecordFromBooking(booking);
        } else if (status === 'CANCELLED') {
          this.updateRoom(room.id, { status: 'AVAILABLE' });
        }
      }
      
      this.logAction('usr-admin-1', 'UPDATE', 'Booking', id, `Chuyển trạng thái booking ${booking.bookingCode} từ ${oldStatus} sang ${status}`);
      this.save();
      return booking;
    }
    return null;
  }

  public deleteBooking(id: string) {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      const booking = this.bookings[idx];
      const room = this.getRoom(booking.roomId);
      if (room && (booking.status === 'PENDING' || booking.status === 'CONFIRMED')) {
        this.updateRoom(room.id, { status: 'AVAILABLE' });
      }
      this.bookings.splice(idx, 1);
      this.logAction('usr-admin-1', 'DELETE', 'Booking', id, `Xóa phiếu đặt phòng ${booking.bookingCode}`);
      this.save();
      return true;
    }
    return false;
  }

  private createStayRecordFromBooking(booking: Booking) {
    const stayId = `stay-active-${Date.now()}`;
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const newStay: StayRecord = {
      id: stayId,
      stayCode: `STAY-${codeNum}`,
      bookingId: booking.id,
      customerId: booking.customerId,
      roomId: booking.roomId,
      actualCheckIn: new Date().toISOString(),
      status: 'STAYING',
      extraServices: [],
      totalCharged: 0,
      staffId: booking.createdById
    };
    this.stays.push(newStay);
    this.logAction(booking.createdById, 'CHECK_IN', 'StayRecord', stayId, `Khách check-in lưu trú phiếu ${newStay.stayCode}`);
  }

  // STAYS API
  public getStays() { return this.stays; }
  public getStay(id: string) { return this.stays.find(s => s.id === id || s.stayCode === id); }
  
  public addStayService(stayId: string, serviceId: string, quantity: number) {
    const stay = this.stays.find(s => s.id === stayId);
    const svc = this.extraServices.find(s => s.id === serviceId);
    if (stay && svc) {
      const existIdx = stay.extraServices.findIndex(item => item.id === serviceId);
      if (existIdx !== -1) {
        stay.extraServices[existIdx].quantity += quantity;
        stay.extraServices[existIdx].amount = stay.extraServices[existIdx].quantity * svc.price;
      } else {
        stay.extraServices.push({
          id: svc.id,
          name: svc.name,
          price: svc.price,
          quantity,
          amount: svc.price * quantity
        });
      }
      stay.totalCharged = stay.extraServices.reduce((sum, item) => sum + item.amount, 0);
      this.save();
      return stay;
    }
    return null;
  }

  public checkIn(bookingId: string, staffId: string) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      return this.updateBookingStatus(booking.id, 'CHECKED_IN');
    }
    return null;
  }

  public checkOut(stayId: string, notes: string, staffId: string, paymentMethod: PaymentMethod, discount: number = 0) {
    const stayIdx = this.stays.findIndex(s => s.id === stayId);
    if (stayIdx !== -1) {
      const stay = this.stays[stayIdx];
      stay.status = 'CHECKED_OUT';
      stay.actualCheckOut = new Date().toISOString();
      
      const booking = this.bookings.find(b => b.id === stay.bookingId)!;
      booking.status = 'CHECKED_OUT';
      booking.paymentStatus = 'PAID';
      
      // Update room to cleaning
      this.updateRoom(stay.roomId, { status: 'CLEANING' });
      
      // Create Invoice
      const subTotal = booking.totalPrice + stay.totalCharged;
      const vat = subTotal * 0.1;
      const totalAmount = subTotal + vat - discount;
      
      const invoiceId = `inv-${Date.now()}`;
      const invCodeNum = Math.floor(1000 + Math.random() * 9000);
      const newInvoice: Invoice = {
        id: invoiceId,
        invoiceCode: `INV-2026-${invCodeNum}`,
        stayId: stay.id,
        customerId: stay.customerId,
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        subTotal,
        vat: 10,
        discount,
        totalAmount,
        isPaid: true,
        paymentMethod,
        notes,
        createdById: staffId
      };
      
      this.invoices.push(newInvoice);
      
      // Update Customer Stats
      const customer = this.customers.find(c => c.id === stay.customerId);
      if (customer) {
        customer.totalStays += 1;
        customer.totalSpent += totalAmount;
      }
      
      this.logAction(staffId, 'CHECK_OUT', 'StayRecord', stayId, `Khách check-out lưu trú ${stay.stayCode}, đã lập hóa đơn ${newInvoice.invoiceCode}`);
      this.save();
      return newInvoice;
    }
    return null;
  }

  // INVOICES API
  public getInvoices() { return this.invoices; }
  public getInvoice(id: string) { return this.invoices.find(i => i.id === id || i.invoiceCode === id); }

  // EXTRA SERVICES
  public getExtraServices() { return this.extraServices; }
  public getCoupons() { return this.coupons; }
  public getCouponByCode(code: string) {
    return this.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  }

  // USERS / SYSTEM ACCOUNTS
  public getUsers() { return this.users; }
  public createUser(user: Omit<User, 'id' | 'createdAt'>) {
    const prefix = user.role.toLowerCase() === 'admin' ? 'usr-admin' : 'usr-staff';
    const newUser: User = {
      id: `${prefix}-${Date.now()}`,
      ...user,
      password: user.password || '123456',
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.save();
    return newUser;
  }
  public updateUser(id: string, data: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...data };
      this.save();
      return this.users[idx];
    }
    return null;
  }
  public deleteUser(id: string) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // BLOGS API
  public getBlogs() { return this.blogs; }
  public getBlog(id: string) { return this.blogs.find(b => b.id === id || b.slug === id); }
  public createBlog(blog: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'views'>) {
    const newBlog: Blog = {
      id: `blog-${Date.now()}`,
      views: 0,
      ...blog,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.blogs.push(newBlog);
    this.save();
    return newBlog;
  }
  public updateBlog(id: string, data: Partial<Blog>) {
    const idx = this.blogs.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.blogs[idx] = { ...this.blogs[idx], ...data, updatedAt: new Date().toISOString() };
      this.save();
      return this.blogs[idx];
    }
    return null;
  }
  public deleteBlog(id: string) {
    const idx = this.blogs.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.blogs.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // NOTIFICATIONS
  public getNotifications() { return this.notifications; }
  public markNotificationRead(id: string) {
    const n = this.notifications.find(not => not.id === id);
    if (n) {
      n.isRead = true;
      this.save();
    }
  }
  private addNotification(userId: string, title: string, message: string, type = 'info') {
    this.notifications.unshift({
      id: `not-${Date.now()}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  // ACTIVITY LOGS
  public getActivityLogs() { return this.logs; }
  private logAction(userId: string, action: string, entityType: string, entityId: string, description: string) {
    this.logs.unshift({
      id: `log-${Date.now()}`,
      userId,
      action,
      entityType,
      entityId,
      description,
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString()
    });
  }

  // METRICS & REPORTS
  public getOverviewStats() {
    const totalRooms = this.rooms.length;
    const occupiedRooms = this.rooms.filter(r => r.status === 'OCCUPIED').length;
    const availableRooms = this.rooms.filter(r => r.status === 'AVAILABLE').length;
    const cleaningRooms = this.rooms.filter(r => r.status === 'CLEANING').length;
    const activeStays = this.stays.filter(s => s.status === 'STAYING').length;
    
    // Total staying guests: Sum adults of checked-in bookings
    const activeBookings = this.bookings.filter(b => b.status === 'CHECKED_IN');
    const totalGuests = activeBookings.reduce((sum, b) => sum + b.numberOfAdults + b.numberOfChildren, 0);

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      cleaningRooms,
      activeStays,
      totalGuests
    };
  }

  public getRevenueStats() {
    // Computes weekly/monthly revenue based on invoices
    const last7Days = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      return d.toISOString().split('T')[0];
    }).reverse();

    const data = last7Days.map(date => {
      const dayInvoices = this.invoices.filter(inv => inv.issueDate.startsWith(date));
      const amount = dayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      return { date, amount };
    });

    return data;
  }
}

// Global db instance for state persistence
let dbInstance: MockDatabase;

export function getDB() {
  if (!dbInstance) {
    dbInstance = new MockDatabase();
  }
  return dbInstance;
}
