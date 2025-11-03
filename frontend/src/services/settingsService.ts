import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '@/config/api';

export interface AppSettings {
  id: number;
  // Paramètres généraux
  appName: string;
  appLanguage: string;
  appCurrency: string;
  appLogo?: string | null;
  appDescription?: string | null;
  
  // Apparence
  theme: string;
  primaryColor: string;
  accentColor: string;
  
  // Notifications
  emailNotifications: boolean;
  browserNotifications: boolean;
  notificationSound: boolean;
  
  // Sécurité
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordPolicy: string;
  
  // Système
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSize: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface AppSettingsUpdate {
  appName?: string;
  appLanguage?: string;
  appCurrency?: string;
  appLogo?: string;
  appDescription?: string;
  theme?: string;
  primaryColor?: string;
  accentColor?: string;
  emailNotifications?: boolean;
  browserNotifications?: boolean;
  notificationSound?: boolean;
  twoFactorEnabled?: boolean;
  sessionTimeout?: number;
  passwordPolicy?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  maxUploadSize?: number;
}

const API_URL = API_BASE_URL;

const authHeader = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const response = await axios.get(`${API_URL}/settings/app`, authHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching app settings:', error);
    throw error;
  }
};

export const updateAppSettings = async (settingsData: AppSettingsUpdate): Promise<AppSettings> => {
  try {
    const response = await axios.put(`${API_URL}/settings/app`, settingsData, authHeader());
    return response.data.settings;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
};

export const uploadLogo = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('logo', file);

    const token = getToken();
    const response = await axios.post(`${API_URL}/settings/logo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.logoUrl;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
};
