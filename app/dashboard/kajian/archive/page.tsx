'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Heart, Archive, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import KajianRowActions from '@/components/kajian/KajianRowActions';
import KajianRegistrationsModal from '@/components/kajian/KajianRegistrationsModal';
import KajianDetailModal from '@/components/kajian/KajianDetailModal';
import {
  useKajianList,
  useRestoreKajian,
  useDeleteKajian,
} from '@/hooks/useKajian';
import { Kajian } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

export default function KajianArchivePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [registrationsItem, setRegistrationsItem] = useState<Kajian | null>(null);
  const [detailItem, setDetailItem] = useState<Kajian | null>(null);

  const { data, isLoading } = useKajianList({
    page,
    limit: 8,
    search,
    status: statusFilter,
    archived: true,
  });
  const restoreMutation = useRestoreKajian();
  const deleteMutation = useDeleteKajian();

  const onRestore = async () => {
    if (!restoreId) return;
    try {
      await restoreMutation.mutateAsync(restoreId);
      toast('success', 'Berhasil', 'Kajian dipulihkan ke daftar aktif');
      setRestoreId(null);
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan');
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Kajian dihapus permanen');
      setDeleteId(null);
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan');
    }
  };

  return (
    <DashboardLayout
      title="Arsip Kajian"
      description="Kajian yang sudah tidak relevan disimpan di sini"
      actions={
        <Link href="/dashboard/kajian">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Kembali ke Kajian
          </Button>
        </Link>
      }
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cari arsip kajian..."
            className="sm:w-72"
          />
          <Select
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'upcoming', label: 'Mendatang' },
              { value: 'finished', label: 'Selesai' },
            ]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
        </div>

        {isLoading ? (
          <LoadingSpinner text="Memuat arsip kajian..." />
        ) : (data?.data ?? []).length === 0 ? (
          <EmptyState
            icon={Archive}
            title="Arsip kosong"
            description="Kajian yang diarsipkan dari halaman Kajian akan muncul di sini."
            action={
              <Link href="/dashboard/kajian">
                <Button leftIcon={<BookOpen className="h-4 w-4" />}>Lihat Kajian Aktif</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3">Pemateri</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Donasi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-700">{item.title}</td>
                      <td className="px-4 py-3 text-gray-600">{item.speaker}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(item.date)} · {item.time}
                      </td>
                      <td className="px-4 py-3">
                        {item.donation_campaign ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                            <Heart className="h-3.5 w-3.5" />
                            {formatCurrency(item.donation_campaign.target_amount)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge(item.status)}>
                          {item.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <KajianRowActions
                          kajian={item}
                          mode="archived"
                          onViewDetail={setDetailItem}
                          onViewRegistrations={setRegistrationsItem}
                          onRestore={(k) => setRestoreId(k.id)}
                          onDelete={(k) => setDeleteId(k.id)}
                        />
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

      <ConfirmDialog
        isOpen={!!restoreId}
        onClose={() => setRestoreId(null)}
        onConfirm={onRestore}
        isLoading={restoreMutation.isPending}
        title="Pulihkan Kajian"
        message="Kajian akan kembali ke daftar aktif."
        confirmLabel="Pulihkan"
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        isLoading={deleteMutation.isPending}
        title="Hapus Permanen"
        message="Kajian akan dihapus selamanya. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
      />

      <KajianRegistrationsModal
        isOpen={!!registrationsItem}
        onClose={() => setRegistrationsItem(null)}
        kajianId={registrationsItem?.id ?? null}
        kajianTitle={registrationsItem?.title ?? ''}
      />

      <KajianDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        kajian={detailItem}
        onViewRegistrations={setRegistrationsItem}
      />
    </DashboardLayout>
  );
}
