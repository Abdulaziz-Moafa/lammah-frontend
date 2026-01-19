import apiClient from './client';
import type {
  MediaPresignPayload,
  MediaPresignResponse,
  MediaFinalizePayload,
  MediaFinalizeResponse,
  ApiResponse,
} from '@/types';

export const mediaApi = {
  presign: async (payload: MediaPresignPayload): Promise<ApiResponse<MediaPresignResponse>> => {
    const response = await apiClient.post('/media/presign', payload);
    return response.data;
  },

  finalize: async (payload: MediaFinalizePayload): Promise<ApiResponse<MediaFinalizeResponse>> => {
    const response = await apiClient.post('/media/finalize', payload);
    return response.data;
  },

  upload: async (file: File, onProgress?: (progress: number) => void): Promise<MediaFinalizeResponse> => {
    // Step 1: Get presigned URL
    const presignResponse = await mediaApi.presign({
      filename: file.name,
      contentType: file.type,
      size: file.size,
    });

    const { uploadUrl, fileKey } = presignResponse.data;

    // Step 2: Upload to storage
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });

    // Step 3: Finalize
    const finalizeResponse = await mediaApi.finalize({ fileKey });
    return finalizeResponse.data;
  },
};

export default mediaApi;
