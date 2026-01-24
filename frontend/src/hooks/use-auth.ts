// ========================================
// HOOK DE AUTENTICACIÓN (VERSIÓN SQL)
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import { AuthSession } from '@/lib/types';

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const expiresAt = localStorage.getItem('auth_expires');
          
          if (expiresAt && new Date(expiresAt) > new Date()) {
            setSession({ user, token, expiresAt });
          } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_expires');
          }
        } catch (error) {
          console.error('Error al cargar sesión:', error);
        }
      }
      setIsLoading(false);
    };

    loadSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { user, token, expiresAt } = response.data;
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_expires', expiresAt);
        
        setSession({ user, token, expiresAt });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      return response.success;
    } catch (error: any) {
      console.error('Error al registrar:', error);
      throw new Error(error.response?.data?.error || 'Error al registrar usuario');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires');
    setSession(null);
  }, []);

  const validatePassword = useCallback((storedPassword: string, inputPassword: string) => {
    return storedPassword === inputPassword;
  }, []);

  return {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading,
    login,
    register,
    logout,
    validatePassword,
  };
}
