'use client';

import { useState } from 'react';
import { X, Send, Users, CheckSquare, Square } from 'lucide-react';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useJamaahList } from '@/hooks/useJamaah';
import { Jamaah } from '@/types';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eventType: 'kajian' | 'event';
  eventData: {
    title: string;
    date?: string;
    time?: string;
    location: string;
    speaker?: string;
  };
}

export default function BroadcastModal({
  isOpen,
  onClose,
  title,
  eventType,
  eventData,
}: BroadcastModalProps) {
  const [search, setSearch] = useState('');
  const [selectedJamaah, setSelectedJamaah] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { data: jamaahData, isLoading } = useJamaahList({ 
    limit: 1000, 
    search 
  });

  const jamaahList = jamaahData?.data ?? [];

  const handleClose = () => {
    setSelectedJamaah([]);
    setSearch('');
    onClose();
  };

  const toggleJamaah = (id: string) => {
    setSelectedJamaah((prev) =>
      prev.includes(id) ? prev.filter((jid) => jid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJamaah.length === jamaahList.length) {
      setSelectedJamaah([]);
    } else {
      setSelectedJamaah(jamaahList.map((j) => j.id));
    }
  };

  const isAllSelected = jamaahList.length > 0 && selectedJamaah.length === jamaahList.length;
  const isSomeSelected = selectedJamaah.length > 0 && selectedJamaah.length < jamaahList.length;

  const handleBroadcast = async () => {
    if (selectedJamaah.length === 0) {
      alert('Silakan pilih minimal 1 jamaah untuk broadcast');
      return;
    }

    setIsSending(true);
    
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // TODO: Implement actual WhatsApp broadcast here
    alert(`🚀 Coming Soon!\n\nFitur broadcast akan mengirim pesan ke ${selectedJamaah.length} jamaah.\n\nIntegrasi dengan WhatsApp API sedang dalam pengembangan.`);
    
    setIsSending(false);
    handleClose();
  };

  if (!isOpen) return null;

  const message = eventType === 'kajian' 
    ? `🕌 *Masjid Darussalam*\n\n📅 *Kajian Rutin*\nTema: ${eventData.title}\nPemateri: ${eventData.speaker}\n📆 ${eventData.date} • ⏰ ${eventData.time}\n📍 ${eventData.location}\n\nJazakumullahu khairan`
    : `🕌 *Masjid Darussalam*\n\n📅 *${eventData.title}*\n📆 ${eventData.date}\n📍 ${eventData.location}\n\nJazakumullahu khairan`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Broadcast WhatsApp</h2>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Message Preview */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Preview Pesan
            </p>
            <div className="whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-gray-700">
              {message}
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Pilih Penerima ({selectedJamaah.length} dipilih)
              </p>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                {isAllSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : isSomeSelected ? (
                  <CheckSquare className="h-4 w-4 opacity-50" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {isAllSelected ? 'Hapus Semua' : 'Pilih Semua'}
              </button>
            </div>

            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Cari jamaah..."
              className="mb-3"
            />

            {isLoading ? (
              <LoadingSpinner text="Memuat daftar jamaah..." />
            ) : jamaahList.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {search ? 'Jamaah tidak ditemukan' : 'Belum ada jamaah terdaftar'}
                </p>
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-200">
                {jamaahList.map((jamaah: Jamaah) => {
                  const isSelected = selectedJamaah.includes(jamaah.id);
                  return (
                    <label
                      key={jamaah.id}
                      className={`flex cursor-pointer items-center gap-3 border-b border-gray-100 p-3 transition-colors last:border-0 hover:bg-gray-50 ${
                        isSelected ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleJamaah(jamaah.id)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {jamaah.nama}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {jamaah.nomor_whatsapp}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-600">
            {selectedJamaah.length > 0 ? (
              <>
                <span className="font-semibold text-emerald-600">{selectedJamaah.length}</span>{' '}
                jamaah akan menerima pesan
              </>
            ) : (
              'Pilih jamaah untuk melanjutkan'
            )}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isSending}>
              Batal
            </Button>
            <Button
              onClick={handleBroadcast}
              isLoading={isSending}
              disabled={selectedJamaah.length === 0}
              leftIcon={<Send className="h-4 w-4" />}
            >
              {isSending ? 'Mengirim...' : 'Broadcast Sekarang'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
