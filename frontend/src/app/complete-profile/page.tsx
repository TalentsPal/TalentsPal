'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMapPin, FiBriefcase, FiBook } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import axios from 'axios';
import { fetchUniversities, fetchMajors, fetchIndustries, fetchCities } from '@/services/metadataService';

interface FormData {
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
  
  // Dynamic data from API
  const [cities, setCities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<{ value: string; label: string }[]>([]);
  const [majors, setMajors] = useState<{ value: string; label: string }[]>([]);
  const [industries, setIndustries] = useState<{ value: string; label: string }[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
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
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
    
    // Load metadata
    const loadMetadata = async () => {
      const [citiesData, universitiesData, majorsData, industriesData] = await Promise.all([
        fetchCities(),
        fetchUniversities(),
        fetchMajors(),
        fetchIndustries(),
      ]);

      setCities(citiesData);
      setUniversities(universitiesData.map(u => ({ value: u.name, label: u.name })));
      setMajors(majorsData.map(m => ({ value: m.name, label: m.name })));
      setIndustries(industriesData.map(i => ({ value: i.name, label: i.name })));
    };

    loadMetadata();
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
      const token = localStorage.getItem('token');
      
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
      
      await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local storage or context if needed
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please provide a few more details to get started.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 text-center rounded-lg border ${role === 'student'
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`p-3 text-center rounded-lg border ${role === 'company'
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Company
                </button>
              </div>
            </div>

            {/* Common Fields */}
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

            {/* Student Fields */}
            {role === 'student' && (
              <>
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
                )}
              </>
            )}

            {/* Company Fields */}
            {role === 'company' && (
              <>
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
                )}
              </>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Complete Profile
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
