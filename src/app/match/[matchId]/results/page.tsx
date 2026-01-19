'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, Avatar } from '@/components/ui';
import { useMatchStore } from '@/store/match';
import { matchesApi } from '@/lib/api';
import { cn, getShareUrl } from '@/lib/utils';
import {
  Trophy,
  Medal,
  Share2,
  RotateCcw,
  Home,
  Star,
  Crown,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const { match, matchResult, myTeam, clearMatch } = useMatchStore();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch final match state if needed
  useEffect(() => {
    const fetchResults = async () => {
      if (!match) {
        try {
          const response = await matchesApi.getSnapshot(matchId);
          // Set match data
        } catch (error) {
          console.error('Failed to fetch results:', error);
        }
      }
      setIsLoading(false);
    };

    fetchResults();
  }, [match, matchId]);

  // Trigger confetti for winner
  useEffect(() => {
    if (!isLoading && matchResult) {
      const winner = matchResult.winner;
      if (winner === myTeam || winner === 'draw') {
        // Fire confetti
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          zIndex: 1000,
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }
    }
  }, [isLoading, matchResult, myTeam]);

  const teamAScore = matchResult?.finalScores.A ?? match?.teams.A.score ?? 0;
  const teamBScore = matchResult?.finalScores.B ?? match?.teams.B.score ?? 0;
  const winner = matchResult?.winner ?? (teamAScore > teamBScore ? 'A' : teamBScore > teamAScore ? 'B' : 'draw');
  const isWinner = winner === myTeam;
  const isDraw = winner === 'draw';

  const handlePlayAgain = () => {
    clearMatch();
    router.push('/create');
  };

  const handleShare = async () => {
    const text = isDraw
      ? `It's a draw! ${teamAScore} - ${teamBScore} on Lamma!`
      : `Team ${winner} wins ${Math.max(teamAScore, teamBScore)} - ${Math.min(teamAScore, teamBScore)} on Lamma!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lamma Match Results',
          text,
          url: process.env.NEXT_PUBLIC_APP_URL,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen',
      isWinner ? 'bg-gradient-to-br from-yellow-900/20 via-gray-900 to-primary-900/20' : 'bg-gray-900'
    )}>
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto px-4 h-14 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">Lamma</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Winner Announcement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center mb-8"
        >
          {isDraw ? (
            <>
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Medal className="w-12 h-12 text-gray-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">It's a Draw!</h1>
              <p className="text-gray-400">Both teams played great</p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4',
                  winner === 'A' ? 'bg-game-red/20' : 'bg-game-blue/20'
                )}
              >
                <Trophy className={cn(
                  'w-12 h-12',
                  winner === 'A' ? 'text-game-red' : 'text-game-blue'
                )} />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Team {winner} Wins!
              </h1>
              {isWinner && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl text-yellow-400"
                >
                  Congratulations! 🎉
                </motion.p>
              )}
            </>
          )}
        </motion.div>

        {/* Final Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <div className="flex items-center justify-center gap-8 py-6">
              {/* Team A */}
              <div className={cn(
                'text-center',
                winner === 'A' && 'scale-110'
              )}>
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2',
                  'bg-game-red/20'
                )}>
                  {winner === 'A' && <Crown className="w-8 h-8 text-yellow-400" />}
                  {winner !== 'A' && <span className="text-2xl font-bold text-game-red">A</span>}
                </div>
                <p className="text-4xl font-bold text-white">{teamAScore}</p>
                <p className="text-sm text-gray-400">Team A</p>
              </div>

              <div className="text-3xl text-gray-600">-</div>

              {/* Team B */}
              <div className={cn(
                'text-center',
                winner === 'B' && 'scale-110'
              )}>
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2',
                  'bg-game-blue/20'
                )}>
                  {winner === 'B' && <Crown className="w-8 h-8 text-yellow-400" />}
                  {winner !== 'B' && <span className="text-2xl font-bold text-game-blue">B</span>}
                </div>
                <p className="text-4xl font-bold text-white">{teamBScore}</p>
                <p className="text-sm text-gray-400">Team B</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Match Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                <p className="text-2xl font-bold text-white">
                  {(match?.config.categoriesCount || 6) * (match?.config.questionsPerCategory || 6)}
                </p>
                <p className="text-sm text-gray-400">Questions Played</p>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                <p className="text-2xl font-bold text-white">
                  {match?.config.categoriesCount || 6}
                </p>
                <p className="text-sm text-gray-400">Categories</p>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                <p className="text-2xl font-bold text-white">
                  {match?.teams.A.players.length || 0}
                </p>
                <p className="text-sm text-gray-400">Team A Players</p>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                <p className="text-2xl font-bold text-white">
                  {match?.teams.B.players.length || 0}
                </p>
                <p className="text-sm text-gray-400">Team B Players</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={handlePlayAgain}
            leftIcon={<RotateCcw className="w-5 h-5" />}
          >
            Play Again
          </Button>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleShare}
            leftIcon={<Share2 className="w-5 h-5" />}
            className="!border-gray-600 !text-white hover:!bg-gray-700"
          >
            Share Results
          </Button>

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => {
              clearMatch();
              router.push('/dashboard');
            }}
            leftIcon={<Home className="w-5 h-5" />}
            className="!text-gray-400"
          >
            Back to Home
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
