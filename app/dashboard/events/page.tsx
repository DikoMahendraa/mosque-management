'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, CalendarDays, Archive, Users } from 'lucide-react';
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
import QRCodeModal from '@/components/ui/QRCodeModal';
import { useEventList, useCreateEvent, useUpdateEvent, useArchiveEvent } from '@/hooks/useEvents';
import { useWhatsAppSettings } from '@/hooks/useSettings';
import { MosqueEvent, EventFormData } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';
import BroadcastModal from '@/components/broadcast/BroadcastModal';
import EventRegistrationsModal from '@/components/events/EventRegistrationsModal';
import EventDetailModal from '@/components/events/EventDetailModal';
import EventRowActions from '@/components/events/EventRowActions';
import EventPosterModal from '@/components/events/EventPosterModal';

const defaultValues: EventFormData = {
  title: '',
  description: '',
  event_date: '',
  location: '',
  poster: '',
  status: 'upcoming',
};

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MosqueEvent | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [broadcastItem, setBroadcastItem] = useState<MosqueEvent | null>(null);
  const [qrCodeItem, setQrCodeItem] = useState<MosqueEvent | null>(null);
  const [registrationsItem, setRegistrationsItem] = useState<MosqueEvent | null>(null);
  const [detailItem, setDetailItem] = useState<MosqueEvent | null>(null);
  const [posterItem, setPosterItem] = useState<MosqueEvent | null>(null);

  const { data, isLoading } = useEventList({ page, limit: 8, search, status: statusFilter });
  const { data: whatsappSettings } = useWhatsAppSettings();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const archiveMutation = useArchiveEvent();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<EventFormData>({ defaultValues });

  const openCreate = () => { setEditItem(null); reset(defaultValues); setIsModalOpen(true); };
  const openEdit = (item: MosqueEvent) => {
    setEditItem(item);
    reset({ title: item.title, description: item.description, event_date: item.event_date, location: item.location, poster: item.poster, status: item.status });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: EventFormData) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast('success', 'Berhasil', 'Event berhasil diupdate');
        setIsModalOpen(false);
      } else {
        const result = await createMutation.mutateAsync(formData);
        setIsModalOpen(false);
        toast('success', 'Berhasil', 'Event berhasil ditambahkan');
        if (result.data) {
          setPosterItem(result.data);
        }
      }
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const onArchive = async () => {
    if (!archiveId) return;
    try {
      await archiveMutation.mutateAsync(archiveId);
      toast('success', 'Berhasil', 'Event dipindahkan ke arsip');
      setArchiveId(null);
    } catch { toast('error', 'Gagal', 'Terjadi kesalahan'); }
  };

  const handleBroadcast = (event: MosqueEvent) => {
    setBroadcastItem(event);
  };

  const handleShowQR = (event: MosqueEvent) => {
    setQrCodeItem(event);
  };

  const handleGeneratePoster = (event: MosqueEvent) => {
    setPosterItem(event);
  };

  const handlePosterSaved = (event: MosqueEvent, posterUrl: string) => {
    if (detailItem?.id === event.id) {
      setDetailItem({ ...detailItem, poster: posterUrl });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout
      title="Events"
      description="Kelola kegiatan dan acara masjid"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/events/archive">
            <Button variant="outline" leftIcon={<Archive className="h-4 w-4" />}>
              Arsip
            </Button>
          </Link>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah Event</Button>
        </div>
      }
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari event..." className="sm:w-72" />
          <Select
            options={[{ value: '', label: 'Semua Status' }, { value: 'upcoming', label: 'Mendatang' }, { value: 'finished', label: 'Selesai' }]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
        </div>
        {isLoading ? <LoadingSpinner text="Memuat data event..." /> :
          (data?.data ?? []).length === 0 ? (
            <EmptyState icon={CalendarDays} title="Belum ada event" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Event</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Nama Event</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Lokasi</th>
                      <th className="px-4 py-3">Pendaftar</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            className="text-left hover:text-emerald-700 transition-colors"
                            title="Lihat detail"
                          >
                            {item.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(item.event_date)}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px]"><p className="truncate">{item.location}</p></td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setRegistrationsItem(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-violet-700 hover:bg-violet-50 transition-colors"
                            title="Lihat pendaftar"
                          >
                            <Users className="h-4 w-4" />
                            {item.registration_count ?? 0}
                          </button>
                        </td>
                        <td className="px-4 py-3"><Badge variant={statusBadge(item.status)}>{item.status === 'upcoming' ? 'Mendatang' : 'Selesai'}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <EventRowActions
                            event={item}
                            mode="active"
                            whatsappEnabled={whatsappSettings?.enabled}
                            onViewDetail={setDetailItem}
                            onViewRegistrations={setRegistrationsItem}
                            onShowQR={handleShowQR}
                            onBroadcast={handleBroadcast}
                            onGeneratePoster={handleGeneratePoster}
                            onEdit={openEdit}
                            onArchive={(e) => setArchiveId(e.id)}
                          />
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Event' : 'Tambah Event'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Event" required error={errors.title?.message} {...register('title', { required: 'Nama wajib diisi' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" required error={errors.event_date?.message} {...register('event_date', { required: 'Tanggal wajib diisi' })} />
            <Input label="Lokasi" required error={errors.location?.message} {...register('location', { required: 'Lokasi wajib diisi' })} />
          </div>
          <Controller name="description" control={control} render={({ field }) => <RichTextEditor label="Deskripsi" value={field.value} onChange={field.onChange} />} />
          <Select label="Status" options={[{ value: 'upcoming', label: 'Mendatang' }, { value: 'finished', label: 'Selesai' }]} {...register('status')} />
          {!editItem && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              Poster event bisa dibuat setelah event tersimpan, lewat menu <strong>Buat Poster</strong>.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Tambah Event'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!archiveId}
        onClose={() => setArchiveId(null)}
        onConfirm={onArchive}
        isLoading={archiveMutation.isPending}
        title="Arsipkan Event"
        message="Event akan dipindahkan ke arsip dan tidak tampil di daftar aktif. Anda bisa memulihkannya kapan saja."
        confirmLabel="Arsipkan"
      />

      <BroadcastModal
        isOpen={!!broadcastItem}
        onClose={() => setBroadcastItem(null)}
        title={broadcastItem?.title ?? ''}
        eventType="event"
        eventData={{
          title: broadcastItem?.title ?? '',
          date: broadcastItem?.event_date ?? '',
          location: broadcastItem?.location ?? '',
        }}
      />

      <QRCodeModal
        isOpen={!!qrCodeItem}
        onClose={() => setQrCodeItem(null)}
        title={qrCodeItem?.title ?? ''}
        url={`https://masjiddarussalaml.vercel.app/events/${qrCodeItem?.id}`}
        description="Scan QR code ini untuk melihat detail event"
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
        onEdit={openEdit}
        onViewRegistrations={setRegistrationsItem}
        onGeneratePoster={handleGeneratePoster}
      />

      <EventPosterModal
        isOpen={!!posterItem}
        onClose={() => setPosterItem(null)}
        event={posterItem}
        onPosterSaved={handlePosterSaved}
      />
    </DashboardLayout>
  );
}
