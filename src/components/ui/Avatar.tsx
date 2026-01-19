'use client';

import { cn, getInitials } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  online?: boolean;
}

export function Avatar({ src, name, size = 'md', className, online }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const onlineIndicatorSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const bgColors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-accent-500',
    'bg-game-red',
    'bg-game-blue',
    'bg-game-green',
    'bg-game-purple',
    'bg-game-orange',
  ];

  // Deterministic color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length;

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={80}
          height={80}
          className={cn(
            'rounded-full object-cover',
            sizes[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-bold text-white',
            sizes[size],
            bgColors[colorIndex]
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            onlineIndicatorSizes[size],
            online ? 'bg-green-500' : 'bg-gray-300'
          )}
        />
      )}
    </div>
  );
}
