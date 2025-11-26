'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiBriefcase,
  FiFileText,
  FiTarget,
  FiAward,
  FiClock,
  FiUsers,
  FiBook,
  FiStar,
  FiCalendar,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const stats = [
    {
      icon: <FiTarget className="text-2xl" />,
      label: 'Applications',
      value: '8',
      change: '+2 this week',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: <FiAward className="text-2xl" />,
      label: 'Profile Score',
      value: '85%',
      change: '+5% improvement',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: <FiBriefcase className="text-2xl" />,
      label: 'Companies Viewed',
      value: '24',
      change: '+8 this month',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: <FiUsers className="text-2xl" />,
      label: 'Connections',
      value: '156',
      change: '+12 this week',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  const quickActions = [
    {
      title: 'Browse Companies',
      description: 'Explore tech companies in Palestine',
      icon: <FiBriefcase className="text-xl" />,
      color: 'from-blue-500 to-blue-600',
      link: '/student/companies',
    },
    {
      title: 'Update Profile',
      description: 'Keep your information current',
      icon: <FiFileText className="text-xl" />,
      color: 'from-purple-500 to-purple-600',
      link: '/student/profile',
    },
    {
      title: 'CV Builder',
      description: 'Create professional resume',
      icon: <FiFileText className="text-xl" />,
      color: 'from-green-500 to-green-600',
      link: '/student/cv-builder',
    },
    {
      title: 'Interview Prep',
      description: 'Practice common questions',
      icon: <FiBook className="text-xl" />,
      color: 'from-orange-500 to-orange-600',
      link: '/student/interview-prep',
    },
  ];

  const recentActivity = [
    {
      type: 'application',
      company: 'TechCorp Palestine',
      action: 'Applied for Software Developer position',
      time: '2 hours ago',
      status: 'pending',
    },
    {
      type: 'profile',
      company: 'Innovation Labs',
      action: 'Company viewed your profile',
      time: '5 hours ago',
      status: 'info',
    },
    {
      type: 'connection',
      company: 'Digital Solutions',
      action: 'New connection request',
      time: '1 day ago',
      status: 'success',
    },
  ];

  const upcomingEvents = [
    {
      title: 'Career Fair 2025',
      date: 'Dec 15, 2025',
      time: '10:00 AM',
      location: 'Birzeit University',
      type: 'fair',
    },
    {
      title: 'Tech Workshop',
      date: 'Dec 20, 2025',
      time: '2:00 PM',
      location: 'Online',
      type: 'workshop',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container-custom py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Welcome back, {user?.fullName || 'Student'}! 👋
              </h1>
              <p className="text-lg text-purple-100">
                Ready to take the next step in your career journey?
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/student/companies">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Find Opportunities
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-dark-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                {stat.label}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
            <FiTarget className="text-purple-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.link}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-dark-700 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <h3 className="font-bold text-dark-900 dark:text-dark-50 mb-2 group-hover:text-purple-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    {action.description}
                  </p>
                  <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                    Get Started
                    <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-dark-700"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-6 flex items-center gap-2">
              <FiClock className="text-purple-600" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                      activity.status === 'pending'
                        ? 'bg-orange-100 text-orange-600'
                        : activity.status === 'success'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {activity.status === 'pending' ? (
                      <FiClock />
                    ) : activity.status === 'success' ? (
                      <FiCheckCircle />
                    ) : (
                      <FiAlertCircle />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-dark-900 dark:text-dark-50 mb-1">
                      {activity.company}
                    </div>
                    <div className="text-sm text-dark-600 dark:text-dark-400 mb-1">
                      {activity.action}
                    </div>
                    <div className="text-xs text-dark-500 dark:text-dark-500">
                      {activity.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-medium transition-colors">
              View All Activity
            </button>
          </motion.div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recommended Companies */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-dark-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 flex items-center gap-2">
                  <FiTrendingUp className="text-purple-600" />
                  Top Picks
                </h2>
                <Link
                  href="/student/companies"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {['TechCorp', 'Innovation Labs', 'Digital Hub'].map((company, i) => (
                  <motion.div
                    key={company}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {company.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-dark-900 dark:text-dark-50 truncate group-hover:text-purple-600 transition-colors">
                        {company}
                      </div>
                      <div className="text-xs text-dark-600 dark:text-dark-400">
                        {3 - i} open positions
                      </div>
                    </div>
                    <FiArrowRight className="text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-dark-700"
            >
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
                <FiCalendar className="text-purple-600" />
                Upcoming Events
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className="p-4 rounded-xl border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  >
                    <div className="font-semibold text-dark-900 dark:text-dark-50 mb-2">
                      {event.title}
                    </div>
                    <div className="text-xs text-dark-600 dark:text-dark-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-3 h-3" />
                        {event.date} • {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <FiTarget className="w-3 h-3" />
                        {event.location}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
