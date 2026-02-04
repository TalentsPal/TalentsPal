'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { isValidEmail } from '@/utils/validation';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate email
        const emailValidation = isValidEmail(email);
        if (!emailValidation) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { forgotPassword } = await import('@/services/authService');
            await forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
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
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 mb-4 shadow-glow"
                    >
                        <FiMail className="text-white text-3xl" />
                    </motion.div>

                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400">
                        Enter your email and we'll send you instructions to reset your password.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="card p-8"
                >
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                <p className="font-medium">Check your email</p>
                                <p className="text-sm mt-1">
                                    We've sent password reset instructions to <strong>{email}</strong>
                                </p>
                            </div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setSuccess(false)}
                                className="w-full mt-4"
                            >
                                Try using a different email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 p-3 rounded-lg text-sm border border-danger-200 dark:border-danger-800">
                                    {error}
                                </div>
                            )}

                            <Input
                                id="email"
                                type="email"
                                label="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<FiMail />}
                                placeholder="Enter your email"
                                required
                                autoFocus
                                disabled={isLoading}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                isLoading={isLoading}
                                rightIcon={<FiSend />}
                            >
                                Send Reset Link
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-medium text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            <FiArrowLeft className="mr-2" />
                            Back to Sign In
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
