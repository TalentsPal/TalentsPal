'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiBriefcase,
  FiFileText,
  FiTarget,
  FiAward,
  FiClock,
} from 'react-icons/fi';

export default function StudentDashboard() {
  const stats = [
    {
      icon: <FiTarget className="text-2xl" />,
      label: 'Exams Completed',
      value: '12',
      change: '+3 this week',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: <FiAward className="text-2xl" />,
      label: 'Average Score',
      value: '85%',
      change: '+5% improvement',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: <FiBriefcase className="text-2xl" />,
      label: 'Companies Viewed',
      value: '24',
      change: '+8 this month',
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      icon: <FiFileText className="text-2xl" />,
      label: 'CV Analyses',
      value: '3',
      change: 'Latest: 2 days ago',
      color: 'from-warning-500 to-warning-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-dark-900 dark:text-dark-50 mb-2">
            Welcome back, Student! 👋
          </h1>
          <p className="text-lg text-dark-600 dark:text-dark-400">
            Here's your progress overview
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}
              >
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                {stat.label}
              </div>
              <div className="text-xs text-success-600 dark:text-success-400">
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
              <FiClock className="text-primary-600" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-dark-900 dark:text-dark-50 mb-1">
                      Completed Exam #{i}
                    </div>
                    <div className="text-sm text-dark-600 dark:text-dark-400">
                      Score: {85 + i * 2}% • 2 hours ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recommended Companies */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-primary-600" />
              Recommended for You
            </h2>
            <div className="space-y-4">
              {['Tech Corp', 'Innovation Labs', 'Digital Solutions'].map((company, i) => (
                <div
                  key={company}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-dark-900 dark:text-dark-50">
                      {company}
                    </div>
                    <div className="text-sm text-dark-600 dark:text-dark-400">
                      {3 - i} open positions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
