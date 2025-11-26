'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiUserCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { LoginFormData, FormErrors, UserRole } from '@/types';
import { validateLoginForm } from '@/utils/validation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Call the backend API
      const { loginUser } = await import('@/services/authService');
      const data = await loginUser(formData);

      const userRole: UserRole = data.data.user.role;

      // Redirect based on role
      const redirectPaths: Record<UserRole, string> = {
        student: '/student/dashboard',
        admin: '/admin/dashboard',
        company: '/company/dashboard',
      };

      router.push(redirectPaths[userRole]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        setErrors({ general: errorMessage });
        
        // If email not verified, show resend link
        if (errorMessage.includes('verify your email')) {
          setErrors({ 
            general: errorMessage,
            emailNotVerified: true as any
          });
        }
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 mb-4 shadow-glow"
          >
            <FiUserCheck className="text-white text-3xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold gradient-text mb-2"
          >
            Welcome Back
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-dark-600 dark:text-dark-400"
          >
            Sign in to continue your journey
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl p-4"
              >
                <p className="text-danger-700 dark:text-danger-400 text-sm">
                  {errors.general}
                </p>
                {errors.emailNotVerified && (
                  <Link 
                    href="/resend-verification"
                    className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline block mt-2"
                  >
                    Resend verification email →
                  </Link>
                )}
              </motion.div>
            )}

            {/* Email Input */}
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
              autoComplete="email"
              autoFocus
            />

            {/* Password Input */}
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              icon={<FiLock />}
              placeholder="Enter your password"
              required
              error={errors.password}
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="checkbox"
                />
                <span className="text-sm text-dark-700 dark:text-dark-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Remember me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<FiLogIn />}
            >
              Sign In
            </Button>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-200 dark:border-dark-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-dark-900 text-dark-500 dark:text-dark-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors duration-200"
                  leftIcon={<FcGoogle className="text-xl" />}
                  onClick={() => {
                    window.location.href = 'http://localhost:5000/api/auth/google';
                  }}
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors duration-200"
                  leftIcon={<FaLinkedin className="text-xl text-[#0077b5]" />}
                  onClick={() => {
                    window.location.href = 'http://localhost:5000/api/auth/linkedin';
                  }}
                >
                  LinkedIn
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-200 dark:border-dark-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-dark-900 text-dark-500 dark:text-dark-400">
                  New to TalentsPal?
                </span>
              </div>
            </div>

            {/* Signup Link */}
            <Link href="/signup">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
              >
                Create an Account
              </Button>
            </Link>
          </form>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-dark-500 dark:text-dark-400">
            By signing in, you agree to our{' '}
            <Link
              href="/terms"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
