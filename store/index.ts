import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { AppRole, FinanceCategory, MenuKey, User } from '@/types';
import { ALL_MENU_KEYS, FINANCE_CATEGORIES, isPrivilegedRole, normalizeRole } from '@/lib/permissions';
import { permissionsService } from '@/services/permissions.service';

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
  isInitialized: boolean;
  isAccessLoaded: boolean;
  session: Session | null;
  menuPermissions: MenuKey[];
  financeCategories: FinanceCategory[];
  login: (user: User, session?: Session | null) => void;
  logout: () => void;
  setSession: (session: Session | null) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

function clearLegacyAuthStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth-store');
  localStorage.removeItem('sb-demo-auth');
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isAccessLoaded: false,
  session: null,
  menuPermissions: [],
  financeCategories: [],
  login: (user, session = null) => {
    const role = normalizeRole(user.role);
    set({
      user: { ...user, role },
      isAuthenticated: true,
      isAccessLoaded: true,
      session,
      menuPermissions: isPrivilegedRole(role) ? [...ALL_MENU_KEYS] : ['dashboard'],
      financeCategories: isPrivilegedRole(role) ? [...FINANCE_CATEGORIES] : [],
    });
  },
  logout: () => set({
    user: null,
    isAuthenticated: false,
    isAccessLoaded: false,
    session: null,
    menuPermissions: [],
    financeCategories: [],
  }),
  setSession: async (session) => {
    if (session?.user) {
      const metadataRole = normalizeRole(String(session.user.user_metadata?.role ?? 'staff'));
      const fallbackUser: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
        role: metadataRole,
        avatar: session.user.user_metadata?.avatar,
        user_metadata: session.user.user_metadata,
      };

      set({
        user: fallbackUser,
        isAuthenticated: true,
        isAccessLoaded: false,
        session,
      });

      try {
        const access = await permissionsService.getCurrentUserAccess(session.user.id);
        const role: AppRole = access?.profile.role ?? metadataRole;
        set({
          user: {
            ...fallbackUser,
            name: access?.profile.name || fallbackUser.name,
            email: access?.profile.email || fallbackUser.email,
            role,
          },
          isAuthenticated: access?.profile.is_active ?? true,
          isAccessLoaded: true,
          session,
          menuPermissions: isPrivilegedRole(role)
            ? [...ALL_MENU_KEYS]
            : access?.menuPermissions.length
              ? access.menuPermissions
              : ['dashboard'],
          financeCategories: isPrivilegedRole(role)
            ? [...FINANCE_CATEGORIES]
            : access?.financeCategories ?? [],
        });
      } catch (error) {
        console.error('Failed to load user permissions:', error);
        set({
          user: fallbackUser,
          isAuthenticated: true,
          isAccessLoaded: true,
          session,
          menuPermissions: isPrivilegedRole(metadataRole) ? [...ALL_MENU_KEYS] : ['dashboard'],
          financeCategories: isPrivilegedRole(metadataRole) ? [...FINANCE_CATEGORIES] : [],
        });
      }
    } else {
      set({ user: null, isAuthenticated: false, session: null });
    }
  },
  initializeAuth: async () => {
    clearLegacyAuthStorage();

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        await get().setSession(session);
      } else {
        get().logout();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      get().logout();
    } finally {
      set({ isInitialized: true });
    }
  },
}));

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
