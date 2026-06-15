'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Archive, ArrowLeft } from 'lucide-react';
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
import EventRowActions from '@/components/events/EventRowActions';
import EventRegistrationsModal from '@/components/events/EventRegistrationsModal';
import EventDetailModal from '@/components/events/EventDetailModal';
import {
  useEventList,
  useRestoreEvent,
  useDeleteEvent,
} from '@/hooks/useEvents';
import { MosqueEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

export default function EventsArchivePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [registrationsItem, setRegistrationsItem] = useState<MosqueEvent | null>(null);
  const [detailItem, setDetailItem] = useState<MosqueEvent | null>(null);

  const { data, isLoading } = useEventList({
    page,
    limit: 8,
    search,
    status: statusFilter,
    archived: true,
  });
  const restoreMutation = useRestoreEvent();
  const deleteMutation = useDeleteEvent();

  const onRestore = async () => {
    if (!restoreId) return;
    try {
      await restoreMutation.mutateAsync(restoreId);
      toast('success', 'Berhasil', 'Event dipulihkan ke daftar aktif');
      setRestoreId(null);
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan');
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast('success', 'Berhasil', 'Event dihapus permanen');
      setDeleteId(null);
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan');
    }
  };

  return (
    <DashboardLayout
      title="Arsip Events"
      description="Event yang sudah tidak relevan disimpan di sini"
      actions={
        <Link href="/dashboard/events">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Kembali ke Events
          </Button>
        </Link>
      }
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cari arsip event..."
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
          <LoadingSpinner text="Memuat arsip event..." />
        ) : (data?.data ?? []).length === 0 ? (
          <EmptyState
            icon={Archive}
            title="Arsip kosong"
            description="Event yang diarsipkan dari halaman Events akan muncul di sini."
            action={
              <Link href="/dashboard/events">
                <Button leftIcon={<CalendarDays className="h-4 w-4" />}>Lihat Events Aktif</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Nama Event</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-700">{item.title}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(item.event_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                        <p className="truncate">{item.location}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge(item.status)}>
                          {item.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <EventRowActions
                          event={item}
                          mode="archived"
                          onViewDetail={setDetailItem}
                          onViewRegistrations={setRegistrationsItem}
                          onRestore={(e) => setRestoreId(e.id)}
                          onDelete={(e) => setDeleteId(e.id)}
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
        title="Pulihkan Event"
        message="Event akan kembali ke daftar aktif."
        confirmLabel="Pulihkan"
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        isLoading={deleteMutation.isPending}
        title="Hapus Permanen"
        message="Event akan dihapus selamanya. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
      />

      <EventRegistrationsModal
        isOpen={!!registrationsItem}
        onClose={() => setRegistrationsItem(null)}
        eventId={registrationsItem?.id ?? null}
        eventTitle={registrationsItem?.title ?? ''}
      />

      <EventDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        event={detailItem}
        onViewRegistrations={setRegistrationsItem}
      />
    </DashboardLayout>
  );
}
