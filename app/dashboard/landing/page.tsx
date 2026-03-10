'use client';

import { useState } from 'react';
import { Globe, Save, Plus, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/components/ui/Toast';
import {
  useHero, useUpdateHero,
  useAbout, useUpdateAbout,
  useVisionMission, useUpdateVisionMission,
  useFeaturedPrograms, useCreateFeaturedProgram, useUpdateFeaturedProgram, useDeleteFeaturedProgram,
  useContact, useUpdateContact,
} from '@/hooks/useLanding';
import { FeaturedProgram } from '@/types';
import { useForm, Controller } from 'react-hook-form';

type Tab = 'hero' | 'about' | 'vision' | 'programs' | 'contact';

const tabs: { key: Tab; label: string }[] = [
  { key: 'hero', label: 'Hero Section' },
  { key: 'about', label: 'Tentang Masjid' },
  { key: 'vision', label: 'Visi & Misi' },
  { key: 'programs', label: 'Program Unggulan' },
  { key: 'contact', label: 'Kontak' },
];

// ─── HERO ───────────────────────────────────────────────────
function HeroTab() {
  const { data, isLoading } = useHero();
  const mutation = useUpdateHero();
  const { register, handleSubmit } = useForm({ values: data?.data });

  if (isLoading) return <LoadingSpinner />;
  return (
    <form onSubmit={handleSubmit(async (d) => {
      try { await mutation.mutateAsync(d); toast('success', 'Berhasil', 'Hero section diupdate'); }
      catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
    })} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Judul" {...register('title')} />
        <Input label="Subjudul" {...register('subtitle')} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Deskripsi</label>
        <textarea className="h-24 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none" {...register('description')} />
      </div>
      <Input label="URL Gambar" placeholder="https://..." {...register('image')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Teks Tombol" {...register('button_text')} />
        <Input label="Link Tombol" placeholder="#programs" {...register('button_link')} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isPending} leftIcon={<Save className="h-4 w-4" />}>Simpan Perubahan</Button>
      </div>
    </form>
  );
}

// ─── ABOUT ──────────────────────────────────────────────────
function AboutTab() {
  const { data, isLoading } = useAbout();
  const mutation = useUpdateAbout();
  const { register, handleSubmit, control } = useForm({ values: data?.data });

  if (isLoading) return <LoadingSpinner />;
  return (
    <form onSubmit={handleSubmit(async (d) => {
      try { await mutation.mutateAsync(d); toast('success', 'Berhasil', 'Data tentang masjid diupdate'); }
      catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
    })} className="space-y-4">
      <Input label="Judul" {...register('title')} />
      <Input label="URL Gambar" placeholder="https://..." {...register('image')} />
      <Controller
        name="description"
        control={control}
        render={({ field }) => <RichTextEditor label="Deskripsi" value={field.value ?? ''} onChange={field.onChange} />}
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isPending} leftIcon={<Save className="h-4 w-4" />}>Simpan Perubahan</Button>
      </div>
    </form>
  );
}

// ─── VISION & MISSION ───────────────────────────────────────
function VisionTab() {
  const { data, isLoading } = useVisionMission();
  const mutation = useUpdateVisionMission();
  const { register, handleSubmit } = useForm({ values: data?.data });

  const vm = data?.data;
  const currentMissions = vm?.missions ?? [];

  if (isLoading) return <LoadingSpinner />;
  return (
    <form onSubmit={handleSubmit(async (d) => {
      try {
        await mutation.mutateAsync({ ...d, missions: currentMissions });
        toast('success', 'Berhasil', 'Visi & Misi diupdate');
      } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
    })} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Visi</label>
        <textarea className="h-24 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none" {...register('vision')} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Misi</label>
        <div className="space-y-2">
          {currentMissions.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={m}
                onChange={(e) => {
                  const next = [...currentMissions];
                  next[i] = e.target.value;
                  mutation.mutateAsync({ missions: next });
                }}
                placeholder={`Misi ${i + 1}`}
              />
              <Button type="button" variant="ghost" size="sm" className="text-red-400 hover:bg-red-50" onClick={() => {
                const next = currentMissions.filter((_, idx) => idx !== i);
                mutation.mutateAsync({ missions: next });
              }}>✕</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => mutation.mutateAsync({ missions: [...currentMissions, ''] })}>
            + Tambah Misi
          </Button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isPending} leftIcon={<Save className="h-4 w-4" />}>Simpan Perubahan</Button>
      </div>
    </form>
  );
}

// ─── PROGRAMS ───────────────────────────────────────────────
function ProgramsTab() {
  const { data, isLoading } = useFeaturedPrograms();
  const createMutation = useCreateFeaturedProgram();
  const updateMutation = useUpdateFeaturedProgram();
  const deleteMutation = useDeleteFeaturedProgram();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FeaturedProgram | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Omit<FeaturedProgram, 'id'>>({
    defaultValues: { title: '', description: '', icon: 'Star', order: 1 },
  });

  const openCreate = () => { setEditItem(null); reset({ title: '', description: '', icon: 'Star', order: (data?.data.length ?? 0) + 1 }); setIsModalOpen(true); };
  const openEdit = (item: FeaturedProgram) => { setEditItem(item); reset({ title: item.title, description: item.description, icon: item.icon, order: item.order }); setIsModalOpen(true); };

  const onSubmit = async (formData: Omit<FeaturedProgram, 'id'>) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Program diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Program ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  if (isLoading) return <LoadingSpinner />;
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Program</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(data?.data ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-800">{item.title}</p>
              <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-3">
              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-50" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Program' : 'Tambah Program'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Program" required {...register('title', { required: true })} />
          <Input label="Deskripsi Singkat" {...register('description')} />
          <Input label="Nama Icon (Lucide)" placeholder="Star, Heart, BookOpen..." {...register('icon')} />
          <Input label="Urutan" type="number" {...register('order', { valueAsNumber: true })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => {
        if (!deleteId) return;
        try { await deleteMutation.mutateAsync(deleteId); toast('success', 'Berhasil', 'Program dihapus'); setDeleteId(null); }
        catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
      }} isLoading={deleteMutation.isPending} />
    </div>
  );
}

// ─── CONTACT ────────────────────────────────────────────────
function ContactTab() {
  const { data, isLoading } = useContact();
  const mutation = useUpdateContact();
  const { register, handleSubmit } = useForm({ values: data?.data });

  if (isLoading) return <LoadingSpinner />;
  return (
    <form onSubmit={handleSubmit(async (d) => {
      try { await mutation.mutateAsync(d); toast('success', 'Berhasil', 'Informasi kontak diupdate'); }
      catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
    })} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Alamat</label>
        <textarea className="h-20 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none" {...register('address')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Telepon" {...register('phone')} />
        <Input label="Email" type="email" {...register('email')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input label="Instagram" placeholder="@username" {...register('social_instagram')} />
        <Input label="YouTube" {...register('social_youtube')} />
        <Input label="Facebook" {...register('social_facebook')} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isPending} leftIcon={<Save className="h-4 w-4" />}>Simpan Perubahan</Button>
      </div>
    </form>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hero');

  const tabContent: Record<Tab, React.ReactNode> = {
    hero: <HeroTab />,
    about: <AboutTab />,
    vision: <VisionTab />,
    programs: <ProgramsTab />,
    contact: <ContactTab />,
  };

  return (
    <DashboardLayout title="Landing Page" description="Kelola konten halaman utama website masjid">
      <Card padding="none">
        {/* Tab Header */}
        <div className="flex overflow-x-auto border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.key
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Globe className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="p-5">{tabContent[activeTab]}</div>
      </Card>
    </DashboardLayout>
  );
}
