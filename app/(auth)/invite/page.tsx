'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store';
import { AppLogo } from '@/components/ui/AppLogo';

interface InviteForm {
  password: string;
  confirm_password: string;
}

export default function InvitePage() {
  const router = useRouter();
  const { setSession, logout } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [invitedEmail, setInvitedEmail] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({
    defaultValues: { password: '', confirm_password: '' },
  });

  const passwordValue = useWatch({ control, name: 'password' });

  useEffect(() => {
    const initializeInviteSession = async () => {
      const supabase = createClient();
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      const type = hash.get('type');

      if (type !== 'invite' || !accessToken || !refreshToken) {
        await supabase.auth.signOut();
        logout();
        setServerError('Link undangan tidak valid atau sudah kedaluwarsa. Minta admin mengirim ulang undangan.');
        setIsCheckingSession(false);
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        await supabase.auth.signOut();
        logout();
        setServerError('Link undangan tidak valid atau sudah kedaluwarsa. Minta admin mengirim ulang undangan.');
        setIsCheckingSession(false);
        return;
      }

      window.history.replaceState(null, '', '/invite');
      setInvitedEmail(data.session.user.email ?? '');
      await setSession(data.session);
      setIsCheckingSession(false);
    };

    initializeInviteSession();
  }, [logout, setSession]);

  const onSubmit = async (data: InviteForm) => {
    setServerError('');

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Sesi undangan tidak valid. Buka ulang link undangan dari email.');
      }

      const { data: updateData, error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw new Error(error.message);

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        await setSession(sessionData.session);
      } else if (updateData.user) {
        router.refresh();
      }

      router.replace('/dashboard');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Gagal membuat password');
    }
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { level: 1, label: 'Terlalu pendek', color: 'bg-red-400' };
    if (pwd.length < 8) return { level: 2, label: 'Lemah', color: 'bg-orange-400' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { level: 4, label: 'Kuat', color: 'bg-emerald-500' };
    return { level: 3, label: 'Sedang', color: 'bg-amber-400' };
  };

  const strength = passwordStrength(passwordValue);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <AppLogo size="md" />
          <p className="mt-1 text-xs text-gray-500">Management Dashboard</p>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Aktivasi Akun</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Buat password untuk menyelesaikan undangan akun Anda.
          </p>
          {invitedEmail && (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              {invitedEmail}
            </p>
          )}
        </div>

        {isCheckingSession ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            Memeriksa link undangan...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 ${errors.password
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
                  {...register('password', {
                    required: 'Password wajib diisi',
                    minLength: { value: 6, message: 'Password minimal 6 karakter' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i <= strength.level ? strength.color : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CheckCircle2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 ${errors.confirm_password
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
                  {...register('confirm_password', {
                    required: 'Konfirmasi password wajib diisi',
                    validate: (value) => value === passwordValue || 'Password tidak sama',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!serverError}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Menyimpan...' : 'Buat Password & Masuk'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
