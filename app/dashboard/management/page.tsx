'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useManagementList, useCreateManagement, useUpdateManagement, useDeleteManagement } from '@/hooks/useManagement';
import { MosqueAdmin, AdminFormData } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

const defaultValues: AdminFormData = {
  name: '',
  position: '',
  phone: '',
  email: '',
  photo: '',
  period_start: '',
  period_end: '',
};

export default function ManagementPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MosqueAdmin | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useManagementList({ page, limit: 9, search });
  const createMutation = useCreateManagement();
  const updateMutation = useUpdateManagement();
  const deleteMutation = useDeleteManagement();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: MosqueAdmin) => {
    setEditItem(item);
    reset({ name: item.name, position: item.position, phone: item.phone, email: item.email, photo: item.photo, period_start: item.period_start, period_end: item.period_end });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: AdminFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Data pengurus berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Pengurus berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Pengurus berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Pengurus Masjid"
      description="Kelola data pengurus dan takmir masjid"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Pengurus</Button>}
    >
      <Card padding="md">
        <div className="mb-4">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari pengurus..." className="sm:w-72" />
        </div>
        {isLoading ? <LoadingSpinner text="Memuat data pengurus..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={Users} title="Belum ada data pengurus" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Pengurus</Button>} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data?.data.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                        {item.photo ? (
                          <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="56px" unoptimized />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl font-bold text-gray-400">
                            {item.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-emerald-600 font-medium truncate">{item.position}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-gray-500">
                      <p>📞 {item.phone}</p>
                      <p>✉️ {item.email}</p>
                      <p>📅 Periode: {formatDate(item.period_start, 'MMM YYYY')} – {formatDate(item.period_end, 'MMM YYYY')}</p>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Pengurus' : 'Tambah Pengurus'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Lengkap" required error={errors.name?.message} {...register('name', { required: 'Nama wajib diisi' })} />
          <Input label="Jabatan" required error={errors.position?.message} {...register('position', { required: 'Jabatan wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="No. Telepon" {...register('phone')} />
            <Input label="Email" type="email" {...register('email')} />
          </div>
          <Input label="URL Foto" placeholder="https://..." {...register('photo')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Awal Periode" type="date" required error={errors.period_start?.message} {...register('period_start', { required: 'Awal periode wajib diisi' })} />
            <Input label="Akhir Periode" type="date" required error={errors.period_end?.message} {...register('period_end', { required: 'Akhir periode wajib diisi' })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Pengurus'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
