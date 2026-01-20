import mongoose, { Document, Schema } from 'mongoose';

/**
 * University Interface
 */
export interface IUniversity extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  country: string;
  city?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * University Schema
 */
const UniversitySchema = new Schema<IUniversity>(
  {
    name: {
      type: String,
      required: [true, 'University name is required'],
      unique: true,
      index: true,
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'Palestine',
    },
    city: {
      type: String,
      trim: true,
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
UniversitySchema.index({ country: 1 });

const University = mongoose.model<IUniversity>('University', UniversitySchema);

export default University;
