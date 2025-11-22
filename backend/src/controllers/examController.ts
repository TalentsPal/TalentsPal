import { Request, Response } from 'express';
import Exam from '../models/Exam';

export const getExams = async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find({});
    res.json(exams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createExam = async (req: Request, res: Response) => {
  const { title, description, category, durationMinutes, questions } = req.body;

  try {
    const exam = new Exam({
      title,
      description,
      category,
      durationMinutes,
      questions
    });

    const createdExam = await exam.save();
    res.status(201).json(createdExam);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExamById = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (exam) {
      res.json(exam);
    } else {
      res.status(404).json({ message: 'Exam not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
