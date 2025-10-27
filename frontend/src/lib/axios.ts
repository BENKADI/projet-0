import axios, { AxiosHeaders } from 'axios';
import { logger } from '../utils/logger';

// Configuration de base pour axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Intercepteur pour ajouter le token JWT automatiquement
axiosInstance.interceptors.request.use(
  (config) => {
    // Essayer de récupérer le token de 'user' ou 'token'
    let token = localStorage.getItem('token');
    
    if (!token) {
      // Si pas de 'token', chercher dans 'user'
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = user.token;
        } catch (err) {
          logger.error('Error parsing user from localStorage', err);
        }
      }
    }
    // Normaliser les headers en AxiosHeaders pour un typage sûr
    if (!(config.headers instanceof AxiosHeaders)) {
      config.headers = AxiosHeaders.from(config.headers || {});
    }

    if (token) {
      (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
    }
    // Ne pas forcer Content-Type pour FormData afin que le boundary soit défini automatiquement
    const isForm = typeof FormData !== 'undefined' && config.data instanceof FormData;
    const method = (config.method || 'get').toLowerCase();
    const isWrite = method === 'post' || method === 'put' || method === 'patch';
    const headers = config.headers as AxiosHeaders;
    if (isForm) {
      headers.delete('Content-Type');
    } else if (isWrite) {
      headers.set('Content-Type', 'application/json');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // DÉSACTIVÉ TEMPORAIREMENT POUR DEBUG
    if (error.response?.status === 401) {
      logger.error('🔴 ERREUR 401 - Non autorisé');
      logger.error('URL:', error.config?.url);
      logger.error('Token présent:', !!localStorage.getItem('token'));
      
      // NE PAS REDIRIGER - JUSTE LOGGER
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
