'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
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
import { usePrayerList, useCreatePrayer, useUpdatePrayer, useDeletePrayer } from '@/hooks/usePrayer';
import { PrayerSchedule, PrayerFormData } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';

const defaultValues: PrayerFormData = {
  date: '',
  fajr_imam: '', dhuhr_imam: '', asr_imam: '', maghrib_imam: '', isha_imam: '',
  fajr_muadzin: '', dhuhr_muadzin: '', asr_muadzin: '', maghrib_muadzin: '', isha_muadzin: '',
};

const prayers = [
  { key: 'fajr', label: 'Subuh' },
  { key: 'dhuhr', label: 'Dzuhur' },
  { key: 'asr', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isya' },
];

export default function PrayerPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PrayerSchedule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = usePrayerList({ page, limit: 10, search });
  const createMutation = useCreatePrayer();
  const updateMutation = useUpdatePrayer();
  const deleteMutation = useDeletePrayer();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PrayerFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: PrayerSchedule) => {
    setEditItem(item);
    reset({
      date: item.date,
      fajr_imam: item.fajr_imam, dhuhr_imam: item.dhuhr_imam, asr_imam: item.asr_imam,
      maghrib_imam: item.maghrib_imam, isha_imam: item.isha_imam,
      fajr_muadzin: item.fajr_muadzin, dhuhr_muadzin: item.dhuhr_muadzin,
      asr_muadzin: item.asr_muadzin, maghrib_muadzin: item.maghrib_muadzin,
      isha_muadzin: item.isha_muadzin,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: PrayerFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Jadwal sholat berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Jadwal sholat berhasil ditambahkan');
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
      title="Jadwal Sholat"
      description="Kelola jadwal imam dan muadzin harian"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Jadwal</Button>}
    >
      <Card padding="md">
        <div className="mb-4">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari jadwal..." className="sm:w-72" />
        </div>

        {isLoading ? <LoadingSpinner text="Memuat jadwal sholat..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={Clock} title="Belum ada jadwal sholat" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Jadwal</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      {prayers.map((p) => (
                        <th key={p.key} className="px-4 py-3 text-left">{p.label}</th>
                      ))}
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{formatDate(item.date, 'ddd, DD MMM')}</td>
                        {prayers.map((p) => (
                          <td key={p.key} className="px-4 py-3">
                            <div className="text-xs">
                              <p className="font-medium text-gray-700">{item[`${p.key}_imam` as keyof PrayerSchedule] as string}</p>
                              <p className="text-gray-400">{item[`${p.key}_muadzin` as keyof PrayerSchedule] as string}</p>
                            </div>
                          </td>
                        ))}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Jadwal Sholat' : 'Tambah Jadwal Sholat'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Tanggal" type="date" required error={errors.date?.message} {...register('date', { required: 'Tanggal wajib diisi' })} />
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Waktu</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Imam</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Muadzin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {prayers.map((p) => (
                  <tr key={p.key}>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{p.label}</span>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="h-8 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        placeholder={`Imam ${p.label}`}
                        {...register(`${p.key}_imam` as keyof PrayerFormData)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="h-8 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        placeholder={`Muadzin ${p.label}`}
                        {...register(`${p.key}_muadzin` as keyof PrayerFormData)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
