import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export const STUDENT_ROLE = 0;
export const COMPANY_ROLE = 1;
export const ADMIN_ROLE = 2;
export const VALID_ROLES = [
	'student',
	'company',
	'admin',
];

/**
 * User Interface - Defines the structure of a User document
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;

  // Common fields
  fullName: string;
  email: string;
  password?: string;
  role: typeof VALID_ROLES[number];
  phone?: string;
  city?: string;
  university?: string;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  isActive: boolean;
  profileImage?: string;

  // Email verification fields
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;

  // OAuth fields
  googleId?: string;
  linkedinId?: string;

  // Student-specific fields
  linkedInUrl?: string;
  major?: string;
  graduationYear?: string;
  interests?: string[];
  bio?: string;

  // Company-specific fields
  companyName?: string;
  companyEmail?: string;
  companyLocation?: string;
  industry?: string;
  description?: string;

  // Refresh Token
  refreshToken?: string;
  refreshTokenExp?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): Partial<IUser>;
}

/**
 * User Schema - MongoDB schema definition with validation
 */
const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: function (this: any) {
        return !this.googleId && !this.linkedinId;
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default in queries
    },
    googleId: {
      type: String,
      select: false,
    },
    linkedinId: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: VALID_ROLES,
        message: 'Role must be one of the following: ' + VALID_ROLES.join(', '),
      },
      default: 'student',
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'City must be at least 2 characters'],
      maxlength: [50, 'City cannot exceed 50 characters'],
    },
    university: {
      type: String,
      trim: true,
      maxlength: [100, 'University cannot exceed 100 characters'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // Student-specific fields
    linkedInUrl: {
      type: String,
      trim: true,
    },
    major: {
      type: String,
      trim: true,
      maxlength: [50, 'Major cannot exceed 50 characters'],
    },
    graduationYear: {
      type: String,
      trim: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },

    // Company-specific fields
    companyName: {
      type: String,
      trim: true,
      maxlength: [50, 'Company Name cannot exceed 50 characters'],
    },
    companyEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    companyLocation: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [50, 'Industry cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 50 characters'],
    },

    // Refresh Token
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExp: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save Hook - Hash password before saving to database
 */
// UserSchema.pre('save', async function () {
//   // Only hash password if it exists and has been modified
//   if (!this.password || !this.isModified('password')) {
//     return;
//   }

//   // Generate salt and hash password
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
// });

/**
 * Instance Method - Compare password for authentication
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * Instance Method - Get public profile (exclude sensitive data)
 */
UserSchema.methods.getPublicProfile = function (): Partial<IUser> {
  const baseProfile = {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    phone: this.phone,
    city: this.city,
    isEmailVerified: this.isEmailVerified,
    isProfileComplete: this.isProfileComplete,
    profileImage: this.profileImage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  // Add role-specific fields
  if (this.role === VALID_ROLES[STUDENT_ROLE]) {
    return {
      ...baseProfile,
      linkedInUrl: this.linkedInUrl,
      university: this.university,
      major: this.major,
      graduationYear: this.graduationYear,
      interests: this.interests,
      bio: this.bio,
    };
  } else if (this.role === VALID_ROLES[COMPANY_ROLE]) {
    return {
      ...baseProfile,
      companyName: this.companyName,
      companyEmail: this.companyEmail,
      companyLocation: this.companyLocation,
      industry: this.industry,
      description: this.description,
    };
  }

  return baseProfile;
};

/**
 * Indexes for performance optimization
 * Note: email index is already created by unique: true constraint
 */
UserSchema.index({ role: 1 }); // Filter by role
UserSchema.index({ createdAt: -1 }); // Sort by creation date
UserSchema.index({ isEmailVerified: 1, role: 1 }); // Filter verified users by role
UserSchema.index({ email:1, isEmailVerified: 1 }); // Filter verified users by email and isEmailVerified
UserSchema.index({ university: 1, major: 1 }); // Student search by university/major
UserSchema.index({ industry: 1 }); // Company search by industry
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true }); // Email verification lookup

/**
 * Export User Model
 */
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
