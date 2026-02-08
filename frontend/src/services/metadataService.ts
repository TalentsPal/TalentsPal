import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface University {
  _id: string;
  name: string;
  country: string;
  city?: string;
}

export interface Major {
  _id: string;
  name: string;
  category: string;
}

export interface Industry {
  _id: string;
  name: string;
}

/**
 * Fetch all universities
 */
export const fetchUniversities = async (): Promise<University[]> => {
  try {
    const response = await axios.get(`${API_URL}/metadata/universities`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching universities:', error);
    return [];
  }
};

/**
 * Fetch all majors
 */
export const fetchMajors = async (): Promise<Major[]> => {
  try {
    const response = await axios.get(`${API_URL}/metadata/majors`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching majors:', error);
    return [];
  }
};

/**
 * Fetch all industries
 */
export const fetchIndustries = async (): Promise<Industry[]> => {
  try {
    const response = await axios.get(`${API_URL}/metadata/industries`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching industries:', error);
    return [];
  }
};

/**
 * Fetch all cities
 */
export const fetchCities = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/metadata/cities`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};
