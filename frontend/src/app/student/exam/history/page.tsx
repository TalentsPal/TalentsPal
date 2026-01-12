'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiBook,
  FiClock,
  FiAward,
  FiCalendar,
  FiTrendingUp,
  FiFilter,
} from 'react-icons/fi';
import { getUserTestHistory, getUserStats } from '@/services/questionService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function ExamHistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'backend', label: 'Backend', icon: '⚙️' },
    { value: 'frontend', label: 'Frontend', icon: '🎨' },
  ];

  useEffect(() => {
    fetchHistory();
  }, [selectedCategory, page]);

  useEffect(() => {
    fetchStats();
  }, [selectedCategory]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserTestHistory(selectedCategory || undefined, page, 10);
      setAttempts(data.attempts || []);
      setTotalPages(data.pages || 1);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      setError(error.message || 'Failed to load exam history');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getUserStats(selectedCategory || undefined);
      if (statsData && statsData.length > 0) {
        // Aggregate stats if multiple categories
        const aggregated = statsData.reduce((acc: any, stat: any) => {
          return {
            totalAttempts: (acc.totalAttempts || 0) + (stat.totalAttempts || 0),
            averageScore: ((acc.averageScore || 0) * (acc.totalAttempts || 0) + (stat.averageScore || 0) * (stat.totalAttempts || 0)) / ((acc.totalAttempts || 0) + (stat.totalAttempts || 0)),
            highestScore: Math.max(acc.highestScore || 0, stat.highestScore || 0),
            lowestScore: acc.lowestScore ? Math.min(acc.lowestScore, stat.lowestScore || 0) : stat.lowestScore,
          };
        }, {});
        setStats(aggregated);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.push('/student/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Exam History</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <FiBook />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-xl">
                  <FiAward />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Highest Score</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.highestScore || 0)}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                  <FiTrendingUp />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageScore || 0)}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
                  <FiClock />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lowest Score</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.lowestScore || 0)}%</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="text-gray-600" />
            <span className="font-semibold text-gray-900">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" message="Loading exam history..." />
          </div>
        ) : attempts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <FiBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Exam History</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory ? 'No exams found for this category' : "You haven't taken any exams yet"}
            </p>
            <Link href="/student/exam">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                Take Your First Exam
              </button>
            </Link>
          </div>
        ) : (
          /* Attempts List */
          <>
            <div className="space-y-4">
              {attempts.map((attempt, index) => (
                <motion.div
                  key={attempt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl ${getScoreColor(attempt.score)}`}>
                        {Math.round(attempt.score)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 capitalize">{attempt.category}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreBadgeColor(attempt.score)}`}>
                            {attempt.score >= 70 ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiBook className="text-gray-400" />
                            <span>{attempt.correctCount}/{attempt.totalQuestions} correct</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock className="text-gray-400" />
                            <span>{Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-gray-400" />
                            <span>{new Date(attempt.completedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link href={`/student/exam/results?attemptId=${attempt._id}`}>
                      <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
