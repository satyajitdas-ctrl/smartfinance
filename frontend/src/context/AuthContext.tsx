import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('finwise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('finwise_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('finwise_token');
      if (storedToken) {
        try {
          const freshUser = await getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('finwise_user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('finwise_token', res.access_token);
    localStorage.setItem('finwise_user', JSON.stringify(res.user));
  };

  const register = async (name: string, email: string, password: string, currency?: string) => {
    const res = await registerUser({ name, email, password, currency });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('finwise_token', res.access_token);
    localStorage.setItem('finwise_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('finwise_token');
    localStorage.removeItem('finwise_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
