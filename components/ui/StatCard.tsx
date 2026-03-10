import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down';
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-emerald-600',
  iconBg = 'bg-emerald-50',
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {trend.value}%
              </span>
              <span className="text-xs text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconBg)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  );
}
