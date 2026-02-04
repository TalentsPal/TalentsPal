'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLock, FiCheck, FiArrowRight } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getPasswordStrength, isStrongPassword } from '@/utils/validation';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const passwordStrength = getPasswordStrength(formData.password);

    if (!token) {
        return (
            <div className="text-center p-6">
                <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 p-4 rounded-xl mb-4">
                    <p className="font-semibold">Invalid Link</p>
                    <p className="text-sm">The password reset link is invalid or missing.</p>
                </div>
                <Link href="/forgot-password">
                    <Button variant="primary">Request New Link</Button>
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordValidation = isStrongPassword(formData.password);
        if (!passwordValidation) {
            setError('Password must be at least 8 characters with uppercase, lowercase, and number');
            return;
        }

        setIsLoading(true);

        try {
            const { resetPassword } = await import('@/services/authService');
            await resetPassword(token, formData.password, formData.confirmPassword);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto"
                >
                    <FiCheck className="text-green-600 dark:text-green-400 text-3xl" />
                </motion.div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white">
                        Password Reset Successfully!
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400">
                        Your password has been updated. You can now sign in with your new password.
                    </p>
                </div>

                <Link href="/login" className="block">
                    <Button variant="primary" size="lg" className="w-full" rightIcon={<FiArrowRight />}>
                        Sign In Now
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 p-3 rounded-lg text-sm border border-danger-200 dark:border-danger-800">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        label="New Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        icon={<FiLock />}
                        placeholder="Enter new password"
                        required
                        autoFocus={!isLoading}
                        disabled={isLoading}
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
                    label="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    icon={<FiLock />}
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
            >
                Reset Password
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                        <FiLock className="text-white text-3xl" />
                    </motion.div>

                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Reset Password
                    </h1>
                    <p className="text-dark-600 dark:text-dark-400">
                        Create a strong password to secure your account
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="card p-8"
                >
                    <Suspense fallback={<div>Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </motion.div>
            </motion.div>
        </div>
    );
}
