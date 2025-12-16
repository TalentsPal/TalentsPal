'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMapPin, FiBriefcase, FiBook, FiCalendar, FiMail } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import axios from 'axios';
import { fetchUniversities, fetchMajors, fetchIndustries, fetchCities } from '@/services/metadataService';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  university: string;
  universityOther: string;
  major: string;
  majorOther: string;
  graduationYear: string;
  companyName: string;
  companyLocation: string;
  industry: string;
  industryOther: string;
  [key: string]: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('student');
  const isInitialized = useRef(false);
  
  // Dynamic data from API
  const [cities, setCities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<{ value: string; label: string }[]>([]);
  const [majors, setMajors] = useState<{ value: string; label: string }[]>([]);
  const [industries, setIndustries] = useState<{ value: string; label: string }[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    university: '',
    universityOther: '',
    major: '',
    majorOther: '',
    graduationYear: '',
    // Company fields
    companyName: '',
    companyLocation: '',
    industry: '',
    industryOther: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (isInitialized.current) return;
    isInitialized.current = true;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch user data from backend API
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.data?.user || data.data;
          console.log('Fetched user data from API:', user);
          
          // Pre-fill form with fresh data from backend
          setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            city: user.city || '',
            university: user.university || '',
            universityOther: '',
            major: user.major || '',
            majorOther: '',
            graduationYear: user.graduationYear || '',
            companyName: user.companyName || '',
            companyLocation: user.companyLocation || '',
            industry: user.industry || '',
            industryOther: '',
          });
          
          // Set role from user data
          if (user.role) {
            setRole(user.role);
          }

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };
    
    // Load metadata and user data in parallel
    const loadData = async () => {
      const [citiesData, universitiesData, majorsData, industriesData] = await Promise.all([
        fetchCities(),
        fetchUniversities(),
        fetchMajors(),
        fetchIndustries(),
        fetchUserData(),
      ]);

      setCities(citiesData);
      setUniversities(universitiesData.map(u => ({ value: u.name, label: u.name })));
      setMajors(majorsData.map(m => ({ value: m.name, label: m.name })));
      setIndustries(industriesData.map(i => ({ value: i.name, label: i.name })));
    };

    loadData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      
      // Prepare data with "Other" field values
      const submitData = {
        ...formData,
        role,
        university: formData.university === 'Other' ? formData.universityOther : formData.university,
        major: formData.major === 'Other' ? formData.majorOther : formData.major,
        industry: formData.industry === 'Other' ? formData.industryOther : formData.industry,
      };
      
      // Remove the "Other" temporary fields
      delete submitData.universityOther;
      delete submitData.majorOther;
      delete submitData.industryOther;
      
      const response = await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch updated user data and store it
      if (response.data.success) {
        try {
          const userResponse = await axios.get(
            'http://localhost:5000/api/auth/me',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (userResponse.data.success && userResponse.data.data) {
            localStorage.setItem('user', JSON.stringify(userResponse.data.data));
          }
        } catch (err) {
          console.error('Failed to fetch updated user data:', err);
        }
      }

      // Redirect to dashboard
      if (role === 'student') {
        router.push('/student/dashboard');
      } else {
        router.push('/company/dashboard');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update profile');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg"
          >
            <FiUser className="text-white text-3xl" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
          >
            Complete Your Profile
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Please provide a few more details to get started.
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <p className="text-red-700 dark:text-red-400 text-sm text-center">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                I am a... <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setRole('student')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 text-center rounded-xl border-2 transition-all duration-200 ${
                    role === 'student'
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 border-transparent text-white shadow-lg'
                      : 'bg-white dark:bg-dark-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FiUser className="text-2xl" />
                    <span className="font-semibold">Student</span>
                  </div>
                  {role === 'student' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setRole('company')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 text-center rounded-xl border-2 transition-all duration-200 ${
                    role === 'company'
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 border-transparent text-white shadow-lg'
                      : 'bg-white dark:bg-dark-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FiBriefcase className="text-2xl" />
                    <span className="font-semibold">Company</span>
                  </div>
                  {role === 'company' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-5">
              <Input
                id="fullName"
                name="fullName"
                type="text"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                disabled
                icon={<FiUser />}
                placeholder="Your full name"
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                disabled
                icon={<FiMail />}
                placeholder="your@email.com"
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                icon={<FiPhone />}
                placeholder="05XXXXXXXX"
              />

              <Select
                id="city"
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                options={cities.map((city) => ({
                  value: city,
                  label: city,
                }))}
                placeholder="Select your city"
                required
              />
            </div>

            {/* Student Fields */}
            {role === 'student' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <FiBook className="text-purple-600 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Academic Information
                  </h3>
                </div>

                <Select
                  id="university"
                  name="university"
                  label="University"
                  value={formData.university}
                  onChange={handleChange}
                  options={universities}
                  placeholder="Select your university"
                />
                
                {formData.university === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Input
                      id="universityOther"
                      name="universityOther"
                      type="text"
                      label="Please specify your university"
                      value={formData.universityOther}
                      onChange={handleChange}
                      required
                      icon={<FiBook />}
                      placeholder="Enter university name"
                    />
                  </motion.div>
                )}

                <Select
                  id="major"
                  name="major"
                  label="Major / Field of Study"
                  value={formData.major}
                  onChange={handleChange}
                  options={majors}
                  placeholder="Select your major"
                />

                {formData.major === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Input
                      id="majorOther"
                      name="majorOther"
                      type="text"
                      label="Please specify your major"
                      value={formData.majorOther}
                      onChange={handleChange}
                      required
                      icon={<FiBriefcase />}
                      placeholder="Enter your major"
                    />
                  </motion.div>
                )}

                <Input
                  id="graduationYear"
                  name="graduationYear"
                  type="text"
                  label="Graduation Year"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  icon={<FiCalendar />}
                  placeholder={`e.g., ${new Date().getFullYear()}`}
                />
              </motion.div>
            )}

            {/* Company Fields */}
            {role === 'company' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <FiBriefcase className="text-blue-600 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Company Information
                  </h3>
                </div>

                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  icon={<FiBriefcase />}
                  placeholder="Your company name"
                />
                
                <Select
                  id="industry"
                  name="industry"
                  label="Industry"
                  value={formData.industry}
                  onChange={handleChange}
                  options={industries}
                  placeholder="Select industry"
                  required
                />

                {formData.industry === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Input
                      id="industryOther"
                      name="industryOther"
                      type="text"
                      label="Please specify your industry"
                      value={formData.industryOther}
                      onChange={handleChange}
                      required
                      icon={<FiBriefcase />}
                      placeholder="Enter your industry"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              isLoading={isLoading}
            >
              Complete Profile
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
