'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiLinkedin,
  FiBookOpen,
  FiCalendar,
  FiTarget,
  FiBriefcase,
  FiFileText,
} from 'react-icons/fi';
import { HiOfficeBuilding } from 'react-icons/hi';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import MultiSelect from '@/components/ui/MultiSelect';
import { SignupFormData, UserRole, FormErrors } from '@/types';
import { validateSignupForm, getPasswordStrength } from '@/utils/validation';
import { fetchUniversities, fetchMajors, fetchIndustries, fetchCities } from '@/services/metadataService';

const PALESTINIAN_CITIES = [
  'Jerusalem',
  'Ramallah',
  'Bethlehem',
  'Hebron',
  'Nablus',
  'Jenin',
  'Tulkarm',
  'Qalqilya',
  'Salfit',
  'Jericho',
  'Gaza',
  'Khan Yunis',
  'Rafah',
  'Deir al-Balah',
  'Jabalia',
];

const UNIVERSITIES = [
  'Birzeit University',
  'An-Najah National University',
  'Bethlehem University',
  'Hebron University',
  'Palestine Polytechnic University',
  'Palestine Technical University',
  'Al-Quds University',
  'Islamic University of Gaza',
  'Al-Azhar University',
  'University College of Applied Sciences',
  'Arab American University',
  'Other',
];

const INDUSTRIES = [
  'Technology & IT',
  'Finance & Banking',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Construction',
  'Telecommunications',
  'Tourism & Hospitality',
  'Agriculture',
  'Media & Marketing',
  'NGO & Development',
  'Other',
];

const INTEREST_OPTIONS = [
  { value: 'training', label: 'Training & Internships' },
  { value: 'job', label: 'Full-time Employment' },
  { value: 'interview-prep', label: 'Interview Preparation' },
];

const MAJORS = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Computer Engineering',
  'Business Administration',
  'Accounting',
  'Finance',
  'Marketing',
  'Economics',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Industrial Engineering',
  'Architecture',
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Dentistry',
  'Law',
  'English Language',
  'Arabic Language',
  'Translation',
  'Journalism',
  'Media & Communication',
  'Graphic Design',
  'Interior Design',
  'Psychology',
  'Social Work',
  'Education',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Agriculture',
  'Other',
];

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Dynamic data from API
  const [cities, setCities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<{ value: string; label: string }[]>([]);
  const [majors, setMajors] = useState<{ value: string; label: string }[]>([]);
  const [industries, setIndustries] = useState<{ value: string; label: string }[]>([]);
  
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    city: '',
    university: '',
    universityOther: '',
    linkedInUrl: '',
    major: '',
    majorOther: '',
    graduationYear: '',
    interests: [],
    companyName: '',
    companyEmail: '',
    companyLocation: '',
    industry: '',
    industryOther: '',
    description: '',
  });

  // Fetch metadata on component mount
  useEffect(() => {
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
  }, []);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setFormData((prev) => ({ ...prev, role }));
    setErrors({});
  };

  const handleInterestsChange = (interests: string[]) => {
    setFormData((prev) => ({ ...prev, interests }));
    if (errors.interests) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.interests;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data with "Other" field values
      const submitData = {
        ...formData,
        university: formData.university === 'Other' ? formData.universityOther : formData.university,
        major: formData.major === 'Other' ? formData.majorOther : formData.major,
        industry: formData.industry === 'Other' ? formData.industryOther : formData.industry,
      };
      
      // Remove the "Other" temporary fields
      delete submitData.universityOther;
      delete submitData.majorOther;
      delete submitData.industryOther;

      // Call the backend API
      const { signupUser } = await import('@/services/authService');
      const response = await signupUser(submitData);

      // Redirect based on role
      const redirectPaths = {
        student: '/student/dashboard',
        admin: '/admin/dashboard',
        company: '/company/dashboard',
      };

      router.push(redirectPaths[formData.role]);
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold gradient-text mb-4"
          >
            Join TalentsPal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-dark-600 dark:text-dark-400"
          >
            Start your journey to career success in Palestine
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl p-4">
                <p className="text-danger-700 dark:text-danger-400 text-sm">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Role Selection */}
            <Select
              id="role"
              name="role"
              label="I am a"
              value={formData.role}
              onChange={handleRoleChange}
              options={[
                { value: 'student', label: 'Student / Graduate' },
                { value: 'company', label: 'Company' },
              ]}
              required
              error={errors.role}
            />

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="fullName"
                name="fullName"
                type="text"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                icon={<FiUser />}
                placeholder="Enter your full name"
                required
                error={errors.fullName}
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                icon={<FiMail />}
                placeholder="your.email@example.com"
                required
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<FiLock />}
                  placeholder="Create a strong password"
                  required
                  error={errors.password}
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.level === 'weak'
                            ? 'bg-danger-500'
                            : passwordStrength.level === 'medium'
                              ? 'bg-warning-500'
                              : 'bg-success-500'
                            }`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-dark-600 dark:text-dark-400">
                        {passwordStrength.feedback}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<FiLock />}
                placeholder="Re-enter your password"
                required
                error={errors.confirmPassword}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                icon={<FiPhone />}
                placeholder="05XXXXXXXX"
                required
                error={errors.phone}
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
                error={errors.city}
              />
            </div>

            <Select
              id="university"
              name="university"
              label="University"
              value={formData.university}
              onChange={handleChange}
              options={universities}
              placeholder="Select your university"
              error={errors.university}
            />

            {formData.university === 'Other' && (
              <Input
                id="universityOther"
                name="universityOther"
                type="text"
                label="Please specify your university"
                value={formData.universityOther || ''}
                onChange={handleChange}
                icon={<FiBookOpen />}
                placeholder="Enter university name"
                required
                error={errors.universityOther}
              />
            )}

            {/* Student-specific Fields */}
            {formData.role === 'student' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-6 border-t border-dark-200 dark:border-dark-700"
              >
                <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-50 flex items-center gap-2">
                  <FiBookOpen className="text-primary-600" />
                  Student Information
                </h3>

                <Input
                  id="linkedInUrl"
                  name="linkedInUrl"
                  type="url"
                  label="LinkedIn Profile URL"
                  value={formData.linkedInUrl}
                  onChange={handleChange}
                  icon={<FiLinkedin />}
                  placeholder="https://linkedin.com/in/yourprofile"
                  error={errors.linkedInUrl}
                  helperText="We'll use this to analyze your profile"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    id="major"
                    name="major"
                    label="Major / Field of Study"
                    value={formData.major}
                    onChange={handleChange}
                    options={majors}
                    placeholder="Select your major"
                    error={errors.major}
                  />

                  <Input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    label="Graduation Year"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    icon={<FiCalendar />}
                    placeholder="e.g., 2024"
                    min="1950"
                    max={new Date().getFullYear() + 10}
                    error={errors.graduationYear}
                  />
                </div>

                {formData.major === 'Other' && (
                  <Input
                    id="majorOther"
                    name="majorOther"
                    type="text"
                    label="Please specify your major"
                    value={formData.majorOther || ''}
                    onChange={handleChange}
                    icon={<FiBookOpen />}
                    placeholder="Enter your major"
                    required
                    error={errors.majorOther}
                  />
                )}

                <MultiSelect
                  id="interests"
                  label="I'm interested in"
                  options={INTEREST_OPTIONS}
                  value={formData.interests || []}
                  onChange={handleInterestsChange}
                  placeholder="Select your interests"
                  required
                  error={errors.interests}
                  helperText="Select all that apply"
                />
              </motion.div>
            )}

            {/* Company-specific Fields */}
            {formData.role === 'company' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-6 border-t border-dark-200 dark:border-dark-700"
              >
                <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-50 flex items-center gap-2">
                  <HiOfficeBuilding className="text-primary-600" />
                  Company Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    label="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    icon={<HiOfficeBuilding />}
                    placeholder="Your company name"
                    required
                    error={errors.companyName}
                  />

                  <Input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    label="Company Email"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    icon={<FiMail />}
                    placeholder="contact@company.com"
                    required
                    error={errors.companyEmail}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="companyLocation"
                    name="companyLocation"
                    type="text"
                    label="Company Location"
                    value={formData.companyLocation}
                    onChange={handleChange}
                    icon={<FiMapPin />}
                    placeholder="Full address"
                    required
                    error={errors.companyLocation}
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
                    error={errors.industry}
                  />
                </div>

                {formData.industry === 'Other' && (
                  <Input
                    id="industryOther"
                    name="industryOther"
                    type="text"
                    label="Please specify your industry"
                    value={formData.industryOther || ''}
                    onChange={handleChange}
                    icon={<FiBriefcase />}
                    placeholder="Enter your industry"
                    required
                    error={errors.industryOther}
                  />
                )}

                <div>
                  <label
                    htmlFor="description"
                    className="label"
                  >
                    Company Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="textarea"
                    rows={4}
                    placeholder="Tell us about your company..."
                  />
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>

            {/* Login Link */}
            <p className="text-center text-dark-600 dark:text-dark-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
