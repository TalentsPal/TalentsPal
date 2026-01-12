import { API_BASE_URL, getHeaders } from '@/config/api';

export interface PracticeQuestion {
  _id: string;
  questionId: number;
  category: string;
  question: string;
  options: string[];
  difficulty: string;
  tags: string[];
  company?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PracticeQuestionsResponse {
  questions: PracticeQuestion[];
  pagination: PaginationInfo;
}

export interface Tag {
  name: string;
  count: number;
}

export interface AnswerCheckResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

/**
 * Get practice questions with filters
 */
export const getPracticeQuestions = async (
  category?: string,
  difficulty?: string,
  company?: string,
  tags?: string[],
  page: number = 1,
  limit: number = 20
): Promise<PracticeQuestionsResponse> => {
  const token = localStorage.getItem('accessToken');
  
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  if (company) params.append('company', company);
  if (tags && tags.length > 0) params.append('tags', tags.join(','));
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetch(`${API_BASE_URL}/practice/questions?${params.toString()}`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Get available companies
 */
export const getAvailableCompanies = async (): Promise<string[]> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/practice/companies`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Get available tags
 */
export const getAvailableTags = async (): Promise<Tag[]> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/practice/tags`, {
    headers: getHeaders(token || ''),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Check practice answer
 */
export const checkPracticeAnswer = async (
  questionId: number,
  userAnswer: string
): Promise<AnswerCheckResult> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/practice/check-answer`, {
    method: 'POST',
    headers: getHeaders(token || ''),
    body: JSON.stringify({ questionId, userAnswer }),
  });
  const data = await response.json();
  return data.data;
};
