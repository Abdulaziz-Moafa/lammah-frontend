'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, useToast } from '@/components/ui';
import { LobbyPlayerList, InviteLinkModal, CategoryGrid } from '@/components/game';
import { useAuthStore } from '@/store/auth';
import { useMatchStore } from '@/store/match';
import { useUIStore } from '@/store/ui';
import { matchesApi } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { getShareUrl } from '@/lib/utils';
import {
  ArrowLeft,
  Sparkles,
  Share2,
  Play,
  RefreshCw,
  Wifi,
  WifiOff,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import type { Category } from '@/types';

// Mock categories for demo
const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'Movies', icon: '🎬', color: 'red', badge: 'hot' },
  { id: '2', name: 'Music', icon: '🎵', color: 'purple' },
  { id: '3', name: 'Sports', icon: '⚽', color: 'green' },
  { id: '4', name: 'Geography', icon: '🌍', color: 'blue' },
  { id: '5', name: 'Science', icon: '🔬', color: 'cyan', badge: 'hard' },
  { id: '6', name: 'History', icon: '📚', color: 'yellow' },
  { id: '7', name: 'Food', icon: '🍕', color: 'orange', badge: 'new' },
  { id: '8', name: 'Animals', icon: '🦁', color: 'green' },
];

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const toast = useToast();

  const { user, isAuthenticated } = useAuthStore();
  const {
    match,
    players,
    isHost,
    setMatch,
    setIsHost,
    setMyPlayerId,
    setMyTeam,
  } = useMatchStore();
  const { wsConnected, setWsConnected } = useUIStore();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Connect to WebSocket and join lobby
  useEffect(() => {
    const connectAndJoin = async () => {
      try {
        await socketClient.connect(matchId);
        socketClient.joinLobby(matchId);
        setWsConnected(true);
      } catch (error) {
        console.error('Failed to connect:', error);
        setWsConnected(false);
        toast.error('Failed to connect to lobby');
      }
    };

    connectAndJoin();

    return () => {
      socketClient.leaveLobby(matchId);
    };
  }, [matchId, setWsConnected, toast]);

  // Fetch match snapshot
  const syncMatch = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await matchesApi.getSnapshot(matchId);
      setMatch(response.data.match);

      // Determine if current user is host
      if (user && response.data.match.hostId === user.id) {
        setIsHost(true);
      }
      if (user) {
        setMyPlayerId(user.id);
        // Find user's team
        const userInTeamA = response.data.match.teams.A.players.find(p => p.odxId === user.id);
        const userInTeamB = response.data.match.teams.B.players.find(p => p.odxId === user.id);
        if (userInTeamA) setMyTeam('A');
        else if (userInTeamB) setMyTeam('B');
      }
    } catch (error) {
      console.error('Failed to sync match:', error);
      toast.error('Failed to load match data');
    } finally {
      setIsSyncing(false);
    }
  }, [matchId, setMatch, setIsHost, setMyPlayerId, setMyTeam, user, toast]);

  useEffect(() => {
    syncMatch();
  }, [syncMatch]);

  // Handle team assignment (host only)
  const handleAssignTeam = (playerId: string, team: 'A' | 'B') => {
    if (!isHost) return;
    socketClient.assignTeam(matchId, playerId, team);
  };

  // Handle start match
  const handleStartMatch = async () => {
    if (!isHost) return;

    // Validate teams have players
    if (match && (match.teams.A.players.length === 0 || match.teams.B.players.length === 0)) {
      toast.warning('Both teams need at least one player');
      return;
    }

    setIsStarting(true);
    try {
      await matchesApi.start(matchId);
      toast.success('Match started!');
      router.push(`/match/${matchId}/play`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to start match');
    } finally {
      setIsStarting(false);
    }
  };

  // Handle copy code
  const handleCopyCode = async () => {
    if (!match) return;
    try {
      await navigator.clipboard.writeText(match.code);
      setCodeCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const inviteLink = match ? getShareUrl(match.code) : '';
  const categories = match?.categories || DEMO_CATEGORIES.slice(0, match?.config.categoriesCount || 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Leave</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold gradient-text">Lobby</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection status */}
            <div className={`p-2 rounded-lg ${wsConnected ? 'text-green-500' : 'text-red-500'}`}>
              {wsConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            {/* Sync button */}
            <button
              onClick={syncMatch}
              disabled={isSyncing}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Match Info & Players */}
          <div className="lg:col-span-1 space-y-6">
            {/* Match Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="text-center">
                <p className="text-sm text-gray-500 mb-2">Match Code</p>
                <button
                  onClick={handleCopyCode}
                  className="group flex items-center justify-center gap-2 w-full"
                >
                  <span className="text-4xl font-bold tracking-[0.2em] text-gray-900">
                    {match?.code || '------'}
                  </span>
                  {codeCopied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  )}
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowInviteModal(true)}
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  Share Invite Link
                </Button>
              </Card>
            </motion.div>

            {/* Players List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Players</h2>
                <LobbyPlayerList
                  players={players}
                  hostId={match?.hostId}
                  currentUserId={user?.id}
                  showTeams
                  isHost={isHost}
                  onAssignTeam={handleAssignTeam}
                />
              </Card>
            </motion.div>

            {/* Start Match Button (Host only) */}
            {isHost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleStartMatch}
                  isLoading={isStarting}
                  leftIcon={<Play className="w-6 h-6" />}
                  disabled={players.length < 2}
                >
                  Start Match
                </Button>
                {players.length < 2 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Need at least 2 players to start
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Categories Preview */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Categories ({categories.length})
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Teams will take turns selecting categories during the match
                </p>
                <CategoryGrid
                  categories={categories}
                  columns={3}
                  size="sm"
                />
              </Card>
            </motion.div>

            {/* Match Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Card>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Match Settings</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      {match?.config.categoriesCount || 6}
                    </p>
                    <p className="text-xs text-gray-500">Categories</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      {match?.config.questionsPerCategory || 6}
                    </p>
                    <p className="text-xs text-gray-500">Q per Category</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      {match?.config.questionTimer || 30}s
                    </p>
                    <p className="text-xs text-gray-500">Question Timer</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      {((match?.config.categoriesCount || 6) * (match?.config.questionsPerCategory || 6))}
                    </p>
                    <p className="text-xs text-gray-500">Total Questions</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      <InviteLinkModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        matchCode={match?.code || ''}
        inviteLink={inviteLink}
      />
    </div>
  );
}
