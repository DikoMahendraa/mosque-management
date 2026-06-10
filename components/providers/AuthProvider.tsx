'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { createClient } from '@/lib/supabase/client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setSession, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session) {
            setSession(session);
          }
        } else if (event === 'SIGNED_OUT') {
          logout();
          router.replace('/login');
          router.refresh();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setSession, logout, initializeAuth, router]);

  return <>{children}</>;
}
