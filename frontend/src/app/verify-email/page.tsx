'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');

          // Store tokens if provided
          if (data.data?.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
          }

          // Start countdown
          const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
          }, 1000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [token, router]);

  // Separate effect to handle redirect when countdown reaches 0
  useEffect(() => {
    if (status === 'success' && countdown === 0) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.isProfileComplete) {
        router.push(`/${user.role}/dashboard`);
      } else {
        router.push('/login');
      }
    }
  }, [countdown, status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6">
              <motion.div
                className="w-full h-full border-4 border-purple-200 border-t-purple-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting in {countdown} seconds...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/resend-verification')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Resend Verification Email
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
