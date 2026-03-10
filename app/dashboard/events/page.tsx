'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
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
import { useEventList, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { MosqueEvent, EventFormData } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';

const defaultValues: EventFormData = {
  title: '',
  description: '',
  event_date: '',
  location: '',
  poster: '',
  status: 'upcoming',
};

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MosqueEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useEventList({ page, limit: 8, search, status: statusFilter });
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<EventFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: MosqueEvent) => {
    setEditItem(item);
    reset({ title: item.title, description: item.description, event_date: item.event_date, location: item.location, poster: item.poster, status: item.status });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: EventFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Event berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Event berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Event berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Events"
      description="Kelola kegiatan dan acara masjid"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Event</Button>}
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari event..." className="sm:w-72" />
          <Select
            options={[{ value: '', label: 'Semua Status' }, { value: 'upcoming', label: 'Mendatang' }, { value: 'finished', label: 'Selesai' }]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
        </div>
        {isLoading ? <LoadingSpinner text="Memuat data event..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={CalendarDays} title="Belum ada event" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Event</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Nama Event</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Lokasi</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(item.event_date)}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px]"><p className="truncate">{item.location}</p></td>
                        <td className="px-4 py-3"><Badge variant={statusBadge(item.status)}>{item.status === 'upcoming' ? 'Mendatang' : 'Selesai'}</Badge></td>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Event' : 'Tambah Event'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Event" required error={errors.title?.message} {...register('title', { required: 'Nama wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" required error={errors.event_date?.message} {...register('event_date', { required: 'Tanggal wajib diisi' })} />
            <Input label="Lokasi" required error={errors.location?.message} {...register('location', { required: 'Lokasi wajib diisi' })} />
          </div>
          <Input label="URL Poster" placeholder="https://..." {...register('poster')} />
          <Controller name="description" control={control} render={({ field }) => <RichTextEditor label="Deskripsi" value={field.value} onChange={field.onChange} />} />
          <Select label="Status" options={[{ value: 'upcoming', label: 'Mendatang' }, { value: 'finished', label: 'Selesai' }]} {...register('status')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Event'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
