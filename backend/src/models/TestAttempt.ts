import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITestAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  category: 'backend' | 'frontend';
  isPracticeMode: boolean; // Practice mode: unlimited time, instant feedback
  questions: Array<{
    questionId: mongoose.Types.ObjectId;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
}

export interface ITestAttemptModel extends Model<ITestAttempt> {
  getUserStats(userId: string, category?: string): Promise<any[]>;
  getLeaderboard(category: string, limit: number): Promise<any[]>;
}

const testAttemptSchema = new Schema<ITestAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['backend', 'frontend'],
      index: true,
    },
    isPracticeMode: {
      type: Boolean,
      default: false,
      index: true,
    },
    questions: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        userAnswer: {
          type: String,
          required: true,
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    correctCount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
testAttemptSchema.index({ userId: 1, category: 1, createdAt: -1 });
testAttemptSchema.index({ score: -1, createdAt: -1 });

// Static method to get user statistics
testAttemptSchema.statics.getUserStats = async function (userId: string, category?: string) {
  const match: any = { userId: new mongoose.Types.ObjectId(userId) };
  if (category) {
    match.category = category;
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        totalQuestions: { $sum: '$totalQuestions' },
        totalCorrect: { $sum: '$correctCount' },
        averageTime: { $avg: '$timeSpent' },
      },
    },
  ]);

  return stats;
};

// Static method to get leaderboard
testAttemptSchema.statics.getLeaderboard = async function (
  category: string,
  limit: number = 10
) {
  return this.aggregate([
    { $match: { category } },
    {
      $group: {
        _id: '$userId',
        bestScore: { $max: '$score' },
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
      },
    },
    { $sort: { bestScore: -1, averageScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        bestScore: 1,
        totalAttempts: 1,
        averageScore: { $round: ['$averageScore', 2] },
        userName: '$user.name',
        userEmail: '$user.email',
      },
    },
  ]);
};

export default mongoose.model<ITestAttempt, ITestAttemptModel>('TestAttempt', testAttemptSchema);
