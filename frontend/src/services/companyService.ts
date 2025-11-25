
import { API_ENDPOINTS, getHeaders } from '@/config/api';

export interface Company {
  _id: string;
  name: string;
  city: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  notes?: string;
}

export interface GetCompaniesParams {
  city?: string;
  search?: string;
}

export const getCompanies = async (params?: GetCompaniesParams) => {
  try {
    const url = new URL(API_ENDPOINTS.COMPANIES.LIST);

    if (params?.city) {
      url.searchParams.append('city', params.city);
    }

    if (params?.search) {
      url.searchParams.append('search', params.search);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch companies');
    }

    return data;
  } catch (error) {
    console.error('Get companies error:', error);
    throw error;
  }
};

export const getCompany = async (id: string) => {
  try {
    const response = await fetch(API_ENDPOINTS.COMPANIES.DETAILS(id), {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch company details');
    }

    return data;
  } catch (error) {
    console.error('Get company details error:', error);
    throw error;
  }
};
