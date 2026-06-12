'use client';

import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useKajianRegistrations } from '@/hooks/useKajianRegistrations';
import { formatDate } from '@/lib/utils';
import { Users } from 'lucide-react';

interface KajianRegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  kajianId: string | null;
  kajianTitle: string;
}

export default function KajianRegistrationsModal({
  isOpen,
  onClose,
  kajianId,
  kajianTitle,
}: KajianRegistrationsModalProps) {
  const { data: registrations, isLoading } = useKajianRegistrations(isOpen ? kajianId : null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pendaftar — ${kajianTitle}`}
      size="xl"
    >
      {isLoading ? (
        <LoadingSpinner text="Memuat daftar pendaftar..." />
      ) : (registrations ?? []).length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada pendaftar"
          description="Pendaftar akan muncul setelah jamaah mendaftar melalui halaman landing page."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Umur</th>
                <th className="px-4 py-3">Telepon</th>
                <th className="px-4 py-3">Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {registrations?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                    <p className="truncate" title={item.address}>{item.address}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.age} th</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(item.created_at, 'DD MMM YYYY HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-xs text-gray-500 border-t border-gray-100">
            Total {registrations?.length} pendaftar
          </p>
        </div>
      )}
    </Modal>
  );
}
