'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Heart, Archive, Users } from 'lucide-react';
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
import SearchableSelect from '@/components/ui/SearchableSelect';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImageUpload from '@/components/ui/ImageUpload';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import QRCodeModal from '@/components/ui/QRCodeModal';
import { useKajianList, useCreateKajian, useUpdateKajian, useArchiveKajian, KAJIAN_KEY } from '@/hooks/useKajian';
import { useUstadList } from '@/hooks/useUstad';
import { useWhatsAppSettings } from '@/hooks/useSettings';
import { Kajian, KajianFormData, KajianDonationInput } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { uploadService } from '@/services/upload.service';
import BroadcastModal from '@/components/broadcast/BroadcastModal';
import KajianRegistrationsModal from '@/components/kajian/KajianRegistrationsModal';
import KajianDetailModal from '@/components/kajian/KajianDetailModal';
import KajianRowActions from '@/components/kajian/KajianRowActions';
import KajianDonationFields, {
  defaultKajianDonationInput,
  donationInputFromCampaign,
  validateKajianDonationInput,
} from '@/components/kajian/KajianDonationFields';
import { kajianDonationService } from '@/services/kajian-donation.service';

const defaultValues: KajianFormData = {
  title: '',
  speaker: '',
  description: '',
  date: '',
  time: '',
  location: '',
  poster_image: '',
  status: 'upcoming',
};

export default function KajianPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Kajian | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [broadcastItem, setBroadcastItem] = useState<Kajian | null>(null);
  const [qrCodeItem, setQrCodeItem] = useState<Kajian | null>(null);
  const [registrationsItem, setRegistrationsItem] = useState<Kajian | null>(null);
  const [detailItem, setDetailItem] = useState<Kajian | null>(null);
  const [donationInput, setDonationInput] = useState<KajianDonationInput>(defaultKajianDonationInput);
  const [donationErrors, setDonationErrors] = useState<Partial<Record<keyof KajianDonationInput, string>>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading } = useKajianList({ page, limit: 8, search, status: statusFilter });
  const { data: ustadData } = useUstadList({ limit: 100 });
  const { data: whatsappSettings } = useWhatsAppSettings();
  const createMutation = useCreateKajian();
  const updateMutation = useUpdateKajian();
  const archiveMutation = useArchiveKajian();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<KajianFormData>({
    defaultValues,
  });

  const ustadOptions = [
    ...(ustadData?.data ?? []).map((ustad) => ({
      value: ustad.nama,
      label: ustad.nama,
    })),
  ];

  const openCreate = () => {
    setEditItem(null);
    reset(defaultValues);
    setDonationInput(defaultKajianDonationInput);
    setDonationErrors({});
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEdit = (item: Kajian) => {
    setEditItem(item);
    reset({
      title: item.title,
      speaker: item.speaker,
      description: item.description,
      date: item.date,
      time: item.time,
      location: item.location,
      poster_image: item.poster_image,
      status: item.status,
    });
    setDonationInput(donationInputFromCampaign(item.donation_campaign));
    setDonationErrors({});
    setImageFile(null);
    setImagePreview(item.poster_image || '');
    setIsModalOpen(true);
  };

  const onSubmit = async (data: KajianFormData) => {
    const validationErrors = validateKajianDonationInput(donationInput);
    if (Object.keys(validationErrors).length > 0) {
      setDonationErrors(validationErrors);
      toast('error', 'Validasi gagal', 'Periksa field donasi');
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = data.poster_image;

      // Upload image if a new file is selected
      if (imageFile) {
        try {
          const uploadResult = await uploadService.uploadKajianImage(imageFile);
          imageUrl = uploadResult.url;
          toast('success', 'Berhasil', 'Gambar berhasil diupload');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gagal mengupload gambar';
          toast('error', 'Gagal', errorMessage);
          setIsUploading(false);
          return;
        }
      }

      // Save kajian with image URL
      const dataToSave = { ...data, poster_image: imageUrl };

      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: dataToSave });
        await kajianDonationService.upsertForKajian(
          editItem.id,
          { title: data.title, description: data.description },
          donationInput
        );
        toast('success', 'Berhasil', 'Kajian berhasil diupdate');
      } else {
        const result = await createMutation.mutateAsync(dataToSave);
        await kajianDonationService.upsertForKajian(
          result.data.id,
          { title: data.title, description: data.description },
          donationInput
        );
        toast('success', 'Berhasil', 'Kajian berhasil ditambahkan');
      }

      await queryClient.invalidateQueries({ queryKey: [KAJIAN_KEY] });
      setIsModalOpen(false);
      reset(defaultValues);
      setDonationInput(defaultKajianDonationInput);
      setDonationErrors({});
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      toast('error', 'Gagal', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const onArchive = async () => {
    if (!archiveId) return;
    try {
      await archiveMutation.mutateAsync(archiveId);
      toast('success', 'Berhasil', 'Kajian dipindahkan ke arsip');
      setArchiveId(null);
    } catch {
      toast('error', 'Gagal', 'Terjadi kesalahan');
    }
  };

  const handleBroadcast = (kajian: Kajian) => {
    setBroadcastItem(kajian);
  };

  const handleShowQR = (kajian: Kajian) => {
    setQrCodeItem(kajian);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  const handleImageChange = (file: File | null, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  return (
    <DashboardLayout
      title="Kajian"
      description="Kelola jadwal dan informasi kajian"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/kajian/archive">
            <Button variant="outline" leftIcon={<Archive className="h-4 w-4" />}>
              Arsip
            </Button>
          </Link>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Kajian
          </Button>
        </div>
      }
    >
      <Card padding="md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cari kajian..."
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
          <LoadingSpinner text="Memuat data kajian..." />
        ) : (data?.data ?? []).length === 0 ? (
          <EmptyState icon={BookOpen} title="Belum ada kajian" description="Tambahkan kajian baru untuk memulai" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah Kajian</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[780px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3">Pemateri</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Pendaftar</th>
                    <th className="px-4 py-3">Donasi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setDetailItem(item)}
                          className="text-left font-medium text-gray-800 line-clamp-1 hover:text-emerald-700 transition-colors"
                          title="Lihat detail"
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.speaker}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(item.date)} · {item.time}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                        <p className="truncate">{item.location}</p>
                      </td>
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
                          mode="active"
                          whatsappEnabled={whatsappSettings?.enabled}
                          onViewDetail={setDetailItem}
                          onViewRegistrations={setRegistrationsItem}
                          onShowQR={handleShowQR}
                          onBroadcast={handleBroadcast}
                          onEdit={openEdit}
                          onArchive={(k) => setArchiveId(k.id)}
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

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Kajian' : 'Tambah Kajian'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Judul Kajian" required error={errors.title?.message} {...register('title', { required: 'Judul wajib diisi' })} />
          <Controller
            name="speaker"
            control={control}
            rules={{ required: 'Pemateri wajib diisi' }}
            render={({ field }) => (
              <SearchableSelect
                label="Pemateri"
                placeholder="Pilih pemateri..."
                searchPlaceholder="Cari pemateri..."
                emptyMessage="Tidak ada pemateri. Tambahkan di menu Daftar Ustad."
                required
                options={ustadOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.speaker?.message}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" required error={errors.date?.message} {...register('date', { required: 'Tanggal wajib diisi' })} />
            <Input label="Waktu" type="time" required error={errors.time?.message} {...register('time', { required: 'Waktu wajib diisi' })} />
          </div>
          <Input label="Lokasi" required error={errors.location?.message} {...register('location', { required: 'Lokasi wajib diisi' })} />

          <ImageUpload
            label="Gambar Poster"
            value={imagePreview}
            onChange={handleImageChange}
            maxSizeMB={1}
            disabled={isSubmitting}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor label="Deskripsi" value={field.value} onChange={field.onChange} />
            )}
          />
          <KajianDonationFields
            value={donationInput}
            onChange={setDonationInput}
            errors={donationErrors}
          />
          <Select
            label="Status"
            options={[
              { value: 'upcoming', label: 'Mendatang' },
              { value: 'finished', label: 'Selesai' },
            ]}
            {...register('status')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isUploading ? 'Mengupload...' : editItem ? 'Simpan Perubahan' : 'Tambah Kajian'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!archiveId}
        onClose={() => setArchiveId(null)}
        onConfirm={onArchive}
        isLoading={archiveMutation.isPending}
        title="Arsipkan Kajian"
        message="Kajian akan dipindahkan ke arsip dan tidak tampil di daftar aktif. Anda bisa memulihkannya kapan saja."
        confirmLabel="Arsipkan"
      />

      <BroadcastModal
        isOpen={!!broadcastItem}
        onClose={() => setBroadcastItem(null)}
        title={broadcastItem?.title ?? ''}
        eventType="kajian"
        eventData={{
          title: broadcastItem?.title ?? '',
          date: broadcastItem?.date ?? '',
          time: broadcastItem?.time ?? '',
          location: broadcastItem?.location ?? '',
          speaker: broadcastItem?.speaker ?? '',
        }}
      />

      <QRCodeModal
        isOpen={!!qrCodeItem}
        onClose={() => setQrCodeItem(null)}
        title={qrCodeItem?.title ?? ''}
        url={`https://masjiddarussalaml.vercel.app/kajian/${qrCodeItem?.id}`}
        description="Scan QR code ini untuk melihat detail kajian"
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
        onEdit={openEdit}
        onViewRegistrations={setRegistrationsItem}
      />
    </DashboardLayout>
  );
}
