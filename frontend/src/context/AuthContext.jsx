import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    if (!token) {
      // Fallback: allow public profile usage without token if username is stored
      const uname = localStorage.getItem('username');
      if (!uname) return false;
      try {
        const response = await api.get(`/api/public/profile/${uname}`);
        setProfile(response.data);
        return true;
      } catch (e) {
        return false;
      }
    }
    try {
      const response = await api.get('/api/profile');
      setProfile(response.data);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
      return false;
    }
  }, [token]);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username, password, isAdmin = false) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('grant_type', 'password');

      // Use axios client for consistent baseURL and error handling
      const { data } = await api.post('/api/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      });
      if (data?.access_token) {
        const { access_token } = data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('access_token', access_token);
        setToken(access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        // Fetch user profile (authenticated)
        const profileResponse = await api.get('/api/profile');
        console.log('AuthContext Login Debug:', {
          profileData: profileResponse.data,
          isAdmin,
          profileRole: profileResponse.data.role,
          isAdminCheck: isAdmin && profileResponse.data.role !== 'admin'
        });
        setProfile(profileResponse.data);

          // For admin login, verify admin role
        if (isAdmin && profileResponse.data.role !== 'admin') {
          console.log('AuthContext: Admin role check failed');
          await logout();
          setLoading(false);
          throw new Error('Access denied. Admin privileges required.');
        }

        setLoading(false);
        return true;
      }

      // For admin login, don't use fallback - require proper authentication
      if (isAdmin) {
        await logout();
        setLoading(false);
        throw new Error('Admin login requires valid authentication.');
      }
      
      // Fallback: No token available -> use public profile by username (for regular users only)
      localStorage.setItem('username', username);
      const publicRes = await api.get(`/api/public/profile/${username}`);
      setProfile(publicRes.data);
      setLoading(false);
      return true;
    } catch (error) {
      // For admin login, don't use fallback
      if (isAdmin) {
        await logout();
        setLoading(false);
        throw new Error('Admin authentication failed. Please check your credentials.');
      }
      
      // Fallback flow if token endpoint is missing or returns error (for regular users only)
      try {
        localStorage.setItem('username', username);
        const publicRes = await api.get(`/api/public/profile/${username}`);
        setProfile(publicRes.data);
        setLoading(false);
        return true;
      } catch (e) {
        console.error('Login error:', error);
        setLoading(false);
        throw error;
      }
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/api/register', payload);
      if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('access_token', res.data.access_token);
        setToken(res.data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        return true;
      }
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      setToken(null);
      setProfile(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Check if current user is admin
  const isAdmin = profile?.role === 'admin';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        profile,
        setProfile,
        loading,
        login,
        logout,
        register,
        checkAuth,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
