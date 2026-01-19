'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatTime, vibrate } from '@/lib/utils';

interface TimerProps {
  seconds: number;
  maxSeconds?: number;
  onComplete?: () => void;
  isRunning?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showProgress?: boolean;
  warningThreshold?: number;
  dangerThreshold?: number;
  className?: string;
}

export function Timer({
  seconds,
  maxSeconds,
  onComplete,
  isRunning = true,
  size = 'md',
  showProgress = true,
  warningThreshold = 10,
  dangerThreshold = 5,
  className,
}: TimerProps) {
  const [localSeconds, setLocalSeconds] = useState(seconds);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    setLocalSeconds(seconds);
    setHasCompleted(false);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning || localSeconds <= 0) return;

    const interval = setInterval(() => {
      setLocalSeconds((prev) => {
        const newValue = prev - 1;

        // Vibrate on warning and danger thresholds
        if (newValue === warningThreshold || newValue === dangerThreshold) {
          vibrate(100);
        }

        // Vibrate more intensely in final seconds
        if (newValue <= 3 && newValue > 0) {
          vibrate([50, 50, 50]);
        }

        if (newValue <= 0 && !hasCompleted) {
          setHasCompleted(true);
          onComplete?.();
          return 0;
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, localSeconds, onComplete, warningThreshold, dangerThreshold, hasCompleted]);

  const max = maxSeconds || seconds;
  const progress = (localSeconds / max) * 100;

  const getColor = () => {
    if (localSeconds <= dangerThreshold) return 'text-red-500';
    if (localSeconds <= warningThreshold) return 'text-yellow-500';
    return 'text-gray-900';
  };

  const getProgressColor = () => {
    if (localSeconds <= dangerThreshold) return 'bg-red-500';
    if (localSeconds <= warningThreshold) return 'bg-yellow-500';
    return 'bg-primary-500';
  };

  const sizes = {
    sm: 'text-2xl w-20',
    md: 'text-4xl w-28',
    lg: 'text-5xl w-36',
    xl: 'text-6xl w-44',
  };

  const progressHeights = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
    xl: 'h-3',
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={localSeconds}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'font-bold tabular-nums text-center',
            sizes[size],
            getColor(),
            localSeconds <= dangerThreshold && isRunning && 'animate-pulse'
          )}
        >
          {formatTime(localSeconds)}
        </motion.div>
      </AnimatePresence>

      {showProgress && (
        <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden mt-2', progressHeights[size])}>
          <motion.div
            className={cn('h-full rounded-full transition-colors duration-300', getProgressColor())}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimer({ targetDate, onComplete, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  return (
    <div className={cn('flex gap-4 justify-center', className)}>
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-gray-900 text-white text-3xl font-bold px-4 py-3 rounded-xl min-w-[70px] text-center">
            {value.toString().padStart(2, '0')}
          </div>
          <span className="text-sm text-gray-500 mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}
