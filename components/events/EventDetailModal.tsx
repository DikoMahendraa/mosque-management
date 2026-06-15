'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { MosqueEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import { CalendarDays, MapPin, Users, ExternalLink, Pencil, Sparkles } from 'lucide-react';

const LANDING_PAGE_BASE = 'https://masjiddarussalaml.vercel.app/events';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MosqueEvent | null;
  onEdit?: (event: MosqueEvent) => void;
  onViewRegistrations?: (event: MosqueEvent) => void;
  onGeneratePoster?: (event: MosqueEvent) => void;
}

export default function EventDetailModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onViewRegistrations,
  onGeneratePoster,
}: EventDetailModalProps) {
  if (!event) return null;

  const landingUrl = `${LANDING_PAGE_BASE}/${event.id}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Event" size="lg">
      <div className="space-y-5">
        {event.poster ? (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.poster}
              alt={event.title}
              className="h-48 w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <CalendarDays className="h-10 w-10 text-emerald-400" />
          </div>
        )}

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={statusBadge(event.status)}>
              {event.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
            </Badge>
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <Users className="h-3.5 w-3.5" />
              {event.registration_count ?? 0} pendaftar
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tanggal</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(event.event_date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Lokasi</p>
              <p className="text-sm font-medium text-gray-800">{event.location}</p>
            </div>
          </div>
        </div>

        {event.description ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Deskripsi
            </p>
            <div
              className="prose prose-sm max-w-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-gray-700"
              dangerouslySetInnerHTML={{ __html: event.description }}
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
                onViewRegistrations(event);
              }}
            >
              Lihat Pendaftar
            </Button>
          )}
          {onGeneratePoster && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="h-4 w-4" />}
              onClick={() => {
                onClose();
                onGeneratePoster(event);
              }}
            >
              Buat Poster
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => {
                onClose();
                onEdit(event);
              }}
            >
              Edit Event
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
