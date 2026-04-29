import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - will be configured based on environment
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You might want to navigate to login screen here
      // This will be handled by the navigation context
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/token', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  getProfile: async (username) => {
    const response = await api.get(`/public/profile/${username}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  createProfile: async (profileData) => {
    const response = await api.post('/profile', profileData);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
};

// Company API
export const companyAPI = {
  getCompany: async () => {
    const response = await api.get('/company');
    return response.data;
  },

  updateCompany: async (companyData) => {
    const response = await api.put('/company', companyData);
    return response.data;
  },

  createCompany: async (companyData) => {
    const response = await api.post('/company', companyData);
    return response.data;
  },
};

// Theme API
export const themeAPI = {
  updateTheme: async (themeData) => {
    const response = await api.put('/profile', { theme: themeData });
    return response.data;
  },

  getTheme: async () => {
    const response = await api.get('/profile');
    return response.data.theme;
  },
};

// Storage helpers
export const storage = {
  saveToken: async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  saveUser: async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  clearStorage: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

// Error handler
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.detail || 'Geçersiz istek';
      case 401:
        return 'Oturum süresi doldu, lütfen tekrar giriş yapın';
      case 403:
        return 'Bu işlem için yetkiniz bulunmuyor';
      case 404:
        return 'İstenen kaynak bulunamadı';
      case 422:
        return data.detail || 'Doğrulama hatası';
      case 500:
        return 'Sunucu hatası, lütfen daha sonra tekrar deneyin';
      default:
        return data.detail || 'Bir hata oluştu';
    }
  } else if (error.request) {
    // Request made but no response received
    return 'Sunucuya ulaşılamıyor, internet bağlantınızı kontrol edin';
  } else {
    // Something happened in setting up the request
    return error.message || 'Bir hata oluştu';
  }
};

export default api;
