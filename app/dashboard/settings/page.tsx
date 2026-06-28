'use client';

import { useState } from 'react';
import { Save, User, Bell, Shield, Palette, MessageSquare, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store';
import { AIProvider } from '@/types';

import { useAuthSettings, useUpdateAuthSettings, useWhatsAppSettings, useUpdateWhatsAppSettings, useAISettings, useUpdateAISettings } from '@/hooks/useSettings';
import { isPrivilegedRole } from '@/lib/permissions';

type Tab = 'profile' | 'notifications' | 'security' | 'appearance' | 'whatsapp' | 'ai';
type WhatsAppProvider = 'fonnte' | 'wablas' | 'twilio';

interface WhatsAppFormState {
  enabled: boolean;
  provider: WhatsAppProvider;
  token: string;
  device: string;
}

interface AIFormState {
  enabled: boolean;
  default_provider: AIProvider;
  gemini_api_key: string;
  openai_api_key: string;
  mosque_name: string;
}

interface AuthFormState {
  requireEmailVerificationForNewUsers: boolean;
}

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'whatsapp', label: 'WhatsApp API', icon: MessageSquare },
  { key: 'ai', label: 'Integrasi AI', icon: Sparkles },
  { key: 'notifications', label: 'Notifikasi', icon: Bell },
  { key: 'security', label: 'Keamanan', icon: Shield },
  { key: 'appearance', label: 'Tampilan', icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isSaving, setIsSaving] = useState(false);

  // WhatsApp API settings
  const { data: whatsappSettings, isLoading: isLoadingWhatsApp } = useWhatsAppSettings();
  const updateWhatsAppMutation = useUpdateWhatsAppSettings();
  const { data: authSettings, isLoading: isLoadingAuthSettings } = useAuthSettings();
  const updateAuthSettingsMutation = useUpdateAuthSettings();

  const { data: aiSettings, isLoading: isLoadingAI } = useAISettings();
  const updateAIMutation = useUpdateAISettings();

  const [waDraft, setWaDraft] = useState<WhatsAppFormState | null>(null);
  const [aiDraft, setAiDraft] = useState<AIFormState | null>(null);
  const [authDraft, setAuthDraft] = useState<AuthFormState | null>(null);

  const waForm: WhatsAppFormState = waDraft ?? {
    enabled: whatsappSettings?.enabled ?? false,
    provider: whatsappSettings?.provider ?? 'fonnte',
    token: whatsappSettings?.token ?? '',
    device: whatsappSettings?.device ?? '',
  };

  const updateWaForm = (patch: Partial<WhatsAppFormState>) => {
    setWaDraft({ ...waForm, ...patch });
  };

  const aiForm: AIFormState = aiDraft ?? {
    enabled: aiSettings?.enabled ?? false,
    default_provider: aiSettings?.default_provider ?? 'template',
    gemini_api_key: aiSettings?.gemini_api_key ?? '',
    openai_api_key: aiSettings?.openai_api_key ?? '',
    mosque_name: aiSettings?.mosque_name ?? 'Masjid Darussalam',
  };

  const updateAiForm = (patch: Partial<AIFormState>) => {
    setAiDraft({ ...aiForm, ...patch });
  }

  const authForm: AuthFormState = authDraft ?? {
    requireEmailVerificationForNewUsers: authSettings?.requireEmailVerificationForNewUsers ?? false,
  };

  const updateAuthForm = (patch: Partial<AuthFormState>) => {
    setAuthDraft({ ...authForm, ...patch });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast('success', 'Profil disimpan', 'Data profil berhasil diupdate');
  };

  const handleSaveWhatsApp = async () => {
    try {
      await updateWhatsAppMutation.mutateAsync({
        enabled: waForm.enabled,
        provider: waForm.provider,
        token: waForm.token,
        device: waForm.device,
      });
      setWaDraft(null);
      toast('success', 'Berhasil', 'Pengaturan WhatsApp API berhasil disimpan');
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan');
    }
  };

  const handleSaveAI = async () => {
    try {
      await updateAIMutation.mutateAsync({
        enabled: aiForm.enabled,
        default_provider: aiForm.default_provider,
        gemini_api_key: aiForm.gemini_api_key,
        openai_api_key: aiForm.openai_api_key,
        mosque_name: aiForm.mosque_name,
      });
      setAiDraft(null);
      toast('success', 'Berhasil', 'Pengaturan Integrasi AI berhasil disimpan');

    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan');
    }
  };

  const handleSaveAuthSettings = async () => {
    try {
      await updateAuthSettingsMutation.mutateAsync(authForm);
      setAuthDraft(null);
      toast('success', 'Berhasil', 'Pengaturan user baru berhasil disimpan');
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan');
    }
  };

  return (
    <DashboardLayout title="Pengaturan" description="Kelola pengaturan akun dan aplikasi">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-56 shrink-0">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${activeTab === tab.key
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card padding="md">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Informasi Profil</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                    {name[0] ?? 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <Input label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Role" value={user?.role ?? ''} disabled />
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveProfile} isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
                    Simpan Profil
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'whatsapp' && (
            <Card padding="md">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Pengaturan WhatsApp API</h3>
              <p className="mb-6 text-sm text-gray-600">
                Konfigurasi WhatsApp API untuk mengirim broadcast kajian dan event ke jamaah.
              </p>

              {isLoadingWhatsApp ? (
                <div className="text-center py-8 text-gray-500">Memuat pengaturan...</div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Aktifkan WhatsApp API</p>
                        <p className="text-xs text-gray-500">
                          Fitur broadcast akan muncul di halaman Kajian dan Events
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={waForm.enabled}
                          onChange={(e) => updateWaForm({ enabled: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>

                  {waForm.enabled && (
                    <>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-sm text-emerald-800 font-medium mb-2">📱 Panduan Setup:</p>
                        <ol className="text-xs text-emerald-700 space-y-1 ml-4 list-decimal">
                          <li>Pilih provider WhatsApp API (rekomendasi: Fonnte)</li>
                          <li>Daftar di website provider dan dapatkan API Token</li>
                          <li>Masukkan API Token dan Device/Sender di bawah ini</li>
                          <li>Simpan pengaturan dan test broadcast</li>
                        </ol>
                      </div>

                      <Select
                        label="Provider WhatsApp API"
                        value={waForm.provider}
                        onChange={(e) => updateWaForm({ provider: e.target.value as WhatsAppProvider })}
                        options={[
                          { value: 'fonnte', label: 'Fonnte.com (Rekomendasi)' },
                          { value: 'wablas', label: 'Wablas.com' },
                          { value: 'twilio', label: 'Twilio' },
                        ]}
                      />

                      <Input
                        label="API Token / Key"
                        type="password"
                        value={waForm.token}
                        onChange={(e) => updateWaForm({ token: e.target.value })}
                        placeholder="Masukkan API token dari provider"
                      />

                      <Input
                        label="Device / Sender Number (Optional)"
                        value={waForm.device}
                        onChange={(e) => updateWaForm({ device: e.target.value })}
                        placeholder="Contoh: 628123456789"
                      />

                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs text-blue-800">
                          💡 <strong>Tip:</strong> Pastikan nomor WhatsApp sudah terverifikasi di provider yang Anda pilih.
                          Untuk Fonnte, kunjit{' '}
                          <a
                            href="https://fonnte.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-medium"
                          >
                            fonnte.com
                          </a>
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveWhatsApp}
                      isLoading={updateWhatsAppMutation.isPending}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Simpan Pengaturan
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card padding="md">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Integrasi AI</h3>
              <p className="mb-6 text-sm text-gray-600">
                Simpan token API AI di satu tempat. Fitur poster event saat ini memakai template gratis;
                token Gemini atau OpenAI akan dipakai otomatis saat fitur AI image dirilis.
              </p>

              {isLoadingAI ? (
                <div className="text-center py-8 text-gray-500">Memuat pengaturan...</div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Aktifkan Integrasi AI</p>
                        <p className="text-xs text-gray-500">
                          Dashboard akan menggunakan provider default yang dipilih
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={aiForm.enabled}
                          onChange={(e) => updateAiForm({ enabled: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-800 font-medium mb-2">✨ Cara setup token gratis / trial:</p>
                    <ul className="text-xs text-emerald-700 space-y-1 ml-4 list-disc">
                      <li><strong>Gemini:</strong> buat API key di <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a> (free tier tersedia)</li>
                      <li><strong>OpenAI:</strong> buat API key di <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></li>
                      <li>Simpan token di bawah — cukup sekali, dipakai semua fitur AI dashboard</li>
                    </ul>
                  </div>

                  <Select
                    label="Provider Default"
                    value={aiForm.default_provider}
                    onChange={(e) => updateAiForm({ default_provider: e.target.value as AIProvider })}
                    options={[
                      { value: 'template', label: 'Template Gratis (tanpa API)' },
                      { value: 'gemini', label: 'Google Gemini' },
                      { value: 'openai', label: 'OpenAI (ChatGPT / DALL-E)' },
                    ]}
                  />

                  <Input
                    label="Nama Masjid (untuk poster)"
                    value={aiForm.mosque_name}
                    onChange={(e) => updateAiForm({ mosque_name: e.target.value })}
                    placeholder="Masjid Darussalam"
                  />

                  <Input
                    label="Gemini API Key"
                    type="password"
                    value={aiForm.gemini_api_key}
                    onChange={(e) => updateAiForm({ gemini_api_key: e.target.value })}
                    placeholder="AIza..."
                    hint="Dari Google AI Studio — free tier untuk testing"
                  />

                  <Input
                    label="OpenAI API Key"
                    type="password"
                    value={aiForm.openai_api_key}
                    onChange={(e) => updateAiForm({ openai_api_key: e.target.value })}
                    placeholder="sk-..."
                    hint="Dari OpenAI Platform"
                  />

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-2">
                    <p className="text-xs text-blue-800">
                      <strong>Status:</strong>{' '}
                      {aiForm.gemini_api_key.trim() ? '✅ Gemini key tersimpan' : '⬜ Gemini belum diisi'}
                      {' · '}
                      {aiForm.openai_api_key.trim() ? '✅ OpenAI key tersimpan' : '⬜ OpenAI belum diisi'}
                    </p>
                    <p className="text-xs text-blue-700">
                      Poster event sudah bisa dibuat dengan <strong>template gratis</strong> atau <strong>AI background</strong> di form Tambah/Edit Event setelah API key disimpan.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveAI}
                      isLoading={updateAIMutation.isPending}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Simpan Pengaturan AI
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card padding="md">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Pengaturan Notifikasi</h3>
              <div className="space-y-4">
                {[
                  { label: 'Kajian baru ditambahkan', description: 'Notifikasi saat admin menambahkan kajian baru' },
                  { label: 'Event mendatang', description: 'Pengingat event yang akan datang dalam 3 hari' },
                  { label: 'Laporan keuangan', description: 'Ringkasan keuangan mingguan' },
                  { label: 'Donasi program berbagi', description: 'Update donasi program berbagi' },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{n.label}</p>
                      <p className="text-xs text-gray-400">{n.description}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card padding="md">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Keamanan Akun</h3>
              <div className="space-y-4">
                {isPrivilegedRole(user?.role) && (
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Wajib Verifikasi Email untuk User Baru</p>
                        <p className="text-xs text-gray-500">
                          Jika aktif, form tambah user akan mengirim undangan email dan menyembunyikan password sementara.
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={authForm.requireEmailVerificationForNewUsers}
                          disabled={isLoadingAuthSettings}
                          onChange={(e) => updateAuthForm({ requireEmailVerificationForNewUsers: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-disabled:opacity-50" />
                      </label>
                    </div>
                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      {authForm.requireEmailVerificationForNewUsers
                        ? 'Mode aktif: user baru harus menerima email undangan dan membuat password dari link.'
                        : 'Mode nonaktif: admin membuat user langsung dengan password sementara tanpa email konfirmasi.'}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={handleSaveAuthSettings}
                        isLoading={updateAuthSettingsMutation.isPending}
                        leftIcon={<Save className="h-4 w-4" />}
                      >
                        Simpan Pengaturan User
                      </Button>
                    </div>
                  </div>
                )}

                <Input label="Password Lama" type="password" placeholder="••••••••" />
                <Input label="Password Baru" type="password" placeholder="••••••••" />
                <Input label="Konfirmasi Password Baru" type="password" placeholder="••••••••" />
                <div className="flex justify-end pt-2">
                  <Button onClick={() => toast('success', 'Password diupdate', 'Password berhasil diubah')} leftIcon={<Shield className="h-4 w-4" />}>
                    Ubah Password
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card padding="md">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Pengaturan Tampilan</h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Tema Warna</p>
                  <div className="flex gap-3">
                    {[
                      { label: 'Emerald', color: 'bg-emerald-500' },
                      { label: 'Blue', color: 'bg-blue-500' },
                      { label: 'Purple', color: 'bg-purple-500' },
                      { label: 'Amber', color: 'bg-amber-500' },
                    ].map((theme) => (
                      <button
                        key={theme.label}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${theme.label === 'Emerald' ? 'border-emerald-500' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <div className={`h-8 w-8 rounded-full ${theme.color}`} />
                        <span className="text-xs text-gray-600">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Sidebar Default</p>
                  <div className="flex gap-3">
                    {['Expanded', 'Collapsed'].map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-100 px-4 py-3">
                        <input type="radio" name="sidebar" defaultChecked={opt === 'Expanded'} className="accent-emerald-600" />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => toast('success', 'Tampilan disimpan', 'Pengaturan tampilan berhasil disimpan')} leftIcon={<Save className="h-4 w-4" />}>
                    Simpan Tampilan
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
