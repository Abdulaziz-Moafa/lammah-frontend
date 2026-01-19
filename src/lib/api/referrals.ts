import apiClient from './client';
import type {
  ReferralInvitePayload,
  ReferralInviteResponse,
  ReferralActivatePayload,
  ApiResponse,
} from '@/types';

export const referralsApi = {
  invite: async (payload: ReferralInvitePayload = {}): Promise<ApiResponse<ReferralInviteResponse>> => {
    const response = await apiClient.post('/referrals/invite', payload);
    return response.data;
  },

  activate: async (payload: ReferralActivatePayload): Promise<ApiResponse<{ credits: number }>> => {
    const response = await apiClient.post('/referrals/activate', payload);
    return response.data;
  },
};

export default referralsApi;
