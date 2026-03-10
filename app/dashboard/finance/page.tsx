'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
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
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useFinanceList, useFinanceSummary, useCreateFinance, useUpdateFinance, useDeleteFinance } from '@/hooks/useFinance';
import { FinanceTransaction, FinanceFormData } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dayjs from 'dayjs';

const INCOME_CATEGORIES = ['Infaq', 'Donasi', 'Wakaf', 'Zakat', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Honor', 'Operasional', 'Maintenance', 'Kegiatan', 'Lainnya'];

const defaultValues: FinanceFormData = {
  title: '',
  category: 'Infaq',
  amount: 0,
  date: '',
  description: '',
  type: 'income',
};

export default function FinancePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FinanceTransaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useFinanceList({ page, limit: 8, search, type: typeFilter });
  const { data: summaryData } = useFinanceSummary();
  const createMutation = useCreateFinance();
  const updateMutation = useUpdateFinance();
  const deleteMutation = useDeleteFinance();

  const [typeValue, setTypeValue] = useState<'income' | 'expense'>('income');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FinanceFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: FinanceTransaction) => {
    setEditItem(item);
    reset({ title: item.title, category: item.category, amount: item.amount, date: item.date, description: item.description, type: item.type });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: FinanceFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Transaksi berhasil diupdate');
      } else {
        await createMutation.mutateAsync(formData);
        toast('success', 'Berhasil', 'Transaksi berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Transaksi berhasil dihapus');
      setDeleteId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const summary = summaryData?.data;
  const chartData = (summary?.monthly_data ?? []).map((m) => ({
    month: dayjs(m.month + '-01').format('MMM'),
    Pemasukan: m.income,
    Pengeluaran: m.expense,
  }));

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const categories = typeValue === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <DashboardLayout
      title="Keuangan"
      description="Kelola arus kas dan keuangan masjid"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Transaksi</Button>}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pemasukan</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(summary?.total_income ?? 0)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pengeluaran</p>
              <p className="mt-1 text-xl font-bold text-red-500">{formatCurrency(summary?.total_expense ?? 0)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700">Saldo Kas</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{formatCurrency(summary?.balance ?? 0)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Wallet className="h-6 w-6 text-emerald-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <Card padding="md" className="mb-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Grafik Arus Keuangan</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
            <Tooltip formatter={(val) => formatCurrency(Number(val))} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pengeluaran" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Transactions Table */}
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari transaksi..." className="sm:w-72" />
          <Select
            options={[{ value: '', label: 'Semua Tipe' }, { value: 'income', label: 'Pemasukan' }, { value: 'expense', label: 'Pengeluaran' }]}
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
        </div>
        {isLoading ? <LoadingSpinner text="Memuat transaksi..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={DollarSign} title="Belum ada transaksi" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Transaksi</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Keterangan</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Jumlah</th>
                      <th className="px-4 py-3">Tipe</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                        <td className="px-4 py-3 text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(item.date)}</td>
                        <td className={`px-4 py-3 font-semibold whitespace-nowrap ${item.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge(item.type)}>
                            {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Transaksi' : 'Tambah Transaksi'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Tipe Transaksi"
            options={[{ value: 'income', label: 'Pemasukan' }, { value: 'expense', label: 'Pengeluaran' }]}
            {...register('type')}
            onChange={(e) => setTypeValue(e.target.value as 'income' | 'expense')}
          />
          <Input label="Keterangan" required error={errors.title?.message} {...register('title', { required: 'Keterangan wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Kategori" options={categories.map((c) => ({ value: c, label: c }))} {...register('category')} />
            <Input label="Jumlah (Rp)" type="number" required error={errors.amount?.message} {...register('amount', { required: 'Jumlah wajib diisi', valueAsNumber: true })} />
          </div>
          <Input label="Tanggal" type="date" required error={errors.date?.message} {...register('date', { required: 'Tanggal wajib diisi' })} />
          <Textarea label="Keterangan Tambahan" rows={3} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Transaksi'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
    </DashboardLayout>
  );
}
