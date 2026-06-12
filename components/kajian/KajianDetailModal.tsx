'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { Kajian } from '@/types';
import { formatDate } from '@/lib/utils';
import { BookOpen, CalendarDays, Clock, MapPin, User, Users, ExternalLink, Pencil } from 'lucide-react';

const LANDING_PAGE_BASE = 'https://masjiddarussalaml.vercel.app//kajian';

interface KajianDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kajian: Kajian | null;
  onEdit?: (kajian: Kajian) => void;
  onViewRegistrations?: (kajian: Kajian) => void;
}

export default function KajianDetailModal({
  isOpen,
  onClose,
  kajian,
  onEdit,
  onViewRegistrations,
}: KajianDetailModalProps) {
  if (!kajian) return null;

  const landingUrl = `${LANDING_PAGE_BASE}/${kajian.id}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Kajian" size="lg">
      <div className="space-y-5">
        {kajian.poster_image ? (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={kajian.poster_image}
              alt={kajian.title}
              className="h-48 w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <BookOpen className="h-10 w-10 text-emerald-400" />
          </div>
        )}

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={statusBadge(kajian.status)}>
              {kajian.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
            </Badge>
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <Users className="h-3.5 w-3.5" />
              {kajian.registration_count ?? 0} pendaftar
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{kajian.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
            <User className="h-4 w-4 text-emerald-600" />
            {kajian.speaker}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tanggal</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(kajian.date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Waktu</p>
              <p className="text-sm font-medium text-gray-800">{kajian.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 sm:col-span-1">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Lokasi</p>
              <p className="text-sm font-medium text-gray-800">{kajian.location}</p>
            </div>
          </div>
        </div>

        {kajian.description ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Deskripsi
            </p>
            <div
              className="prose prose-sm max-w-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-gray-700"
              dangerouslySetInnerHTML={{ __html: kajian.description }}
            />
          </div>
        ) : (
          <p className="text-sm italic text-gray-400">Belum ada deskripsi.</p>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ExternalLink className="h-4 w-4" />}
            onClick={() => window.open(landingUrl, '_blank', 'noopener,noreferrer')}
          >
            Lihat di Landing Page
          </Button>
          {onViewRegistrations && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Users className="h-4 w-4" />}
              onClick={() => {
                onClose();
                onViewRegistrations(kajian);
              }}
            >
              Lihat Pendaftar
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => {
                onClose();
                onEdit(kajian);
              }}
            >
              Edit Kajian
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
