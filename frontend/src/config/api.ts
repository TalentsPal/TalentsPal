/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// Base API URL - Update this based on your environment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/update-profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    UPLOAD_PROFILE_IMAGE: `${API_BASE_URL}/auth/upload-profile-image`,
    DELETE_PROFILE_IMAGE: `${API_BASE_URL}/auth/delete-profile-image`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
  },
  // Company endpoints
  COMPANIES: {
    LIST: `${API_BASE_URL}/companies`,
    DETAILS: (id: string) => `${API_BASE_URL}/companies/${id}`,
  },
  // Add more endpoints as needed
};

// API Headers
export const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
