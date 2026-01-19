'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Timer } from './Timer';
import { Button } from '@/components/ui';
import type { Question } from '@/types';
import Image from 'next/image';

interface QuestionCardProps {
  question: Question;
  timer: number;
  onAnswer: (answer: string) => void;
  onTimeout?: () => void;
  selectedAnswer?: string | null;
  correctAnswer?: string | null;
  showResult?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function QuestionCard({
  question,
  timer,
  onAnswer,
  onTimeout,
  selectedAnswer,
  correctAnswer,
  showResult = false,
  isDisabled = false,
  className,
}: QuestionCardProps) {
  const [localSelected, setLocalSelected] = useState<string | null>(selectedAnswer ?? null);

  const handleSelect = (answer: string) => {
    if (isDisabled || showResult) return;
    setLocalSelected(answer);
  };

  const handleSubmit = () => {
    if (localSelected && !isDisabled && !showResult) {
      onAnswer(localSelected);
    }
  };

  const getOptionStyle = (option: string) => {
    if (showResult) {
      if (option === correctAnswer) {
        return 'bg-green-100 border-green-500 text-green-800';
      }
      if (option === localSelected && option !== correctAnswer) {
        return 'bg-red-100 border-red-500 text-red-800';
      }
    }
    if (option === localSelected) {
      return 'bg-primary-100 border-primary-500 text-primary-800';
    }
    return 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full max-w-2xl mx-auto', className)}
    >
      {/* Timer */}
      <div className="mb-6 flex justify-center">
        <Timer
          seconds={timer}
          maxSeconds={question.timeLimit}
          onComplete={onTimeout}
          size="lg"
          isRunning={!showResult && !isDisabled}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Question Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-medium opacity-90">
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
            <span className="text-sm font-bold">
              {question.points} points
            </span>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          {/* Media */}
          {question.mediaUrl && (
            <div className="mb-6">
              {question.mediaType === 'image' && (
                <Image
                  src={question.mediaUrl}
                  alt="Question media"
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
              {question.mediaType === 'audio' && (
                <audio
                  src={question.mediaUrl}
                  controls
                  className="w-full"
                />
              )}
              {question.mediaType === 'video' && (
                <video
                  src={question.mediaUrl}
                  controls
                  className="w-full h-48 rounded-xl"
                />
              )}
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-8">
            {question.text}
          </h2>

          {/* Options */}
          {question.options && (
            <div className="space-y-3">
              <AnimatePresence>
                {question.options.map((option, index) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSelect(option)}
                    disabled={isDisabled || showResult}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
                      'flex items-center gap-4',
                      getOptionStyle(option),
                      (isDisabled || showResult) && 'cursor-not-allowed'
                    )}
                  >
                    <span
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                        option === localSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 font-medium">{option}</span>
                    {showResult && option === correctAnswer && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                    {showResult && option === localSelected && option !== correctAnswer && (
                      <span className="text-red-600 font-bold">✗</span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Submit Button */}
          {!showResult && (
            <div className="mt-8">
              <Button
                variant="primary"
                size="xl"
                fullWidth
                onClick={handleSubmit}
                disabled={!localSelected || isDisabled}
              >
                Submit Answer
              </Button>
            </div>
          )}

          {/* Result Feedback */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'mt-6 p-4 rounded-xl text-center font-bold text-lg',
                localSelected === correctAnswer
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {localSelected === correctAnswer ? '🎉 Correct!' : '😔 Wrong answer'}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
