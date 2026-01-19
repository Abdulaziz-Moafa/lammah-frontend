// Auth Types
export interface User {
  id: string;
  phone: string;
  username: string;
  email?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OTPRequestPayload {
  phone: string;
}

export interface OTPVerifyPayload {
  phone: string;
  code: string;
  username?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Match Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  badge?: 'new' | 'hot' | 'hard' | 'easy';
  questionCount?: number;
}

export interface Question {
  id: string;
  categoryId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  options?: string[];
  correctAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
}

export interface Player {
  id: string;
  odxId?: string;
  username: string;
  avatar?: string;
  team?: 'A' | 'B';
  isHost: boolean;
  isOnline: boolean;
  score: number;
  joinedAt: string;
}

export interface Team {
  id: 'A' | 'B';
  name: string;
  color: string;
  players: Player[];
  score: number;
  selectedCategories: string[];
  powerUps: PowerUp[];
}

export interface PowerUp {
  id: string;
  type: 'double_points' | 'skip_question' | 'extra_time' | 'steal_points' | 'fifty_fifty';
  name: string;
  description: string;
  icon: string;
  isUsed: boolean;
  isEnabled: boolean;
}

export interface MatchConfig {
  categoriesCount: number;
  questionsPerCategory: number;
  questionTimer: number;
  categorySelectionTimer: number;
  breakTimer: number;
}

export interface Match {
  id: string;
  code: string;
  hostId: string;
  status: 'waiting' | 'lobby' | 'category_selection' | 'playing' | 'paused' | 'finished';
  config: MatchConfig;
  teams: {
    A: Team;
    B: Team;
  };
  categories: Category[];
  currentTurn: 'A' | 'B';
  currentQuestion?: Question;
  currentCategory?: Category;
  questionIndex: number;
  roundIndex: number;
  timer: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface MatchCreatePayload {
  categoriesCount?: number;
  questionsPerCategory?: number;
  questionTimer?: number;
  categorySelectionTimer?: number;
  breakTimer?: number;
}

export interface MatchJoinPayload {
  code: string;
  username?: string;
}

export interface MatchAnswerPayload {
  matchId: string;
  questionId: string;
  answer: string;
}

export interface PowerUpPayload {
  matchId: string;
  powerUpId: string;
  targetTeam?: 'A' | 'B';
}

export interface MatchSnapshot {
  match: Match;
  timestamp: number;
}

// Credits Types
export interface CreditsPayload {
  userId: string;
  amount: number;
  reason: string;
}

// Referral Types
export interface ReferralInvitePayload {
  channel?: 'sms' | 'whatsapp' | 'email' | 'link';
}

export interface ReferralInviteResponse {
  code: string;
  link: string;
  expiresAt: string;
}

export interface ReferralActivatePayload {
  code: string;
}

// Media Types
export interface MediaPresignPayload {
  filename: string;
  contentType: string;
  size: number;
}

export interface MediaPresignResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: string;
}

export interface MediaFinalizePayload {
  fileKey: string;
  metadata?: Record<string, string>;
}

export interface MediaFinalizeResponse {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

// Ingest Types
export interface QuestionIngestPayload {
  questions: Array<{
    categoryId: string;
    text: string;
    options: string[];
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    timeLimit: number;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video';
  }>;
}

export interface BatchStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalQuestions: number;
  processedQuestions: number;
  failedQuestions: number;
  errors?: string[];
  createdAt: string;
  completedAt?: string;
}

// Admin Types
export interface ModerationPayload {
  questionId: string;
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// WebSocket Event Types
export interface WSLobbyJoinEvent {
  matchId: string;
  player: Player;
}

export interface WSMatchAnswerEvent {
  matchId: string;
  playerId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  timeRemaining: number;
}

export interface WSMatchStateEvent {
  match: Match;
}

export interface WSTimerEvent {
  matchId: string;
  timer: number;
  phase: 'question' | 'category_selection' | 'break';
}

export interface WSPlayerJoinedEvent {
  matchId: string;
  player: Player;
}

export interface WSPlayerLeftEvent {
  matchId: string;
  playerId: string;
}

export interface WSTeamAssignedEvent {
  matchId: string;
  playerId: string;
  team: 'A' | 'B';
}

export interface WSCategorySelectedEvent {
  matchId: string;
  categoryId: string;
  team: 'A' | 'B';
}

export interface WSPowerUpUsedEvent {
  matchId: string;
  team: 'A' | 'B';
  powerUp: PowerUp;
  effect?: string;
}

export interface WSMatchEndedEvent {
  match: Match;
  winner: 'A' | 'B' | 'draw';
  finalScores: {
    A: number;
    B: number;
  };
}
