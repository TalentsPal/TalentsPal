import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  city: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  notes?: string;
  sourceFile?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      enum: ['Nablus', 'Ramallah', 'Other'],
    },
    address: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    sourceFile: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searching
CompanySchema.index({ city: 1 });
CompanySchema.index({ name: 'text' });

const Company = mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
