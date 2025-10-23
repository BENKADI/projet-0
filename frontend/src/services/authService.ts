import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

const API_URL = API_ENDPOINTS.AUTH;

// Interface for login and registration data
export interface AuthData {
  email: string;
  password: string;
}

// Response interface
export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    role?: string;
  };
  token: string;
}

/**
 * Register a new user
 */
export const register = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axiosInstance.post(`${API_URL}/register`, data);
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axiosInstance.post(`${API_URL}/login`, data);
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

/**
 * Logout user
 */
export const logout = (): void => {
  localStorage.removeItem('user');
};

/**
 * Get current user from local storage
 */
export const getCurrentUser = (): AuthResponse | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

/**
 * Get authentication token
 */
export const getToken = (): string | null => {
  const user = getCurrentUser();
  return user ? user.token : null;
};

/**
 * Set token from Google OAuth and fetch user data
 */
export const setTokenFromOAuth = async (token: string): Promise<AuthResponse> => {
  try {
    // Récupérer les données utilisateur depuis l'API avec le token
    const response = await axiosInstance.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const userData = response.data.user;
    const authData = { 
      token, 
      user: userData, 
      message: 'OAuth login successful' 
    };
    
    // Stocker les données complètes
    localStorage.setItem('user', JSON.stringify(authData));
    
    return authData;
  } catch (error) {
    console.error('Error setting OAuth token:', error);
    // En cas d'erreur, supprimer tout token invalide
    localStorage.removeItem('user');
    throw error;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
  setTokenFromOAuth,
};
