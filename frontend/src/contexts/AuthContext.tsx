import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { auth as authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await authApi.me();
        setUser(userData);
        setToken(storedToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    validateToken();
  }, [logout]);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await authApi.login(normalizedEmail, password);
    const accessToken = response.access_token;
    
    // Store token first so subsequent requests have Authorization header
    localStorage.setItem('token', accessToken);
    setToken(accessToken);

    let currentUser = response.user;
    if (!currentUser) {
      try {
        currentUser = await authApi.me();
      } catch {
        currentUser = {
          id: (response as any).user_id || 'user',
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
        };
      }
    }
    setUser(currentUser);
    localStorage.setItem('user', JSON.stringify(currentUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await authApi.signup(normalizedEmail, password, name);
    const accessToken = response.access_token;

    localStorage.setItem('token', accessToken);
    setToken(accessToken);

    let currentUser = response.user;
    if (!currentUser) {
      currentUser = {
        id: (response as any).user_id || 'user',
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
      };
    }
    setUser(currentUser);
    localStorage.setItem('user', JSON.stringify(currentUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
