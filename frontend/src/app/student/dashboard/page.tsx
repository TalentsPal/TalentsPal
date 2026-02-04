'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiBriefcase,
  FiFileText,
  FiTarget,
  FiAward,
  FiBook,
  FiArrowRight,
  FiCheckCircle,
  FiLogOut,
  FiUser,
  FiClock,
  FiTrendingUp,
} from 'react-icons/fi';
import { getUserStats, getUserTestHistory } from '@/services/questionService';
import DailyChallengeCard from '@/components/DailyChallengeCard';
import { logoutUser, simpleLogout } from '@/services/authService';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    examsTaken: 0,
    lastScore: 0,
    averageScore: 0,
    highestScore: 0,
    profileCompletion: 0,
    totalQuestions: 0,
    totalCorrect: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        // Fetch user data
        const { getCurrentUser } = await import('@/services/authService');
        const userData = await getCurrentUser();

        // Check structure
        const user = userData.data?.user || userData.data;
        if (!user) {
          throw new Error('User data not found');
        }

        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));

        // Calculate profile completion
        let completion = 0;
        if (user.fullName) completion += 15;
        if (user.email) completion += 15;
        if (user.phone) completion += 15;
        if (user.university) completion += 15;
        if (user.major) completion += 15;
        if (user.city) completion += 10;
        if (user.graduationYear) completion += 10;
        if (user.linkedInUrl) completion += 5;

        // Fetch user stats
        const userStats = await getUserStats();

        // Fetch recent test history
        const history = await getUserTestHistory(undefined, 1, 5);
        setRecentAttempts(history.attempts || []);

        // Calculate stats
        let totalAttempts = 0;
        let avgScore = 0;
        let maxScore = 0;
        let totalQs = 0;
        let totalCorrect = 0;

        if (userStats && userStats.length > 0) {
          userStats.forEach((stat: any) => {
            totalAttempts += stat.totalAttempts || 0;
            avgScore += (stat.averageScore || 0) * (stat.totalAttempts || 0);
            maxScore = Math.max(maxScore, stat.highestScore || 0);
            totalQs += stat.totalQuestions || 0;
            totalCorrect += stat.totalCorrect || 0;
          });

          if (totalAttempts > 0) {
            avgScore = Math.round(avgScore / totalAttempts);
          }
        }

        // Get last score from recent attempts
        const lastScore = history.attempts && history.attempts.length > 0
          ? history.attempts[0].score
          : 0;

        setStats({
          examsTaken: totalAttempts,
          lastScore: Math.round(lastScore),
          averageScore: avgScore,
          highestScore: Math.round(maxScore),
          profileCompletion: completion,
          totalQuestions: totalQs,
          totalCorrect: totalCorrect,
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      simpleLogout();
    }
  };

  const quickActions = [
    {
      title: 'Take Exam',
      description: 'Test your skills with technical questions',
      icon: <FiBook className="text-2xl" />,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      link: '/student/exam',
    },
    {
      title: 'Practice Mode',
      description: 'Practice unlimited questions without pressure',
      icon: <FiTarget className="text-2xl" />,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
      link: '/student/practice',
    },
    {
      title: 'Browse Companies',
      description: 'Discover companies hiring in Palestine',
      icon: <FiBriefcase className="text-2xl" />,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      link: '/student/companies',
    },
    {
      title: 'My Achievements',
      description: 'View your unlocked badges and progress',
      icon: <FiAward className="text-2xl" />,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      hoverColor: 'hover:from-yellow-600 hover:to-yellow-700',
      link: '/student/achievements',
    },
    {
      title: 'Performance Analytics',
      description: 'Track your progress with detailed charts',
      icon: <FiTrendingUp className="text-2xl" />,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      link: '/student/analytics',
    },
    {
      title: 'Leaderboard',
      description: 'See how you rank against other students',
      icon: <FiAward className="text-2xl" />,
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
      link: '/student/leaderboard',
    },
  ];

  const statCards = [
    {
      icon: <FiBook />,
      label: 'Exams Taken',
      value: stats.examsTaken,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <FiAward />,
      label: 'Highest Score',
      value: stats.highestScore ? `${stats.highestScore}%` : 'N/A',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: <FiTarget />,
      label: 'Average Score',
      value: stats.averageScore ? `${stats.averageScore}%` : 'N/A',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: <FiCheckCircle />,
      label: 'Profile Complete',
      value: `${stats.profileCompletion}%`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TalentsPal
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to advance your career? Start by taking an exam or exploring companies.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} ${stat.color} flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiTarget className="text-blue-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <div className={`${action.color} ${action.hoverColor} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 duration-200`}>
                  <div className="mb-4">
                    {action.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-2">{action.title}</h4>
                  <p className="text-white/90 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Get Started
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Daily Challenge Card */}
        <div className="mb-8">
          <DailyChallengeCard />
        </div>

        {/* Profile Completion Banner */}
        {stats.profileCompletion < 100 && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="text-xl font-bold mb-2">Complete Your Profile</h4>
                <p className="text-white/90">Your profile is {stats.profileCompletion}% complete. Add more details to get noticed by companies!</p>
              </div>
              <Link href="/student/profile">
                <button className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-md">
                  Complete Now
                </button>
              </Link>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${stats.profileCompletion}%` }}
              />
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Recent Exams */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="text-blue-600" />
              Recent Exam Attempts
            </h4>
            <div className="space-y-3">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt, index) => (
                  <div key={attempt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${attempt.score >= 70 ? 'bg-green-500' : attempt.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                        {Math.round(attempt.score)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{attempt.category}</p>
                        <p className="text-xs text-gray-500">
                          {attempt.correctCount}/{attempt.totalQuestions} correct • {Math.floor(attempt.timeSpent / 60)}m
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiBook className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No exams taken yet</p>
                  <Link href="/student/exam">
                    <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Take your first exam →
                    </button>
                  </Link>
                </div>
              )}
            </div>
            {recentAttempts.length > 0 && (
              <Link href="/student/exam/history">
                <button className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors border border-blue-200">
                  View All Attempts
                </button>
              </Link>
            )}
          </div>

          {/* Getting Started */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTarget className="text-purple-600" />
              Getting Started
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {stats.profileCompletion >= 100 ? '✓' : '1'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Complete your profile</p>
                  <p className="text-sm text-gray-600">Add your skills, education, and experience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {stats.examsTaken > 0 ? '✓' : '2'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Take technical exams</p>
                  <p className="text-sm text-gray-600">Prove your skills with our assessment tests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900">Browse companies</p>
                  <p className="text-sm text-gray-600">Find opportunities that match your skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info - Moved below */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiFileText className="text-purple-600" />
            Your Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">University</p>
              <p className="font-medium text-gray-900">{user?.university || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Major</p>
              <p className="font-medium text-gray-900">{user?.major || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-medium text-gray-900">{user?.city || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">{user?.phone || 'Not specified'}</p>
            </div>
          </div>
          <Link href="/student/profile">
            <button className="w-full mt-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors border border-purple-200">
              Edit Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
