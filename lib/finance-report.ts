import dayjs from 'dayjs';
import { FinanceTransaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export type FinanceDateFilter =
  | 'all'
  | 'today'
  | 'week'
  | 'month'
  | 'year'
  | 'friday'
  | 'custom';

export interface FinanceDateRange {
  start_date?: string;
  end_date?: string;
}

export function getFinanceDateRange(
  filter: FinanceDateFilter,
  customStart = '',
  customEnd = ''
): FinanceDateRange {
  const today = dayjs();

  switch (filter) {
    case 'today':
      return {
        start_date: today.format('YYYY-MM-DD'),
        end_date: today.format('YYYY-MM-DD'),
      };
    case 'week':
      return {
        start_date: today.startOf('week').format('YYYY-MM-DD'),
        end_date: today.endOf('week').format('YYYY-MM-DD'),
      };
    case 'month':
      return {
        start_date: today.startOf('month').format('YYYY-MM-DD'),
        end_date: today.endOf('month').format('YYYY-MM-DD'),
      };
    case 'year':
      return {
        start_date: today.startOf('year').format('YYYY-MM-DD'),
        end_date: today.endOf('year').format('YYYY-MM-DD'),
      };
    case 'friday': {
      const daysBack = (today.day() - 5 + 7) % 7;
      const lastFriday = today.subtract(daysBack, 'day');
      return {
        start_date: lastFriday.format('YYYY-MM-DD'),
        end_date: today.format('YYYY-MM-DD'),
      };
    }
    case 'custom':
      return customStart && customEnd
        ? { start_date: customStart, end_date: customEnd }
        : {};
    default:
      return {};
  }
}

export function getFinancePeriodLabel(
  filter: FinanceDateFilter,
  customStart = '',
  customEnd = '',
  dateRange?: FinanceDateRange
): string {
  switch (filter) {
    case 'today':
      return `Hari Ini (${formatDate(dayjs().format('YYYY-MM-DD'))})`;
    case 'week':
      return 'Minggu Ini';
    case 'month':
      return `Bulan ${dayjs().format('MMMM YYYY')}`;
    case 'year':
      return `Tahun ${dayjs().format('YYYY')}`;
    case 'friday':
      if (dateRange?.start_date && dateRange?.end_date) {
        if (dateRange.start_date === dateRange.end_date) {
          return `Jumat, ${formatDate(dateRange.start_date)}`;
        }
        return `Jumat ${formatDate(dateRange.start_date, 'DD MMM')} – ${formatDate(dateRange.end_date, 'DD MMM YYYY')}`;
      }
      return 'Periode Jumat';
    case 'custom':
      return customStart && customEnd
        ? `${formatDate(customStart, 'DD MMM YYYY')} – ${formatDate(customEnd, 'DD MMM YYYY')}`
        : 'Rentang Tanggal';
    default:
      return 'Semua Periode';
  }
}

export function computeFinanceTotals(transactions: FinanceTransaction[]) {
  const total_income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const total_expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    total_income,
    total_expense,
    balance: total_income - total_expense,
  };
}

function formatLine(label: string, amount: number, maxLabelWidth = 28): string {
  const amountStr = formatCurrency(amount);
  const padded = label.length >= maxLabelWidth ? label.slice(0, maxLabelWidth - 1) + '…' : label.padEnd(maxLabelWidth, ' ');
  return `• ${padded} ${amountStr}`;
}

export function buildFinanceReportMessage(
  transactions: FinanceTransaction[],
  periodLabel: string,
  mosqueName = 'Masjid Darussalam'
): string {
  const income = transactions
    .filter((t) => t.type === 'income')
    .sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount);
  const { total_income, total_expense, balance } = computeFinanceTotals(transactions);

  const lines: string[] = [
    `📊 *LAPORAN KEUANGAN*`,
    `🕌 ${mosqueName}`,
    `📅 Periode: ${periodLabel}`,
    '',
  ];

  lines.push('💚 *PEMASUKAN*');
  if (income.length === 0) {
    lines.push('_(Tidak ada pemasukan)_');
  } else {
    income.forEach((t) => {
      const label = t.category ? `${t.category} — ${t.title}` : t.title;
      lines.push(formatLine(label, t.amount));
    });
  }
  lines.push(`*Total pemasukan:* ${formatCurrency(total_income)}`);
  lines.push('');

  lines.push('🔴 *PENGELUARAN*');
  if (expense.length === 0) {
    lines.push('_(Tidak ada pengeluaran)_');
  } else {
    expense.forEach((t) => {
      const label = t.category ? `${t.category} — ${t.title}` : t.title;
      lines.push(formatLine(label, t.amount));
    });
  }
  lines.push(`*Total pengeluaran:* ${formatCurrency(total_expense)}`);
  lines.push('');

  lines.push(`💰 *Saldo periode:* ${formatCurrency(balance)}`);
  lines.push('');
  lines.push(`📝 Total ${transactions.length} transaksi`);
  lines.push('_Dikirim dari Dashboard Darussalam_');

  return lines.join('\n');
}

export function openWhatsAppShare(message: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
