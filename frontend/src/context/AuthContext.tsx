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
  enterDirectly: () => Promise<void>;
  quickRegisterNewUser: (name?: string) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    sessionStorage.removeItem('finwise_explicit_logout');
    const res = await loginUser({ email, password });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('finwise_token', res.access_token);
    localStorage.setItem('finwise_user', JSON.stringify(res.user));
  };

  const register = async (name: string, email: string, password: string, currency?: string) => {
    sessionStorage.removeItem('finwise_explicit_logout');
    const res = await registerUser({ name, email, password, currency });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('finwise_token', res.access_token);
    localStorage.setItem('finwise_user', JSON.stringify(res.user));
  };

  const enterDirectly = async () => {
    await login('satyajit@example.com', 'SecurePassword123!');
  };

  const quickRegisterNewUser = async (customName?: string) => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const userName = customName?.trim() || `User_${randomCode}`;
    const userEmail = `${userName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${randomCode}@finwise.local`.replace('__', '_');
    const userPass = 'SecurePassword123!';
    await register(userName, userEmail, userPass, 'INR');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('finwise_token');
    localStorage.removeItem('finwise_user');
    sessionStorage.setItem('finwise_explicit_logout', 'true');
  };

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
      } else {
        // Automatic personal sign-in if not explicitly logged out
        const hasExplicitLogout = sessionStorage.getItem('finwise_explicit_logout');
        if (!hasExplicitLogout) {
          try {
            await enterDirectly();
          } catch (autoErr) {
            console.warn('Auto sign-in fallback notice:', autoErr);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

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
        enterDirectly,
        quickRegisterNewUser,
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
