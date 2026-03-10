import { User } from '@/types';

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

const MOCK_ACCOUNTS: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@darussalam.or.id',
    password: 'admin123',
    user: {
      id: '1',
      name: 'Admin Darussalam',
      email: 'admin@darussalam.or.id',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
  },
  {
    email: 'takmir@darussalam.or.id',
    password: 'takmir123',
    user: {
      id: '2',
      name: 'Takmir Masjid',
      email: 'takmir@darussalam.or.id',
      role: 'editor',
      avatar: '',
    },
  },
];

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay();
    const account = MOCK_ACCOUNTS.find(
      (a) => a.email === payload.email && a.password === payload.password
    );
    if (!account) {
      throw new Error('Email atau password salah. Silakan coba lagi.');
    }
    return {
      user: account.user,
      token: 'mock-jwt-token-' + account.user.id,
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay();
    const existing = MOCK_ACCOUNTS.find((a) => a.email === payload.email);
    if (existing) {
      throw new Error('Email sudah terdaftar. Gunakan email lain.');
    }
    if (payload.password.length < 6) {
      throw new Error('Password minimal 6 karakter.');
    }
    const newUser: User = {
      id: String(Date.now()),
      name: payload.name,
      email: payload.email,
      role: 'editor',
      avatar: '',
    };
    MOCK_ACCOUNTS.push({ email: payload.email, password: payload.password, user: newUser });
    return {
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id,
    };
  },

  async logout(): Promise<void> {
    await delay(200);
  },
};
