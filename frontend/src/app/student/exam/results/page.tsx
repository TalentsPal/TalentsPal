'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface QuestionResult {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  question: string;
}

interface ExamResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  results: QuestionResult[];
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const attemptId = searchParams.get('attemptId');
  const score = parseInt(searchParams.get('score') || '0');

  // Format code blocks in text
  const formatTextWithCode = (text: string) => {
    if (!text) return null;

    const backtickRegex = /`([^`]+)`/g;

    if (!backtickRegex.test(text)) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    backtickRegex.lastIndex = 0;

    while ((match = backtickRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${key++}`} className="whitespace-pre-wrap">{text.substring(lastIndex, match.index)}</span>
        );
      }

      parts.push(
        <code
          key={`code-${key++}`}
          className="inline-block bg-slate-900 text-green-400 px-4 py-2 rounded-md font-mono text-sm border border-slate-700 mx-1 my-1"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {match[1]}
        </code>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${key++}`} className="whitespace-pre-wrap">{text.substring(lastIndex)}</span>
      );
    }

    return <div className="leading-relaxed">{parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{text}</span>}</div>;
  };

  useEffect(() => {
    // Make sure we exit fullscreen when viewing results
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }

    const fetchResults = async () => {
      if (!attemptId) {
        router.push('/student/exam');
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const response = await fetch(
          `${apiUrl}/questions/attempt/${attemptId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch results');

        const data = await response.json();
        setResult(data.attempt);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, router]);

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-500', desc: 'Excellent!' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-500', desc: 'Very Good!' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-500', bg: 'bg-yellow-500', desc: 'Good!' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-500', bg: 'bg-orange-500', desc: 'Fair' };
    return { grade: 'F', color: 'text-red-500', bg: 'bg-red-500', desc: 'Needs Improvement' };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  const gradeInfo = getGrade(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Exam Results
          </h1>
          <p className="text-gray-600">
            Your performance summary
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="text-center mb-8">
            <div className="relative w-52 h-52 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="104"
                  cy="104"
                  r="96"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="104"
                  cy="104"
                  r="96"
                  stroke={score >= 90 ? '#10b981' : score >= 80 ? '#3b82f6' : score >= 70 ? '#eab308' : score >= 60 ? '#f97316' : '#ef4444'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 96}`}
                  strokeDashoffset={`${2 * Math.PI * 96 * (1 - score / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-6xl font-bold ${gradeInfo.color}`}>
                  {score}%
                </div>
                <div className={`text-2xl font-bold ${gradeInfo.color} mt-1`}>
                  Grade {gradeInfo.grade}
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {gradeInfo.desc}
            </h2>
            <p className="text-gray-600">
              You scored better than average students
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="text-green-600 text-sm font-semibold mb-1">Correct Answers</div>
              <div className="text-3xl font-bold text-green-700">
                {result?.correctCount || 0}
              </div>
              <div className="text-green-600 text-sm mt-1">
                out of {result?.totalQuestions || 0}
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="text-red-600 text-sm font-semibold mb-1">Wrong Answers</div>
              <div className="text-3xl font-bold text-red-700">
                {(result?.totalQuestions || 0) - (result?.correctCount || 0)}
              </div>
              <div className="text-red-600 text-sm mt-1">
                need improvement
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="text-blue-600 text-sm font-semibold mb-1">Time Spent</div>
              <div className="text-3xl font-bold text-blue-700">
                {formatTime(result?.timeSpent || 0)}
              </div>
              <div className="text-blue-600 text-sm mt-1">
                total duration
              </div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Performance</span>
              <span className="text-sm text-gray-600">{score}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${gradeInfo.bg} transition-all duration-1000 ease-out`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              {showDetails ? 'Hide' : 'View'} Detailed Results
            </button>
            <button
              onClick={() => router.push('/student/exam')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Take Another Exam
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        {showDetails && result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Question by Question Review
            </h3>

            <div className="space-y-6">
              {result.questions?.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 border-2 ${item.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                      <span className="text-2xl text-white">
                        {item.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          }`}>
                          Question {index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.isCorrect
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-red-100 text-red-700 border border-red-300'
                          }`}>
                          {item.isCorrect ? 'Correct' : 'Wrong'}
                        </span>
                      </div>

                      <div className="text-gray-900 font-medium mb-4 text-lg">
                        {formatTextWithCode(item.questionId?.question || 'Question not available')}
                      </div>

                      <div className="space-y-2">
                        {!item.isCorrect && (
                          <div className="bg-red-100 rounded-lg p-3 border border-red-200">
                            <div className="text-sm text-red-600 font-semibold mb-1">
                              Your Answer:
                            </div>
                            <div className="text-red-800">
                              {formatTextWithCode(item.userAnswer)}
                            </div>
                          </div>
                        )}

                        <div className={`rounded-lg p-3 border ${item.isCorrect
                            ? 'bg-green-100 border-green-200'
                            : 'bg-green-50 border-green-200'
                          }`}>
                          <div className="text-sm text-green-600 font-semibold mb-1">
                            Correct Answer:
                          </div>
                          <div className="text-green-800 font-medium">
                            {formatTextWithCode(item.correctAnswer)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
