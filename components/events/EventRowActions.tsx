'use client';

import {
  Archive,
  Eye,
  Pencil,
  QrCode,
  Send,
  Trash2,
  Users,
  ArchiveRestore,
  Sparkles,
} from 'lucide-react';
import ActionMenu, { ActionMenuItem } from '@/components/ui/ActionMenu';
import { MosqueEvent } from '@/types';

interface EventRowActionsProps {
  event: MosqueEvent;
  mode: 'active' | 'archived';
  whatsappEnabled?: boolean;
  onViewDetail: (event: MosqueEvent) => void;
  onViewRegistrations: (event: MosqueEvent) => void;
  onShowQR?: (event: MosqueEvent) => void;
  onBroadcast?: (event: MosqueEvent) => void;
  onGeneratePoster?: (event: MosqueEvent) => void;
  onEdit?: (event: MosqueEvent) => void;
  onArchive?: (event: MosqueEvent) => void;
  onRestore?: (event: MosqueEvent) => void;
  onDelete?: (event: MosqueEvent) => void;
}

export default function EventRowActions({
  event,
  mode,
  whatsappEnabled,
  onViewDetail,
  onViewRegistrations,
  onShowQR,
  onBroadcast,
  onGeneratePoster,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: EventRowActionsProps) {
  const items: ActionMenuItem[] =
    mode === 'active'
      ? [
          { label: 'Lihat detail', icon: <Eye className="h-4 w-4" />, onClick: () => onViewDetail(event) },
          { label: 'Lihat pendaftar', icon: <Users className="h-4 w-4" />, onClick: () => onViewRegistrations(event) },
          { label: 'QR Code', icon: <QrCode className="h-4 w-4" />, onClick: () => onShowQR?.(event), hidden: !onShowQR },
          {
            label: 'Broadcast',
            icon: <Send className="h-4 w-4" />,
            onClick: () => onBroadcast?.(event),
            hidden: !whatsappEnabled || event.status !== 'upcoming' || !onBroadcast,
          },
          {
            label: 'Buat Poster',
            icon: <Sparkles className="h-4 w-4" />,
            onClick: () => onGeneratePoster?.(event),
            hidden: !onGeneratePoster,
          },
          { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => onEdit?.(event), hidden: !onEdit },
          {
            label: 'Arsipkan',
            icon: <Archive className="h-4 w-4" />,
            onClick: () => onArchive?.(event),
            hidden: !onArchive,
          },
        ]
      : [
          { label: 'Lihat detail', icon: <Eye className="h-4 w-4" />, onClick: () => onViewDetail(event) },
          { label: 'Lihat pendaftar', icon: <Users className="h-4 w-4" />, onClick: () => onViewRegistrations(event) },
          {
            label: 'Pulihkan',
            icon: <ArchiveRestore className="h-4 w-4" />,
            onClick: () => onRestore?.(event),
            hidden: !onRestore,
          },
          {
            label: 'Hapus permanen',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => onDelete?.(event),
            variant: 'danger',
            hidden: !onDelete,
          },
        ];

  return <ActionMenu items={items} />;
}
