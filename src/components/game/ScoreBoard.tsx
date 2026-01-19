'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Team } from '@/types';

interface ScoreBoardProps {
  teamA: { name: string; score: number; color?: string };
  teamB: { name: string; score: number; color?: string };
  currentTurn?: 'A' | 'B';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ScoreBoard({
  teamA,
  teamB,
  currentTurn,
  size = 'md',
  orientation = 'horizontal',
  className,
}: ScoreBoardProps) {
  const sizes = {
    sm: { container: 'gap-2', score: 'text-2xl', name: 'text-xs' },
    md: { container: 'gap-4', score: 'text-4xl', name: 'text-sm' },
    lg: { container: 'gap-6', score: 'text-6xl', name: 'text-base' },
  };

  const TeamScore = ({ team, teamId, score, color }: { team: string; teamId: 'A' | 'B'; score: number; color?: string }) => {
    const defaultColor = teamId === 'A' ? 'bg-game-red' : 'bg-game-blue';
    const isActive = currentTurn === teamId;

    return (
      <motion.div
        className={cn(
          'flex flex-col items-center rounded-2xl p-4 transition-all duration-300',
          isActive && 'ring-4 ring-yellow-400 ring-offset-2'
        )}
        animate={isActive ? { scale: 1.05 } : { scale: 1 }}
      >
        <div
          className={cn(
            'px-4 py-1 rounded-full text-white font-bold mb-2',
            sizes[size].name,
            color || defaultColor
          )}
        >
          {team}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={score}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={cn('font-bold tabular-nums', sizes[size].score)}
          >
            {score}
          </motion.div>
        </AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium text-yellow-600 mt-1"
          >
            Current Turn
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        sizes[size].container,
        className
      )}
    >
      <TeamScore team={teamA.name} teamId="A" score={teamA.score} color={teamA.color} />

      <div className="flex items-center justify-center">
        <span className={cn('font-bold text-gray-300', sizes[size].score)}>:</span>
      </div>

      <TeamScore team={teamB.name} teamId="B" score={teamB.score} color={teamB.color} />
    </div>
  );
}

interface MiniScoreBoardProps {
  teamA: { name: string; score: number };
  teamB: { name: string; score: number };
  className?: string;
}

export function MiniScoreBoard({ teamA, teamB, className }: MiniScoreBoardProps) {
  return (
    <div className={cn('flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2', className)}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-game-red" />
        <span className="font-bold text-sm">{teamA.score}</span>
      </div>
      <span className="text-gray-400">-</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm">{teamB.score}</span>
        <div className="w-3 h-3 rounded-full bg-game-blue" />
      </div>
    </div>
  );
}
