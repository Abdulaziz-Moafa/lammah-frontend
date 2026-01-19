'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PowerUp } from '@/types';
import {
  Zap,
  SkipForward,
  Clock,
  Target,
  Scissors,
} from 'lucide-react';

interface PowerUpPanelProps {
  powerUps: PowerUp[];
  onUsePowerUp: (powerUpId: string) => void;
  isMyTurn?: boolean;
  className?: string;
}

const powerUpIcons: Record<string, React.ReactNode> = {
  double_points: <Zap className="w-5 h-5" />,
  skip_question: <SkipForward className="w-5 h-5" />,
  extra_time: <Clock className="w-5 h-5" />,
  steal_points: <Target className="w-5 h-5" />,
  fifty_fifty: <Scissors className="w-5 h-5" />,
};

const powerUpColors: Record<string, string> = {
  double_points: 'from-yellow-400 to-orange-500',
  skip_question: 'from-purple-400 to-pink-500',
  extra_time: 'from-blue-400 to-cyan-500',
  steal_points: 'from-red-400 to-rose-500',
  fifty_fifty: 'from-green-400 to-emerald-500',
};

export function PowerUpPanel({
  powerUps,
  onUsePowerUp,
  isMyTurn = true,
  className,
}: PowerUpPanelProps) {
  return (
    <div className={cn('flex flex-wrap gap-2 justify-center', className)}>
      {powerUps.map((powerUp) => {
        const isDisabled = powerUp.isUsed || !powerUp.isEnabled || !isMyTurn;

        return (
          <motion.button
            key={powerUp.id}
            whileHover={!isDisabled ? { scale: 1.05 } : undefined}
            whileTap={!isDisabled ? { scale: 0.95 } : undefined}
            onClick={() => !isDisabled && onUsePowerUp(powerUp.id)}
            disabled={isDisabled}
            className={cn(
              'relative flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] transition-all duration-200',
              !isDisabled
                ? `bg-gradient-to-br ${powerUpColors[powerUp.type]} text-white shadow-lg hover:shadow-xl`
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
            title={powerUp.description}
          >
            {/* Icon */}
            <div className={cn('mb-1', isDisabled && 'opacity-50')}>
              {powerUpIcons[powerUp.type] || powerUp.icon}
            </div>

            {/* Name */}
            <span className="text-xs font-medium text-center leading-tight">
              {powerUp.name}
            </span>

            {/* Used indicator */}
            {powerUp.isUsed && (
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">USED</span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

interface PowerUpButtonProps {
  powerUp: PowerUp;
  onUse: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PowerUpButton({
  powerUp,
  onUse,
  disabled = false,
  size = 'md',
}: PowerUpButtonProps) {
  const isDisabled = disabled || powerUp.isUsed || !powerUp.isEnabled;

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.1, rotate: 5 } : undefined}
      whileTap={!isDisabled ? { scale: 0.9 } : undefined}
      onClick={() => !isDisabled && onUse()}
      disabled={isDisabled}
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all duration-200',
        sizes[size],
        !isDisabled
          ? `bg-gradient-to-br ${powerUpColors[powerUp.type]} text-white shadow-lg`
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      )}
      title={`${powerUp.name}: ${powerUp.description}`}
    >
      {powerUpIcons[powerUp.type] || powerUp.icon}

      {powerUp.isUsed && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <span className="text-white text-xxs font-bold">✓</span>
        </div>
      )}
    </motion.button>
  );
}
