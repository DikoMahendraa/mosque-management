import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export default function LoadingSpinner({ className, size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Loader2 className={cn('animate-spin text-emerald-500', sizeClasses[size])} />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
}
