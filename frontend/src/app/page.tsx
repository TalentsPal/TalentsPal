'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  FiMapPin,
  FiGlobe,
  FiMail,
  FiBookOpen,
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { getCompanies, Company } from '@/services/companyService';
import { fetchUniversities, University } from '@/services/metadataService';

export default function HomePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companiesData, universitiesData] = await Promise.all([
          getCompanies(),
          fetchUniversities(),
        ]);

        setCompanies(companiesData.data || []);
        setUniversities(universitiesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const features = [
    {
      icon: <FiBriefcase className="text-3xl" />,
      title: 'Explore Companies',
      description: 'Browse companies in Palestine and discover opportunities',
      link: '/signup',
    },
    {
      icon: <FiTarget className="text-3xl" />,
      title: 'Practice Exams',
      description: 'Solve training and employment exams to test your skills',
      link: '/signup',
    },
    {
      icon: <FiUsers className="text-3xl" />,
      title: 'Interview Questions',
      description: 'Access real interview questions from top companies',
      link: '/signup',
    },
    {
      icon: <FiFileText className="text-3xl" />,
      title: 'CV Analysis',
      description: 'Get AI-powered feedback on your resume',
      link: '/signup',
    },
    {
      icon: <FiLinkedin className="text-3xl" />,
      title: 'LinkedIn Analysis',
      description: 'Optimize your LinkedIn profile for better opportunities',
      link: '/signup',
    },
    {
      icon: <FiTrendingUp className="text-3xl" />,
      title: 'Track Progress',
      description: 'Monitor your improvement and achievements',
      link: '/signup',
    },
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
                Explore tech companies in Palestine, prepare for interviews, and advance your career
                with comprehensive tools and resources.
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
                className="card p-8 card-hover group cursor-pointer"
                onClick={() => router.push(feature.link)}
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

      {/* Featured Companies Section */}
      <section className="py-20 bg-dark-50 dark:bg-dark-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-dark-50 mb-4">
              Tech <span className="gradient-text">Companies</span> in Palestine
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
              Browse our directory of {isLoading ? '...' : companies.length} companies in Ramallah and Nablus
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-6 bg-dark-200 dark:bg-dark-700 rounded mb-4"></div>
                  <div className="h-4 bg-dark-100 dark:bg-dark-800 rounded mb-2"></div>
                  <div className="h-4 bg-dark-100 dark:bg-dark-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.slice(0, 6).map((company, index) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6 card-hover group cursor-pointer"
                  onClick={() => router.push('/signup')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 group-hover:text-primary-600 transition-colors">
                      {company.name}
                    </h3>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white flex-shrink-0">
                      <FiBriefcase />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-dark-600 dark:text-dark-400">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="flex-shrink-0" />
                      <span>{company.city}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <FiGlobe className="flex-shrink-0" />
                        <span className="truncate">{company.website}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2">
                        <FiMail className="flex-shrink-0" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold group-hover:underline">
                        View Details
                      </span>
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && companies.length > 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button
                variant="outline"
                size="lg"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push('/signup')}
              >
                View All {companies.length} Companies
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-dark-50 mb-4">
              <span className="gradient-text">Universities</span> Database
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
              {isLoading ? 'Loading...' : `${universities.length} universities in our database`}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-5 bg-dark-200 dark:bg-dark-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {universities.slice(0, 8).map((university, index) => (
                <motion.div
                  key={university._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-4 text-center card-hover group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                    <FiBookOpen className="text-xl" />
                  </div>
                  <h4 className="font-semibold text-dark-900 dark:text-dark-50 text-sm group-hover:text-primary-600 transition-colors">
                    {university.name}
                  </h4>
                  {university.city && (
                    <p className="text-xs text-dark-500 dark:text-dark-500 mt-1">
                      {university.city}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && universities.length > 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <p className="text-dark-600 dark:text-dark-400">
                + {universities.length - 8} more universities
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-50 dark:bg-dark-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 p-12 md:p-16 text-center"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Explore Tech Opportunities?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Create your free account and start browsing companies in Palestine
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
