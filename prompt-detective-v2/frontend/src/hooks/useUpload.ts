import { useState } from 'react';
import { api } from '../services/api';

interface UploadProgress {
  (progress: number): void;
}

interface UploadResponse {
  job_id: string;
  status: string;
  message: string;
}

interface JobStatus {
  job_id: string;
  filename: string;
  content_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  result?: any;
  created_at: string;
  completed_at?: string;
}

export const useUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const uploadFile = async (file: File, onProgress?: UploadProgress): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          onProgress?.(progress / 100);
        }
      },
    });

    return response.data;
  };

  const getJobStatus = async (jobId: string): Promise<JobStatus> => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  };

  const getJobResults = async (jobId: string) => {
    const response = await api.get(`/jobs/${jobId}/results`);
    return response.data;
  };

  const listJobs = async (statusFilter?: string, limit = 20, offset = 0) => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status_filter', statusFilter);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await api.get(`/jobs?${params}`);
    return response.data;
  };

  return {
    uploadFile,
    getJobStatus,
    getJobResults,
    listJobs,
    uploadProgress
  };
};