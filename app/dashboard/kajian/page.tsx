'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
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
import { useKajianList, useCreateKajian, useUpdateKajian, useDeleteKajian } from '@/hooks/useKajian';
import { Kajian, KajianFormData } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';

const defaultValues: KajianFormData = {
  title: '',
  speaker: '',
  description: '',
  date: '',
  time: '',
  location: '',
  poster_image: '',
  status: 'upcoming',
};

export default function KajianPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Kajian | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useKajianList({ page, limit: 8, search, status: statusFilter });
  const createMutation = useCreateKajian();
  const updateMutation = useUpdateKajian();
  const deleteMutation = useDeleteKajian();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<KajianFormData>({
    defaultValues,
  });

  const openCreate = () => {
    setEditItem(null);
    reset(defaultValues);
    setIsModalOpen(true);
  };

  const openEdit = (item: Kajian) => {
    setEditItem(item);
    reset({
      title: item.title,
      speaker: item.speaker,
      description: item.description,
      date: item.date,
      time: item.time,
      location: item.location,
      poster_image: item.poster_image,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: KajianFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data });
        toast('success', 'Berhasil', 'Kajian berhasil diupdate');
      } else {
        await createMutation.mutateAsync(data);
        toast('success', 'Berhasil', 'Kajian berhasil ditambahkan');
      }
      setIsModalOpen(false);
      reset(defaultValues);
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan');
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Kajian berhasil dihapus');
      setDeleteId(null);
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Kajian"
      description="Kelola jadwal dan informasi kajian"
      actions={
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Tambah Kajian
        </Button>
      }
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cari kajian..."
            className="sm:w-72"
          />
          <Select
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'upcoming', label: 'Mendatang' },
              { value: 'finished', label: 'Selesai' },
            ]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
        </div>

        {isLoading ? (
          <LoadingSpinner text="Memuat data kajian..." />
        ) : (data?.data ?? []).length === 0 ? (
          <EmptyState icon={BookOpen} title="Belum ada kajian" description="Tambahkan kajian baru untuk memulai" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Kajian</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3">Pemateri</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 line-clamp-1">{item.title}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.speaker}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(item.date)} · {item.time}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                        <p className="truncate">{item.location}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge(item.status)}>
                          {item.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.meta && (
              <div className="mt-4">
                <Pagination
                  page={data.meta.page}
                  totalPages={data.meta.totalPages}
                  total={data.meta.total}
                  limit={data.meta.limit}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Kajian' : 'Tambah Kajian'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Judul Kajian" required error={errors.title?.message} {...register('title', { required: 'Judul wajib diisi' })} />
          <Input label="Pemateri" required error={errors.speaker?.message} {...register('speaker', { required: 'Pemateri wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" required error={errors.date?.message} {...register('date', { required: 'Tanggal wajib diisi' })} />
            <Input label="Waktu" type="time" required error={errors.time?.message} {...register('time', { required: 'Waktu wajib diisi' })} />
          </div>
          <Input label="Lokasi" required error={errors.location?.message} {...register('location', { required: 'Lokasi wajib diisi' })} />
          <Input label="URL Poster" placeholder="https://..." {...register('poster_image')} />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor label="Deskripsi" value={field.value} onChange={field.onChange} />
            )}
          />
          <Select
            label="Status"
            options={[
              { value: 'upcoming', label: 'Mendatang' },
              { value: 'finished', label: 'Selesai' },
            ]}
            {...register('status')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Kajian'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
