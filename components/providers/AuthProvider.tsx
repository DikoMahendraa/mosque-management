'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { createClient } from '@/lib/supabase/client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setSession, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: { user?: { email?: string } } | null) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session) {
            setSession(session);
          }
        } else if (event === 'SIGNED_OUT') {
          logout();
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setSession, logout, initializeAuth, router]);

  return <>{children}</>;
}
