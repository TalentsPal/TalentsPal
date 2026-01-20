import mongoose, { Document, Schema } from 'mongoose';

/**
 * Industry Interface
 */
export interface IIndustry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Industry Schema
 */
const IndustrySchema = new Schema<IIndustry>(
  {
    name: {
      type: String,
      required: [true, 'Industry name is required'],
      unique: true,
      index: true,
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

const Industry = mongoose.model<IIndustry>('Industry', IndustrySchema);

export default Industry;
