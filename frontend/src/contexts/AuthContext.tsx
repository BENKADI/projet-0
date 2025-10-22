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
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Enhanced error logging for debugging
      if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        console.error('No response received from server. Is the backend running?');
      } else {
        // Error in setting up the request
        console.error('Error message:', error.message);
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
