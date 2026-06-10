'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown, Wallet, Download } from 'lucide-react';
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
import { formatDate, formatCurrency, exportToCSV } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { financeService } from '@/services/finance.service';

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
  
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getDateRange = () => {
    const today = dayjs();
    switch (dateFilter) {
      case 'today':
        return { start_date: today.format('YYYY-MM-DD'), end_date: today.format('YYYY-MM-DD') };
      case 'week':
        return { 
          start_date: today.startOf('week').format('YYYY-MM-DD'), 
          end_date: today.endOf('week').format('YYYY-MM-DD') 
        };
      case 'month':
        return { 
          start_date: today.startOf('month').format('YYYY-MM-DD'), 
          end_date: today.endOf('month').format('YYYY-MM-DD') 
        };
      case 'year':
        return { 
          start_date: today.startOf('year').format('YYYY-MM-DD'), 
          end_date: today.endOf('year').format('YYYY-MM-DD') 
        };
      case 'custom':
        return startDate && endDate ? { start_date: startDate, end_date: endDate } : {};
      default:
        return {};
    }
  };

  const dateRange = getDateRange();

  const { data, isLoading } = useFinanceList({ page, limit: 8, search, type: typeFilter, ...dateRange });
  const { data: summaryData } = useFinanceSummary(dateRange);
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

  const handleExport = async () => {
    try {
      toast('info', 'Mengekspor', 'Sedang memproses data...');
      
      const allData = await financeService.getAllForExport({ 
        search, 
        type: typeFilter,
        ...dateRange
      });

      if (allData.length === 0) {
        toast('warning', 'Tidak Ada Data', 'Tidak ada data untuk diekspor');
        return;
      }

      const periodLabel = dateFilter === 'all' ? 'Semua Periode' :
        dateFilter === 'today' ? 'Hari Ini' :
        dateFilter === 'week' ? 'Minggu Ini' :
        dateFilter === 'month' ? 'Bulan Ini' :
        dateFilter === 'year' ? 'Tahun Ini' :
        `${formatDate(startDate, 'DD/MM/YYYY')} - ${formatDate(endDate, 'DD/MM/YYYY')}`;

      const csvData = [
        {
          'Keterangan': '=== RINGKASAN KEUANGAN ===',
          'Kategori': '',
          'Tanggal': '',
          'Jumlah': '',
          'Tipe': '',
        },
        {
          'Keterangan': 'Periode',
          'Kategori': periodLabel,
          'Tanggal': '',
          'Jumlah': '',
          'Tipe': '',
        },
        {
          'Keterangan': 'Total Pemasukan',
          'Kategori': '',
          'Tanggal': '',
          'Jumlah': summary?.total_income ?? 0,
          'Tipe': '',
        },
        {
          'Keterangan': 'Total Pengeluaran',
          'Kategori': '',
          'Tanggal': '',
          'Jumlah': summary?.total_expense ?? 0,
          'Tipe': '',
        },
        {
          'Keterangan': 'Saldo Kas',
          'Kategori': '',
          'Tanggal': '',
          'Jumlah': summary?.balance ?? 0,
          'Tipe': '',
        },
        {
          'Keterangan': '',
          'Kategori': '',
          'Tanggal': '',
          'Jumlah': '',
          'Tipe': '',
        },
        {
          'Keterangan': '=== DATA TRANSAKSI ===',
          'Kategori': '',
          'Tanggal': '',
          'Jumlah': '',
          'Tipe': '',
        },
        ...allData.map(item => ({
          'Keterangan': item.title,
          'Kategori': item.category,
          'Tanggal': formatDate(item.date, 'DD/MM/YYYY'),
          'Jumlah': item.amount,
          'Tipe': item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        }))
      ];

      const filename = `keuangan-masjid-${dayjs().format('YYYY-MM-DD-HHmmss')}.csv`;
      exportToCSV(csvData, filename);
      
      toast('success', 'Berhasil', 'Data berhasil diekspor');
    } catch (error) {
      console.error('Export error:', error);
      toast('error', 'Gagal', 'Gagal mengekspor data');
    }
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
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            leftIcon={<Download className="h-4 w-4" />} 
            onClick={handleExport}
          >
            Ekspor CSV
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Transaksi
          </Button>
        </div>
      }
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
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <SearchBar 
              value={search} 
              onChange={(v) => { setSearch(v); setPage(1); }} 
              placeholder="Cari transaksi..." 
              className="sm:w-72" 
            />
            <Select
              options={[
                { value: '', label: 'Semua Tipe' }, 
                { value: 'income', label: 'Pemasukan' }, 
                { value: 'expense', label: 'Pengeluaran' }
              ]}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="sm:w-44"
            />
            <Select
              options={[
                { value: 'all', label: 'Semua Periode' },
                { value: 'today', label: 'Hari Ini' },
                { value: 'week', label: 'Minggu Ini' },
                { value: 'month', label: 'Bulan Ini' },
                { value: 'year', label: 'Tahun Ini' },
                { value: 'custom', label: 'Rentang Tanggal' },
              ]}
              value={dateFilter}
              onChange={(e) => { 
                setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'); 
                setPage(1); 
              }}
              className="sm:w-52"
            />
          </div>
          
          {dateFilter === 'custom' && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                placeholder="Tanggal Mulai"
                className="sm:w-52"
              />
              <span className="text-gray-500 text-sm hidden sm:block">s/d</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                placeholder="Tanggal Akhir"
                className="sm:w-52"
              />
            </div>
          )}
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
