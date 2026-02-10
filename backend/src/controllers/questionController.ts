import { Request, Response } from 'express';
import Question, { IQuestion, VALID_CATEGORIES, BACKEND_CATEGORY } from '../models/Question';
import TestAttempt from '../models/TestAttempt';
import { validationResult } from 'express-validator';
import {
  formatQuestionForDisplay,
  validateQuestionStructure,
  calculateScore,
  getGrade,
} from '../utils/questionFormatter';
import { checkAndUnlockAchievements } from './achievementController';

// Constants
const DEFAULT_QUESTION_COUNT = 10;
const MAX_QUESTION_COUNT = 50;
const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 100;
const DEFAULT_HISTORY_LIMIT = 10;
const MAX_HISTORY_LIMIT = 50;
const DEFAULT_LEADERBOARD_LIMIT = 10;
const MAX_LEADERBOARD_LIMIT = 100;

/**
 * Get random questions for a test (students only see questions without correct answers)
 */
export const getRandomQuestions = async (req: Request, res: Response) => {
  try {
    const { category, count = DEFAULT_QUESTION_COUNT, difficulty } = req.query;

    // Validate category
    if (!category || !VALID_CATEGORIES.includes(category as string)) {
      return res.status(400).json({
        success: false,
        message: 'A valid category (' + VALID_CATEGORIES.join(',') + ') is required',
      });
    }

    // Validate count
    const questionCount = Math.min(
      Math.max(parseInt(count as string) || DEFAULT_QUESTION_COUNT, 1),
      MAX_QUESTION_COUNT
    );

    // Get random questions
    const questions = await Question.getRandomQuestions(
      category as string,
      questionCount,
      difficulty as string
    );

    // Format questions for display (without correct answers)
    const formattedQuestions = questions.map((q: any) => {
      const formatted = formatQuestionForDisplay(q, false);
      // Remove correct answer from response
      delete formatted.correctAnswer;
      return formatted;
    });

    res.json({
      success: true,
      count: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error('Error getting random questions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error retrieving questions',
      error: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
};

/**
 * Get a single question by ID (without correct answer for students)
 */
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    if (!question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Question is not available',
      });
    }

    // Return question without correct answer
    res.json({
      success: true,
      question: question.toPublicJSON(),
    });
  } catch (error) {
    console.error('Error getting question:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error retrieving question',
      error: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
};

/**
 * Submit answers and get results
 */
export const submitAnswers = async (req: Request, res: Response) => {
  try {
    const { answers, startedAt, category } = req.body;
    const userId = (req.user as any).userId;

    // Validate answers format
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be a non-empty array',
      });
    }

    // Validate category
    const validCategories = ['backend', 'frontend', 'qa', 'data-engineering', 'devops', 'mobile', 'fullstack'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Valid category is required. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    // Validate each answer has questionId and answer
    const isValid = answers.every(
      (ans) => ans.questionId && typeof ans.answer === 'string'
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Each answer must include questionId and answer',
      });
    }

    // Get all questions by IDs
    const questionIds = answers.map((ans) => ans.questionId);
    const questions = await Question.find({
      _id: { $in: questionIds },
      isActive: true,
    });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some questions not found or are inactive',
      });
    }

    // Check answers and calculate score
    const results = answers.map((ans) => {
      const question = questions.find((q) => q._id.toString() === ans.questionId);
      if (!question) {
        return {
          questionId: ans.questionId,
          correct: false,
          userAnswer: ans.answer,
        };
      }

      const isCorrect = question.checkAnswer(ans.answer);
      return {
        questionId: ans.questionId,
        correct: isCorrect,
        userAnswer: ans.answer,
        correctAnswer: question.correctAnswer,
        question: question.question,
      };
    });

    const correctCount = results.filter((r) => r.correct).length;
    const score = calculateScore(correctCount, results.length);
    const gradeInfo = getGrade(score);

    // Calculate time spent
    const completedAt = new Date();
    const start = startedAt ? new Date(startedAt) : completedAt;
    const timeSpent = Math.floor((completedAt.getTime() - start.getTime()) / 1000);

    // Save test attempt
    const testAttempt = new TestAttempt({
      userId,
      category,
      questions: results.map((r) => ({
        questionId: r.questionId,
        userAnswer: r.userAnswer,
        correctAnswer: r.correctAnswer,
        isCorrect: r.correct,
      })),
      score,
      correctCount,
      totalQuestions: results.length,
      timeSpent,
      startedAt: start,
      completedAt,
    });

    await testAttempt.save();

    // Check and unlock achievements
    try {
      await checkAndUnlockAchievements(userId, testAttempt._id.toString());
    } catch (achievementError) {
      console.error('Error checking achievements:', achievementError);
      // Don't fail the submission if achievements fail
    }

    res.json({
      success: true,
      score,
      correctCount,
      totalQuestions: results.length,
      timeSpent,
      attemptId: testAttempt._id,
      results,
    });
  } catch (error: any) {
    console.error('Error submitting answers:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing answers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Admin: Get all questions with correct answers
 */
export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const {
      category,
      difficulty,
      page = 1,
      limit = DEFAULT_PAGE_LIMIT,
      includeInactive = false,
    } = req.query;

    const query: any = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (!includeInactive) query.isActive = true;

    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.min(
      Math.max(parseInt(limit as string) || DEFAULT_PAGE_LIMIT, 1),
      MAX_PAGE_LIMIT
    );

    const questions = await Question.find(query)
      .sort({ category: 1, questionId: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error getting all questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Admin: Create a new question
 */
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // Validate question structure
    const validation = validateQuestionStructure(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question structure',
        errors: validation.errors,
      });
    }

    const question = new Question(req.body);
    await question.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question,
    });
  } catch (error: any) {
    console.error('Error creating question:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A question with this ID already exists',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((e: any) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Admin: Update a question
 */
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      question,
    });
  } catch (error: any) {
    console.error('Error updating question:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((e: any) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Admin: Delete a question (soft delete by setting isActive to false)
 */
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    if (permanent === 'true') {
      // Permanent delete
      const question = await Question.findByIdAndDelete(id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }

      return res.json({
        success: true,
        message: 'Question permanently deleted',
      });
    }

    // Soft delete
    const question = await Question.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question deactivated successfully',
      question,
    });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Admin: Get question statistics
 */
export const getQuestionStats = async (req: Request, res: Response) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: {
            category: '$category',
            difficulty: '$difficulty',
            isActive: '$isActive',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          difficulties: {
            $push: {
              difficulty: '$_id.difficulty',
              isActive: '$_id.isActive',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
    ]);

    const totalQuestions = await Question.countDocuments();
    const activeQuestions = await Question.countDocuments({ isActive: true });

    res.json({
      success: true,
      stats: {
        total: totalQuestions,
        active: activeQuestions,
        inactive: totalQuestions - activeQuestions,
        byCategory: stats,
      },
    });
  } catch (error: any) {
    console.error('Error getting question stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get user's test history
 */
export const getUserTestHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const { category, page = 1, limit = DEFAULT_HISTORY_LIMIT } = req.query;

    const query: any = { userId };
    if (category) query.category = category;

    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.min(
      Math.max(parseInt(limit as string) || DEFAULT_HISTORY_LIMIT, 1),
      MAX_HISTORY_LIMIT
    );

    const attempts = await TestAttempt.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-questions.correctAnswer'); // Don't send correct answers

    const total = await TestAttempt.countDocuments(query);

    res.json({
      success: true,
      attempts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error getting test history:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving test history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const { category } = req.query;

    const stats = await TestAttempt.getUserStats(userId, category as string);

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const {
      category = VALID_CATEGORIES[BACKEND_CATEGORY],
      limit = DEFAULT_LEADERBOARD_LIMIT,
    } = req.query;

    if (!VALID_CATEGORIES.includes(category as string)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be one of the following: ' + VALID_CATEGORIES.join(','),
      });
    }

    const limitNum = Math.min(
      Math.max(parseInt(limit as string) || DEFAULT_LEADERBOARD_LIMIT, 1),
      MAX_LEADERBOARD_LIMIT
    );

    const leaderboard = await TestAttempt.getLeaderboard(
      category as string,
      limitNum
    );

    res.json({
      success: true,
      category,
      leaderboard,
    });
  } catch (error: any) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get single test attempt details
 */
export const getTestAttemptById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).userId;
    const userRole = (req.user as any).role;

    const attempt = await TestAttempt.findById(id).populate(
      'questions.questionId',
      'question category'
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found',
      });
    }

    // Only allow user to see their own attempts (unless admin)
    if (userRole !== 'admin' && attempt.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own test attempts',
      });
    }

    res.json({
      success: true,
      attempt,
    });
  } catch (error: any) {
    console.error('Error getting test attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving test attempt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
