'use client';

import { useState } from 'react';
import { Save, User, Bell, Shield, Palette } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store';

type Tab = 'profile' | 'notifications' | 'security' | 'appearance';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profil', icon: User },
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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast('success', 'Profil disimpan', 'Data profil berhasil diupdate');
  };

  return (
    <DashboardLayout title="Pengaturan" description="Kelola pengaturan akun dan aplikasi">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                      activeTab === tab.key
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700 flex-shrink-0">
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
