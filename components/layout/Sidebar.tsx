'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Heart,
  Image,
  Newspaper,
  DollarSign,
  Users,
  Clock,
  Star,
  Settings,
  X,
  Building2,
} from 'lucide-react';
import { useSidebarStore } from '@/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/landing', label: 'Landing Page', icon: Globe },
  { href: '/dashboard/kajian', label: 'Kajian', icon: BookOpen },
  { href: '/dashboard/events', label: 'Events', icon: CalendarDays },
  { href: '/dashboard/tahsin', label: 'Tahsin', icon: GraduationCap },
  { href: '/dashboard/berbagi', label: 'Berbagi', icon: Heart },
  { href: '/dashboard/gallery', label: 'Dokumentasi', icon: Image },
  { href: '/dashboard/posts', label: 'Berita Terkini', icon: Newspaper },
  { href: '/dashboard/finance', label: 'Keuangan', icon: DollarSign },
  { href: '/dashboard/management', label: 'Pengurus', icon: Users },
  { href: '/dashboard/prayer', label: 'Jadwal Sholat', icon: Clock },
  { href: '/dashboard/friday', label: 'Jadwal Jumat', icon: Star },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isMobileOpen, setMobileOpen } = useSidebarStore();

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
          'fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-emerald-900 to-emerald-950 text-white transition-all duration-300 flex flex-col',
          isOpen ? 'lg:w-64' : 'lg:w-20',
          isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-emerald-700/50">
          <div className={cn('flex items-center gap-3', !isOpen && 'lg:justify-center')}>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Building2 className="h-5 w-5 text-emerald-300" />
            </div>
            {(isOpen || isMobileOpen) && (
              <div>
                <p className="text-sm font-bold text-white leading-none">Darussalam</p>
                <p className="text-xs text-emerald-300 mt-0.5">Dashboard</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-emerald-300 hover:text-white"
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
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 group',
                      isActive
                        ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
                        : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white',
                      !isOpen && 'lg:justify-center lg:px-2'
                    )}
                    title={!isOpen ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors',
                        isActive ? 'text-emerald-300' : 'text-emerald-400 group-hover:text-emerald-200'
                      )}
                    />
                    {(isOpen || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && (isOpen || isMobileOpen) && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-emerald-700/50 px-3 py-3">
          {(isOpen || isMobileOpen) && (
            <p className="text-center text-xs text-emerald-500">
              © 2024 Masjid Darussalam
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
