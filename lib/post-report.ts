import { Post } from '@/types';
import { formatDate, stripHtml } from '@/lib/utils';
export { openWhatsAppShare } from '@/lib/finance-report';

export function buildPostShareMessage(
  post: Post,
  mosqueName = 'Masjid Darussalam'
): string {
  const rawExcerpt = stripHtml(post.content).replace(/\s+/g, ' ').trim();
  const excerpt =
    rawExcerpt.length > 150 ? rawExcerpt.slice(0, 150) + '...' : rawExcerpt;

  const lines: string[] = [
    '📰 *BERITA TERKINI*',
    `🕌 ${mosqueName}`,
    '',
    `*${post.title}*`,
    '',
  ];

  if (post.category) {
    lines.push(`🏷️ Kategori: ${post.category}`);
  }

  if (post.author) {
    lines.push(`✍️ Penulis: ${post.author}`);
  }

  if (post.published_date) {
    lines.push(`📅 Tanggal: ${formatDate(post.published_date)}`);
  }

  if (excerpt) {
    lines.push('');
    lines.push(excerpt);
  }

  lines.push('');
  lines.push('_Dikirim dari Dashboard Darussalam_');

  return lines.join('\n');
}
