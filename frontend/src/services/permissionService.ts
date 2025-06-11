import axios from 'axios';
import { getToken } from './authService';
// Définition des types
export interface Permission {
  id: number;
  name: string;
  description?: string;
}

const API_URL = 'http://localhost:3000';

export interface PermissionCreateInput {
  name: string;
  description?: string;
}

export interface PermissionUpdateInput {
  name?: string;
  description?: string;
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

// Obtenir toutes les permissions
export const getAllPermissions = async (): Promise<Permission[]> => {
  const response = await axios.get(`${API_URL}/permissions`, authHeader());
  return response.data;
};

// Obtenir une permission par son ID
export const getPermissionById = async (id: number): Promise<Permission> => {
  const response = await axios.get(`${API_URL}/permissions/${id}`, authHeader());
  return response.data;
};

// Créer une nouvelle permission
export const createPermission = async (permissionData: PermissionCreateInput): Promise<Permission> => {
  const response = await axios.post(`${API_URL}/permissions`, permissionData, authHeader());
  return response.data;
};

// Mettre à jour une permission
export const updatePermission = async (id: number, permissionData: PermissionUpdateInput): Promise<Permission> => {
  const response = await axios.put(`${API_URL}/permissions/${id}`, permissionData, authHeader());
  return response.data;
};

// Supprimer une permission
export const deletePermission = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/permissions/${id}`, authHeader());
};
