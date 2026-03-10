import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, format = 'DD MMMM YYYY') {
  return dayjs(date).format(format);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function truncate(text: string, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export function getCurrentMonth() {
  return dayjs().format('YYYY-MM');
}

export function getMonthName(month: string) {
  return dayjs(month + '-01').format('MMMM YYYY');
}
