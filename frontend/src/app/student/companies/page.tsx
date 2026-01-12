'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiGlobe, FiLinkedin, FiMail, FiInfo, FiArrowLeft } from 'react-icons/fi';
import { getCompanies, Company } from '@/services/companyService';
import { fetchCities } from '@/services/metadataService';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    // Load cities from backend
    const loadCities = async () => {
      const cities = await fetchCities();
      setAvailableCities(cities);
    };
    loadCities();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompaniesData();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [search, city]);

  const fetchCompaniesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCompanies({ search, city });
      setCompanies(data.data);
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden p-6 md:p-8">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-emerald-600/20 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/student/dashboard')}
          className="mb-6 flex items-center gap-2 text-white hover:text-blue-300 transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </motion.button>

        {/* Header Section */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Tech Companies
              </h1>
              <p className="text-slate-300">
                Discover opportunities in Ramallah and Nablus
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {companies.length} Companies Found
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4"
          >
            <div className="md:col-span-8">
              <Input
                placeholder="Search by company name..."
                icon={<FiSearch />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="md:col-span-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setCity('')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${city === ''
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
              >
                All Cities
              </button>
              {availableCities.slice(0, 3).map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${city === c
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error} 
            onDismiss={() => setError(null)}
            type="error"
          />
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-64 animate-pulse border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-32 bg-gray-100 rounded"></div>
                  <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {companies.map((company) => (
              <motion.div
                key={company._id}
                variants={item}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {company.name}
                    </h3>
                    <div className="flex items-center text-gray-500 text-xs mt-1 font-medium uppercase tracking-wide">
                      <FiMapPin className="w-3 h-3 mr-1" />
                      {company.city}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-inner">
                    {company.name.charAt(0)}
                  </div>
                </div>

                <div className="space-y-4">
                  {company.address && (
                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                      {company.address}
                    </p>
                  )}

                  {company.notes && (
                    <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-lg flex items-start gap-2">
                      <FiInfo className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">{company.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors group/link p-2 hover:bg-blue-50 rounded-lg -mx-2"
                      >
                        <div className="w-8 flex justify-center">
                          <FiGlobe className="w-4 h-4" />
                        </div>
                        <span className="truncate">Visit Website</span>
                      </a>
                    )}
                    {company.linkedIn && (
                      <a
                        href={company.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-500 hover:text-blue-700 transition-colors group/link p-2 hover:bg-blue-50 rounded-lg -mx-2"
                      >
                        <div className="w-8 flex justify-center">
                          <FiLinkedin className="w-4 h-4" />
                        </div>
                        <span className="truncate">LinkedIn Profile</span>
                      </a>
                    )}
                    {company.email && (
                      <a
                        href={`mailto:${company.email}`}
                        className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors group/link p-2 hover:bg-blue-50 rounded-lg -mx-2"
                      >
                        <div className="w-8 flex justify-center">
                          <FiMail className="w-4 h-4" />
                        </div>
                        <span className="truncate">{company.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && companies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
