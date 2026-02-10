import { FormErrors, SignupFormData, LoginFormData } from '@/types';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Palestinian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(05\d{8}|07\d{8}|\+9725\d{8}|\+9727\d{8})$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// Password strength validation
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// LinkedIn URL validation
export const isValidLinkedInUrl = (url: string): boolean => {
  const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/;
  return linkedInRegex.test(url);
};

// Year validation
export const isValidYear = (year: string): boolean => {
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year);
  return yearNum >= 1950 && yearNum <= currentYear + 10;
};

// Signup form validation
export const validateSignupForm = (data: SignupFormData): FormErrors => {
  const errors: FormErrors = {};

  // Common validations
  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isStrongPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!data.role) {
    errors.role = 'Please select a role';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid Palestinian phone number (e.g., 0599123456)';
  }

  if (!data.city.trim()) {
    errors.city = 'City is required';
  }

  // Student-specific validations
  if (data.role === 'student') {
    if (data.linkedInUrl && !isValidLinkedInUrl(data.linkedInUrl)) {
      errors.linkedInUrl = 'Please enter a valid LinkedIn profile URL';
    }

    if (data.graduationYear && !isValidYear(data.graduationYear)) {
      errors.graduationYear = 'Please enter a valid graduation year';
    }
  }

  // Company-specific validations
  if (data.role === 'company') {
    if (!data.companyName?.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (!data.companyEmail?.trim()) {
      errors.companyEmail = 'Company email is required';
    } else if (!isValidEmail(data.companyEmail)) {
      errors.companyEmail = 'Please enter a valid company email';
    }

    if (!data.companyLocation?.trim()) {
      errors.companyLocation = 'Company location is required';
    }

    if (!data.industry?.trim()) {
      errors.industry = 'Industry is required';
    }
  }

  return errors;
};

// Login form validation
export const validateLoginForm = (data: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

// Get password strength level
export const getPasswordStrength = (password: string): {
  level: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  if (score <= 2) {
    return { level: 'weak', score: 33, feedback: 'Weak password' };
  } else if (score <= 4) {
    return { level: 'medium', score: 66, feedback: 'Medium strength' };
  } else {
    return { level: 'strong', score: 100, feedback: 'Strong password' };
  }
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('05') || cleaned.startsWith('07')) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
