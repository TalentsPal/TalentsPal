import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  website: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Company', companySchema);
