'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
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
import { useTahsinList, useCreateTahsin, useUpdateTahsin, useDeleteTahsin } from '@/hooks/useTahsin';
import { TahsinClass, TahsinFormData } from '@/types';
import { toast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';

const defaultValues: TahsinFormData = {
  class_name: '',
  teacher: '',
  schedule: '',
  description: '',
  capacity: 20,
  location: '',
  status: 'active',
};

export default function TahsinPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TahsinClass | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useTahsinList({ page, limit: 8, search });
  const createMutation = useCreateTahsin();
  const updateMutation = useUpdateTahsin();
  const deleteMutation = useDeleteTahsin();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TahsinFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: TahsinClass) => {
    setEditItem(item);
    reset({ class_name: item.class_name, teacher: item.teacher, schedule: item.schedule, description: item.description, capacity: item.capacity, location: item.location, status: item.status });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: TahsinFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Kelas Tahsin berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Kelas Tahsin berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Kelas berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Tahsin"
      description="Kelola kelas tahsin Al-Quran"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Kelas</Button>}
    >
      <Card padding="md">
        <div className="mb-4">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari kelas..." className="sm:w-72" />
        </div>
        {isLoading ? <LoadingSpinner text="Memuat data..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={GraduationCap} title="Belum ada kelas tahsin" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Kelas</Button>} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {data?.data.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <Badge variant={statusBadge(item.status)}>{item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</Badge>
                    </div>
                    <h3 className="mt-3 font-semibold text-gray-900">{item.class_name}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{item.teacher}</p>
                    <div className="mt-3 space-y-1 text-xs text-gray-500">
                      <p>📅 {item.schedule}</p>
                      <p>📍 {item.location}</p>
                      <p>👥 Kapasitas: {item.capacity} peserta</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(item)} leftIcon={<Pencil className="h-3.5 w-3.5" />} className="flex-1">Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              {data?.meta && <div className="mt-4"><Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} /></div>}
            </>
          )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Kelas Tahsin' : 'Tambah Kelas Tahsin'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Kelas" required error={errors.class_name?.message} {...register('class_name', { required: 'Nama kelas wajib diisi' })} />
          <Input label="Ustadz / Pengajar" required error={errors.teacher?.message} {...register('teacher', { required: 'Pengajar wajib diisi' })} />
          <Input label="Jadwal" placeholder="Senin & Rabu, 16:00 – 17:30" required error={errors.schedule?.message} {...register('schedule', { required: 'Jadwal wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Lokasi" required error={errors.location?.message} {...register('location', { required: 'Lokasi wajib diisi' })} />
            <Input label="Kapasitas" type="number" required error={errors.capacity?.message} {...register('capacity', { required: 'Kapasitas wajib diisi', valueAsNumber: true })} />
          </div>
          <Controller name="description" control={control} render={({ field }) => <RichTextEditor label="Deskripsi" value={field.value} onChange={field.onChange} />} />
          <Select label="Status" options={[{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Tidak Aktif' }]} {...register('status')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Kelas'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
