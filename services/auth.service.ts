import { User } from '@/types';
import { createClient } from '@/lib/supabase/client';

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
  session: any; // Supabase session
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      throw new Error(error.message || 'Login gagal. Silakan coba lagi.');
    }

    if (!data.user || !data.session) {
      throw new Error('Login gagal. Silakan coba lagi.');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
      role: data.user.user_metadata?.role || 'editor',
      avatar: data.user.user_metadata?.avatar,
      user_metadata: data.user.user_metadata,
    };

    return {
      user,
      session: data.session,
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          role: 'editor', // Default role for new users
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Registrasi gagal. Silakan coba lagi.');
    }

    if (!data.user) {
      throw new Error('Registrasi gagal. Silakan coba lagi.');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || payload.name,
      role: data.user.user_metadata?.role || 'editor',
      avatar: data.user.user_metadata?.avatar,
      user_metadata: data.user.user_metadata,
    };

    return {
      user,
      session: data.session,
    };
  },

  async logout(): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout, just log it
    }
  },

  async getCurrentSession(): Promise<any> {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return session;
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      role: user.user_metadata?.role || 'editor',
      avatar: user.user_metadata?.avatar,
      user_metadata: user.user_metadata,
    };
  },
};
