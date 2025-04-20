import apiClient, { createAuthConfig } from './apiClient';

export const apiUser = {
  // Lấy danh sách tất cả người dùng
  getAllUsers: async (skip = 0, limit = 100) => {
    try {
      const response = await apiClient.get(`/users?skip=${skip}&limit=${limit}`, createAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách người dùng theo role
  getUsersByRole: async (role, skip = 0, limit = 100) => {
    try {
      const response = await apiClient.get(`/users/role/${role}?skip=${skip}&limit=${limit}`, createAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`, createAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo người dùng mới
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData, createAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData, createAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật mật khẩu
  updatePassword: async (userId, newPassword) => {
    try {
      const response = await apiClient.put(`/users/${userId}/password`, { password: newPassword }, createAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa người dùng
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`, createAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset mật khẩu
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post('/users/reset-password', { email }, createAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiUser;