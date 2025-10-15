// Configuration centralisée de l'API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  USERS: `${API_BASE_URL}/users`,
  PERMISSIONS: `${API_BASE_URL}/permissions`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
