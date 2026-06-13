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
} from 'lucide-react';
import ActionMenu, { ActionMenuItem } from '@/components/ui/ActionMenu';
import { Kajian } from '@/types';

interface KajianRowActionsProps {
  kajian: Kajian;
  mode: 'active' | 'archived';
  whatsappEnabled?: boolean;
  onViewDetail: (kajian: Kajian) => void;
  onViewRegistrations: (kajian: Kajian) => void;
  onShowQR?: (kajian: Kajian) => void;
  onBroadcast?: (kajian: Kajian) => void;
  onEdit?: (kajian: Kajian) => void;
  onArchive?: (kajian: Kajian) => void;
  onRestore?: (kajian: Kajian) => void;
  onDelete?: (kajian: Kajian) => void;
}

export default function KajianRowActions({
  kajian,
  mode,
  whatsappEnabled,
  onViewDetail,
  onViewRegistrations,
  onShowQR,
  onBroadcast,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: KajianRowActionsProps) {
  const items: ActionMenuItem[] =
    mode === 'active'
      ? [
          { label: 'Lihat detail', icon: <Eye className="h-4 w-4" />, onClick: () => onViewDetail(kajian) },
          { label: 'Lihat pendaftar', icon: <Users className="h-4 w-4" />, onClick: () => onViewRegistrations(kajian) },
          { label: 'QR Code', icon: <QrCode className="h-4 w-4" />, onClick: () => onShowQR?.(kajian), hidden: !onShowQR },
          {
            label: 'Broadcast',
            icon: <Send className="h-4 w-4" />,
            onClick: () => onBroadcast?.(kajian),
            hidden: !whatsappEnabled || kajian.status !== 'upcoming' || !onBroadcast,
          },
          { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => onEdit?.(kajian), hidden: !onEdit },
          {
            label: 'Arsipkan',
            icon: <Archive className="h-4 w-4" />,
            onClick: () => onArchive?.(kajian),
            hidden: !onArchive,
          },
        ]
      : [
          { label: 'Lihat detail', icon: <Eye className="h-4 w-4" />, onClick: () => onViewDetail(kajian) },
          { label: 'Lihat pendaftar', icon: <Users className="h-4 w-4" />, onClick: () => onViewRegistrations(kajian) },
          {
            label: 'Pulihkan',
            icon: <ArchiveRestore className="h-4 w-4" />,
            onClick: () => onRestore?.(kajian),
            hidden: !onRestore,
          },
          {
            label: 'Hapus permanen',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => onDelete?.(kajian),
            variant: 'danger',
            hidden: !onDelete,
          },
        ];

  return <ActionMenu items={items} />;
}
