'use client';

import { motion } from 'framer-motion';
import { CategoryCard } from './CategoryCard';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
  selectedCategories?: string[];
  teamACategories?: string[];
  teamBCategories?: string[];
  onSelectCategory?: (categoryId: string) => void;
  disabledCategories?: string[];
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryGrid({
  categories,
  selectedCategories = [],
  teamACategories = [],
  teamBCategories = [],
  onSelectCategory,
  disabledCategories = [],
  columns = 3,
  size = 'md',
  className,
}: CategoryGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  const getSelectedByTeam = (categoryId: string): 'A' | 'B' | null => {
    if (teamACategories.includes(categoryId)) return 'A';
    if (teamBCategories.includes(categoryId)) return 'B';
    return null;
  };

  return (
    <motion.div
      className={cn('grid gap-4', gridCols[columns], className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {categories.map((category) => (
        <motion.div
          key={category.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <CategoryCard
            category={category}
            isSelected={selectedCategories.includes(category.id)}
            selectedByTeam={getSelectedByTeam(category.id)}
            isDisabled={disabledCategories.includes(category.id)}
            onSelect={() => onSelectCategory?.(category.id)}
            size={size}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
