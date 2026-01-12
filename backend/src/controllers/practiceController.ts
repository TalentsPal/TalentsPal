import { Request, Response } from 'express';
import Question from '../models/Question';
import { AppError } from '../utils/errorHandler';

/**
 * Get practice questions with advanced filters
 */
export const getPracticeQuestions = async (req: Request, res: Response) => {
  try {
    const {
      category,
      difficulty,
      company,
      tags,
      limit = 20,
      page = 1,
    } = req.query;

    // Build query
    const query: any = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (company) {
      query.company = company;
    }

    if (tags) {
      const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
      query.tags = { $in: tagArray };
    }

    const limitNum = Math.min(parseInt(limit as string), 50);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    // Get questions
    const questions = await Question.find(query)
      .select('-correctAnswer')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get practice questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching practice questions',
    });
  }
};

/**
 * Get available companies list
 */
export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Question.distinct('company', {
      isActive: true,
      company: { $exists: true, $ne: null, $nin: ['', null] },
    });

    res.status(200).json({
      success: true,
      data: companies.sort(),
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
    });
  }
};

/**
 * Get available tags list
 */
export const getTags = async (req: Request, res: Response) => {
  try {
    const allTags = await Question.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    const tags = allTags.map(t => ({
      name: t._id,
      count: t.count,
    }));

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
    });
  }
};

/**
 * Check answer for practice mode
 */
export const checkPracticeAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId, userAnswer } = req.body;

    if (!questionId || !userAnswer) {
      throw new AppError('Question ID and answer are required', 400);
    }

    const question = await Question.findOne({ questionId, isActive: true });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    const isCorrect = question.checkAnswer(userAnswer);

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.tags?.join(', ') || 'No explanation available',
      },
    });
  } catch (error) {
    console.error('Check practice answer error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error checking answer',
    });
  }
};
