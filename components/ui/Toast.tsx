'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
};

const iconStyles = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const t = setTimeout(onRemove, 4000);
    return () => clearTimeout(t);
  }, [onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm min-w-[300px] max-w-sm',
        styles[toast.type]
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-xs text-gray-600">{toast.message}</p>}
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

let addToastFn: ((toast: Omit<ToastMessage, 'id'>) => void) | null = null;

export function toast(type: ToastType, title: string, message?: string) {
  addToastFn?.({ type, title, message });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (t) =>
      setToasts((prev) => [
        ...prev,
        { ...t, id: Math.random().toString(36).substring(2, 9) },
      ]);
    return () => { addToastFn = null; };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          toast={t}
          onRemove={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
        />
      ))}
    </div>
  );
}
