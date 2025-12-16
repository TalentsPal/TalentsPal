'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiBriefcase,
  FiFileText,
  FiTarget,
  FiAward,
  FiBook,
  FiArrowRight,
  FiCheckCircle,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    examsTaken: 0,
    lastScore: 0,
    companiesViewed: 0,
    profileCompletion: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.data?.user || data.data;
          setUser(userData);
          
          // Calculate profile completion
          let completion = 0;
          if (userData.fullName) completion += 20;
          if (userData.email) completion += 20;
          if (userData.phoneNumber) completion += 15;
          if (userData.university) completion += 15;
          if (userData.major) completion += 15;
          if (userData.city) completion += 15;
          
          setStats({
            examsTaken: 0,
            lastScore: 0,
            companiesViewed: 0,
            profileCompletion: completion
          });
          
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const quickActions = [
    {
      title: 'Take Exam',
      description: 'Test your skills with technical questions',
      icon: <FiBook className="text-2xl" />,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      link: '/student/exam',
    },
    {
      title: 'Browse Companies',
      description: 'Discover companies hiring in Palestine',
      icon: <FiBriefcase className="text-2xl" />,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      link: '/student/companies',
    },
    {
      title: 'Update Profile',
      description: 'Keep your profile complete and updated',
      icon: <FiUser className="text-2xl" />,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      link: '/student/profile',
    },
  ];

  const statCards = [
    {
      icon: <FiBook />,
      label: 'Exams Taken',
      value: stats.examsTaken,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <FiAward />,
      label: 'Last Score',
      value: stats.lastScore ? `${stats.lastScore}%` : 'N/A',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: <FiBriefcase />,
      label: 'Companies Viewed',
      value: stats.companiesViewed,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: <FiCheckCircle />,
      label: 'Profile Complete',
      value: `${stats.profileCompletion}%`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TalentsPal
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to advance your career? Start by taking an exam or exploring companies.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} ${stat.color} flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiTarget className="text-blue-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <div className={`${action.color} ${action.hoverColor} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 duration-200`}>
                  <div className="mb-4">
                    {action.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-2">{action.title}</h4>
                  <p className="text-white/90 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Get Started
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Profile Completion Banner */}
        {stats.profileCompletion < 100 && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="text-xl font-bold mb-2">Complete Your Profile</h4>
                <p className="text-white/90">Your profile is {stats.profileCompletion}% complete. Add more details to get noticed by companies!</p>
              </div>
              <Link href="/student/profile">
                <button className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-md">
                  Complete Now
                </button>
              </Link>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500" 
                style={{ width: `${stats.profileCompletion}%` }}
              />
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Getting Started */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTarget className="text-blue-600" />
              Getting Started
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-gray-900">Complete your profile</p>
                  <p className="text-sm text-gray-600">Add your skills, education, and experience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-gray-900">Take technical exams</p>
                  <p className="text-sm text-gray-600">Prove your skills with our assessment tests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900">Browse companies</p>
                  <p className="text-sm text-gray-600">Find opportunities that match your skills</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiFileText className="text-purple-600" />
              Your Information
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">University</p>
                <p className="font-medium text-gray-900">{user?.university?.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Major</p>
                <p className="font-medium text-gray-900">{user?.major?.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-medium text-gray-900">{user?.city?.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user?.phoneNumber || 'Not specified'}</p>
              </div>
            </div>
            <Link href="/student/profile">
              <button className="w-full mt-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors border border-purple-200">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
