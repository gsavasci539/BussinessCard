import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
  },
  withCredentials: true, // Important for cookies, CSRF protection
  // Only treat 2xx responses as success so 4xx will reject and flow into catch blocks
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
  crossDomain: true
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Function to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Function to set auth token
api.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('access_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('access_token');
  }
};

// Initialize auth token if exists
const token = getAuthToken();
if (token) {
  api.setAuthToken(token);
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Don't add auth header for login/refresh token endpoints
    const isAuthEndpoint = ['/token', '/token/refresh', '/login'].some(path => 
      config.url?.includes(path)
    );

    if (!isAuthEndpoint) {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add CSRF token for non-GET requests
    if (config.method !== 'get' && config.method !== 'GET') {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    // Add request timestamp for logging
    config.metadata = { startTime: new Date() };
    
    // Log request details
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata?.startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`,
        response.data
      );
    }
    
    // Handle custom error responses
    if (response.data?.error) {
      return Promise.reject(new Error(response.data.error));
    }
    
    return response;
  },
  (error) => {
    console.error('[API] Response Error:', {
      config: error.config,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle common error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Handle unauthorized
        console.error('Authentication required');
        // You might want to redirect to login here
      } else if (error.response.status === 404) {
        // Handle not found
        console.error('Resource not found');
      } else if (error.response.status >= 500) {
        // Handle server errors
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      error.message = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);
