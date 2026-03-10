import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

// ============================================================
// SIDEBAR STORE
// ============================================================

interface SidebarStore {
  isOpen: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  setOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true,
      isMobileOpen: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setOpen: (open) => set({ isOpen: open }),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
    }),
    { name: 'sidebar-store' }
  )
);

// ============================================================
// AUTH STORE
// ============================================================

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-store' }
  )
);

// ============================================================
// UI STORE
// ============================================================

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  created_at: string;
}

interface UIStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
}

export const useUIStore = create<UIStore>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'Kajian Baru Ditambahkan',
      message: 'Kajian Tafsir Al-Quran telah dijadwalkan untuk 15 Maret 2024',
      type: 'info',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Event Selesai',
      message: 'Isra Miraj 1445 H telah selesai dilaksanakan',
      type: 'success',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Target Berbagi Tercapai',
      message: 'Program Bantuan Bencana Alam telah mencapai target donasi',
      type: 'success',
      read: true,
      created_at: new Date().toISOString(),
    },
  ],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substring(2, 9),
          read: false,
          created_at: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
