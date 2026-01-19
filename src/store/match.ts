import { create } from 'zustand';
import type { Match, Player, Category, Question, PowerUp, WSMatchEndedEvent } from '@/types';

interface MatchState {
  match: Match | null;
  players: Player[];
  currentQuestion: Question | null;
  currentCategory: Category | null;
  timer: number;
  isHost: boolean;
  myTeam: 'A' | 'B' | null;
  myPlayerId: string | null;
  selectedAnswer: string | null;
  answerSubmitted: boolean;
  lastAnswerResult: { isCorrect: boolean; points: number } | null;
  matchResult: WSMatchEndedEvent | null;

  // Actions
  setMatch: (match: Match) => void;
  clearMatch: () => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  assignPlayerToTeam: (playerId: string, team: 'A' | 'B') => void;
  setCurrentQuestion: (question: Question | undefined) => void;
  setCurrentCategory: (category: Category | null) => void;
  setTimer: (timer: number) => void;
  selectCategory: (categoryId: string, team: 'A' | 'B') => void;
  setSelectedAnswer: (answer: string | null) => void;
  submitAnswer: (isCorrect: boolean, points: number) => void;
  updateScore: (points: number) => void;
  usePowerUp: (team: 'A' | 'B', powerUpId: string) => void;
  endMatch: (result: WSMatchEndedEvent) => void;
  setIsHost: (isHost: boolean) => void;
  setMyTeam: (team: 'A' | 'B' | null) => void;
  setMyPlayerId: (playerId: string) => void;
  resetAnswerState: () => void;
}

export const useMatchStore = create<MatchState>()((set, get) => ({
  match: null,
  players: [],
  currentQuestion: null,
  currentCategory: null,
  timer: 0,
  isHost: false,
  myTeam: null,
  myPlayerId: null,
  selectedAnswer: null,
  answerSubmitted: false,
  lastAnswerResult: null,
  matchResult: null,

  setMatch: (match) =>
    set({
      match,
      players: [...match.teams.A.players, ...match.teams.B.players],
      currentQuestion: match.currentQuestion,
      currentCategory: match.currentCategory,
      timer: match.timer,
    }),

  clearMatch: () =>
    set({
      match: null,
      players: [],
      currentQuestion: null,
      currentCategory: null,
      timer: 0,
      isHost: false,
      myTeam: null,
      myPlayerId: null,
      selectedAnswer: null,
      answerSubmitted: false,
      lastAnswerResult: null,
      matchResult: null,
    }),

  addPlayer: (player) =>
    set((state) => {
      // Avoid duplicates
      if (state.players.some((p) => p.id === player.id)) {
        return state;
      }

      const newPlayers = [...state.players, player];

      // Update match teams if match exists
      if (state.match && player.team) {
        const updatedMatch = { ...state.match };
        updatedMatch.teams[player.team].players = [
          ...updatedMatch.teams[player.team].players,
          player,
        ];
        return { players: newPlayers, match: updatedMatch };
      }

      return { players: newPlayers };
    }),

  removePlayer: (playerId) =>
    set((state) => {
      const newPlayers = state.players.filter((p) => p.id !== playerId);

      if (state.match) {
        const updatedMatch = { ...state.match };
        updatedMatch.teams.A.players = updatedMatch.teams.A.players.filter(
          (p) => p.id !== playerId
        );
        updatedMatch.teams.B.players = updatedMatch.teams.B.players.filter(
          (p) => p.id !== playerId
        );
        return { players: newPlayers, match: updatedMatch };
      }

      return { players: newPlayers };
    }),

  assignPlayerToTeam: (playerId, team) =>
    set((state) => {
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return state;

      const updatedPlayer = { ...player, team };
      const newPlayers = state.players.map((p) =>
        p.id === playerId ? updatedPlayer : p
      );

      // Update my team if it's my player
      const myTeamUpdate = playerId === state.myPlayerId ? { myTeam: team } : {};

      if (state.match) {
        const updatedMatch = { ...state.match };

        // Remove from old team if exists
        const oldTeam = player.team;
        if (oldTeam) {
          updatedMatch.teams[oldTeam].players = updatedMatch.teams[
            oldTeam
          ].players.filter((p) => p.id !== playerId);
        }

        // Add to new team
        updatedMatch.teams[team].players = [
          ...updatedMatch.teams[team].players,
          updatedPlayer,
        ];

        return { players: newPlayers, match: updatedMatch, ...myTeamUpdate };
      }

      return { players: newPlayers, ...myTeamUpdate };
    }),

  setCurrentQuestion: (question) =>
    set({
      currentQuestion: question ?? null,
      selectedAnswer: null,
      answerSubmitted: false,
      lastAnswerResult: null,
    }),

  setCurrentCategory: (category) =>
    set({ currentCategory: category }),

  setTimer: (timer) =>
    set({ timer }),

  selectCategory: (categoryId, team) =>
    set((state) => {
      if (!state.match) return state;

      const updatedMatch = { ...state.match };
      if (!updatedMatch.teams[team].selectedCategories.includes(categoryId)) {
        updatedMatch.teams[team].selectedCategories = [
          ...updatedMatch.teams[team].selectedCategories,
          categoryId,
        ];
      }

      return { match: updatedMatch };
    }),

  setSelectedAnswer: (answer) =>
    set({ selectedAnswer: answer }),

  submitAnswer: (isCorrect, points) =>
    set({
      answerSubmitted: true,
      lastAnswerResult: { isCorrect, points },
    }),

  updateScore: (points) =>
    set((state) => {
      if (!state.match || !state.myTeam) return state;

      const updatedMatch = { ...state.match };
      updatedMatch.teams[state.myTeam].score += points;

      return { match: updatedMatch };
    }),

  usePowerUp: (team, powerUpId) =>
    set((state) => {
      if (!state.match) return state;

      const updatedMatch = { ...state.match };
      updatedMatch.teams[team].powerUps = updatedMatch.teams[team].powerUps.map(
        (p) => (p.id === powerUpId ? { ...p, isUsed: true } : p)
      );

      return { match: updatedMatch };
    }),

  endMatch: (result) =>
    set((state) => ({
      match: state.match ? { ...state.match, status: 'finished' as const } : null,
      matchResult: result,
    })),

  setIsHost: (isHost) =>
    set({ isHost }),

  setMyTeam: (team) =>
    set({ myTeam: team }),

  setMyPlayerId: (playerId) =>
    set({ myPlayerId: playerId }),

  resetAnswerState: () =>
    set({
      selectedAnswer: null,
      answerSubmitted: false,
      lastAnswerResult: null,
    }),
}));
