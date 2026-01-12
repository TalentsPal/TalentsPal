/// <reference path="../types/index.d.ts" />
import { Request, Response } from 'express';
import Achievement, { AchievementType, IAchievement } from '../models/Achievement';
import TestAttempt from '../models/TestAttempt';
import { DailyChallenge } from '../models/DailyChallenge';

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  { title: string; description: string; icon: string }
> = {
  first_exam: {
    title: 'First Steps',
    description: 'Complete your first exam',
    icon: '🎯',
  },
  exam_streak_3: {
    title: '3-Day Streak',
    description: 'Complete exams for 3 consecutive days',
    icon: '🔥',
  },
  exam_streak_7: {
    title: 'Week Warrior',
    description: 'Complete exams for 7 consecutive days',
    icon: '💪',
  },
  exam_streak_30: {
    title: 'Monthly Master',
    description: 'Complete exams for 30 consecutive days',
    icon: '👑',
  },
  perfect_score: {
    title: 'Perfect Score',
    description: 'Score 100% on any exam',
    icon: '⭐',
  },
  speed_master: {
    title: 'Speed Master',
    description: 'Complete an exam in under 5 minutes',
    icon: '⚡',
  },
  improvement_champion: {
    title: 'Improvement Champion',
    description: 'Improve your average score by 20% or more',
    icon: '📈',
  },
  category_master_frontend: {
    title: 'Frontend Master',
    description: 'Complete 20 exams in Frontend category',
    icon: '🎨',
  },
  category_master_backend: {
    title: 'Backend Master',
    description: 'Complete 20 exams in Backend category',
    icon: '⚙️',
  },
  exam_count_10: {
    title: 'Getting Started',
    description: 'Complete 10 exams',
    icon: '🎓',
  },
  exam_count_50: {
    title: 'Dedicated Learner',
    description: 'Complete 50 exams',
    icon: '📚',
  },
  exam_count_100: {
    title: 'Century Club',
    description: 'Complete 100 exams',
    icon: '💯',
  },
  hard_questions_10: {
    title: 'Challenge Accepted',
    description: 'Complete 10 hard difficulty exams',
    icon: '🏆',
  },
  practice_warrior: {
    title: 'Practice Warrior',
    description: 'Complete 25 practice mode sessions',
    icon: '🥋',
  },
};

/**
 * Check and unlock achievements for a user after completing an exam
 */
export const checkAndUnlockAchievements = async (
  userId: string,
  testAttemptId: string
): Promise<IAchievement[]> => {
  try {
    const newAchievements: IAchievement[] = [];

    // Get all test attempts for the user
    const testAttempts = await TestAttempt.find({ userId }).sort({ completedAt: -1 });

    if (testAttempts.length === 0) return newAchievements;

    const latestAttempt = testAttempts[0];

    // Check First Exam
    if (testAttempts.length === 1) {
      const achievement = await unlockAchievement(userId, 'first_exam');
      if (achievement) newAchievements.push(achievement);
    }

    // Check Perfect Score
    if (latestAttempt.score === 100) {
      const achievement = await unlockAchievement(userId, 'perfect_score');
      if (achievement) newAchievements.push(achievement);
    }

    // Check Speed Master (less than 5 minutes = 300 seconds)
    if (latestAttempt.timeSpent < 300) {
      const achievement = await unlockAchievement(userId, 'speed_master');
      if (achievement) newAchievements.push(achievement);
    }

    // Check Exam Count Milestones
    const realExams = testAttempts.filter((a) => !a.isPracticeMode);
    if (realExams.length >= 10) {
      const achievement = await unlockAchievement(userId, 'exam_count_10');
      if (achievement) newAchievements.push(achievement);
    }
    if (realExams.length >= 50) {
      const achievement = await unlockAchievement(userId, 'exam_count_50');
      if (achievement) newAchievements.push(achievement);
    }
    if (realExams.length >= 100) {
      const achievement = await unlockAchievement(userId, 'exam_count_100');
      if (achievement) newAchievements.push(achievement);
    }

    // Check Category Masters
    const frontendExams = realExams.filter((a) => a.category === 'frontend');
    const backendExams = realExams.filter((a) => a.category === 'backend');
    
    if (frontendExams.length >= 20) {
      const achievement = await unlockAchievement(userId, 'category_master_frontend');
      if (achievement) newAchievements.push(achievement);
    }
    if (backendExams.length >= 20) {
      const achievement = await unlockAchievement(userId, 'category_master_backend');
      if (achievement) newAchievements.push(achievement);
    }

    // Check Practice Warrior
    const practiceExams = testAttempts.filter((a) => a.isPracticeMode);
    if (practiceExams.length >= 25) {
      const achievement = await unlockAchievement(userId, 'practice_warrior');
      if (achievement) newAchievements.push(achievement);
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

/**
 * Unlock a specific achievement for a user
 */
const unlockAchievement = async (
  userId: string,
  type: AchievementType
): Promise<IAchievement | null> => {
  try {
    // Check if already unlocked
    const existing = await Achievement.findOne({ userId, type });
    if (existing) return null;

    const definition = ACHIEVEMENT_DEFINITIONS[type];

    const achievement = await Achievement.create({
      userId,
      type,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
    });

    return achievement;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return null;
  }
};

/**
 * Get all achievements for a user
 */
export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;

    const achievements = await Achievement.find({ userId }).sort({ unlockedAt: -1 });

    // Get all available achievements
    const allAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => {
      const unlocked = achievements.find((a) => a.type === type);
      return {
        type,
        ...def,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        achievements: allAchievements,
        unlockedCount: achievements.length,
        totalCount: Object.keys(ACHIEVEMENT_DEFINITIONS).length,
      },
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
    });
  }
};

/**
 * Get achievement progress for a user
 */
export const getAchievementProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;

    const testAttempts = await TestAttempt.find({ userId });
    const realExams = testAttempts.filter((a) => !a.isPracticeMode);
    const practiceExams = testAttempts.filter((a) => a.isPracticeMode);
    const dailyChallenges = await DailyChallenge.find({ userId, completed: true });

    const frontendExams = realExams.filter((a) => a.category === 'frontend');
    const backendExams = realExams.filter((a) => a.category === 'backend');

    const perfectScores = realExams.filter((a) => a.score === 100).length;
    const speedMasters = realExams.filter((a) => a.timeSpent < 300).length;

    const progress = {
      totalExams: realExams.length,
      practiceExams: practiceExams.length,
      frontendExams: frontendExams.length,
      backendExams: backendExams.length,
      perfectScores,
      speedMasters,
      dailyChallengesCompleted: dailyChallenges.length,
    };

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Get achievement progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement progress',
    });
  }
};
