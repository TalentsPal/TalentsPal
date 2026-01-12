'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBook,
  FiAward,
  FiLinkedin,
  FiEdit2,
  FiSave,
  FiX,
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiTarget,
  FiCamera,
  FiLogOut,
} from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { fetchUniversities, fetchMajors, fetchCities } from '@/services/metadataService';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  university: string;
  major: string;
  graduationYear: string;
  linkedInUrl: string;
  interests: string[];
  bio: string;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isInitialized = useRef(false);
  
  // Dynamic data
  const [cities, setCities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<{ value: string; label: string }[]>([]);
  const [majors, setMajors] = useState<{ value: string; label: string }[]>([]);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    university: '',
    major: '',
    graduationYear: '',
    linkedInUrl: '',
    interests: [],
    bio: '',
  });

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Fetch user data from backend API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.data?.user || data.data;
          
          // Update state with fresh data from backend
          setUser(userData);
          setProfileData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            city: userData.city || '',
            university: userData.university || '',
            major: userData.major || '',
            graduationYear: userData.graduationYear || '',
            linkedInUrl: userData.linkedInUrl || '',
            interests: userData.interests || [],
            bio: userData.bio || '',
          });

          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };

    // Load metadata and user data in parallel
    const loadData = async () => {
      const [citiesData, universitiesData, majorsData] = await Promise.all([
        fetchCities(),
        fetchUniversities(),
        fetchMajors(),
        fetchUserData(),
      ]);

      setCities(citiesData);
      setUniversities(universitiesData.map(u => ({ value: u.name, label: u.name })));
      setMajors(majorsData.map(m => ({ value: m.name, label: m.name })));
    };

    loadData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Import and call API
      const { updateProfile } = await import('@/services/authService');
      const response = await updateProfile(profileData);
      
      // Update localStorage with new data
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setIsEditing(false);
      
      // Show success message (optional)
      console.log('Profile updated successfully:', response);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        university: user.university || '',
        major: user.major || '',
        graduationYear: user.graduationYear || '',
        linkedInUrl: user.linkedInUrl || '',
        interests: user.interests || [],
        bio: user.bio || '',
      });
    }
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const { uploadProfileImage } = await import('@/services/authService');
      const response = await uploadProfileImage(file);
      
      // Update user data with new profile image
      const updatedUser = { ...user, profileImage: response.data.profileImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      console.log('Profile image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login page
    router.push('/login');
  };

  const profileStats = [
    { label: 'Profile Completion', value: '85%', color: 'text-green-600' },
    { label: 'Applications', value: '8', color: 'text-blue-600' },
    { label: 'Connections', value: '156', color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container-custom py-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/student/dashboard')}
            className="mb-4 flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </motion.button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-2"
              >
                My Profile
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-purple-100"
              >
                Manage your personal information and preferences
              </motion.p>
            </div>

            {!isEditing ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <FiEdit2 />
                Edit Profile
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex gap-3"
              >
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20"
                >
                  <FiX />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <FiSave />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Profile Card */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-dark-700">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={profileData.fullName}
                      className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white dark:border-dark-700"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {profileData.fullName.charAt(0) || 'S'}
                    </div>
                  )}
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="profileImageUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="profileImageUpload"
                        className={`absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-dark-700 rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors border-2 border-white dark:border-dark-800 cursor-pointer ${
                          isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploadingImage ? (
                          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiCamera />
                        )}
                      </label>
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                  {profileData.fullName || 'Student Name'}
                </h2>
                <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">
                  {profileData.major || 'Computer Science'} Student
                </p>
                {profileData.linkedInUrl && (
                  <a
                    href={profileData.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <FiLinkedin />
                    View LinkedIn
                  </a>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-700">
                <div className="space-y-3">
                  {profileStats.map((stat, index) => (
                    <div key={stat.label} className="flex justify-between items-center">
                      <span className="text-sm text-dark-600 dark:text-dark-400">
                        {stat.label}
                      </span>
                      <span className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                {[
                  { icon: <FiBriefcase />, label: 'My Applications', link: '/student/applications' },
                  { icon: <FiTarget />, label: 'Saved Companies', link: '/student/saved' },
                  { icon: <FiAward />, label: 'Achievements', link: '/student/achievements' },
                ].map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.link)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left group"
                  >
                    <div className="text-purple-600 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-dark-900 dark:text-dark-50">
                      {item.label}
                    </span>
                  </button>
                ))}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group border-t border-gray-100 dark:border-dark-700 mt-4 pt-4"
                >
                  <div className="text-red-600 group-hover:scale-110 transition-transform">
                    <FiLogOut />
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-500">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-dark-700">
              <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-6">
                Personal Information
              </h3>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
                    <FiUser className="text-purple-600" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      id="fullName"
                      name="fullName"
                      label="Full Name"
                      value={profileData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      icon={<FiUser />}
                      required
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      label="Email Address"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled={true}
                      icon={<FiMail />}
                      required
                    />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      icon={<FiPhone />}
                      placeholder="05XXXXXXXX"
                    />
                    <Select
                      id="city"
                      name="city"
                      label="City"
                      value={profileData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      options={cities.map((city) => ({ value: city, label: city }))}
                      placeholder="Select your city"
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="pt-6 border-t border-gray-100 dark:border-dark-700">
                  <h4 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
                    <FiBook className="text-purple-600" />
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select
                      id="university"
                      name="university"
                      label="University"
                      value={profileData.university}
                      onChange={handleChange}
                      disabled={!isEditing}
                      options={universities}
                      placeholder="Select your university"
                    />
                    <Select
                      id="major"
                      name="major"
                      label="Major"
                      value={profileData.major}
                      onChange={handleChange}
                      disabled={!isEditing}
                      options={majors}
                      placeholder="Select your major"
                    />
                    <Input
                      id="graduationYear"
                      name="graduationYear"
                      type="text"
                      label="Graduation Year"
                      value={profileData.graduationYear}
                      onChange={handleChange}
                      disabled={!isEditing}
                      icon={<FiCalendar />}
                      placeholder={`e.g., ${new Date().getFullYear()}`}
                    />
                    <Input
                      id="linkedInUrl"
                      name="linkedInUrl"
                      type="url"
                      label="LinkedIn Profile"
                      value={profileData.linkedInUrl}
                      onChange={handleChange}
                      disabled={!isEditing}
                      icon={<FiLinkedin />}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="pt-6 border-t border-gray-100 dark:border-dark-700">
                  <h4 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
                    <FiEdit2 className="text-purple-600" />
                    About Me
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:bg-gray-50 dark:disabled:bg-dark-800 disabled:text-gray-500"
                      placeholder="Tell us about yourself, your goals, and what you're looking for..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
