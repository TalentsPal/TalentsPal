import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // Date for this challenge (YYYY-MM-DD)
  questionId: mongoose.Types.ObjectId;
  category: 'backend' | 'frontend';
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface IUserStreak extends Document {
  userId: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date;
  totalChallengesCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const dailyChallengeSchema = new Schema<IDailyChallenge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['backend', 'frontend'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userAnswer: {
      type: String,
    },
    isCorrect: {
      type: Boolean,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const userStreakSchema = new Schema<IUserStreak>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCompletedDate: {
      type: Date,
    },
    totalChallengesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one challenge per user per day
dailyChallengeSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyChallenge = mongoose.model<IDailyChallenge>(
  'DailyChallenge',
  dailyChallengeSchema
);

export const UserStreak = mongoose.model<IUserStreak>(
  'UserStreak',
  userStreakSchema
);
