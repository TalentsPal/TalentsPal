'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';

interface Company {
  _id: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  website: string;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">Top Companies</h1>
        <div className="text-gray-500">
          {companies.length} {companies.length === 1 ? 'Company' : 'Companies'} Listed
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company, index) => (
          <Card key={company._id} delay={index * 0.1} className="flex flex-col h-full hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-md">
                {company.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="mr-1">📍</span>
                  {company.location}
                </div>
              </div>
            </div>

            <div className="mb-6 flex-grow">
              <p className="text-gray-600 leading-relaxed line-clamp-3">{company.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wider">
                {company.industry}
              </span>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                Visit Website
                <span>→</span>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
