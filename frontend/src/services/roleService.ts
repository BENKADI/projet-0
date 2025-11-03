import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '@/config/api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleCreateInput {
  name: string;
  description?: string;
  permissions: string[];
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
  permissions?: string[];
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

export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await axios.get(`${API_URL}/roles`, authHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const response = await axios.get(`${API_URL}/roles/${id}`, authHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error;
  }
};

export const createRole = async (roleData: RoleCreateInput): Promise<Role> => {
  try {
    const response = await axios.post(`${API_URL}/roles`, roleData, authHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

export const updateRole = async (id: string, roleData: RoleUpdateInput): Promise<Role> => {
  try {
    const response = await axios.put(`${API_URL}/roles/${id}`, roleData, authHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

export const deleteRole = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/roles/${id}`, authHeader());
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

export const assignRoleToUser = async (userId: string, roleId: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/users/${userId}/roles`, { roleId }, authHeader());
  } catch (error) {
    console.error('Error assigning role to user:', error);
    throw error;
  }
};

export const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/users/${userId}/roles/${roleId}`, authHeader());
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
};

export const getUserRoles = async (userId: string): Promise<Role[]> => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/roles`, authHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};
