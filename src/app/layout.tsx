import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import ThemeSync from '@/components/ThemeSync';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dmsans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

const beVietnam = Be_Vietnam_Pro({
  variable: '--font-bevietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Horizon Grand Resort & HMS',
  description: 'Trang đặt phòng khách sạn nghỉ dưỡng cao cấp và hệ thống quản trị Horizon HMS.',
  keywords: 'horizon hotel, resort phu quoc, horizon hms, dat phong khach san',
  authors: [{ name: 'Horizon Resort Group' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${cormorant.variable} ${dmSans.variable} ${beVietnam.variable} h-full antialiased`}
    >
      <body className="min-h-full font-dmsans bg-[#0a0a0f] text-[#f5f0e8] selection:bg-gold selection:text-black">
        <ThemeSync />
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
