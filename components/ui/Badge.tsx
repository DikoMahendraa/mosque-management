import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    upcoming: 'info',
    finished: 'default',
    active: 'success',
    inactive: 'error',
    published: 'success',
    draft: 'warning',
    completed: 'purple',
    income: 'success',
    expense: 'error',
  };
  return map[status] ?? 'default';
}
