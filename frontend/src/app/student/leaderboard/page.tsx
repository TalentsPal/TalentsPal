'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrophy, FiAward, FiTrendingUp } from 'react-icons/fi';
import {
  getLeaderboard,
  getUserLeaderboardPosition,
  LeaderboardEntry,
  UserLeaderboardPosition,
} from '@/services/analyticsService';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<UserLeaderboardPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<'all' | 'frontend' | 'backend'>('all');
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchLeaderboardData();
  }, [category, timeRange]);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      const [leaderboardData, positionData] = await Promise.all([
        getLeaderboard(category, timeRange, 10),
        getUserLeaderboardPosition(category, timeRange),
      ]);
      setLeaderboard(leaderboardData);
      setUserPosition(positionData);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TalentsPal
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TalentsPal
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              🏆 Leaderboard
            </h1>
            <p className="text-gray-600">
              See how you rank against other students
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex gap-2">
              {['all', 'frontend', 'backend'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <div className="flex gap-2">
              {['all', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range === 'all' ? 'All Time' : `Last ${range.charAt(0).toUpperCase() + range.slice(1)}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Position Card */}
        {userPosition && userPosition.rank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 mb-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Position</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-3xl font-bold">#{userPosition.rank}</p>
                    <p className="text-sm text-blue-100">out of {userPosition.totalUsers} students</p>
                  </div>
                  <div className="h-12 w-px bg-white/30"></div>
                  <div>
                    <p className="text-2xl font-bold">{userPosition.points}</p>
                    <p className="text-sm text-blue-100">points</p>
                  </div>
                  <div className="h-12 w-px bg-white/30"></div>
                  <div>
                    <p className="text-2xl font-bold">Top {100 - userPosition.percentile}%</p>
                    <p className="text-sm text-blue-100">percentile</p>
                  </div>
                </div>
              </div>
              <FiTrendingUp className="text-6xl text-white/30" />
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center pt-8"
            >
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getRankColor(2)} flex items-center justify-center text-3xl shadow-lg mb-3`}>
                {getRankIcon(2)}
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 w-full text-center">
                <h3 className="font-bold text-gray-900 truncate">{leaderboard[1].fullName}</h3>
                <p className="text-sm text-gray-600 truncate">{leaderboard[1].university || 'N/A'}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{leaderboard[1].points}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl mb-2">👑</div>
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRankColor(1)} flex items-center justify-center text-4xl shadow-xl mb-3`}>
                {getRankIcon(1)}
              </div>
              <div className="bg-white rounded-xl shadow-xl p-6 w-full text-center border-2 border-yellow-400">
                <h3 className="font-bold text-lg text-gray-900 truncate">{leaderboard[0].fullName}</h3>
                <p className="text-sm text-gray-600 truncate">{leaderboard[0].university || 'N/A'}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{leaderboard[0].points}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center pt-12"
            >
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getRankColor(3)} flex items-center justify-center text-3xl shadow-lg mb-3`}>
                {getRankIcon(3)}
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 w-full text-center">
                <h3 className="font-bold text-gray-900 truncate">{leaderboard[2].fullName}</h3>
                <p className="text-sm text-gray-600 truncate">{leaderboard[2].university || 'N/A'}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{leaderboard[2].points}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">University</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Attempts</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Avg Score</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Accuracy</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <motion.tr
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold">{getRankIcon(entry.rank)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{entry.fullName}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{entry.university || 'N/A'}</td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">{entry.totalAttempts}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {entry.averageScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                        {entry.accuracy}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-gray-900">{entry.points}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Points System Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-6 mt-8 border border-purple-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FiAward className="text-purple-600" />
            How Points Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold text-gray-900">Attempts</p>
                <p className="text-gray-600">10 points per exam</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-semibold text-gray-900">Average Score</p>
                <p className="text-gray-600">2x your avg score</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-gray-900">Highest Score</p>
                <p className="text-gray-600">1x your best score</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
