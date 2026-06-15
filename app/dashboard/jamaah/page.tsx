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
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Badge, { statusBadge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useJamaahList, useCreateJamaah, useUpdateJamaah, useDeleteJamaah } from '@/hooks/useJamaah';
import { Jamaah, JamaahFormData, JAMAAH_STATUS_LABELS, JamaahStatus } from '@/types';
import { toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { jamaahService } from '@/services/jamaah.service';

const STATUS_OPTIONS = (Object.entries(JAMAAH_STATUS_LABELS) as [JamaahStatus, string][]).map(
  ([value, label]) => ({ value, label })
);

const defaultValues: JamaahFormData = {
  nama: '',
  nomor_whatsapp: '',
  alamat: '',
  status: 'jamaah_tetap',
};

export default function JamaahPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Jamaah | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useJamaahList({
    page,
    limit: 10,
    search,
    status: statusFilter || undefined,
  });
  const createMutation = useCreateJamaah();
  const updateMutation = useUpdateJamaah();
  const deleteMutation = useDeleteJamaah();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JamaahFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: Jamaah) => {
    setEditItem(item);
    reset({
      nama: item.nama,
      nomor_whatsapp: item.nomor_whatsapp,
      alamat: item.alamat,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: JamaahFormData) => {
    try {
      const isDuplicate = await jamaahService.checkDuplicateWhatsApp(
        formData.nomor_whatsapp,
        editItem?.id
      );

      if (isDuplicate) {
        toast(
          'error',
          'Nomor WhatsApp Sudah Terdaftar',
          'Nomor WhatsApp ini sudah digunakan oleh jamaah lain. Silakan gunakan nomor yang berbeda.'
        );
        return;
      }

      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Data jamaah berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Jamaah berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan');
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Jamaah berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Daftar Jamaah"
      description="Kelola data jamaah masjid"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Jamaah</Button>}
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cari jamaah..."
            className="sm:w-72"
          />
          <Select
            options={[
              { value: '', label: 'Semua Status' },
              ...STATUS_OPTIONS,
            ]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="sm:w-48"
          />
        </div>
        {isLoading ? <LoadingSpinner text="Memuat data jamaah..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState
              icon={Users}
              title="Belum ada data jamaah"
              description="Tambahkan jamaah baru untuk memulai"
              action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Jamaah</Button>}
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">No. WhatsApp</th>
                      <th className="px-4 py-3">Alamat</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{item.nama}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge(item.status)}>
                            {JAMAAH_STATUS_LABELS[item.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`https://wa.me/${item.nomor_whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            {item.nomor_whatsapp}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs">
                          <p className="truncate">{item.alamat}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(item.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Jamaah' : 'Tambah Jamaah'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Lengkap"
            required
            error={errors.nama?.message}
            {...register('nama', { required: 'Nama wajib diisi' })}
          />
          <Select
            label="Status"
            required
            options={STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status', { required: 'Status wajib dipilih' })}
          />
          <Input
            label="Nomor WhatsApp"
            required
            placeholder="081234567890"
            error={errors.nomor_whatsapp?.message}
            {...register('nomor_whatsapp', { required: 'Nomor WhatsApp wajib diisi' })}
          />
          <Textarea
            label="Alamat"
            rows={3}
            required
            error={errors.alamat?.message}
            {...register('alamat', { required: 'Alamat wajib diisi' })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editItem ? 'Simpan Perubahan' : 'Tambah Jamaah'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
