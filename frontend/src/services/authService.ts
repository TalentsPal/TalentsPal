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
    // Store user data
    if (data.data.user) {
      localStorage.setItem('user', JSON.stringify(data.data.user));
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
    // Store user data
    if (data.data.user) {
      localStorage.setItem('user', JSON.stringify(data.data.user));
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
  localStorage.removeItem('user');
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

/**
 * Update user profile
 */
export const updateProfile = async (profileData: any) => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (file: File) => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found');
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch(API_ENDPOINTS.AUTH.UPLOAD_PROFILE_IMAGE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }

    return data;
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async () => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(API_ENDPOINTS.AUTH.DELETE_PROFILE_IMAGE, {
      method: 'DELETE',
      headers: getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete image');
    }

    return data;
  } catch (error) {
    console.error('Delete image error:', error);
    throw error;
  }
};
