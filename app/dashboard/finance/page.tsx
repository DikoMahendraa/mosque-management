'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown, Wallet, Download, MessageCircle,
} from 'lucide-react';
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
import FinanceShareModal from '@/components/finance/FinanceShareModal';
import { useFinanceList, useFinanceSummary, useCreateFinance, useUpdateFinance, useDeleteFinance, useDeleteManyFinance } from '@/hooks/useFinance';
import { FinanceTransaction, FinanceFormData } from '@/types';
import { formatDate, formatCurrency, exportToCSV } from '@/lib/utils';
import {
  FinanceDateFilter,
  getFinanceDateRange,
  getFinancePeriodLabel,
} from '@/lib/finance-report';
import { toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { financeService } from '@/services/finance.service';
import { FINANCE_CATEGORIES, isPrivilegedRole } from '@/lib/permissions';
import { useAuthStore } from '@/store';

const formatIdrInput = (value: number | string) => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';

  return new Intl.NumberFormat('id-ID').format(Number(digits));
};

const parseIdrInput = (value: number | string) => Number(String(value).replace(/\D/g, '')) || 0;

const defaultValues: FinanceFormData = {
  title: '',
  category: 'Sosial',
  amount: 0,
  date: '',
  description: '',
  type: 'income',
};

export default function FinancePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FinanceTransaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareFilterTransactions, setShareFilterTransactions] = useState<FinanceTransaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTransactionsCache, setSelectedTransactionsCache] = useState<Map<string, FinanceTransaction>>(new Map());

  const [dateFilter, setDateFilter] = useState<FinanceDateFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const dateRange = getFinanceDateRange(dateFilter, startDate, endDate);
  const periodLabel = getFinancePeriodLabel(dateFilter, startDate, endDate, dateRange);

  const { data, isLoading } = useFinanceList({ page, limit: 8, search, type: typeFilter, category: categoryFilter, ...dateRange });
  const { data: summaryData } = useFinanceSummary(dateRange);
  const createMutation = useCreateFinance();
  const updateMutation = useUpdateFinance();
  const deleteMutation = useDeleteFinance();
  const deleteManyMutation = useDeleteManyFinance();
  const { user, financeCategories } = useAuthStore();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FinanceFormData>({ defaultValues });
  const [amountDisplay, setAmountDisplay] = useState('');

  const pageItems = data?.data ?? [];
  const allPageSelected = pageItems.length > 0 && pageItems.every((item) => selectedIds.has(item.id));
  const somePageSelected = pageItems.some((item) => selectedIds.has(item.id));

  const selectedTransactions = useMemo(
    () => Array.from(selectedIds).map((id) => selectedTransactionsCache.get(id)).filter(Boolean) as FinanceTransaction[],
    [selectedIds, selectedTransactionsCache]
  );
  const categories = useMemo(
    () => isPrivilegedRole(user?.role) ? [...FINANCE_CATEGORIES] : financeCategories,
    [financeCategories, user?.role]
  );
  const allowedCategoryScope = isPrivilegedRole(user?.role) ? undefined : financeCategories;

  useEffect(() => {
    if (categoryFilter && !categories.includes(categoryFilter as typeof categories[number])) {
      setCategoryFilter('');
      setPage(1);
    }
  }, [categories, categoryFilter]);

  const toggleSelect = (item: FinanceTransaction) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
    setSelectedTransactionsCache((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.set(item.id, item);
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageItems.forEach((item) => next.delete(item.id));
        return next;
      });
      setSelectedTransactionsCache((prev) => {
        const next = new Map(prev);
        pageItems.forEach((item) => next.delete(item.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageItems.forEach((item) => next.add(item.id));
        return next;
      });
      setSelectedTransactionsCache((prev) => {
        const next = new Map(prev);
        pageItems.forEach((item) => next.set(item.id, item));
        return next;
      });
    }
  };

  const openCreate = () => {
    setEditItem(null);
    reset({ ...defaultValues, category: categories[0] ?? defaultValues.category });
    setAmountDisplay('');
    setIsModalOpen(true);
  };
  const openEdit = (item: FinanceTransaction) => {
    setEditItem(item);
    reset({ title: item.title, category: item.category, amount: item.amount, date: item.date, description: item.description, type: item.type });
    setAmountDisplay(formatIdrInput(item.amount));
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: FinanceFormData) => {
    const payload: FinanceFormData = {
      ...formData,
      amount: parseIdrInput(formData.amount),
    };

    try {
      if (!categories.includes(payload.category as typeof categories[number])) {
        toast('error', 'Tidak Diizinkan', 'Anda tidak memiliki akses untuk kategori ini');
        return;
      }

      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast('success', 'Berhasil', 'Transaksi berhasil diupdate');
      } else {
        await createMutation.mutateAsync(payload);
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
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await deleteManyMutation.mutateAsync(ids);
      toast('success', 'Berhasil', `${ids.length} transaksi berhasil dihapus`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
      setSelectedTransactionsCache(new Map());
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const handleOpenShare = async () => {
    setShareLoading(true);
    setIsShareOpen(true);
    try {
      const allData = await financeService.getAllForExport({
        search,
        type: typeFilter,
        category: categoryFilter,
        categories: allowedCategoryScope,
        ...dateRange,
      });
      setShareFilterTransactions(allData);
      if (allData.length === 0 && selectedTransactions.length === 0) {
        toast('warning', 'Kosong', 'Tidak ada transaksi untuk periode ini');
      }
    } catch {
      toast('error', 'Gagal', 'Gagal memuat data laporan');
      setIsShareOpen(false);
    } finally {
      setShareLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast('info', 'Mengekspor', 'Sedang memproses data...');

      const allData = await financeService.getAllForExport({
        search,
        type: typeFilter,
        category: categoryFilter,
        categories: allowedCategoryScope,
        ...dateRange,
      });

      if (allData.length === 0) {
        toast('warning', 'Tidak Ada Data', 'Tidak ada data untuk diekspor');
        return;
      }

      const csvData = [
        {
          Keterangan: '=== RINGKASAN KEUANGAN ===',
          Kategori: '',
          Tanggal: '',
          Jumlah: '',
          Tipe: '',
        },
        {
          Keterangan: 'Periode',
          Kategori: periodLabel,
          Tanggal: '',
          Jumlah: '',
          Tipe: '',
        },
        {
          Keterangan: 'Total Pemasukan',
          Kategori: '',
          Tanggal: '',
          Jumlah: summary?.total_income ?? 0,
          Tipe: '',
        },
        {
          Keterangan: 'Total Pengeluaran',
          Kategori: '',
          Tanggal: '',
          Jumlah: summary?.total_expense ?? 0,
          Tipe: '',
        },
        {
          Keterangan: 'Saldo Kas',
          Kategori: '',
          Tanggal: '',
          Jumlah: summary?.balance ?? 0,
          Tipe: '',
        },
        { Keterangan: '', Kategori: '', Tanggal: '', Jumlah: '', Tipe: '' },
        {
          Keterangan: '=== DATA TRANSAKSI ===',
          Kategori: '',
          Tanggal: '',
          Jumlah: '',
          Tipe: '',
        },
        ...allData.map((item) => ({
          Keterangan: item.title,
          Kategori: item.category,
          Tanggal: formatDate(item.date, 'DD/MM/YYYY'),
          Jumlah: item.amount,
          Tipe: item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        })),
      ];

      exportToCSV(csvData, `keuangan-masjid-${dayjs().format('YYYY-MM-DD-HHmmss')}.csv`);
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
  const amountField = register('amount', {
    required: 'Jumlah wajib diisi',
    validate: (value) => parseIdrInput(value) > 0 || 'Jumlah harus lebih dari 0',
  });

  return (
    <DashboardLayout
      title="Keuangan"
      description="Kelola arus kas dan keuangan masjid"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={<MessageCircle className="h-4 w-4" />}
            onClick={handleOpenShare}
          >
            Bagikan WhatsApp
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            Ekspor CSV
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={categories.length === 0}>
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
                { value: 'expense', label: 'Pengeluaran' },
              ]}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="sm:w-44"
            />
            <Select
              options={[
                { value: '', label: 'Semua Kategori' },
                ...categories.map((category) => ({ value: category, label: category })),
              ]}
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="sm:w-52"
            />
            <Select
              options={[
                { value: 'all', label: 'Semua Periode' },
                { value: 'today', label: 'Hari Ini' },
                { value: 'friday', label: 'Per Jumat' },
                { value: 'week', label: 'Minggu Ini' },
                { value: 'month', label: 'Bulan Ini' },
                { value: 'year', label: 'Tahun Ini' },
                { value: 'custom', label: 'Rentang Tanggal' },
              ]}
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as FinanceDateFilter);
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

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-800">
              <span>{selectedIds.size} transaksi terpilih</span>
              <button
                type="button"
                onClick={() => { setSelectedIds(new Set()); setSelectedTransactionsCache(new Map()); }}
                className="text-emerald-700 underline hover:text-emerald-900"
              >
                Hapus pilihan
              </button>
              <Button size="sm" variant="secondary" leftIcon={<MessageCircle className="h-3.5 w-3.5" />} onClick={handleOpenShare}>
                Bagikan terpilih
              </Button>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => setIsBulkDeleteOpen(true)}
              >
                Hapus terpilih
              </Button>
            </div>
          )}
        </div>

        {isLoading ? <LoadingSpinner text="Memuat transaksi..." /> :
          pageItems.length === 0 ? (
            <EmptyState icon={DollarSign} title="Belum ada transaksi" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Transaksi</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-3 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                          onChange={toggleSelectAllPage}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          aria-label="Pilih semua di halaman ini"
                        />
                      </th>
                      <th className="px-4 py-3">Keterangan</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Jumlah</th>
                      <th className="px-4 py-3">Tipe</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pageItems.map((item) => (
                      <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.has(item.id) ? 'bg-emerald-50/40' : ''}`}>
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            aria-label={`Pilih ${item.title}`}
                          />
                        </td>
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
          />
          <Input label="Keterangan" required error={errors.title?.message} {...register('title', { required: 'Keterangan wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Kategori" options={categories.map((c) => ({ value: c, label: c }))} {...register('category')} />
            <Input
              label="Jumlah (Rp)"
              type="text"
              inputMode="numeric"
              required
              error={errors.amount?.message}
              placeholder="1.000.000"
              name={amountField.name}
              ref={amountField.ref}
              onBlur={amountField.onBlur}
              value={amountDisplay}
              onChange={(e) => {
                const amount = parseIdrInput(e.target.value);
                setAmountDisplay(formatIdrInput(e.target.value));
                setValue('amount', amount, { shouldDirty: true, shouldValidate: true });
              }}
            />
          </div>
          <Input label="Tanggal" type="date" required error={errors.date?.message} {...register('date', { required: 'Tanggal wajib diisi' })} />
          <Textarea label="Keterangan Tambahan" rows={3} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Transaksi'}</Button>
          </div>
        </form>
      </Modal>

      <FinanceShareModal
        key={`share-${isShareOpen}-${selectedTransactions.length}`}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        periodLabel={periodLabel}
        filterTransactions={shareFilterTransactions}
        selectedTransactions={selectedTransactions}
        isLoading={shareLoading}
      />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} isLoading={deleteMutation.isPending} />
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={onBulkDelete}
        title="Konfirmasi Hapus Terpilih"
        message={`Apakah Anda yakin ingin menghapus ${selectedIds.size} transaksi terpilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Terpilih"
        isLoading={deleteManyMutation.isPending}
      />
    </DashboardLayout>
  );
}
