'use client';

import { useState } from 'react';
import { Sparkles, Download, ImageIcon, Loader2, Wand2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { useAISettings } from '@/hooks/useSettings';
import { useUpdateEvent } from '@/hooks/useEvents';
import { generateEventPoster, generateEventPosterWithBackground, POSTER_TEMPLATE_OPTIONS } from '@/lib/event-poster';
import { uploadEventPoster } from '@/services/poster.service';
import { generateAIPosterBackground } from '@/services/ai-poster.service';
import { EventPosterTemplate, MosqueEvent } from '@/types';
import { stripHtml } from '@/lib/utils';

const LANDING_PAGE_BASE = 'https://masjiddarussalaml.vercel.app/events';

type GenerationMode = 'template' | 'ai';

interface EventPosterGeneratorProps {
  event: MosqueEvent;
  onPosterSaved?: (url: string) => void;
  onCancel?: () => void;
}

export default function EventPosterGenerator({
  event,
  onPosterSaved,
  onCancel,
}: EventPosterGeneratorProps) {
  const { data: aiSettings } = useAISettings();
  const updateMutation = useUpdateEvent();

  const [template, setTemplate] = useState<EventPosterTemplate>('emerald');
  const [mode, setMode] = useState<GenerationMode>('template');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastProvider, setLastProvider] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const mosqueName = aiSettings?.mosque_name || 'Masjid Darussalam';
  const hasGeminiKey = !!aiSettings?.gemini_api_key?.trim();
  const hasOpenAIKey = !!aiSettings?.openai_api_key?.trim();
  const aiAvailable = hasGeminiKey || hasOpenAIKey;

  const aiProviderPreference =
    aiSettings?.default_provider === 'openai' && hasOpenAIKey
      ? 'openai'
      : aiSettings?.default_provider === 'gemini' && hasGeminiKey
        ? 'gemini'
        : hasGeminiKey
          ? 'gemini'
          : hasOpenAIKey
            ? 'openai'
            : 'auto';

  const hasDescription = Boolean(stripHtml(event.description ?? '').trim());
  const canGenerate = Boolean(event.title.trim() && event.event_date && event.location.trim());

  const posterInput = {
    title: event.title.trim(),
    eventDate: event.event_date,
    location: event.location.trim(),
    description: event.description,
    mosqueName,
    template,
    landingUrl: `${LANDING_PAGE_BASE}/${event.id}`,
  };

  const handleGenerateTemplate = async () => {
    const dataUrl = await generateEventPoster(posterInput);
    setLastProvider(null);
    setPreviewUrl(dataUrl);
  };

  const handleGenerateAI = async () => {
    const { backgroundDataUrl, provider } = await generateAIPosterBackground({
      title: event.title.trim(),
      eventDate: event.event_date,
      location: event.location.trim(),
      description: event.description,
      mosqueName,
      template,
      provider: aiProviderPreference,
    });

    const dataUrl = await generateEventPosterWithBackground(posterInput, backgroundDataUrl);
    setLastProvider(provider);
    setPreviewUrl(dataUrl);
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast('error', 'Data event tidak lengkap', 'Pastikan event memiliki judul, tanggal, dan lokasi');
      return;
    }

    if (mode === 'ai' && !aiAvailable) {
      toast('error', 'AI belum dikonfigurasi', 'Simpan API key Gemini atau OpenAI di Pengaturan → Integrasi AI');
      return;
    }

    setIsGenerating(true);
    try {
      if (mode === 'ai') {
        await handleGenerateAI();
        toast('success', 'Poster AI siap', 'Background AI + teks event (termasuk deskripsi) ditambahkan otomatis');
      } else {
        await handleGenerateTemplate();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tidak dapat membuat poster';
      toast('error', 'Gagal', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePoster = async () => {
    if (!previewUrl) return;
    try {
      const url = await uploadEventPoster(previewUrl, `${event.id}.png`);
      await updateMutation.mutateAsync({ id: event.id, data: { poster: url } });
      toast('success', 'Poster disimpan', 'Poster event berhasil disimpan');
      onPosterSaved?.(url);
    } catch {
      toast('error', 'Gagal', 'Tidak dapat menyimpan poster');
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `${event.title.trim() || 'event-poster'}.png`;
    link.click();
  };

  const displayUrl = previewUrl || event.poster || null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Generator Poster Event
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Poster dibuat setelah event tersimpan. Judul, tanggal, lokasi
              {hasDescription ? ', dan deskripsi' : ''} akan tampil di poster.
              {mode === 'ai' && hasDescription ? ' Deskripsi juga dipakai AI sebagai konteks visual.' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Template Gratis</Badge>
            {aiAvailable ? (
              <Badge variant="info">AI {hasGeminiKey ? 'Gemini' : 'OpenAI'} Siap</Badge>
            ) : (
              <Badge variant="default">AI Belum Aktif</Badge>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="space-y-3">
            <Select
              label="Mode Generate"
              value={mode}
              onChange={(e) => setMode(e.target.value as GenerationMode)}
              options={[
                { value: 'template', label: 'Template Gratis (tanpa API)' },
                { value: 'ai', label: 'AI Background (Gemini / OpenAI)' },
              ]}
            />

            <Select
              label="Gaya Visual"
              options={POSTER_TEMPLATE_OPTIONS}
              value={template}
              onChange={(e) => setTemplate(e.target.value as EventPosterTemplate)}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleGenerate}
                isLoading={isGenerating}
                disabled={!canGenerate || (mode === 'ai' && !aiAvailable)}
                leftIcon={mode === 'ai' ? <Wand2 className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
              >
                {mode === 'ai' ? 'Generate dengan AI' : 'Buat Preview Poster'}
              </Button>
              {previewUrl && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSavePoster}
                    isLoading={updateMutation.isPending}
                  >
                    Simpan Poster
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleDownload}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    Download
                  </Button>
                </>
              )}
            </div>

            {lastProvider && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                Background dari <strong>{lastProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'}</strong>.
                Teks event ditambahkan otomatis agar mudah dibaca.
              </p>
            )}

            {mode === 'ai' && aiAvailable && (
              <p className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg px-3 py-2">
                AI membuat background visual berdasarkan judul & deskripsi event.
                {isGenerating ? ' Proses bisa memakan 10–30 detik.' : ''}
              </p>
            )}

            {mode === 'ai' && !aiAvailable && (
              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                Simpan token di <strong>Pengaturan → Integrasi AI</strong> untuk mode AI.
              </p>
            )}
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xs font-medium text-gray-500 mb-2 self-start lg:self-center">Preview</p>
            <div className="relative w-full max-w-[240px] aspect-[4/5] rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 px-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-xs">
                    {mode === 'ai' ? 'AI sedang membuat background...' : 'Membuat poster...'}
                  </span>
                </div>
              ) : displayUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayUrl} alt="Preview poster event" className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 px-4 text-center">
                  Preview poster akan muncul di sini
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Tutup
          </Button>
        )}
      </div>
    </div>
  );
}
