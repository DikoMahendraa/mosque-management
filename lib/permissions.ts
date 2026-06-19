export type AppRole = 'root_admin' | 'admin' | 'staff';

export const FINANCE_CATEGORIES = ['Sosial', 'Kajian', 'Operasional'] as const;
export type FinanceCategory = (typeof FINANCE_CATEGORIES)[number];

export const DASHBOARD_MENUS = [
  { key: 'dashboard', href: '/dashboard', label: 'Dashboard' },
  { key: 'landing', href: '/dashboard/landing', label: 'Landing Page' },
  { key: 'kajian', href: '/dashboard/kajian', label: 'Kajian' },
  { key: 'events', href: '/dashboard/events', label: 'Events' },
  { key: 'finance', href: '/dashboard/finance', label: 'Keuangan' },
  { key: 'ustad', href: '/dashboard/ustad', label: 'Daftar Ustad' },
  { key: 'jamaah', href: '/dashboard/jamaah', label: 'Daftar Jamaah' },
  { key: 'management', href: '/dashboard/management', label: 'Pengurus' },
  { key: 'users', href: '/dashboard/users', label: 'Users' },
  { key: 'settings', href: '/dashboard/settings', label: 'Pengaturan' },
] as const;

export type MenuKey = (typeof DASHBOARD_MENUS)[number]['key'];

export const ALL_MENU_KEYS = DASHBOARD_MENUS.map((menu) => menu.key);

export function normalizeRole(role?: string | null): AppRole {
  if (role === 'root_admin' || role === 'admin' || role === 'staff') return role;
  if (role === 'viewer' || role === 'editor') return 'staff';
  return 'staff';
}

export function isPrivilegedRole(role?: string | null) {
  return role === 'root_admin' || role === 'admin';
}

export function getMenuKeyForPath(pathname: string): MenuKey {
  const match = [...DASHBOARD_MENUS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((menu) => pathname === menu.href || pathname.startsWith(`${menu.href}/`));

  return match?.key ?? 'dashboard';
}

export function canAccessMenu(role: AppRole | undefined, menuPermissions: MenuKey[], menuKey: MenuKey) {
  if (isPrivilegedRole(role)) return true;
  if (menuKey === 'dashboard') return true;
  return menuPermissions.includes(menuKey);
}
