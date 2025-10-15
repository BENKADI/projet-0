import axios from 'axios';
import { getToken } from './authService';
import { Permission } from './permissionService';
import { API_BASE_URL } from '@/config/api';

const API_URL = API_BASE_URL;

// Types pour les utilisateurs
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

// Interface User utilise l'interface Permission importée

export interface UserCreateInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissionIds?: number[];
}

export interface UserUpdateInput {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissionIds?: number[];
}

// Configuration de l'en-tête avec token d'autorisation
const authHeader = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obtenir tous les utilisateurs
export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_URL}/users`, authHeader());
  return response.data;
};

// Obtenir un utilisateur par son ID
export const getUserById = async (id: number): Promise<User> => {
  const response = await axios.get(`${API_URL}/users/${id}`, authHeader());
  return response.data;
};

// Créer un nouvel utilisateur
export const createUser = async (userData: UserCreateInput): Promise<User> => {
  const response = await axios.post(`${API_URL}/users`, userData, authHeader());
  return response.data;
};

// Mettre à jour un utilisateur
export const updateUser = async (id: number, userData: UserUpdateInput): Promise<User> => {
  const response = await axios.put(`${API_URL}/users/${id}`, userData, authHeader());
  return response.data;
};

// Supprimer un utilisateur
export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/users/${id}`, authHeader());
};

// Obtenir toutes les permissions (pour l'attribution aux utilisateurs)
export const getAllPermissions = async (): Promise<Permission[]> => {
  const response = await axios.get(`${API_URL}/permissions`, authHeader());
  return response.data;
};
