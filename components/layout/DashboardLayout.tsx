'use client';

import { useSidebarStore } from '@/store';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import AuthGuard from '@/components/providers/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  description,
  actions,
}: DashboardLayoutProps) {
  const { isOpen } = useSidebarStore();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div
          className={cn(
            'transition-all duration-300',
            isOpen ? 'lg:pl-64' : 'lg:pl-20'
          )}
        >
          <Header />
          <main className="p-4 sm:p-6">
            {(title || actions) && (
              <div className="mb-6">
                <Breadcrumb />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {title && (
                      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-gray-500">{description}</p>
                    )}
                  </div>
                  {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
