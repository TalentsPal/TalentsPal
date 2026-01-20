import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IQuestion extends Document {
  questionId: number;
  category: 'backend' | 'frontend';
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  company?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toPublicJSON(): any;
  checkAnswer(answer: string): boolean;
}

export interface IQuestionModel extends Model<IQuestion> {
  getRandomQuestions(category: string, count: number, difficulty?: string): Promise<any[]>;
}

const questionSchema = new Schema<IQuestion>(
  {
    questionId: {
      type: Number,
      required: [true, 'Question ID is required'],
      unique: true,
      index: true,
      min: [1, 'Question ID must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['backend', 'frontend'],
        message: 'Category must be either backend or frontend',
      },
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: [10, 'Question must be at least 10 characters long'],
      maxlength: [1000, 'Question must not exceed 1000 characters'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function (options: string[]) {
          return options.length >= 2 && options.length <= 6;
        },
        message: 'Question must have between 2 and 6 options',
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      validate: {
        validator: function (answer: string) {
          return (this as any).options.includes(answer);
        },
        message: 'Correct answer must be one of the provided options',
      },
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be easy, medium, or hard',
      },
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name must not exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Remove sensitive fields when converting to JSON
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient queries
questionSchema.index({ category: 1, isActive: 1, difficulty: 1 });
questionSchema.index({ category: 1, questionId: 1 });

// Static method to get random questions
questionSchema.statics.getRandomQuestions = async function (
  category: string,
  count: number,
  difficulty?: string
) {
  const match: any = { category, isActive: true };
  if (difficulty) {
    match.difficulty = difficulty;
  }

  // Get all matching questions first
  const allQuestions = await this.find(match).select('-__v');
  
  // Shuffle using Fisher-Yates algorithm for better randomization
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use crypto random for better randomness
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Add additional randomization by sorting with random values
  const doubleShuffled = shuffled
    .map(q => ({ question: q, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.question);
  
  // Return requested count
  return doubleShuffled.slice(0, count);
};

// Instance method to format question for display (without correct answer)
questionSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  return {
    _id: obj._id,
    questionId: obj.questionId,
    category: obj.category,
    question: obj.question,
    options: obj.options,
    difficulty: obj.difficulty,
    tags: obj.tags,
  };
};

// Instance method to check if answer is correct
questionSchema.methods.checkAnswer = function (answer: string): boolean {
  return this.correctAnswer === answer;
};

export default mongoose.model<IQuestion, IQuestionModel>('Question', questionSchema);
