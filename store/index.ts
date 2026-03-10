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
  session: any | null; // Supabase session
  login: (user: User, session?: any) => void;
  logout: () => void;
  setSession: (session: any) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      session: null,
      login: (user, session = null) => set({ user, isAuthenticated: true, session }),
      logout: () => set({ user: null, isAuthenticated: false, session: null }),
      setSession: (session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            role: session.user.user_metadata?.role || 'editor',
            avatar: session.user.user_metadata?.avatar,
            user_metadata: session.user.user_metadata,
          };
          set({ user, isAuthenticated: true, session });
        } else {
          set({ user: null, isAuthenticated: false, session: null });
        }
      },
      initializeAuth: async () => {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            get().setSession(session);
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        }
      },
    }),
    { 
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        // Don't persist the session object, it will be refreshed from Supabase
      }),
    }
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
