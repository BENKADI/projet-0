import axios from 'axios';

// Configuration de base pour axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
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
        } catch (e) {
          console.error('Error parsing user from localStorage');
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      console.error('🔴 ERREUR 401 - Non autorisé');
      console.error('URL:', error.config?.url);
      console.error('Token présent:', !!localStorage.getItem('token'));
      
      // NE PAS REDIRIGER - JUSTE LOGGER
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
