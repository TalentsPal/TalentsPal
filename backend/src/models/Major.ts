import mongoose, { Document, Schema } from 'mongoose';

/**
 * Major Interface
 */
export interface IMajor extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Major Schema
 */
const MajorSchema = new Schema<IMajor>(
  {
    name: {
      type: String,
      required: [true, 'Major name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Engineering',
        'Business',
        'Medicine & Health',
        'Arts & Humanities',
        'Sciences',
        'IT & Computer Science',
        'Law',
        'Education',
        'Other',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 * Note: name index is already created by unique: true constraint
 */
MajorSchema.index({ category: 1 });

const Major = mongoose.model<IMajor>('Major', MajorSchema);

export default Major;
