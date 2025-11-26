import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Interface - Defines the structure of a User document
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;

  // Common fields
  fullName: string;
  email: string;
  password?: string;
  role: 'student' | 'company' | 'admin';
  phone?: string;
  city?: string;
  university?: string;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  isActive: boolean;
  profileImage?: string;

  // OAuth fields
  googleId?: string;
  linkedinId?: string;

  // Student-specific fields
  linkedInUrl?: string;
  major?: string;
  graduationYear?: string;
  interests?: string[];

  // Company-specific fields
  companyName?: string;
  companyEmail?: string;
  companyLocation?: string;
  industry?: string;
  description?: string;

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
        values: ['student', 'company', 'admin'],
        message: 'Role must be either student, company, or admin',
      },
      default: 'student',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
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

    // Student-specific fields
    linkedInUrl: {
      type: String,
      trim: true,
    },
    major: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: String,
      trim: true,
    },
    interests: {
      type: [String],
      default: [],
    },

    // Company-specific fields
    companyName: {
      type: String,
      trim: true,
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
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save Hook - Hash password before saving to database
 */
UserSchema.pre('save', async function () {
  // Only hash password if it exists and has been modified
  if (!this.password || !this.isModified('password')) {
    return;
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

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
    university: this.university,
    isEmailVerified: this.isEmailVerified,
    isProfileComplete: this.isProfileComplete,
    profileImage: this.profileImage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  // Add role-specific fields
  if (this.role === 'student') {
    return {
      ...baseProfile,
      linkedInUrl: this.linkedInUrl,
      major: this.major,
      graduationYear: this.graduationYear,
      interests: this.interests,
    };
  } else if (this.role === 'company') {
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
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

/**
 * Export User Model
 */
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
