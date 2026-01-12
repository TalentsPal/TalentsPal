'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const isProfileComplete = searchParams.get('isProfileComplete') === 'true';

      console.log('OAuth Callback - Token:', token ? 'Present' : 'Missing');
      console.log('OAuth Callback - Refresh Token:', refreshToken ? 'Present' : 'Missing');
      console.log('OAuth Callback - Profile Complete:', isProfileComplete);

      if (token && refreshToken) {
        // Store tokens with correct key names
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        console.log('Tokens stored successfully');

        try {
          // Fetch user data
          console.log('Fetching user data from /api/auth/me...');
          const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('User data response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('User data received:', data);
            
            // Store user data - handle nested user object
            const userData = data.data?.user || data.data;
            console.log('Extracted user data:', userData);
            
            if (userData) {
              localStorage.setItem('user', JSON.stringify(userData));
              console.log('User data stored in localStorage:', JSON.stringify(userData, null, 2));
            }

            // Always redirect to student dashboard (profile completion removed)
            console.log('Redirecting to student dashboard...');
            router.push('/student/dashboard');
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          setError('Authentication failed. Redirecting to login...');
          setTimeout(() => {
            router.push('/login?error=auth_failed');
          }, 2000);
        }
      } else {
        // Handle error
        console.error('Missing tokens in callback URL');
        setError('Authentication failed. Redirecting to login...');
        setTimeout(() => {
          router.push('/login?error=auth_failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-lg font-medium text-dark-900 dark:text-dark-50 mb-2">Authenticating...</p>
            <p className="text-sm text-dark-600 dark:text-dark-400">Please wait while we log you in</p>
          </>
        )}
      </div>
    </div>
  );
}
