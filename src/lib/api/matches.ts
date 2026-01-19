import apiClient from './client';
import type {
  Match,
  MatchCreatePayload,
  MatchJoinPayload,
  MatchAnswerPayload,
  PowerUpPayload,
  MatchSnapshot,
  ApiResponse,
} from '@/types';

export const matchesApi = {
  create: async (payload: MatchCreatePayload = {}): Promise<ApiResponse<Match>> => {
    const response = await apiClient.post('/matches', {
      categories_count: payload.categoriesCount ?? 6,
      questions_per_category: payload.questionsPerCategory ?? 6,
      question_timer: payload.questionTimer ?? 30,
      category_selection_timer: payload.categorySelectionTimer ?? 15,
      break_timer: payload.breakTimer ?? 5,
    });
    return response.data;
  },

  join: async (payload: MatchJoinPayload): Promise<ApiResponse<Match>> => {
    const response = await apiClient.post('/matches/join', payload);
    return response.data;
  },

  start: async (matchId: string): Promise<ApiResponse<Match>> => {
    const response = await apiClient.post('/matches/start', { matchId });
    return response.data;
  },

  end: async (matchId: string): Promise<ApiResponse<Match>> => {
    const response = await apiClient.post('/matches/end', { matchId });
    return response.data;
  },

  answer: async (payload: MatchAnswerPayload): Promise<ApiResponse<{ isCorrect: boolean; points: number }>> => {
    const response = await apiClient.post('/matches/answer', payload);
    return response.data;
  },

  usePowerUp: async (payload: PowerUpPayload): Promise<ApiResponse<{ success: boolean; effect: string }>> => {
    const response = await apiClient.post('/matches/powerups', payload);
    return response.data;
  },

  getSnapshot: async (matchId: string): Promise<ApiResponse<MatchSnapshot>> => {
    const response = await apiClient.get(`/matches/${matchId}/snapshot`);
    return response.data;
  },
};

export default matchesApi;
