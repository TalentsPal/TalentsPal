'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Exam {
  _id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: string;
  questions: any[];
}

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        // Handle potential response structure variations
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
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
        <h1 className="text-3xl font-bold text-gray-900">Available Exams</h1>
        <div className="text-gray-500">
          {exams.length} {exams.length === 1 ? 'Exam' : 'Exams'} Found
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 text-lg">No exams available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, index) => (
            <Card key={exam._id} delay={index * 0.1} className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium uppercase tracking-wide">
                  {exam.category}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="mr-1">⏱️</span>
                  {exam.durationMinutes} min
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{exam.title}</h3>
              <p className="text-gray-600 mb-6 flex-grow line-clamp-3">{exam.description}</p>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                  <span>{exam.questions?.length || 0} Questions</span>
                </div>
                <Button className="w-full">Start Exam</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
