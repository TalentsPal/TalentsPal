import mongoose from 'mongoose';

const cvSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvText: { type: String, required: true }, // In a real app, this might be a file URL
  analysis: {
    score: Number,
    summary: String,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CvSubmission', cvSubmissionSchema);
