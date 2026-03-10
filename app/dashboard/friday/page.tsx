'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
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
import { useFridayList, useCreateFriday, useUpdateFriday, useDeleteFriday } from '@/hooks/useFriday';
import { FridayDuty, FridayFormData } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';

const defaultValues: FridayFormData = {
  date: '',
  khateeb: '',
  imam: '',
  muadzin: '',
  bilal: '',
  notes: '',
};

export default function FridayPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FridayDuty | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useFridayList({ page, limit: 10, search });
  const createMutation = useCreateFriday();
  const updateMutation = useUpdateFriday();
  const deleteMutation = useDeleteFriday();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FridayFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: FridayDuty) => {
    setEditItem(item);
    reset({ date: item.date, khateeb: item.khateeb, imam: item.imam, muadzin: item.muadzin, bilal: item.bilal, notes: item.notes });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: FridayFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Jadwal Jumat berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Jadwal Jumat berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Jadwal berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Jadwal Sholat Jumat"
      description="Kelola petugas sholat Jumat"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Jadwal</Button>}
    >
      <Card padding="md">
        <div className="mb-4">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari jadwal Jumat..." className="sm:w-72" />
        </div>

        {isLoading ? <LoadingSpinner text="Memuat jadwal Jumat..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={Star} title="Belum ada jadwal Jumat" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Jadwal</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Khatib</th>
                      <th className="px-4 py-3">Imam</th>
                      <th className="px-4 py-3">Muadzin</th>
                      <th className="px-4 py-3">Bilal</th>
                      <th className="px-4 py-3">Catatan</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                          {formatDate(item.date, 'DD MMM YYYY')}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.khateeb}</td>
                        <td className="px-4 py-3 text-gray-700">{item.imam}</td>
                        <td className="px-4 py-3 text-gray-600">{item.muadzin}</td>
                        <td className="px-4 py-3 text-gray-600">{item.bilal}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px]">
                          <p className="truncate text-xs">{item.notes || '–'}</p>
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
              {data?.meta && (
                <div className="mt-4">
                  <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Jadwal Jumat' : 'Tambah Jadwal Jumat'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Tanggal (Jumat)" type="date" required error={errors.date?.message} {...register('date', { required: 'Tanggal wajib diisi' })} />
          <Input label="Khatib" required error={errors.khateeb?.message} placeholder="Nama khatib" {...register('khateeb', { required: 'Khatib wajib diisi' })} />
          <Input label="Imam" required error={errors.imam?.message} placeholder="Nama imam" {...register('imam', { required: 'Imam wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Muadzin" placeholder="Nama muadzin" {...register('muadzin')} />
            <Input label="Bilal" placeholder="Nama bilal" {...register('bilal')} />
          </div>
          <Textarea label="Catatan / Tema Khutbah" rows={3} placeholder="Contoh: Tema khutbah tentang Ramadhan" {...register('notes')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Jadwal'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
