import { Request, Response } from 'express';
import CvSubmission from '../models/CvSubmission';
import { analyzeCV } from '../utils/aiPlaceholder';

export const submitCv = async (req: any, res: Response) => {
  const { cvText } = req.body;

  try {
    const analysis = await analyzeCV(cvText);

    const submission = new CvSubmission({
      user: req.user.id,
      cvText,
      analysis
    });

    const createdSubmission = await submission.save();
    res.status(201).json(createdSubmission);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCvs = async (req: any, res: Response) => {
  try {
    const submissions = await CvSubmission.find({ user: req.user.id });
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
