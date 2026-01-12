import mongoose, { Document, Schema } from 'mongoose';

export type AchievementType = 
  | 'first_exam'
  | 'exam_streak_3'
  | 'exam_streak_7'
  | 'exam_streak_30'
  | 'perfect_score'
  | 'speed_master'
  | 'improvement_champion'
  | 'category_master_frontend'
  | 'category_master_backend'
  | 'exam_count_10'
  | 'exam_count_50'
  | 'exam_count_100'
  | 'hard_questions_10'
  | 'practice_warrior';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  createdAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'first_exam',
        'exam_streak_3',
        'exam_streak_7',
        'exam_streak_30',
        'perfect_score',
        'speed_master',
        'improvement_champion',
        'category_master_frontend',
        'category_master_backend',
        'exam_count_10',
        'exam_count_50',
        'exam_count_100',
        'hard_questions_10',
        'practice_warrior',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one achievement type per user
achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);

export default Achievement;
