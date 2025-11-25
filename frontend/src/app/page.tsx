'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiBriefcase,
  FiFileText,
  FiLinkedin,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiCheckCircle,
} from 'react-icons/fi';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const features = [
    {
      icon: <FiBriefcase className="text-3xl" />,
      title: 'Explore Companies',
      description: 'Browse companies in Palestine and discover opportunities',
    },
    {
      icon: <FiTarget className="text-3xl" />,
      title: 'Practice Exams',
      description: 'Solve training and employment exams to test your skills',
    },
    {
      icon: <FiUsers className="text-3xl" />,
      title: 'Interview Questions',
      description: 'Access real interview questions from top companies',
    },
    {
      icon: <FiFileText className="text-3xl" />,
      title: 'CV Analysis',
      description: 'Get AI-powered feedback on your resume',
    },
    {
      icon: <FiLinkedin className="text-3xl" />,
      title: 'LinkedIn Analysis',
      description: 'Optimize your LinkedIn profile for better opportunities',
    },
    {
      icon: <FiTrendingUp className="text-3xl" />,
      title: 'Track Progress',
      description: 'Monitor your improvement and achievements',
    },
  ];

  const stats = [
    { value: '500+', label: 'Students' },
    { value: '100+', label: 'Companies' },
    { value: '50+', label: 'Exams' },
    { value: '1000+', label: 'Interview Questions' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container-custom py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6"
              >
                <FiAward />
                <span>Your Career Success Partner</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-dark-900 dark:text-dark-50 mb-6 leading-tight">
                Launch Your Career in{' '}
                <span className="gradient-text">Palestine</span>
              </h1>

              <p className="text-xl text-dark-600 dark:text-dark-400 mb-8 leading-relaxed">
                TalentsPal helps students and graduates explore companies, prepare for interviews,
                and land their dream jobs with AI-powered tools and real-world practice.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button variant="primary" size="lg" rightIcon={<FiArrowRight />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold gradient-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-dark-600 dark:text-dark-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-3xl transform rotate-6 opacity-20 blur-3xl" />
                <div className="relative bg-white dark:bg-dark-900 rounded-3xl shadow-2xl p-8 border border-dark-100 dark:border-dark-800">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.2 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                          <FiCheckCircle className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded-full mb-2" style={{ width: `${80 - i * 15}%` }} />
                          <div className="h-2 bg-dark-100 dark:bg-dark-600 rounded-full" style={{ width: `${60 - i * 10}%` }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-dark-50 mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
              Comprehensive tools and resources to help you prepare for your career journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card p-8 card-hover group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-3">
                  {feature.title}
                </h3>
                <p className="text-dark-600 dark:text-dark-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 p-12 md:p-16 text-center"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join hundreds of students who are already preparing for their dream careers
              </p>
              <Link href="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-white/90 border-white"
                  rightIcon={<FiArrowRight />}
                >
                  Create Free Account
                </Button>
              </Link>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
