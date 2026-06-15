'use client';

import { useMemo, useState } from 'react';
import { Copy, MessageCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FinanceTransaction } from '@/types';
import {
  buildFinanceReportMessage,
  computeFinanceTotals,
  copyToClipboard,
  openWhatsAppShare,
} from '@/lib/finance-report';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

export type FinanceShareSource = 'filter' | 'selected';

interface FinanceShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  filterTransactions: FinanceTransaction[];
  selectedTransactions: FinanceTransaction[];
  isLoading?: boolean;
}

export default function FinanceShareModal({
  isOpen,
  onClose,
  periodLabel,
  filterTransactions,
  selectedTransactions,
  isLoading = false,
}: FinanceShareModalProps) {
  const [source, setSource] = useState<FinanceShareSource>(
    selectedTransactions.length > 0 ? 'selected' : 'filter'
  );

  const transactions =
    source === 'selected' && selectedTransactions.length > 0
      ? selectedTransactions
      : filterTransactions;

  const totals = useMemo(() => computeFinanceTotals(transactions), [transactions]);

  const message = useMemo(
    () =>
      buildFinanceReportMessage(
        transactions,
        source === 'selected' ? `Transaksi Terpilih (${transactions.length})` : periodLabel
      ),
    [transactions, periodLabel, source]
  );

  const handleCopy = async () => {
    const ok = await copyToClipboard(message);
    if (ok) toast('success', 'Berhasil', 'Laporan disalin ke clipboard');
    else toast('error', 'Gagal', 'Tidak dapat menyalin teks');
  };

  const handleWhatsApp = () => {
    if (transactions.length === 0) {
      toast('warning', 'Kosong', 'Tidak ada transaksi untuk dibagikan');
      return;
    }
    openWhatsAppShare(message);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagikan Laporan Ke WhatsApp" size="lg">
      {isLoading ? (
        <LoadingSpinner text="Menyiapkan laporan..." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSource('filter')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                source === 'filter'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Filter aktif ({filterTransactions.length})
            </button>
            <button
              type="button"
              onClick={() => setSource('selected')}
              disabled={selectedTransactions.length === 0}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                source === 'selected'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Transaksi terpilih ({selectedTransactions.length})
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-center text-sm">
            <div>
              <p className="text-gray-500">Pemasukan</p>
              <p className="font-semibold text-emerald-600">{formatCurrency(totals.total_income)}</p>
            </div>
            <div>
              <p className="text-gray-500">Pengeluaran</p>
              <p className="font-semibold text-red-500">{formatCurrency(totals.total_expense)}</p>
            </div>
            <div>
              <p className="text-gray-500">Saldo</p>
              <p className="font-semibold text-emerald-700">{formatCurrency(totals.balance)}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Preview pesan
            </p>
            <textarea
              readOnly
              value={message}
              rows={14}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <p className="text-xs text-gray-500">
            Pilih grup WhatsApp pengurus setelah WhatsApp terbuka. Format *tebal* akan tampil otomatis di WhatsApp.
          </p>

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Tutup
            </Button>
            <Button variant="secondary" type="button" leftIcon={<Copy className="h-4 w-4" />} onClick={handleCopy}>
              Salin
            </Button>
            <Button
              type="button"
              leftIcon={<MessageCircle className="h-4 w-4" />}
              onClick={handleWhatsApp}
              disabled={transactions.length === 0}
            >
              Buka WhatsApp
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
