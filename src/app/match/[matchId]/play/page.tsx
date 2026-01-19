'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, useToast } from '@/components/ui';
import {
  CategoryGrid,
  QuestionCard,
  ScoreBoard,
  Timer,
  PowerUpPanel,
} from '@/components/game';
import { useAuthStore } from '@/store/auth';
import { useMatchStore } from '@/store/match';
import { useUIStore } from '@/store/ui';
import { matchesApi } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  RefreshCw,
  Wifi,
  WifiOff,
  StopCircle,
  AlertTriangle,
} from 'lucide-react';
import type { Category, Question, PowerUp } from '@/types';

// Demo data
const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'Movies', icon: '🎬', color: 'red' },
  { id: '2', name: 'Music', icon: '🎵', color: 'purple' },
  { id: '3', name: 'Sports', icon: '⚽', color: 'green' },
  { id: '4', name: 'Geography', icon: '🌍', color: 'blue' },
  { id: '5', name: 'Science', icon: '🔬', color: 'cyan' },
  { id: '6', name: 'History', icon: '📚', color: 'yellow' },
];

const DEMO_QUESTION: Question = {
  id: 'q1',
  categoryId: '1',
  text: 'Which movie won the Academy Award for Best Picture in 2020?',
  options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
  correctAnswer: 'Parasite',
  difficulty: 'medium',
  points: 100,
  timeLimit: 30,
};

const DEMO_POWERUPS: PowerUp[] = [
  { id: 'p1', type: 'double_points', name: '2x', description: 'Double points', icon: '⚡', isUsed: false, isEnabled: true },
  { id: 'p2', type: 'extra_time', name: '+10s', description: 'Extra time', icon: '⏰', isUsed: false, isEnabled: true },
  { id: 'p3', type: 'fifty_fifty', name: '50/50', description: 'Remove 2 options', icon: '✂️', isUsed: false, isEnabled: true },
];

type GamePhase = 'category_selection' | 'question' | 'answer_reveal' | 'break' | 'finished';

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const toast = useToast();

  const { user } = useAuthStore();
  const {
    match,
    currentQuestion,
    currentCategory,
    timer,
    isHost,
    myTeam,
    selectedAnswer,
    answerSubmitted,
    lastAnswerResult,
    setMatch,
    setCurrentQuestion,
    setCurrentCategory,
    setTimer,
    setSelectedAnswer,
    submitAnswer,
    usePowerUp: markPowerUpUsed,
    resetAnswerState,
  } = useMatchStore();
  const { wsConnected, setWsConnected, isTVMode } = useUIStore();

  const [gamePhase, setGamePhase] = useState<GamePhase>('category_selection');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [localTimer, setLocalTimer] = useState(15);

  // Connect to WebSocket
  useEffect(() => {
    const connect = async () => {
      try {
        await socketClient.connect(matchId);
        setWsConnected(true);
      } catch {
        setWsConnected(false);
      }
    };
    connect();
  }, [matchId, setWsConnected]);

  // Sync match state
  const syncMatch = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await matchesApi.getSnapshot(matchId);
      setMatch(response.data.match);
    } catch (error) {
      toast.error('Failed to sync match');
    } finally {
      setIsSyncing(false);
    }
  }, [matchId, setMatch, toast]);

  useEffect(() => {
    syncMatch();
  }, [syncMatch]);

  // Handle category selection
  const handleSelectCategory = (categoryId: string) => {
    if (gamePhase !== 'category_selection') return;
    if (match?.currentTurn !== myTeam) {
      toast.warning("It's not your team's turn!");
      return;
    }

    socketClient.selectCategory(matchId, categoryId);

    // Demo: Move to question phase
    const category = (match?.categories || DEMO_CATEGORIES).find(c => c.id === categoryId);
    if (category) {
      setCurrentCategory(category);
      setGamePhase('question');
      setLocalTimer(match?.config.questionTimer || 30);
      setCurrentQuestion(DEMO_QUESTION);
    }
  };

  // Handle answer submission
  const handleAnswer = async (answer: string) => {
    if (answerSubmitted) return;

    setSelectedAnswer(answer);

    try {
      const response = await matchesApi.answer({
        matchId,
        questionId: currentQuestion?.id || '',
        answer,
      });

      submitAnswer(response.data.isCorrect, response.data.points);
      setGamePhase('answer_reveal');

      // Show result for 3 seconds, then move on
      setTimeout(() => {
        setGamePhase('break');
        setLocalTimer(match?.config.breakTimer || 5);
      }, 3000);
    } catch (error) {
      // Demo: simulate response
      const isCorrect = answer === DEMO_QUESTION.correctAnswer;
      submitAnswer(isCorrect, isCorrect ? 100 : 0);
      setGamePhase('answer_reveal');

      setTimeout(() => {
        setGamePhase('break');
        setLocalTimer(5);
      }, 3000);
    }
  };

  // Handle power-up usage
  const handleUsePowerUp = async (powerUpId: string) => {
    try {
      await matchesApi.usePowerUp({
        matchId,
        powerUpId,
      });
      markPowerUpUsed(myTeam || 'A', powerUpId);
      toast.success('Power-up activated!');
    } catch (error) {
      toast.error('Failed to use power-up');
    }
  };

  // Handle end match (host only)
  const handleEndMatch = async () => {
    try {
      await matchesApi.end(matchId);
      router.push(`/match/${matchId}/results`);
    } catch (error) {
      toast.error('Failed to end match');
    }
  };

  // Timer countdown for demo
  useEffect(() => {
    if (gamePhase === 'break' && localTimer > 0) {
      const interval = setInterval(() => {
        setLocalTimer(prev => {
          if (prev <= 1) {
            setGamePhase('category_selection');
            resetAnswerState();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gamePhase, localTimer, resetAnswerState]);

  // Get available categories (not yet selected)
  const selectedCategoryIds = [
    ...(match?.teams.A.selectedCategories || []),
    ...(match?.teams.B.selectedCategories || []),
  ];
  const availableCategories = (match?.categories || DEMO_CATEGORIES).filter(
    c => !selectedCategoryIds.includes(c.id)
  );

  const teamAPowerUps = match?.teams.A.powerUps || DEMO_POWERUPS;
  const teamBPowerUps = match?.teams.B.powerUps || DEMO_POWERUPS;
  const myPowerUps = myTeam === 'A' ? teamAPowerUps : teamBPowerUps;

  return (
    <div className={cn('min-h-screen bg-gray-900', isTVMode && 'tv-mode')}>
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">Live Match</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`p-2 ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
              {wsConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <button
              onClick={syncMatch}
              disabled={isSyncing}
              className="p-2 text-gray-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            {isHost && (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="p-2 text-red-400 hover:text-red-300"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Score Board */}
      <div className="bg-gray-800/50 py-4 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <ScoreBoard
            teamA={{ name: 'Team A', score: match?.teams.A.score || 0 }}
            teamB={{ name: 'Team B', score: match?.teams.B.score || 0 }}
            currentTurn={match?.currentTurn}
            size={isTVMode ? 'lg' : 'md'}
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <AnimatePresence mode="wait">
          {/* Category Selection Phase */}
          {gamePhase === 'category_selection' && (
            <motion.div
              key="category-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className={cn('text-2xl font-bold text-white mb-2', isTVMode && 'tv-heading')}>
                  {match?.currentTurn === myTeam ? 'Your Turn!' : `Team ${match?.currentTurn}'s Turn`}
                </h2>
                <p className="text-gray-400">
                  {match?.currentTurn === myTeam
                    ? 'Select a category'
                    : 'Waiting for opponent to choose...'}
                </p>
              </div>

              <Timer
                seconds={localTimer}
                maxSeconds={15}
                size={isTVMode ? 'xl' : 'lg'}
                className="mx-auto"
              />

              <CategoryGrid
                categories={availableCategories}
                teamACategories={match?.teams.A.selectedCategories}
                teamBCategories={match?.teams.B.selectedCategories}
                onSelectCategory={handleSelectCategory}
                disabledCategories={match?.currentTurn !== myTeam ? availableCategories.map(c => c.id) : []}
                columns={3}
                size={isTVMode ? 'lg' : 'md'}
              />
            </motion.div>
          )}

          {/* Question Phase */}
          {(gamePhase === 'question' || gamePhase === 'answer_reveal') && currentQuestion && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Current Category Badge */}
              {currentCategory && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full">
                    <span className="text-2xl">{currentCategory.icon}</span>
                    <span className="text-white font-medium">{currentCategory.name}</span>
                  </div>
                </div>
              )}

              {/* Power-ups */}
              <div className="flex justify-center">
                <PowerUpPanel
                  powerUps={myPowerUps}
                  onUsePowerUp={handleUsePowerUp}
                  isMyTurn={match?.currentTurn === myTeam}
                />
              </div>

              {/* Question Card */}
              <QuestionCard
                question={currentQuestion}
                timer={localTimer}
                onAnswer={handleAnswer}
                onTimeout={() => handleAnswer('')}
                selectedAnswer={selectedAnswer}
                correctAnswer={gamePhase === 'answer_reveal' ? currentQuestion.correctAnswer : null}
                showResult={gamePhase === 'answer_reveal'}
                isDisabled={answerSubmitted || match?.currentTurn !== myTeam}
              />

              {/* Result Feedback */}
              {gamePhase === 'answer_reveal' && lastAnswerResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'text-center py-4 rounded-xl',
                    lastAnswerResult.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  )}
                >
                  <p className={cn(
                    'text-2xl font-bold',
                    lastAnswerResult.isCorrect ? 'text-green-400' : 'text-red-400'
                  )}>
                    {lastAnswerResult.isCorrect ? `+${lastAnswerResult.points} points!` : 'No points'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Break Phase */}
          {gamePhase === 'break' && (
            <motion.div
              key="break"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Get Ready!</h2>
              <p className="text-gray-400 mb-8">Next round starting in...</p>
              <div className="text-6xl font-bold text-primary-400">{localTimer}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* End Match Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="max-w-sm w-full">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">End Match?</h3>
              <p className="text-gray-500 mb-6">
                This will end the match for all players. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowEndConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleEndMatch}
                >
                  End Match
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
