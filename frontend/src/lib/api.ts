// ========================================
// CLIENTE API HTTP
// ========================================
// Este archivo maneja todas las peticiones al backend
// ========================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/users/${id}`, updates);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const organizationsAPI = {
  getAll: async () => {
    const response = await api.get('/organizations');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },
  
  create: async (orgData: any) => {
    const response = await api.post('/organizations', orgData);
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/organizations/${id}`, updates);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/organizations/${id}`);
    return response.data;
  },
};

export const opportunitiesAPI = {
  getAll: async () => {
    const response = await api.get('/opportunities');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
  },
  
  create: async (oppData: any) => {
    const response = await api.post('/opportunities', oppData);
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/opportunities/${id}`, updates);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/opportunities/${id}`);
    return response.data;
  },
};

export const signupsAPI = {
  create: async (opportunityId: string) => {
    const response = await api.post('/signups', { opportunityId });
    return response.data;
  },
  
  getByVolunteer: async (volunteerId: string) => {
    const response = await api.get(`/signups/volunteer/${volunteerId}`);
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/signups/${id}`, updates);
    return response.data;
  },
  
  cancel: async (id: string) => {
    const response = await api.delete(`/signups/${id}`);
    return response.data;
  },
};

export default api;
