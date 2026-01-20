/**
 * Validation Utility Functions
 */
import User, { IUser, STUDENT_ROLE, COMPANY_ROLE, VALID_ROLES } from '../models/User';
import City from '../models/City';
import parsePhoneNumber from 'libphonenumber-js';
import University from '../models/University';
import Major from '../models/Major';

// Constants
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate Email Format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const ensureEmailIsNotFound = async (email: string): Promise<{ valid: boolean; message?: string }> => {
  const user = await User.findOne({ email });
  if (user) {
    return { valid: false, message: 'An account with this email already found' };
  }
  return { valid: true };
}

/**
 * Validate city
 */

export const isValidCity = async(name: string): Promise<{ valid: boolean; message?: string }> => {
  const city = await City.findOne({ name });
  if (city) {
    return { valid: true};
  }
  return { valid: false, message: `This city (${name}) is not supported yet` };
}

/**
 * Validate university
 */

export const isValidUniversity = async(name: string): Promise<{ valid: boolean; message?: string }> => {
  const university = await University.findOne({ name });
  if (university) {
    return { valid: true};
  }
  return { valid: false, message: `This university (${name}) is not supported yet` };
}

/**
 * Validate major
 */

export const isValidMajor = async(name: string): Promise<{ valid: boolean; message?: string }> => {
  const major = await Major.findOne({ name });
  if (major) {
    return { valid: true};
  }
  return { valid: false, message: `This major (${name}) is not supported yet` };
}

/**
 * Validate Password Strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const isValidPassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true };
};

/**
 * Validate Phone Number
 * Validates a phone number using the provided country code.
 * It supports phone numbers with or without country code prefix (e.g., +1234567890 or 1234567890).
 * countryCode should be a two-letter ISO country code (e.g., "US", "PS", "GB").
 */
export const isValidPhoneNumber = (
  phone: string,
  countryCode: string
): { valid: boolean; message?: string } => {
  if (!phone || !countryCode) {
    return { valid: false, message: 'Phone number and country code are required' };
  }

  // Normalize country code to uppercase
  const normalizedCountryCode = countryCode.toUpperCase().trim();

  try {
    // Try parsing the phone number with the country code
    const parsedNumber = parsePhoneNumber(phone, normalizedCountryCode as any);
    
    if (!parsedNumber) {
      return { valid: false, message: 'Invalid phone number format' };
    }

    // Validate the parsed number
    if (!parsedNumber.isValid()) {
      return { valid: false, message: 'Phone number is not valid for the specified country' };
    }

    // Verify the country code matches
    const parsedCountryCode = parsedNumber.country;
    if (parsedCountryCode !== normalizedCountryCode) {
      return { valid: false, message: 'Phone number country code does not match the specified country' };
    }

    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, message: `Invalid phone number format: ${errorMessage}` };
  }
};

/**
 * Validate Name (First/Last)
 */
export const isValidName = (name: string): {valid: boolean, message: string} => {
  const trimmedLength = name.trim().length;
  return {valid: trimmedLength >= MIN_NAME_LENGTH && trimmedLength <= MAX_NAME_LENGTH, message: `Full name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`};
};

/**
 * Validate Year
 */
export const isValidYear = (value: string): {valid: boolean, message?: string} => {
  const numericalYear = Number(value);
  if (!Number.isInteger(numericalYear)) {
    return { valid: false, message: `Year must be a number` };
  }

  const currentYear = new Date().getFullYear();
  if (numericalYear < 1900 || numericalYear > currentYear) {
    return { valid: false, message: `Year must be between 1900 and ${currentYear}` };
  }

  return { valid: true };
};


/**
 * Signup Request Body Type
 */
export interface SignupRequestBody {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  countryCode?: string;
  phone?: string;
  city?: string;
  university?: string;
  linkedInUrl?: string;
  major?: string;
  graduationYear?: string;
  interests?: string[];
  companyName?: string;
  companyEmail?: string;
  companyLocation?: string;
  industry?: string;
  description?: string;
}

/**
 * Sanitize Signup Request Body
 * Mutates the body object in place (similar to Go version)
 */
export const sanitizeSignupRequest = (body: SignupRequestBody): void => {
  if (body.fullName) {
    body.fullName = sanitizeInput(body.fullName);
  }
  if (body.email) {
    body.email = sanitizeInput(body.email.toLowerCase());
  }
  if (body.role) {
    body.role = body.role.toLowerCase().trim();
  }
  if (body.countryCode) {
    body.countryCode = body.countryCode.toUpperCase().trim();
  }
  if (body.phone) {
    body.phone = sanitizeInput(body.phone);
  }
  if (body.city) {
    body.city = sanitizeInput(body.city);
  }
  if (body.university) {
    body.university = sanitizeInput(body.university);
  }
  if (body.linkedInUrl) {
    body.linkedInUrl = body.linkedInUrl.trim();
  }
  if (body.major) {
    body.major = sanitizeInput(body.major);
  }
  if (body.companyName) {
    body.companyName = sanitizeInput(body.companyName);
  }
  if (body.companyEmail) {
    body.companyEmail = sanitizeInput(body.companyEmail.toLowerCase().trim());
  }
  if (body.companyLocation) {
    body.companyLocation = sanitizeInput(body.companyLocation);
  }
  if (body.industry) {
    body.industry = sanitizeInput(body.industry);
  }
  if (body.description) {
    body.description = sanitizeInput(body.description.trim());
  }
  if (body.interests && Array.isArray(body.interests)) {
    body.interests = body.interests.map(interest => sanitizeInput(interest));
  }
};

/**
 * Update Profile Request Body Type
 */
export interface UpdateProfileRequestBody {
  fullName?: string;
  countryCode?: string;
  phone?: string;
  city?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  interests?: string[];
  bio?: string;
  linkedInUrl?: string;
  companyName?: string;
  companyLocation?: string;
  industry?: string;
  description?: string;
}

/**
 * Sanitize Signup Request Body
 * Mutates the body object in place (similar to Go version)
 */
export const sanitizeUpdateProfileRequest = (body: UpdateProfileRequestBody): void => {
  if (body.fullName) {
    body.fullName = sanitizeInput(body.fullName);
  }
  if (body.countryCode) {
    body.countryCode = body.countryCode.toUpperCase().trim();
  }
  if (body.phone) {
    body.phone = sanitizeInput(body.phone);
  }
  if (body.city) {
    body.city = sanitizeInput(body.city);
  }
  if (body.university) {
    body.university = sanitizeInput(body.university);
  }
  if (body.major) {
    body.major = sanitizeInput(body.major);
  }
  if (body.linkedInUrl) {
    body.linkedInUrl = body.linkedInUrl.trim();
  }
  if (body.interests && Array.isArray(body.interests)) {
    body.interests = body.interests.map(interest => sanitizeInput(interest));
  }
  if (body.bio) {
    body.bio = sanitizeInput(body.bio);
  }
  if (body.companyName) {
    body.companyName = sanitizeInput(body.companyName);
  }
  if (body.companyLocation) {
    body.companyLocation = sanitizeInput(body.companyLocation);
  }
  if (body.industry) {
    body.industry = sanitizeInput(body.industry);
  }
  if (body.description) {
    body.description = sanitizeInput(body.description.trim());
  }
};

/**
 * Sanitize Input - Remove potentially harmful characters
 */
// Regex equivalents
const reHTML = /<[^>]*>/gi;
const reProto = /javascript\s*:/gi;

// Invisible & bidi control characters
const invisibleRunes = new Set([
  "\u200B", "\u200C", "\u200D",
  "\u202A", "\u202B", "\u202D", "\u202E",
  "\u2066", "\u2067", "\u2068", "\u2069",
]);

export const sanitizeInput = (value: string): string => {
  if (typeof value !== "string") return "";

  // 1) Normalize unicode (NFKC)
  let s = value.normalize("NFKC");

  // 2) Strip HTML tags
  s = s.replace(reHTML, "");

  // 3) Remove javascript: protocol
  s = s.replace(reProto, "");

  // 4) Strip invisible/bidi + control chars (except \n and \t)
  // Use for...of to iterate by Unicode code points without building an array.
  let out = "";
  let changed = false;

  for (const ch of s) {
    if (invisibleRunes.has(ch)) {
      changed = true;
      continue;
    }

    // for...of guarantees ch is a non-empty string => codePointAt(0) will be a number,
    // but TS still types it as number | undefined, so we handle it safely:
    const code = ch.codePointAt(0);
    if (code === undefined) {
      changed = true;
      continue;
    }

    // ASCII control chars: 0x00-0x1F and 0x7F (allow \n and \t)
    if ((code <= 0x1f || code === 0x7f) && ch !== "\n" && ch !== "\t") {
      changed = true;
      continue;
    }

    out += ch;
  }

  // 5) Trim whitespace
  return (changed ? out : s).trim();
};

/**
 * Check if profile is complete
 */
export const isProfileComplete = (user: IUser): boolean => {
  if (user.fullName != "" && user.email != "" && user.role != "" && user.phone != "" && user.city != "" && user.profileImage) {
    switch (user.role) {
    case VALID_ROLES[STUDENT_ROLE]:
      if (user.linkedInUrl != "" && user.university != "" && user.major != "" && user.graduationYear != "" && user.interests && user.interests.length > 0 && user.bio != "") {
        return true;
      }
      break;
    case VALID_ROLES[COMPANY_ROLE]:
      if (user.companyName != "" && user.companyLocation != "" && user.companyEmail != "" && user.industry != "" && user.description != "") {
        return true;
      }
      break;
    }
  }
  return false;
};

/**
 * Validate User Role
 */
export const isValidRole = (role: string): boolean => {
  return VALID_ROLES.includes(role as typeof VALID_ROLES[number]);
};

/**
 * Validate Interests
 * Validates an array of interests, removes duplicates, and ensures each interest is between 2-50 characters.
 * Returns the unique interests array if valid.
 */
export const validateInterests = (
  interests: string[]
): { valid: boolean; uniqueInterests: string[]; message?: string } => {
  const seen = new Set<string>();
  const uniqueInterests: string[] = [];

  for (const interest of interests) {
    // Skip if already seen (remove duplicates)
    if (!seen.has(interest)) {
      seen.add(interest);
      uniqueInterests.push(interest);
      
      // Validate length (2-50 characters)
      const length = interest.length;
      if (length < 2 || length > 50) {
        return {
          valid: false,
          uniqueInterests: [],
          message: 'An interest should be between 2 & 50 characters',
        };
      }
    }
  }

  return { valid: true, uniqueInterests };
};
