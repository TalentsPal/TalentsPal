'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserAchievements, UserAchievements } from '@/services/featuresService';

export default function AchievementsPage() {
  const [data, setData] = useState<UserAchievements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const achievements = await getUserAchievements();
      setData(achievements);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAchievements = data?.achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TalentsPal
              </h1>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              🏆 Achievements
            </h1>
            <p className="text-gray-600">Unlock badges by completing challenges and reaching milestones</p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="text-4xl mb-2">🏅</div>
            <div className="text-3xl font-bold mb-1">{data?.unlockedCount || 0}</div>
            <div className="text-yellow-100 text-sm">Unlocked Achievements</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold mb-1">{data?.totalCount || 0}</div>
            <div className="text-purple-100 text-sm">Total Achievements</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold mb-1">
              {data ? Math.round((data.unlockedCount / data.totalCount) * 100) : 0}%
            </div>
            <div className="text-green-100 text-sm">Completion Rate</div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({data?.totalCount || 0})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'unlocked'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unlocked ({data?.unlockedCount || 0})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'locked'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Locked ({data ? data.totalCount - data.unlockedCount : 0})
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements?.map((achievement, index) => (
            <motion.div
              key={achievement.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl shadow-lg p-6 border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-white to-purple-50 border-purple-300 hover:shadow-xl'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Icon */}
              <div className={`text-6xl mb-4 ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>

              {/* Badge */}
              {achievement.unlocked && (
                <div className="inline-block mb-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border-2 border-green-300">
                    ✓ UNLOCKED
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className={`text-xl font-bold mb-2 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {achievement.title}
              </h3>

              {/* Description */}
              <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                {achievement.description}
              </p>

              {/* Unlock Date */}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-purple-600 font-semibold mt-4 pt-4 border-t border-purple-200">
                  Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}

              {/* Locked State */}
              {!achievement.unlocked && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-300">
                  <div className="text-gray-400 text-2xl">🔒</div>
                  <span className="text-xs text-gray-500 font-semibold">Keep working to unlock!</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements?.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Achievements Yet</h3>
            <p className="text-gray-600">Start taking exams and complete challenges to unlock achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}
