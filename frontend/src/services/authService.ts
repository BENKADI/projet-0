import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

// Interface for login and registration data
interface AuthData {
  email: string;
  password: string;
}

// Response interface
interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
  };
  token: string;
}

/**
 * Register a new user
 */
export const register = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/register`, data);
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/login`, data);
  
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

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
};
