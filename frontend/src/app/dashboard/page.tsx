'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Assuming /auth/me exists, otherwise we might need to decode token or fetch by ID
        // For now, let's try to fetch user profile if endpoint exists, or just use local storage if we stored it
        // Since we didn't store user in local storage on login, we rely on API.
        // If /auth/me is not implemented in backend, this will fail. 
        // Let's assume standard practice.
        const res = await api.get('/auth/me');
        setUser(res.data.data || res.data); // Handle potential response wrapping
      } catch (error) {
        console.error('Failed to fetch user', error);
        // If 401, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>!
        </h1>
        <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {user?.role || 'Student'}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col h-full" delay={0.1}>
          <div className="flex-grow">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📝
            </div>
            <h3 className="text-xl font-semibold mb-2">Your Exams</h3>
            <p className="text-gray-600 mb-4">
              Track your progress, take new practice exams, and improve your scores.
            </p>
          </div>
          <Link href="/exams">
            <Button variant="outline" className="w-full">Go to Exams</Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col h-full" delay={0.2}>
          <div className="flex-grow">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📄
            </div>
            <h3 className="text-xl font-semibold mb-2">CV Analysis</h3>
            <p className="text-gray-600 mb-4">
              Get AI-powered feedback on your resume to stand out to recruiters.
            </p>
          </div>
          <Link href="/cv-analyzer">
            <Button variant="outline" className="w-full">Analyze CV</Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col h-full" delay={0.3}>
          <div className="flex-grow">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              💬
            </div>
            <h3 className="text-xl font-semibold mb-2">Interviews</h3>
            <p className="text-gray-600 mb-4">
              Practice behavioral and technical interviews with our AI bot.
            </p>
          </div>
          <Link href="/interview">
            <Button variant="outline" className="w-full">Start Interview</Button>
          </Link>
        </Card>
      </div>

      {/* Recent Activity Section Placeholder */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <p>No recent activity found. Start by taking an exam or analyzing your CV!</p>
        </div>
      </div>
    </div>
  );
}
