'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  BookOpen,
  CalendarDays,
  GraduationCap,
  DollarSign,
  Users,
  UserCircle,
  Settings,
  X,
} from 'lucide-react';
import { useAuthStore, useSidebarStore } from '@/store';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/ui/AppLogo';
import { APP_VERSION } from '@/lib/version';
import { canAccessMenu, DASHBOARD_MENUS, MenuKey } from '@/lib/permissions';

const menuIcons: Record<MenuKey, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  landing: Globe,
  kajian: BookOpen,
  events: CalendarDays,
  finance: DollarSign,
  ustad: GraduationCap,
  jamaah: UserCircle,
  management: Users,
  users: Users,
  settings: Settings,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isMobileOpen, setMobileOpen } = useSidebarStore();
  const { user, menuPermissions } = useAuthStore();
  const navItems = DASHBOARD_MENUS.filter((item) =>
    canAccessMenu(user?.role, menuPermissions, item.key)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-linear-to-b from-primary to-primary/80 text-white transition-all duration flex flex-col',
          isOpen ? 'lg:w-64' : 'lg:w-20',
          isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-primary/20 bg-white">
          <div className={cn('flex items-center gap-3', !isOpen && 'lg:justify-center')}>
            <AppLogo
              size={isOpen || isMobileOpen ? 'md' : 'sm'}
              className="shrink-0 text-primary"
            />
            {(isOpen || isMobileOpen) && (
              <p className="text-sm text-primary font-semibold">Masjid Darussalam</p>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-primary hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
              const Icon = menuIcons[item.key];

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 group',
                      isActive
                        ? 'bg-primary text-white border border-primary'
                        : 'text-white hover:bg-white hover:text-primary',
                      !isOpen && 'lg:justify-center lg:px-2'
                    )}
                    title={!isOpen ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-white group-hover:text-primary'
                      )}
                    />
                    {(isOpen || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && (isOpen || isMobileOpen) && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-primary px-3 py-3">
          {(isOpen || isMobileOpen) && (
            <div className="text-center text-xs text-white/80 space-y-0.5">
              <p>© 2026 Masjid Darussalam</p>
              <p>v{APP_VERSION}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
