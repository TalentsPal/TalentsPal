import { Request, Response } from 'express';
import Interview from '../models/Interview';
import { simulateInterviewQuestion, evaluateInterviewAnswer } from '../utils/aiPlaceholder';

export const startInterview = async (req: any, res: Response) => {
  const { topic } = req.body;

  try {
    const { question } = await simulateInterviewQuestion(topic);

    const interview = new Interview({
      user: req.user.id,
      topic,
      history: [] // Initial empty history
    });

    const createdInterview = await interview.save();

    // Return the interview ID and the first question
    res.status(201).json({
      _id: createdInterview._id,
      topic: createdInterview.topic,
      firstQuestion: question
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitAnswer = async (req: any, res: Response) => {
  const { interviewId, question, answer } = req.body;

  try {
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    // Evaluate the answer
    const evaluation = await evaluateInterviewAnswer(question, answer);

    // Add to history
    interview.history.push({
      question,
      answer,
      feedback: evaluation.feedback,
      score: evaluation.score
    });

    await interview.save();

    // Get next question
    const { question: nextQuestion } = await simulateInterviewQuestion(interview.topic);

    res.json({
      evaluation,
      nextQuestion
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
