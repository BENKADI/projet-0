import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, setTokenFromOAuth } from '../services/authService';

interface User {
  id: string | number;
  email: string;
  role?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  setToken: (token: string) => Promise<void>;
  loading: boolean;
}

// Create the auth context with default values
export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  login: async () => ({}),
  logout: () => {},
  setToken: async () => {},
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
    } catch (error) {
      console.error('Login error:', error);
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

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    setToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
