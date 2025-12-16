'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiTrendingUp,
  FiEye,
  FiUserCheck,
} from 'react-icons/fi';

export default function CompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user data from backend API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.data?.user || data.data;
          setUser(userData);
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  const stats = [
    {
      icon: <FiUsers className="text-2xl" />,
      label: 'Profile Views',
      value: '456',
      change: '+23% this week',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: <FiUserCheck className="text-2xl" />,
      label: 'Applications',
      value: '89',
      change: '+12 new today',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: <FiFileText className="text-2xl" />,
      label: 'Active Exams',
      value: '5',
      change: '234 total attempts',
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      icon: <FiMessageSquare className="text-2xl" />,
      label: 'Interview Questions',
      value: '12',
      change: '456 views',
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
            Welcome back, {user?.companyName || user?.fullName || 'Company'}! 🏢
          </h1>
          <p className="text-lg text-dark-600 dark:text-dark-400">
            Manage your company profile and view applicants
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
          {/* Recent Applicants */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
              <FiUserCheck className="text-primary-600" />
              Recent Applicants
            </h2>
            <div className="space-y-4">
              {[
                { name: 'Ahmad Hassan', position: 'Software Engineer', score: 92 },
                { name: 'Sara Mahmoud', position: 'UI/UX Designer', score: 88 },
                { name: 'Omar Khalil', position: 'Data Analyst', score: 85 },
              ].map((applicant) => (
                <div
                  key={applicant.name}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                    {applicant.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-dark-900 dark:text-dark-50">
                      {applicant.name}
                    </div>
                    <div className="text-sm text-dark-600 dark:text-dark-400">
                      {applicant.position}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">
                      {applicant.score}%
                    </div>
                    <div className="text-xs text-dark-500">Exam Score</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Exam Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-primary-600" />
              Your Exams Performance
            </h2>
            <div className="space-y-4">
              {[
                { name: 'Technical Assessment', attempts: 45, avg: 78 },
                { name: 'Behavioral Questions', attempts: 38, avg: 82 },
                { name: 'Case Study Analysis', attempts: 29, avg: 75 },
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
