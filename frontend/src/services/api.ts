import axios from 'axios';
import type { AuthResponse, User, Document, Claim, Citation, VerificationResult, DocumentStatus, Report } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  signup: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/signup', { email, password, name, full_name: name });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};

export const documents = {
  upload: async (file: File, onProgress?: (progress: number) => void): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return data;
  },

  list: async (): Promise<Document[]> => {
    const { data } = await api.get<any>('/documents');
    return Array.isArray(data) ? data : data.documents || [];
  },

  get: async (id: string): Promise<Document> => {
    const { data } = await api.get<Document>(`/documents/${id}`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  process: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>(`/documents/${id}/process`);
    return data;
  },

  getStatus: async (id: string): Promise<DocumentStatus> => {
    const { data } = await api.get<DocumentStatus>(`/documents/${id}/status`);
    return data;
  },

  getClaims: async (id: string): Promise<Claim[]> => {
    const { data } = await api.get<any>(`/documents/${id}/claims`);
    return Array.isArray(data) ? data : data.claims || [];
  },

  getCitations: async (id: string): Promise<Citation[]> => {
    const { data } = await api.get<any>(`/documents/${id}/citations`);
    return Array.isArray(data) ? data : data.citations || [];
  },

  getVerification: async (id: string): Promise<VerificationResult[]> => {
    const { data } = await api.get<any>(`/documents/${id}/verification`);
    return Array.isArray(data) ? data : data.results || [];
  },

  getReport: async (id: string): Promise<Report> => {
    const { data } = await api.get<Report>(`/documents/${id}/report`);
    return data;
  },
};

export const claims = {
  get: async (id: string): Promise<Claim> => {
    const { data } = await api.get<Claim>(`/claims/${id}`);
    return data;
  },
};

export default api;
