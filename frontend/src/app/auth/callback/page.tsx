'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const isProfileComplete = searchParams.get('isProfileComplete') === 'true';

    if (token && refreshToken) {
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Redirect
      if (!isProfileComplete) {
        router.push('/complete-profile');
      } else {
        router.push('/student/dashboard'); // Or determine role and redirect
      }
    } else {
      // Handle error
      router.push('/login?error=auth_failed');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
      <div className="text-center">
        <div className="spinner mb-4 mx-auto" />
        <p className="text-dark-600 dark:text-dark-400">Authenticating...</p>
      </div>
    </div>
  );
}
