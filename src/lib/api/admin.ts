import apiClient from './client';
import type {
  ModerationPayload,
  QuestionIngestPayload,
  BatchStatus,
  ApiResponse,
} from '@/types';

export const adminApi = {
  moderate: async (payload: ModerationPayload): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.post('/admin/moderation', payload);
    return response.data;
  },

  ingestQuestions: async (payload: QuestionIngestPayload): Promise<ApiResponse<{ batchId: string }>> => {
    const response = await apiClient.post('/ingest/questions/batch', payload);
    return response.data;
  },

  getBatchStatus: async (batchId: string): Promise<ApiResponse<BatchStatus>> => {
    const response = await apiClient.get(`/ingest/batches/${batchId}`);
    return response.data;
  },
};

export default adminApi;
