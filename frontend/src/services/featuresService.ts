import { API_BASE_URL, getHeaders } from '@/config/api';

export interface DailyChallenge {
  _id: string;
  userId: string;
  date: string;
  questionId: {
    _id: string;
    question: string;
    category: string;
    difficulty: string;
    options: string[];
  };
  category: string;
  difficulty: string;
  completed: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
  completedAt?: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  totalChallengesCompleted: number;
}

export interface TodayChallengeResponse {
  challenge: DailyChallenge;
  streak: UserStreak;
}

export interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserAchievements {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

/**
 * Get today's daily challenge
 */
export const getTodayChallenge = async (): Promise<TodayChallengeResponse> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/challenges/today`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Submit answer for daily challenge
 */
export const submitChallengeAnswer = async (userAnswer: string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/challenges/submit`, {
    method: 'POST',
    headers: getHeaders(token || ''),
    body: JSON.stringify({ userAnswer }),
  });
  return await response.json();
};

/**
 * Get user streak information
 */
export const getUserStreak = async (): Promise<UserStreak> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/challenges/streak`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Get challenge history
 */
export const getChallengeHistory = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/challenges/history?page=${page}&limit=${limit}`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Get all user achievements
 */
export const getUserAchievements = async (): Promise<UserAchievements> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/achievements`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Get achievement progress
 */
export const getAchievementProgress = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/achievements/progress`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};
