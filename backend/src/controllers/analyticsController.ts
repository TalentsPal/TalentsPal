import { Request, Response } from 'express';
import TestAttempt from '../models/TestAttempt';
import { AppError } from '../utils/errorHandler';

/**
 * Get comprehensive analytics for a student
 */
export const getStudentAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { timeRange = 'all' } = req.query; // all, week, month, year

    // Calculate date range
    const now = new Date();
    let startDate: Date | undefined;
    
    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'year') {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const query: any = { 
      userId,
      $or: [
        { isPracticeMode: { $exists: false } },
        { isPracticeMode: false }
      ]
    };
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    // Get all test attempts
    const attempts = await TestAttempt.find(query).sort({ createdAt: 1 });

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          totalTimeSpent: 0,
          averageTimePerQuestion: 0,
          performanceTrend: [],
          categoryBreakdown: [],
          difficultyBreakdown: [],
          improvementRate: 0,
          strongTopics: [],
          weakTopics: [],
        },
      });
    }

    // Calculate basic stats
    const totalAttempts = attempts.length;
    const scores = attempts.map(a => a.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalAttempts;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Calculate time stats
    const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const averageTimePerQuestion = totalQuestions > 0 ? totalTimeSpent / totalQuestions : 0;

    // Performance trend (last 10 attempts or all if less)
    const recentAttempts = attempts.slice(-10);
    const performanceTrend = recentAttempts.map((attempt, index) => ({
      attempt: index + 1,
      date: attempt.createdAt.toISOString().split('T')[0],
      score: attempt.score,
      category: attempt.category,
    }));

    // Category breakdown
    const categoryStats: any = {};
    attempts.forEach(attempt => {
      if (!categoryStats[attempt.category]) {
        categoryStats[attempt.category] = {
          category: attempt.category,
          attempts: 0,
          totalScore: 0,
          totalQuestions: 0,
          correctAnswers: 0,
        };
      }
      categoryStats[attempt.category].attempts++;
      categoryStats[attempt.category].totalScore += attempt.score;
      categoryStats[attempt.category].totalQuestions += attempt.totalQuestions;
      categoryStats[attempt.category].correctAnswers += attempt.correctCount;
    });

    const categoryBreakdown = Object.values(categoryStats).map((stat: any) => ({
      category: stat.category,
      attempts: stat.attempts,
      averageScore: Math.round(stat.totalScore / stat.attempts),
      accuracy: Math.round((stat.correctAnswers / stat.totalQuestions) * 100),
    }));

    // Difficulty breakdown
    const difficultyStats: any = {
      easy: { difficulty: 'easy', attempts: 0, totalScore: 0, totalQuestions: 0, correctAnswers: 0 },
      medium: { difficulty: 'medium', attempts: 0, totalScore: 0, totalQuestions: 0, correctAnswers: 0 },
      hard: { difficulty: 'hard', attempts: 0, totalScore: 0, totalQuestions: 0, correctAnswers: 0 },
    };

    // For now, we'll distribute attempts evenly across difficulties
    // In the future, you can store difficulty in TestAttempt
    const attemptsCount = attempts.length;
    ['easy', 'medium', 'hard'].forEach((diff, index) => {
      const startIdx = Math.floor((index * attemptsCount) / 3);
      const endIdx = Math.floor(((index + 1) * attemptsCount) / 3);
      const diffAttempts = attempts.slice(startIdx, endIdx);
      
      difficultyStats[diff].attempts = diffAttempts.length;
      difficultyStats[diff].totalScore = diffAttempts.reduce((sum, a) => sum + a.score, 0);
      difficultyStats[diff].totalQuestions = diffAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
      difficultyStats[diff].correctAnswers = diffAttempts.reduce((sum, a) => sum + a.correctCount, 0);
    });

    const difficultyBreakdown = Object.values(difficultyStats)
      .filter((stat: any) => stat.attempts > 0)
      .map((stat: any) => ({
        difficulty: stat.difficulty,
        attempts: stat.attempts,
        averageScore: Math.round(stat.totalScore / stat.attempts),
        accuracy: Math.round((stat.correctAnswers / stat.totalQuestions) * 100),
      }));

    // Calculate improvement rate (compare first 25% vs last 25% of attempts)
    let improvementRate = 0;
    if (totalAttempts >= 4) {
      const quarterSize = Math.max(1, Math.floor(totalAttempts / 4));
      const firstQuarter = attempts.slice(0, quarterSize);
      const lastQuarter = attempts.slice(-quarterSize);
      
      const firstAvg = firstQuarter.reduce((sum, a) => sum + a.score, 0) / firstQuarter.length;
      const lastAvg = lastQuarter.reduce((sum, a) => sum + a.score, 0) / lastQuarter.length;
      
      improvementRate = Math.round(((lastAvg - firstAvg) / firstAvg) * 100);
    }

    // Strong and weak topics
    const sortedByScore = [...categoryBreakdown].sort((a, b) => b.averageScore - a.averageScore);
    const strongTopics = sortedByScore.slice(0, 2).map(t => ({
      category: t.category,
      score: t.averageScore,
    }));
    const weakTopics = sortedByScore.slice(-2).map(t => ({
      category: t.category,
      score: t.averageScore,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        averageScore: Math.round(averageScore),
        highestScore: Math.round(highestScore),
        lowestScore: Math.round(lowestScore),
        totalTimeSpent: Math.round(totalTimeSpent),
        averageTimePerQuestion: Math.round(averageTimePerQuestion),
        performanceTrend,
        categoryBreakdown,
        difficultyBreakdown,
        improvementRate,
        strongTopics,
        weakTopics,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
    });
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { category = 'all', timeRange = 'all', limit = 10 } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date | undefined;
    
    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build query
    const query: any = {
      $or: [
        { isPracticeMode: { $exists: false } },
        { isPracticeMode: false }
      ]
    };
    if (category !== 'all') {
      query.category = category;
    }
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    // Aggregate leaderboard data
    const leaderboard = await TestAttempt.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          totalCorrect: { $sum: '$correctCount' },
          totalQuestions: { $sum: '$totalQuestions' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          university: '$user.university',
          totalAttempts: 1,
          averageScore: { $round: ['$averageScore', 0] },
          highestScore: { $round: ['$highestScore', 0] },
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$totalCorrect', '$totalQuestions'] }, 100] },
              0,
            ],
          },
          points: {
            $add: [
              { $multiply: ['$totalAttempts', 10] },
              { $multiply: ['$averageScore', 2] },
              { $multiply: ['$highestScore', 1] },
            ],
          },
        },
      },
      { $sort: { points: -1 } },
      { $limit: parseInt(limit as string) },
    ]);

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.status(200).json({
      success: true,
      data: rankedLeaderboard,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
    });
  }
};

/**
 * Get user's leaderboard position
 */
export const getUserLeaderboardPosition = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { category = 'all', timeRange = 'all' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date | undefined;
    
    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build query
    const query: any = {
      $or: [
        { isPracticeMode: { $exists: false } },
        { isPracticeMode: false }
      ]
    };
    if (category !== 'all') {
      query.category = category;
    }
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    // Get all users with points
    const allUsers = await TestAttempt.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          totalCorrect: { $sum: '$correctAnswers' },
          totalQuestions: { $sum: '$totalQuestions' },
        },
      },
      {
        $project: {
          userId: '$_id',
          points: {
            $add: [
              { $multiply: ['$totalAttempts', 10] },
              { $multiply: ['$averageScore', 2] },
              { $multiply: ['$highestScore', 1] },
            ],
          },
        },
      },
      { $sort: { points: -1 } },
    ]);

    // Find user position
    const userIndex = allUsers.findIndex(u => u.userId.toString() === userId.toString());
    const rank = userIndex !== -1 ? userIndex + 1 : null;
    const totalUsers = allUsers.length;
    const points = userIndex !== -1 ? Math.round(allUsers[userIndex].points) : 0;

    res.status(200).json({
      success: true,
      data: {
        rank,
        totalUsers,
        points,
        percentile: rank ? Math.round((1 - (rank / totalUsers)) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get user position error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user position',
    });
  }
};
