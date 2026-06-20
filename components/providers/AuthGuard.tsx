'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { canAccessMenu, getMenuKeyForPath } from '@/lib/permissions';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, isAccessLoaded, user, menuPermissions } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);
  const menuKey = getMenuKeyForPath(pathname);
  const isAuthorized = canAccessMenu(user?.role, menuPermissions, menuKey);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated && !redirected.current) {
      redirected.current = true;
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !isAccessLoaded || isAuthorized) return;
    router.replace('/dashboard');
  }, [isAccessLoaded, isAuthenticated, isAuthorized, isInitialized, router]);

  if (!isInitialized || !isAuthenticated || !isAccessLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner text="Memeriksa sesi..." size="lg" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner text="Mengalihkan halaman..." size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
