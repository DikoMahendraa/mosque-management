import { EventPosterInput, EventPosterTemplate } from '@/types';
import { formatDate, stripHtml, truncate } from '@/lib/utils';

const WIDTH = 1080;
const HEIGHT = 1350;

interface TemplateTheme {
  gradient: [string, string, string];
  accent: string;
  textPrimary: string;
  textSecondary: string;
  pattern: string;
}

const THEMES: Record<EventPosterTemplate, TemplateTheme> = {
  emerald: {
    gradient: ['#064e3b', '#047857', '#10b981'],
    accent: '#a7f3d0',
    textPrimary: '#ffffff',
    textSecondary: '#d1fae5',
    pattern: '◆',
  },
  gold: {
    gradient: ['#78350f', '#b45309', '#f59e0b'],
    accent: '#fde68a',
    textPrimary: '#ffffff',
    textSecondary: '#fef3c7',
    pattern: '✦',
  },
  night: {
    gradient: ['#0f172a', '#1e3a5f', '#334155'],
    accent: '#93c5fd',
    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',
    pattern: '☪',
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  return lines.flatMap((line) => {
    if (ctx.measureText(line).width <= maxWidth) return [line];
    const chars = line.split('');
    const splitLines: string[] = [];
    let chunk = '';
    for (const char of chars) {
      const test = chunk + char;
      if (ctx.measureText(test).width > maxWidth && chunk) {
        splitLines.push(chunk);
        chunk = char;
      } else {
        chunk = test;
      }
    }
    if (chunk) splitLines.push(chunk);
    return splitLines;
  }).slice(0, 4);
}

function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  align: CanvasTextAlign = 'center'
) {
  ctx.textAlign = align;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
}

function drawBackground(ctx: CanvasRenderingContext2D, theme: TemplateTheme) {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, theme.gradient[0]);
  gradient.addColorStop(0.55, theme.gradient[1]);
  gradient.addColorStop(1, theme.gradient[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.globalAlpha = 0.08;
  ctx.fillStyle = theme.accent;
  ctx.font = '48px serif';
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 8; col++) {
      ctx.fillText(theme.pattern, 60 + col * 130, 80 + row * 120);
    }
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.arc(WIDTH * 0.85, HEIGHT * 0.12, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(WIDTH * 0.1, HEIGHT * 0.88, 140, 0, Math.PI * 2);
  ctx.fill();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (WIDTH - w) / 2;
  const y = (HEIGHT - h) / 2;
  ctx.drawImage(img, x, y, w, h);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function drawPosterOverlay(ctx: CanvasRenderingContext2D, theme: TemplateTheme) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, 'rgba(0,0,0,0.45)');
  gradient.addColorStop(0.35, 'rgba(0,0,0,0.15)');
  gradient.addColorStop(0.65, 'rgba(0,0,0,0.35)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.arc(WIDTH * 0.85, HEIGHT * 0.12, 180, 0, Math.PI * 2);
  ctx.fill();
}

function getPlainDescription(description?: string): string {
  if (!description?.trim()) return '';
  return truncate(stripHtml(description).replace(/\s+/g, ' ').trim(), 220);
}

function drawPosterContent(
  ctx: CanvasRenderingContext2D,
  theme: TemplateTheme,
  input: EventPosterInput
) {
  const mosqueName = input.mosqueName?.trim() || 'Masjid Darussalam';
  const formattedDate = input.eventDate ? formatDate(input.eventDate, 'dddd, DD MMMM YYYY') : '-';
  const plainDescription = getPlainDescription(input.description);

  ctx.fillStyle = theme.accent;
  ctx.font = '600 28px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EVENT MASJID', WIDTH / 2, 120);

  ctx.fillStyle = theme.textPrimary;
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  const titleLines = wrapText(ctx, input.title || 'Judul Event', 920, 62).slice(0, 3);
  drawMultilineText(ctx, titleLines, WIDTH / 2, 210, 62);
  ctx.shadowBlur = 0;

  const infoTop = 210 + titleLines.length * 62 + 36;

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.roundRect(80, infoTop, WIDTH - 160, 200, 24);
  ctx.fill();

  ctx.fillStyle = theme.textSecondary;
  ctx.font = '500 24px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📅  Tanggal', 120, infoTop + 48);
  ctx.fillText('📍  Lokasi', 120, infoTop + 100);
  ctx.fillText('🕌  Tempat', 120, infoTop + 152);

  ctx.fillStyle = theme.textPrimary;
  ctx.font = '600 26px system-ui, sans-serif';
  const locationLines = wrapText(ctx, input.location || '-', 620, 32);
  ctx.fillText(formattedDate, 280, infoTop + 48);
  drawMultilineText(ctx, locationLines.slice(0, 2), 280, infoTop + 100, 32, 'left');
  ctx.fillText(mosqueName, 280, infoTop + 152);

  let contentBottom = infoTop + 200;

  if (plainDescription) {
    const descTop = infoTop + 220;
    const descHeight = 140;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.roundRect(80, descTop, WIDTH - 160, descHeight, 20);
    ctx.fill();

    ctx.fillStyle = theme.textSecondary;
    ctx.font = '600 22px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Deskripsi', 120, descTop + 36);

    ctx.fillStyle = theme.textPrimary;
    ctx.font = '400 24px system-ui, sans-serif';
    const descLines = wrapText(ctx, plainDescription, 820, 30);
    drawMultilineText(ctx, descLines.slice(0, 3), 120, descTop + 72, 30, 'left');

    contentBottom = descTop + descHeight;
  }

  return { contentBottom };
}

async function drawPosterQr(
  ctx: CanvasRenderingContext2D,
  theme: TemplateTheme,
  landingUrl: string,
  contentBottom: number
) {
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(landingUrl)}`;
    const qrImage = await loadImage(qrUrl);
    const qrSize = 160;
    const qrX = WIDTH / 2 - qrSize / 2;
    const qrY = contentBottom + 28;

    ctx.fillStyle = '#ffffff';
    ctx.roundRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 14);
    ctx.fill();
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = theme.textSecondary;
    ctx.font = '500 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan untuk info & pendaftaran', WIDTH / 2, qrY + qrSize + 40);
  } catch {
    // QR optional
  }
}

export async function generateEventPosterWithBackground(
  input: EventPosterInput,
  backgroundSrc: string
): Promise<string> {
  const template = input.template ?? 'emerald';
  const theme = THEMES[template];

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung di browser ini');

  const background = await loadImage(backgroundSrc);
  drawCoverImage(ctx, background);
  drawPosterOverlay(ctx, theme);

  const { contentBottom } = drawPosterContent(ctx, theme, input);

  if (input.landingUrl) {
    await drawPosterQr(ctx, theme, input.landingUrl, contentBottom);
  }

  ctx.fillStyle = theme.textSecondary;
  ctx.font = '500 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Generated by Dashboard Darussalam • AI Background', WIDTH / 2, HEIGHT - 48);

  return canvas.toDataURL('image/png');
}

export async function generateEventPoster(input: EventPosterInput): Promise<string> {
  const template = input.template ?? 'emerald';
  const theme = THEMES[template];

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung di browser ini');

  drawBackground(ctx, theme);

  const { contentBottom } = drawPosterContent(ctx, theme, input);

  if (input.landingUrl) {
    await drawPosterQr(ctx, theme, input.landingUrl, contentBottom);
  }

  ctx.fillStyle = theme.textSecondary;
  ctx.font = '500 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Generated by Dashboard Darussalam • Template Gratis', WIDTH / 2, HEIGHT - 48);

  return canvas.toDataURL('image/png');
}

export const POSTER_TEMPLATE_OPTIONS: { value: EventPosterTemplate; label: string }[] = [
  { value: 'emerald', label: 'Hijau Emerald' },
  { value: 'gold', label: 'Emas Ramadhan' },
  { value: 'night', label: 'Biru Malam' },
];

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
