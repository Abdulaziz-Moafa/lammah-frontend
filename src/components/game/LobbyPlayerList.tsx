'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Crown, Users } from 'lucide-react';
import type { Player } from '@/types';

interface LobbyPlayerListProps {
  players: Player[];
  hostId?: string;
  currentUserId?: string;
  showTeams?: boolean;
  onAssignTeam?: (playerId: string, team: 'A' | 'B') => void;
  isHost?: boolean;
  className?: string;
}

export function LobbyPlayerList({
  players,
  hostId,
  currentUserId,
  showTeams = true,
  onAssignTeam,
  isHost = false,
  className,
}: LobbyPlayerListProps) {
  const teamAPlayers = players.filter((p) => p.team === 'A');
  const teamBPlayers = players.filter((p) => p.team === 'B');
  const unassignedPlayers = players.filter((p) => !p.team);

  const PlayerCard = ({ player }: { player: Player }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-100',
        player.id === currentUserId && 'border-primary-300 bg-primary-50'
      )}
    >
      <Avatar
        name={player.username}
        src={player.avatar}
        size="md"
        online={player.isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 truncate">
            {player.username}
          </span>
          {player.id === hostId && (
            <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          )}
          {player.id === currentUserId && (
            <span className="text-xs text-primary-500 font-medium">(You)</span>
          )}
        </div>
        {player.team && (
          <span
            className={cn(
              'text-xs font-medium',
              player.team === 'A' ? 'text-game-red' : 'text-game-blue'
            )}
          >
            Team {player.team}
          </span>
        )}
      </div>

      {/* Team assignment buttons (host only) */}
      {isHost && onAssignTeam && (
        <div className="flex gap-1">
          <button
            onClick={() => onAssignTeam(player.id, 'A')}
            className={cn(
              'px-2 py-1 rounded text-xs font-bold transition-colors',
              player.team === 'A'
                ? 'bg-game-red text-white'
                : 'bg-red-100 text-game-red hover:bg-red-200'
            )}
          >
            A
          </button>
          <button
            onClick={() => onAssignTeam(player.id, 'B')}
            className={cn(
              'px-2 py-1 rounded text-xs font-bold transition-colors',
              player.team === 'B'
                ? 'bg-game-blue text-white'
                : 'bg-blue-100 text-game-blue hover:bg-blue-200'
            )}
          >
            B
          </button>
        </div>
      )}
    </motion.div>
  );

  if (showTeams) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
        {/* Team A */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-game-red" />
            <h3 className="font-bold text-gray-900">Team A</h3>
            <span className="text-sm text-gray-500">({teamAPlayers.length})</span>
          </div>
          <div className="space-y-2 min-h-[100px] p-3 bg-red-50/50 rounded-xl border-2 border-dashed border-red-200">
            <AnimatePresence>
              {teamAPlayers.length > 0 ? (
                teamAPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm py-8">
                  <Users className="w-5 h-5 mr-2" />
                  No players yet
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Team B */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-game-blue" />
            <h3 className="font-bold text-gray-900">Team B</h3>
            <span className="text-sm text-gray-500">({teamBPlayers.length})</span>
          </div>
          <div className="space-y-2 min-h-[100px] p-3 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200">
            <AnimatePresence>
              {teamBPlayers.length > 0 ? (
                teamBPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm py-8">
                  <Users className="w-5 h-5 mr-2" />
                  No players yet
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Unassigned players */}
        {unassignedPlayers.length > 0 && (
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400" />
              <h3 className="font-bold text-gray-900">Waiting for Team</h3>
              <span className="text-sm text-gray-500">({unassignedPlayers.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <AnimatePresence>
                {unassignedPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Simple list without teams
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-500" />
        <h3 className="font-bold text-gray-900">Players</h3>
        <span className="text-sm text-gray-500">({players.length})</span>
      </div>
      <AnimatePresence>
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </AnimatePresence>
    </div>
  );
}
