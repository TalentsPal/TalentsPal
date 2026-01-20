import mongoose, { Document, Schema } from 'mongoose';

/**
 * City Interface
 */
export interface ICity extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  country: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * City Schema
 */
const CitySchema = new Schema<ICity>(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      unique: true,
      index: true,
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'Palestine',
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
CitySchema.index({ country: 1 });

const City = mongoose.model<ICity>('City', CitySchema);

export default City;
