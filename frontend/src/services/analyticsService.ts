import { API_BASE_URL, getHeaders } from '@/config/api';

// Analytics Interfaces
export interface PerformanceTrend {
  attempt: number;
  date: string;
  score: number;
  category: string;
}

export interface CategoryBreakdown {
  category: string;
  attempts: number;
  averageScore: number;
  accuracy: number;
}

export interface DifficultyBreakdown {
  difficulty: string;
  attempts: number;
  averageScore: number;
  accuracy: number;
}

export interface TopicPerformance {
  category: string;
  score: number;
}

export interface StudentAnalytics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  performanceTrend: PerformanceTrend[];
  categoryBreakdown: CategoryBreakdown[];
  difficultyBreakdown: DifficultyBreakdown[];
  improvementRate: number;
  strongTopics: TopicPerformance[];
  weakTopics: TopicPerformance[];
}

// Leaderboard Interfaces
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  university: string | null;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  accuracy: number;
  points: number;
}

export interface UserLeaderboardPosition {
  rank: number | null;
  totalUsers: number;
  points: number;
  percentile: number;
}

/**
 * Get student analytics
 */
export const getStudentAnalytics = async (
  timeRange: 'all' | 'week' | 'month' | 'year' = 'all'
): Promise<StudentAnalytics> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/analytics/student?timeRange=${timeRange}`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (
  category: 'all' | 'frontend' | 'backend' = 'all',
  timeRange: 'all' | 'week' | 'month' = 'all',
  limit: number = 10
): Promise<LeaderboardEntry[]> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `${API_BASE_URL}/analytics/leaderboard?category=${category}&timeRange=${timeRange}&limit=${limit}`,
    {
      headers: getHeaders(token || ''),
    }
  );
  const data = await response.json();
  return data.data;
};

/**
 * Get user's leaderboard position
 */
export const getUserLeaderboardPosition = async (
  category: 'all' | 'frontend' | 'backend' = 'all',
  timeRange: 'all' | 'week' | 'month' = 'all'
): Promise<UserLeaderboardPosition> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `${API_BASE_URL}/analytics/leaderboard/position?category=${category}&timeRange=${timeRange}`,
    {
      headers: getHeaders(token || ''),
    }
  );
  const data = await response.json();
  return data.data;
};
