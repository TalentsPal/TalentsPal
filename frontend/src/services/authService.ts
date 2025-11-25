/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { API_ENDPOINTS, getHeaders } from '@/config/api';
import { SignupFormData, LoginFormData } from '@/types';

/**
 * Signup a new user
 */
export const signupUser = async (formData: SignupFormData) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Store tokens in localStorage
    if (data.data.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
    }
    if (data.data.refreshToken) {
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }

    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (formData: LoginFormData) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store tokens in localStorage
    if (data.data.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
    }
    if (data.data.refreshToken) {
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
      headers: getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user profile');
    }

    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

/**
 * Get access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};
