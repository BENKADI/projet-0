import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;
      
      console.error(`API Error [${status}]:`, data?.message || 'Unknown error');
      
      // Handle specific status codes
      switch (status) {
        case 401:
          console.error('Unauthorized - Invalid credentials or token expired');
          // Optionally clear localStorage and redirect to login
          break;
        case 403:
          console.error('Forbidden - Insufficient permissions');
          break;
        case 404:
          console.error('Not Found - The requested resource does not exist');
          break;
        case 500:
          console.error('Internal Server Error - Please try again later');
          break;
        default:
          console.error(`Error ${status}: ${data?.message || 'An error occurred'}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response from server');
      console.error('Is the backend server running at:', API_BASE_URL);
      console.error('Request details:', error.request);
    } else {
      // Error in setting up the request
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
