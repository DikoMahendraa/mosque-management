'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Bell, Search, ChevronDown, Check, LogOut, Settings, UserCircle } from 'lucide-react';
import { useSidebarStore, useAuthStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { authService } from '@/services/auth.service';

export default function Header() {
  const { toggle, toggleMobile } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useUIStore();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push('/login');
  };
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const unread = unreadCount();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { toggle(); toggleMobile(); }}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={toggle}
          className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:flex"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="h-9 w-64 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Tandai semua dibaca
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">Tidak ada notifikasi</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors',
                        !n.read && 'bg-emerald-50/50'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 h-2 w-2 flex-shrink-0 rounded-full',
                          n.type === 'success' && 'bg-emerald-500',
                          n.type === 'error' && 'bg-red-500',
                          n.type === 'info' && 'bg-blue-500',
                          n.type === 'warning' && 'bg-amber-500'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-emerald-600"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-100 px-4 py-2">
                <button
                  onClick={() => setShowNotif(false)}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-emerald-100">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-sm font-medium text-emerald-700">
                  {user?.name?.[0] ?? 'A'}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-none">{user?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link href="/dashboard/settings" onClick={() => setShowUser(false)} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <UserCircle className="h-4 w-4 text-gray-400" />
                  Profil
                </Link>
                <Link href="/dashboard/settings" onClick={() => setShowUser(false)} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings className="h-4 w-4 text-gray-400" />
                  Pengaturan
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close dropdowns on outside click */}
        {(showNotif || showUser) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => { setShowNotif(false); setShowUser(false); }}
          />
        )}
      </div>
    </header>
  );
}
