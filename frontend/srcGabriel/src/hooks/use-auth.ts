import { useKV } from '@github/spark/hooks';
import { User, AuthSession } from '@/lib/types';
import { useCallback } from 'react';

export function useAuth() {
  const [session, setSession] = useKV<AuthSession | null>('auth_session', null);

  const login = useCallback((user: User, password: string) => {
    const newSession: AuthSession = {
      user,
      token: `token_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setSession(() => newSession);
    return true;
  }, [setSession]);

  const logout = useCallback(() => {
    setSession(() => null);
  }, [setSession]);

  const validatePassword = useCallback((storedPassword: string, inputPassword: string) => {
    return storedPassword === inputPassword;
  }, []);

  return {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    login,
    logout,
    validatePassword,
  };
}
