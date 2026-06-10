'use client';

import { useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  title,
  url,
  description,
}: QRCodeModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const svg = document.getElementById('qr-code-svg') as unknown as SVGElement;
      if (!svg) {
        toast('error', 'Gagal', 'QR Code tidak ditemukan');
        setDownloading(false);
        return;
      }

      // Get the SVG element
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scale = 4; // Higher resolution for better quality
      const size = 300 * scale;
      canvas.width = size;
      canvas.height = size;

      if (!ctx) {
        toast('error', 'Gagal', 'Tidak dapat membuat canvas');
        setDownloading(false);
        return;
      }

      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);

      // Load and draw the SVG
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const filename = `qr-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.download = filename;
            link.href = downloadUrl;
            link.click();

            // Cleanup
            URL.revokeObjectURL(downloadUrl);
            URL.revokeObjectURL(url);

            toast('success', 'Berhasil', 'QR Code berhasil diunduh');
          }
          setDownloading(false);
        }, 'image/png', 1.0);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast('error', 'Gagal', 'Gagal memproses QR Code');
        setDownloading(false);
      };

      img.src = url;
    } catch (error) {
      console.error('Download error:', error);
      toast('error', 'Gagal', 'Terjadi kesalahan saat mengunduh');
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast('success', 'Berhasil', 'Link berhasil disalin');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">QR Code</h2>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {description && (
            <p className="mb-4 text-sm text-gray-600">{description}</p>
          )}

          {/* QR Code */}
          <div className="mb-6 flex justify-center rounded-xl border-2 border-gray-100 bg-white p-6">
            <QRCodeSVG
              id="qr-code-svg"
              value={url}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/logo.png',
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          {/* URL Display */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Link Tujuan:</p>
            <p className="break-all text-sm text-gray-700">{url}</p>
          </div>

          {/* Instructions */}
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Cara Menggunakan:</strong>
              <br />
              • Unduh QR Code untuk dicetak di poster/flyer
              <br />
              • Jamaah scan QR dengan kamera HP
              <br />• Langsung menuju halaman detail kajian
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            leftIcon={<Share2 className="h-4 w-4" />}
            className="flex-1"
          >
            Salin Link
          </Button>
          <Button
            onClick={handleDownload}
            isLoading={downloading}
            leftIcon={<Download className="h-4 w-4" />}
            className="flex-1"
          >
            {downloading ? 'Mengunduh...' : 'Unduh QR'}
          </Button>
        </div>
      </div>
    </div>
  );
}
