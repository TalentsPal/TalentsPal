/**
 * Question/Exam Service
 * Handles all exam and question-related API calls
 */

import { getHeaders } from '@/config/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface UserStats {
  _id: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalQuestions: number;
  totalCorrect: number;
  averageTime: number;
}

export interface TestHistory {
  _id: string;
  category: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  startedAt: string;
  completedAt: string;
  createdAt: string;
}

/**
 * Get user statistics
 */
export const getUserStats = async (category?: string): Promise<UserStats[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    const url = category 
      ? `${API_URL}/questions/stats/user?category=${category}`
      : `${API_URL}/questions/stats/user`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user stats');
    }

    return data.stats || [];
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

/**
 * Get user test history
 */
export const getUserTestHistory = async (
  category?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ attempts: TestHistory[]; total: number; page: number; pages: number }> => {
  try {
    const token = localStorage.getItem('accessToken');
    let url = `${API_URL}/questions/history?page=${page}&limit=${limit}`;
    
    if (category) {
      url += `&category=${category}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch test history');
    }

    return data;
  } catch (error) {
    console.error('Get test history error:', error);
    throw error;
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (
  category: string = 'backend',
  limit: number = 10
): Promise<any[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    const url = `${API_URL}/questions/leaderboard?category=${category}&limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch leaderboard');
    }

    return data.leaderboard || [];
  } catch (error) {
    console.error('Get leaderboard error:', error);
    throw error;
  }
};
