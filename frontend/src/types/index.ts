// User Types
export type UserRole = 'student' | 'admin' | 'company';

export interface BaseUser {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  city: string;
  university?: string;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  linkedInUrl?: string;
  major?: string;
  graduationYear?: string;
  interests?: ('training' | 'job' | 'interview-prep')[];
}

export interface CompanyUser extends BaseUser {
  role: 'company';
  companyName: string;
  companyEmail: string;
  companyLocation: string;
  industry: string;
  description?: string;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
}

export type User = StudentUser | CompanyUser | AdminUser;

// Signup Form Types
export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone: string;
  city: string;
  university?: string;
  universityOther?: string;
  // Student fields
  linkedInUrl?: string;
  major?: string;
  majorOther?: string;
  graduationYear?: string;
  interests?: string[];
  // Company fields
  companyName?: string;
  companyEmail?: string;
  companyLocation?: string;
  industry?: string;
  industryOther?: string;
  description?: string;
}

// Login Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Form Validation Error Types
export interface FormErrors {
  [key: string]: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: FormErrors;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => void;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  email: string;
  location: string;
  city: string;
  field: string;
  opportunities: string[];
  description?: string;
  logo?: string;
  website?: string;
  employees?: number;
  founded?: string;
}

// Exam Types
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  companyId?: string;
  companyName?: string;
  duration: number; // in minutes
  questions: Question[];
  passingScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  passed: boolean;
  completedAt: string;
}

// Interview Types
export interface InterviewQuestion {
  id: string;
  companyId: string;
  companyName: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string[];
  submittedBy?: string;
  upvotes: number;
  createdAt: string;
}

// CV Analysis Types
export interface CVAnalysis {
  id: string;
  userId: string;
  fileName: string;
  uploadedAt: string;
  analysis: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    keywords: string[];
    formatting: {
      score: number;
      issues: string[];
    };
    content: {
      score: number;
      sections: {
        name: string;
        present: boolean;
        quality: number;
      }[];
    };
  };
}

// LinkedIn Analysis Types
export interface LinkedInAnalysis {
  id: string;
  userId: string;
  profileUrl: string;
  analyzedAt: string;
  analysis: {
    score: number;
    profileCompleteness: number;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    sections: {
      headline: { score: number; feedback: string };
      summary: { score: number; feedback: string };
      experience: { score: number; feedback: string };
      education: { score: number; feedback: string };
      skills: { score: number; feedback: string };
    };
  };
}

// Dashboard Types
export interface StudentDashboard {
  examsCompleted: number;
  averageScore: number;
  companiesViewed: number;
  cvAnalysisCount: number;
  recentExams: ExamResult[];
  recommendedCompanies: Company[];
  upcomingExams: Exam[];
}

export interface AdminDashboard {
  totalStudents: number;
  totalCompanies: number;
  totalExams: number;
  totalInterviewQuestions: number;
  recentSignups: User[];
  examAnalytics: {
    examId: string;
    examTitle: string;
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  }[];
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
