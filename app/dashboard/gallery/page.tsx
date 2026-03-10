'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useGalleryList, useCreateGallery, useUpdateGallery, useDeleteGallery } from '@/hooks/useGallery';
import { GalleryItem, GalleryFormData } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import NextImage from 'next/image';

const CATEGORIES = ['Kajian', 'Event', 'Tahsin', 'Berbagi', 'Masjid', 'Lainnya'];

const defaultValues: GalleryFormData = {
  title: '',
  category: 'Kajian',
  image: '',
  date: '',
  description: '',
};

export default function GalleryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGalleryList({ page, limit: 12, search, category: categoryFilter });
  const createMutation = useCreateGallery();
  const updateMutation = useUpdateGallery();
  const deleteMutation = useDeleteGallery();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GalleryFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    reset({ title: item.title, category: item.category, image: item.image, date: item.date, description: item.description });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: GalleryFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Foto berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Foto berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Foto berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Dokumentasi"
      description="Galeri foto kegiatan masjid"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Foto</Button>}
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari foto..." className="sm:w-72" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setCategoryFilter(''); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!categoryFilter ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); setPage(1); }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${categoryFilter === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? <LoadingSpinner text="Memuat galeri..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={ImageIcon} title="Belum ada foto" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Foto</Button>} />
          ) : (
            <>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {data?.data.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square hover:shadow-md transition-all">
                    <NextImage
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-gray-300">{formatDate(item.date)}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-gray-700 hover:bg-white shadow-sm">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-red-500 hover:bg-white shadow-sm">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
              {data?.meta && <div className="mt-4"><Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} /></div>}
            </>
          )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Foto' : 'Tambah Foto'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Judul" required error={errors.title?.message} {...register('title', { required: 'Judul wajib diisi' })} />
          <Input label="URL Gambar" required error={errors.image?.message} placeholder="https://..." {...register('image', { required: 'URL gambar wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Kategori</label>
              <select className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" {...register('category')}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Tanggal" type="date" required error={errors.date?.message} {...register('date', { required: 'Tanggal wajib diisi' })} />
          </div>
          <Textarea label="Keterangan" rows={3} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Foto'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
