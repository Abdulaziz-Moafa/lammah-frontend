'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  isDisabled?: boolean;
  selectedByTeam?: 'A' | 'B' | null;
  onSelect?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  default: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
};

const teamColors = {
  A: 'ring-4 ring-game-red',
  B: 'ring-4 ring-game-blue',
};

export function CategoryCard({
  category,
  isSelected = false,
  isDisabled = false,
  selectedByTeam = null,
  onSelect,
  size = 'md',
}: CategoryCardProps) {
  const colors = categoryColors[category.color] || categoryColors.default;

  const sizes = {
    sm: 'p-4 min-h-[100px]',
    md: 'p-6 min-h-[140px]',
    lg: 'p-8 min-h-[180px]',
  };

  const iconSizes = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      onClick={!isDisabled ? onSelect : undefined}
      disabled={isDisabled}
      className={cn(
        'relative w-full rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3',
        sizes[size],
        colors.bg,
        colors.border,
        !isDisabled && 'hover:shadow-lg cursor-pointer',
        isDisabled && 'opacity-50 cursor-not-allowed',
        isSelected && 'ring-4 ring-primary-500 border-primary-500',
        selectedByTeam && !isSelected && teamColors[selectedByTeam]
      )}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
    >
      {/* Badge */}
      {category.badge && (
        <div className="absolute top-2 right-2">
          <Badge variant={category.badge} size="sm">
            {category.badge.charAt(0).toUpperCase() + category.badge.slice(1)}
          </Badge>
        </div>
      )}

      {/* Selected by team indicator */}
      {selectedByTeam && (
        <div
          className={cn(
            'absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold text-white',
            selectedByTeam === 'A' ? 'bg-game-red' : 'bg-game-blue'
          )}
        >
          Team {selectedByTeam}
        </div>
      )}

      {/* Icon */}
      <span className={cn(iconSizes[size])} role="img" aria-label={category.name}>
        {category.icon}
      </span>

      {/* Name */}
      <span className={cn('font-bold', textSizes[size], colors.text)}>
        {category.name}
      </span>

      {/* Question count */}
      {category.questionCount !== undefined && (
        <span className="text-xs text-gray-500">
          {category.questionCount} questions
        </span>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
