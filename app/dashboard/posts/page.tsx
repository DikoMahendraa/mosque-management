'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Newspaper } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import RichTextEditor from '@/components/ui/RichTextEditor';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { usePostList, useCreatePost, useUpdatePost, useDeletePost } from '@/hooks/usePosts';
import { Post, PostFormData } from '@/types';
import { formatDate, slugify } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';

const defaultValues: PostFormData = {
  title: '',
  slug: '',
  content: '',
  cover_image: '',
  author: '',
  published_date: '',
  status: 'draft',
};

export default function PostsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = usePostList({ page, limit: 8, search, status: statusFilter });
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<PostFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: Post) => {
    setEditItem(item);
    reset({ title: item.title, slug: item.slug, content: item.content, cover_image: item.cover_image, author: item.author, published_date: item.published_date, status: item.status });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: PostFormData) => {
    try {
      const payload = { ...formData, slug: formData.slug || slugify(formData.title) };
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast('success', 'Berhasil', 'Berita berhasil diupdate');
      } else {
        await createMutation.mutateAsync(payload);
        toast('success', 'Berhasil', 'Berita berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Berita berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Berita Terkini"
      description="Kelola berita dan informasi terbaru masjid"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tulis Berita</Button>}
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari berita..." className="sm:w-72" />
          <Select
            options={[{ value: '', label: 'Semua Status' }, { value: 'published', label: 'Diterbitkan' }, { value: 'draft', label: 'Draft' }]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
        </div>
        {isLoading ? <LoadingSpinner text="Memuat berita..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={Newspaper} title="Belum ada berita" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tulis Berita</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[650px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Judul</th>
                      <th className="px-4 py-3">Penulis</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.slug}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.author}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {item.published_date ? formatDate(item.published_date) : '–'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge(item.status)}>
                            {item.status === 'published' ? 'Diterbitkan' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data?.meta && <div className="mt-4"><Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} /></div>}
            </>
          )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Berita' : 'Tulis Berita Baru'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Judul Berita"
            required
            error={errors.title?.message}
            {...register('title', {
              required: 'Judul wajib diisi',
              onChange: (e) => { if (!editItem) setValue('slug', slugify(e.target.value)); },
            })}
          />
          <Input label="Slug" hint="Diisi otomatis dari judul" {...register('slug')} />
          <Input label="URL Cover Image" placeholder="https://..." {...register('cover_image')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Penulis" required error={errors.author?.message} {...register('author', { required: 'Penulis wajib diisi' })} />
            <Input label="Tanggal Terbit" type="date" {...register('published_date')} />
          </div>
          <Controller name="content" control={control} render={({ field }) => <RichTextEditor label="Konten" value={field.value} onChange={field.onChange} />} />
          <Select label="Status" options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Terbitkan' }]} {...register('status')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Simpan Berita'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
