'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  landing: 'Landing Page',
  kajian: 'Kajian',
  events: 'Events',
  tahsin: 'Tahsin',
  berbagi: 'Berbagi',
  gallery: 'Dokumentasi',
  posts: 'Berita',
  finance: 'Keuangan',
  management: 'Pengurus',
  prayer: 'Jadwal Sholat',
  friday: 'Jadwal Jumat',
  settings: 'Pengaturan',
  new: 'Tambah Baru',
  edit: 'Edit',
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = routeLabels[seg] ?? seg;
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link href="/dashboard" className="text-gray-400 hover:text-emerald-600 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          {crumb.isLast ? (
            <span className="font-medium text-gray-700">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-gray-400 hover:text-emerald-600 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
