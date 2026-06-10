import Image from 'next/image';
import { cn } from '@/lib/utils';

const HEIGHTS = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-36',
} as const;

export type AppLogoSize = keyof typeof HEIGHTS;

interface AppLogoProps {
  size?: AppLogoSize;
  className?: string;
  priority?: boolean;
}

export function AppLogo({ size = 'md', className, priority = false }: AppLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Masjid Darussalam"
      width={256}
      height={256}
      priority={priority}
      className={cn('w-auto object-contain', HEIGHTS[size], className)}
    />
  );
}
