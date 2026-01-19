import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';
import { useMatchStore } from '@/store/match';
import type {
  WSPlayerJoinedEvent,
  WSPlayerLeftEvent,
  WSTeamAssignedEvent,
  WSMatchStateEvent,
  WSTimerEvent,
  WSCategorySelectedEvent,
  WSMatchAnswerEvent,
  WSPowerUpUsedEvent,
  WSMatchEndedEvent,
} from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';

type EventCallback<T = unknown> = (data: T) => void;

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Set<EventCallback>> = new Map();
  private isConnecting = false;

  connect(matchId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;
      const { accessToken } = useAuthStore.getState();

      this.socket = io(WS_URL, {
        auth: {
          token: accessToken,
        },
        query: matchId ? { matchId } : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnecting = false;
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect after maximum attempts'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.socket?.connect();
        }
      });

      this.setupEventListeners();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Player events
    this.socket.on('player.joined', (data: WSPlayerJoinedEvent) => {
      this.emit('player.joined', data);
      useMatchStore.getState().addPlayer(data.player);
    });

    this.socket.on('player.left', (data: WSPlayerLeftEvent) => {
      this.emit('player.left', data);
      useMatchStore.getState().removePlayer(data.playerId);
    });

    this.socket.on('team.assigned', (data: WSTeamAssignedEvent) => {
      this.emit('team.assigned', data);
      useMatchStore.getState().assignPlayerToTeam(data.playerId, data.team);
    });

    // Match events
    this.socket.on('match.state', (data: WSMatchStateEvent) => {
      this.emit('match.state', data);
      useMatchStore.getState().setMatch(data.match);
    });

    this.socket.on('match.started', (data: WSMatchStateEvent) => {
      this.emit('match.started', data);
      useMatchStore.getState().setMatch(data.match);
    });

    this.socket.on('match.timer', (data: WSTimerEvent) => {
      this.emit('match.timer', data);
      useMatchStore.getState().setTimer(data.timer);
    });

    this.socket.on('category.selected', (data: WSCategorySelectedEvent) => {
      this.emit('category.selected', data);
      useMatchStore.getState().selectCategory(data.categoryId, data.team);
    });

    this.socket.on('question.new', (data: { question: unknown; category: unknown }) => {
      this.emit('question.new', data);
      useMatchStore.getState().setCurrentQuestion(data.question as WSMatchStateEvent['match']['currentQuestion']);
    });

    this.socket.on('answer.submitted', (data: WSMatchAnswerEvent) => {
      this.emit('answer.submitted', data);
      if (data.isCorrect) {
        useMatchStore.getState().updateScore(data.points);
      }
    });

    this.socket.on('powerup.used', (data: WSPowerUpUsedEvent) => {
      this.emit('powerup.used', data);
      useMatchStore.getState().usePowerUp(data.team, data.powerUp.id);
    });

    this.socket.on('match.ended', (data: WSMatchEndedEvent) => {
      this.emit('match.ended', data);
      useMatchStore.getState().endMatch(data);
    });

    // Error handling
    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  // Join lobby
  joinLobby(matchId: string): void {
    this.socket?.emit('lobby.join', { matchId });
  }

  // Leave lobby
  leaveLobby(matchId: string): void {
    this.socket?.emit('lobby.leave', { matchId });
  }

  // Submit answer via WebSocket
  submitAnswer(matchId: string, questionId: string, answer: string): void {
    this.socket?.emit('match.answer', { matchId, questionId, answer });
  }

  // Select category
  selectCategory(matchId: string, categoryId: string): void {
    this.socket?.emit('category.select', { matchId, categoryId });
  }

  // Use power-up
  usePowerUp(matchId: string, powerUpId: string, targetTeam?: 'A' | 'B'): void {
    this.socket?.emit('powerup.use', { matchId, powerUpId, targetTeam });
  }

  // Assign player to team (host only)
  assignTeam(matchId: string, playerId: string, team: 'A' | 'B'): void {
    this.socket?.emit('team.assign', { matchId, playerId, team });
  }

  // Event subscription
  on<T = unknown>(event: string, callback: EventCallback<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(callback as EventCallback);
  }

  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    this.eventHandlers.get(event)?.delete(callback as EventCallback);
  }

  private emit<T = unknown>(event: string, data: T): void {
    this.eventHandlers.get(event)?.forEach((callback) => callback(data));
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = new SocketClient();
export default socketClient;
