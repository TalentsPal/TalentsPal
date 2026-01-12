import { Request, Response } from 'express';
import { DailyChallenge, UserStreak } from '../models/DailyChallenge';
import Question from '../models/Question';
import { AppError } from '../utils/errorHandler';

/**
 * Get or create today's challenge for a user
 */
export const getTodayChallenge = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;

    // Get today's date at midnight (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if challenge already exists for today
    let challenge = await DailyChallenge.findOne({
      userId,
      date: today,
    }).populate('questionId');

    // If no challenge exists, create one
    if (!challenge) {
      // Randomly select category and difficulty
      const categories = ['backend', 'frontend'];
      const difficulties = ['easy', 'medium', 'hard'];
      
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

      // Get a random question
      const questions = await Question.getRandomQuestions(randomCategory, 1, randomDifficulty);
      
      if (questions.length === 0) {
        throw new AppError('No questions available for daily challenge', 404);
      }

      challenge = await DailyChallenge.create({
        userId,
        date: today,
        questionId: questions[0]._id,
        category: randomCategory as 'backend' | 'frontend',
        difficulty: randomDifficulty as 'easy' | 'medium' | 'hard',
        completed: false,
      });

      challenge = await DailyChallenge.findById(challenge._id).populate('questionId');
    }

    // Get user streak info
    const streakInfo = await UserStreak.findOne({ userId });

    res.status(200).json({
      success: true,
      data: {
        challenge,
        streak: streakInfo || {
          currentStreak: 0,
          longestStreak: 0,
          totalChallengesCompleted: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get today challenge error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching daily challenge',
    });
  }
};

/**
 * Submit answer for today's challenge
 */
export const submitChallengeAnswer = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { userAnswer } = req.body;

    if (!userAnswer) {
      throw new AppError('Answer is required', 400);
    }

    // Get today's challenge
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await DailyChallenge.findOne({
      userId,
      date: today,
    }).populate('questionId');

    if (!challenge) {
      throw new AppError('No challenge found for today', 404);
    }

    if (challenge.completed) {
      throw new AppError('Challenge already completed', 400);
    }

    // Check if answer is correct
    const question = challenge.questionId as any;
    const isCorrect = userAnswer === question.correctAnswer;

    // Update challenge
    challenge.userAnswer = userAnswer;
    challenge.isCorrect = isCorrect;
    challenge.completed = true;
    challenge.completedAt = new Date();
    await challenge.save();

    // Update user streak
    let streakInfo = await UserStreak.findOne({ userId });
    
    if (!streakInfo) {
      streakInfo = await UserStreak.create({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: today,
        totalChallengesCompleted: 1,
      });
    } else {
      const lastCompleted = new Date(streakInfo.lastCompletedDate);
      lastCompleted.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if completed yesterday (streak continues)
      if (lastCompleted.getTime() === yesterday.getTime()) {
        streakInfo.currentStreak += 1;
        if (streakInfo.currentStreak > streakInfo.longestStreak) {
          streakInfo.longestStreak = streakInfo.currentStreak;
        }
      } 
      // Check if completed before yesterday (streak broken)
      else if (lastCompleted.getTime() < yesterday.getTime()) {
        streakInfo.currentStreak = 1;
      }
      // If completed today already, don't update streak

      streakInfo.lastCompletedDate = today;
      streakInfo.totalChallengesCompleted += 1;
      await streakInfo.save();
    }

    res.status(200).json({
      success: true,
      data: {
        challenge,
        streak: streakInfo,
        isCorrect,
        correctAnswer: question.correctAnswer,
      },
    });
  } catch (error) {
    console.error('Submit challenge answer error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error submitting challenge answer',
    });
  }
};

/**
 * Get user streak information
 */
export const getUserStreak = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;

    let streakInfo = await UserStreak.findOne({ userId });
    
    if (!streakInfo) {
      streakInfo = await UserStreak.create({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        totalChallengesCompleted: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: streakInfo,
    });
  } catch (error) {
    console.error('Get user streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching streak information',
    });
  }
};

/**
 * Get challenge history for a user
 */
export const getChallengeHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);

    const challenges = await DailyChallenge.find({ userId, completed: true })
      .populate('questionId')
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await DailyChallenge.countDocuments({ userId, completed: true });

    res.status(200).json({
      success: true,
      data: {
        challenges,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get challenge history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching challenge history',
    });
  }
};

/**
 * Reset today's challenge (for testing purposes)
 */
export const resetTodayChallenge = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;

    // Get today's date at midnight (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find and delete today's challenge
    const result = await DailyChallenge.deleteOne({
      userId,
      date: today,
    });

    if (result.deletedCount === 0) {
      throw new AppError('No challenge found for today', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Today\'s challenge has been reset',
    });
  } catch (error) {
    console.error('Reset challenge error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error resetting challenge',
    });
  }
};
