const AUTH_KEY = 'sb-demo-auth';

const DEMO_USERS = [
  {
    email: 'admin@darussalam.or.id',
    password: 'admin123',
    role: 'admin' as const,
    name: 'Admin',
  },
  {
    email: 'takmir@darussalam.or.id',
    password: 'takmir123',
    role: 'editor' as const,
    name: 'Takmir',
  },
];

export interface LocalDemoUser {
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  name: string;
}

export function buildSupabaseSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  return {
    access_token: 'demo-token',
    refresh_token: 'demo-refresh',
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { name: user.name, role: user.role },
    },
  };
}

export function getLocalSession() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setLocalSession(session: ReturnType<typeof buildSupabaseSession>) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearLocalSession() {
  localStorage.removeItem(AUTH_KEY);
}

export function validateDemoCredentials(
  email: string,
  password: string
): Omit<LocalDemoUser, 'password'> | null {
  const match = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!match) return null;
  const { password: _, ...user } = match;
  return user;
}
