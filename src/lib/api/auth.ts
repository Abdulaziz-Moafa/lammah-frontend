import apiClient from './client';
import type {
  OTPRequestPayload,
  OTPVerifyPayload,
  AuthResponse,
  ApiResponse,
} from '@/types';

export const authApi = {
  requestOTP: async (payload: OTPRequestPayload): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/otp/request', payload);
    return response.data;
  },

  verifyOTP: async (payload: OTPVerifyPayload): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/otp/verify', payload);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

export default authApi;
