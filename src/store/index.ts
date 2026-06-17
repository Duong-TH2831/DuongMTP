import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Notification, getDB } from '../lib/db';

interface BookingCart {
  checkInDate: string;
  checkOutDate: string;
  roomTypeId: string;
  numberOfAdults: number;
  numberOfChildren: number;
  promoCode: string;
  discountAmount: number;
  bookingSuccessCode?: string;
}

interface AppState {
  // Booking state
  bookingCart: BookingCart;
  setBookingCart: (cart: Partial<BookingCart>) => void;
  resetBookingCart: () => void;

  // Language state
  language: 'VI' | 'EN';
  setLanguage: (lang: 'VI' | 'EN') => void;

  // Admin authentication state
  adminSession: {
    user: User | null;
    isLoggedIn: boolean;
  };
  loginAdmin: (email: string, password?: string) => boolean;
  logoutAdmin: () => void;

  // Notification state
  notifications: Notification[];
  fetchNotifications: () => void;
  markRead: (id: string) => void;

  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      // Booking state default values
      bookingCart: {
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
        roomTypeId: 'rt-deluxe',
        numberOfAdults: 2,
        numberOfChildren: 0,
        promoCode: '',
        discountAmount: 0,
      },
      setBookingCart: (cart) =>
        set((state) => ({
          bookingCart: { ...state.bookingCart, ...cart },
        })),
      resetBookingCart: () =>
        set({
          bookingCart: {
            checkInDate: new Date().toISOString().split('T')[0],
            checkOutDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
            roomTypeId: 'rt-deluxe',
            numberOfAdults: 2,
            numberOfChildren: 0,
            promoCode: '',
            discountAmount: 0,
          },
        }),

      // Language
      language: 'VI',
      setLanguage: (language) => set({ language }),

      // Theme
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Admin Auth
      adminSession: {
        user: null,
        isLoggedIn: false,
      },
      loginAdmin: (email, password) => {
        const db = getDB();
        const user = db.getUsers().find((u) => u.email === email && u.isActive);
        if (user) {
          const userPassword = user.password || '123456';
          if (password === undefined || userPassword === password) {
            set({
              adminSession: {
                user,
                isLoggedIn: true,
              },
            });
            return true;
          }
        }
        return false;
      },
      logoutAdmin: () => {
        set({
          adminSession: {
            user: null,
            isLoggedIn: false,
          },
        });
      },

      // Notifications
      notifications: [],
      fetchNotifications: () => {
        const db = getDB();
        set({ notifications: db.getNotifications() });
      },
      markRead: (id) => {
        const db = getDB();
        db.markNotificationRead(id);
        set({ notifications: db.getNotifications() });
      },
    }),
    {
      name: 'horizon_hms_store',
      partialize: (state) => ({
        bookingCart: state.bookingCart,
        language: state.language,
        adminSession: state.adminSession,
        theme: state.theme,
      }),
    }
  )
);
