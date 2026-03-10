'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Heart } from 'lucide-react';
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
import { useBerbagiList, useCreateBerbagi, useUpdateBerbagi, useDeleteBerbagi } from '@/hooks/useBerbagi';
import { BerbagiProgram, BerbagiFormData } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';

const defaultValues: BerbagiFormData = {
  program_name: '',
  description: '',
  target_amount: 0,
  collected_amount: 0,
  program_date: '',
  status: 'active',
};

export default function BerbagiPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<BerbagiProgram | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useBerbagiList({ page, limit: 8, search, status: statusFilter });
  const createMutation = useCreateBerbagi();
  const updateMutation = useUpdateBerbagi();
  const deleteMutation = useDeleteBerbagi();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<BerbagiFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: BerbagiProgram) => {
    setEditItem(item);
    reset({ program_name: item.program_name, description: item.description, target_amount: item.target_amount, collected_amount: item.collected_amount, program_date: item.program_date, status: item.status });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: BerbagiFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Program berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Program berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Program berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Berbagi"
      description="Kelola program sedekah dan berbagi"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Program</Button>}
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari program..." className="sm:w-72" />
          <Select
            options={[{ value: '', label: 'Semua Status' }, { value: 'active', label: 'Aktif' }, { value: 'upcoming', label: 'Mendatang' }, { value: 'completed', label: 'Selesai' }]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
        </div>
        {isLoading ? <LoadingSpinner text="Memuat data..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={Heart} title="Belum ada program berbagi" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Program</Button>} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {data?.data.map((item) => {
                  const progress = item.target_amount > 0 ? (item.collected_amount / item.target_amount) * 100 : 0;
                  return (
                    <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50">
                          <Heart className="h-5 w-5 text-rose-500" />
                        </div>
                        <Badge variant={statusBadge(item.status)}>
                          {item.status === 'active' ? 'Aktif' : item.status === 'completed' ? 'Selesai' : 'Mendatang'}
                        </Badge>
                      </div>
                      <h3 className="mt-3 font-semibold text-gray-900">{item.program_name}</h3>
                      <p className="mt-1 text-xs text-gray-400">📅 {formatDate(item.program_date)}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Terkumpul</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                        <div className="mt-1.5 flex justify-between text-xs">
                          <span className="font-medium text-emerald-600">{formatCurrency(item.collected_amount)}</span>
                          <span className="text-gray-400">dari {formatCurrency(item.target_amount)}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(item)} leftIcon={<Pencil className="h-3.5 w-3.5" />} className="flex-1">Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {data?.meta && <div className="mt-4"><Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} /></div>}
            </>
          )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Program' : 'Tambah Program Berbagi'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Program" required error={errors.program_name?.message} {...register('program_name', { required: 'Nama program wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Dana (Rp)" type="number" required error={errors.target_amount?.message} {...register('target_amount', { required: 'Target wajib diisi', valueAsNumber: true })} />
            <Input label="Terkumpul (Rp)" type="number" {...register('collected_amount', { valueAsNumber: true })} />
          </div>
          <Input label="Tanggal Program" type="date" required error={errors.program_date?.message} {...register('program_date', { required: 'Tanggal wajib diisi' })} />
          <Controller name="description" control={control} render={({ field }) => <RichTextEditor label="Deskripsi" value={field.value} onChange={field.onChange} />} />
          <Select label="Status" options={[{ value: 'active', label: 'Aktif' }, { value: 'upcoming', label: 'Mendatang' }, { value: 'completed', label: 'Selesai' }]} {...register('status')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Program'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
