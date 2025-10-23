import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { login as apiLogin, logout as apiLogout, getCurrentUser, setTokenFromOAuth, type AuthResponse } from '../services/authService';
import axios from '@/lib/axios';

interface User {
  id: string | number;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  provider?: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  setToken: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

// Create the auth context with default values
export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  login: async () => ({} as AuthResponse),
  logout: () => {},
  setToken: async () => {},
  refreshUser: async () => {},
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser.user);
    }
    setLoading(false);
  }, []);

  // Login user and set user in state
  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin({ email, password });
      setUser(response.user);
      return response;
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Enhanced error logging for debugging
      if (isAxiosError(error)) {
        // Server responded with error status
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        console.error('Error response headers:', error.response?.headers);
      } else {
        // Error in setting up the request
        console.error('Error message:', (error as Error)?.message);
      }
      
      throw error;
    }
  };

  // Logout user and remove from state
  const logout = () => {
    apiLogout();
    setUser(null);
  };

  // Set token from OAuth (Google, etc.)
  const setToken = async (token: string) => {
    try {
      const response = await setTokenFromOAuth(token);
      setUser(response.user);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const resp = await axios.get('/users/me');
      const current = getCurrentUser();
      if (current) {
        const updated = { ...current, user: { ...current.user, ...resp.data } };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated.user);
      } else {
        setUser(resp.data);
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    setToken,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
