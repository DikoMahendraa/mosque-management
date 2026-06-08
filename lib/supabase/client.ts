import { createBrowserClient } from '@supabase/ssr';
import { isLocalAuthMode } from './auth-mode';
import {
  buildSupabaseSession,
  clearLocalSession,
  getLocalSession,
  setLocalSession,
  validateDemoCredentials,
} from './local-session';

type AuthChangeCallback = (event: string, session: ReturnType<typeof getLocalSession>) => void;

function createLocalAuthClient() {
  const listeners = new Set<AuthChangeCallback>();

  const notify = (event: string, session: ReturnType<typeof getLocalSession>) => {
    listeners.forEach((cb) => cb(event, session));
  };

  return {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const match = validateDemoCredentials(email, password);
        if (!match) {
          return {
            data: { user: null, session: null },
            error: { message: 'Email atau password salah.' },
          };
        }

        const session = buildSupabaseSession({
          id: `demo-${match.email}`,
          email: match.email,
          name: match.name,
          role: match.role,
        });
        setLocalSession(session);
        notify('SIGNED_IN', session);
        return { data: { user: session.user, session }, error: null };
      },

      async signUp() {
        return {
          data: { user: null, session: null },
          error: { message: 'Registrasi dinonaktifkan dalam mode demo.' },
        };
      },

      async signOut() {
        clearLocalSession();
        notify('SIGNED_OUT', null);
        return { error: null };
      },

      async getSession() {
        return { data: { session: getLocalSession() }, error: null };
      },

      async getUser() {
        const session = getLocalSession();
        return { data: { user: session?.user ?? null }, error: null };
      },

      onAuthStateChange(callback: AuthChangeCallback) {
        listeners.add(callback);
        callback('INITIAL_SESSION', getLocalSession());
        return {
          data: {
            subscription: {
              unsubscribe: () => listeners.delete(callback),
            },
          },
        };
      },
    },
  } as ReturnType<typeof createBrowserClient>;
}

export function createClient() {
  if (isLocalAuthMode()) {
    return createLocalAuthClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
