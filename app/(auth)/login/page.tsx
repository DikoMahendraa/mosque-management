'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await authService.login({ email: data.email, password: data.password });
      login(res.user, res.session);
      router.push('/dashboard');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-12">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white leading-tight">Masjid Darussalam</p>
            <p className="text-xs text-emerald-100">Management Dashboard</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 text-center">
          {/* Mosque silhouette */}
          <div className="mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <svg viewBox="0 0 100 100" className="h-24 w-24 text-white" fill="currentColor">
              <path d="M50 5 C40 5, 35 12, 35 20 C35 28, 40 32, 50 35 C60 32, 65 28, 65 20 C65 12, 60 5, 50 5Z" />
              <path d="M47 35 L47 55 L53 55 L53 35 Z" />
              <rect x="15" y="55" width="70" height="5" rx="2" />
              <path d="M10 60 L10 90 L35 90 L35 70 L45 60 L55 60 L65 70 L65 90 L90 90 L90 60 Z" />
              <rect x="42" y="70" width="16" height="20" rx="8" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Sistem Manajemen<br />Masjid Modern
          </h2>
          <p className="mt-3 text-base text-emerald-100 leading-relaxed max-w-xs mx-auto">
            Kelola kajian, kegiatan, keuangan, dan informasi masjid dalam satu platform terintegrasi.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { label: 'Kajian & Event', desc: 'Kelola jadwal kegiatan' },
            { label: 'Keuangan', desc: 'Arus kas transparan' },
            { label: 'Jadwal Sholat', desc: 'Imam & muadzin harian' },
            { label: 'Program Berbagi', desc: 'Kelola donasi & sedekah' },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl bg-white/10 backdrop-blur-sm p-3">
              <p className="text-sm font-semibold text-white">{f.label}</p>
              <p className="text-xs text-emerald-100 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Masjid Darussalam</p>
              <p className="text-xs text-gray-500">Management Dashboard</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Masukkan kredensial Anda untuk mengakses dashboard
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
            <p className="text-xs font-semibold text-emerald-700 mb-1">Akun Demo</p>
            <div className="space-y-0.5 text-xs text-emerald-600 font-mono">
              <p>admin@darussalam.or.id / admin123</p>
              <p>takmir@darussalam.or.id / takmir123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Server error */}
            {serverError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="admin@darussalam.or.id"
                  className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 ${errors.email
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' },
                  })}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 ${errors.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
                  {...register('password', { required: 'Password wajib diisi' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 accent-emerald-600"
                {...register('remember')}
              />
              <span className="text-sm text-gray-600">Ingat saya selama 30 hari</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Daftar sekarang
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Masjid Darussalam. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
