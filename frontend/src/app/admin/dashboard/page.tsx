'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiMessageSquare,
  FiTrendingUp,
  FiActivity,
} from 'react-icons/fi';

export default function AdminDashboard() {
  const stats = [
    {
      icon: <FiUsers className="text-2xl" />,
      label: 'Total Students',
      value: '1,234',
      change: '+12% this month',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: <FiBriefcase className="text-2xl" />,
      label: 'Companies',
      value: '156',
      change: '+8 new this week',
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      icon: <FiFileText className="text-2xl" />,
      label: 'Total Exams',
      value: '89',
      change: '+5 this month',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: <FiMessageSquare className="text-2xl" />,
      label: 'Interview Questions',
      value: '2,456',
      change: '+124 this week',
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
            Admin Dashboard 🎯
          </h1>
          <p className="text-lg text-dark-600 dark:text-dark-400">
            Manage your platform and monitor analytics
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
          {/* Recent Signups */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
              <FiActivity className="text-primary-600" />
              Recent Signups
            </h2>
            <div className="space-y-4">
              {['Ahmad Hassan', 'Sara Mahmoud', 'Omar Khalil'].map((name, i) => (
                <div
                  key={name}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-dark-900 dark:text-dark-50">
                      {name}
                    </div>
                    <div className="text-sm text-dark-600 dark:text-dark-400">
                      Student • {i + 1} hour{i > 0 ? 's' : ''} ago
                    </div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Exam Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-primary-600" />
              Top Performing Exams
            </h2>
            <div className="space-y-4">
              {[
                { name: 'JavaScript Basics', attempts: 234, avg: 87 },
                { name: 'React Fundamentals', attempts: 189, avg: 82 },
                { name: 'Python Programming', attempts: 156, avg: 79 },
              ].map((exam) => (
                <div
                  key={exam.name}
                  className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-dark-900 dark:text-dark-50">
                      {exam.name}
                    </div>
                    <span className="text-sm font-semibold text-primary-600">
                      {exam.avg}%
                    </span>
                  </div>
                  <div className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                    {exam.attempts} attempts
                  </div>
                  <div className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      style={{ width: `${exam.avg}%` }}
                    />
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
