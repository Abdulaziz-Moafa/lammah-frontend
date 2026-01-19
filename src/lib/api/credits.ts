import apiClient from './client';
import type { CreditsPayload, ApiResponse } from '@/types';

export const creditsApi = {
  grant: async (payload: CreditsPayload): Promise<ApiResponse<{ balance: number }>> => {
    const response = await apiClient.post('/credits/grant', payload);
    return response.data;
  },

  spend: async (payload: CreditsPayload): Promise<ApiResponse<{ balance: number }>> => {
    const response = await apiClient.post('/credits/spend', payload);
    return response.data;
  },
};

export default creditsApi;
