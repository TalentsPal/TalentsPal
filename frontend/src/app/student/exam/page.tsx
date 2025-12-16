'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ExamConfig {
  category: string;
  difficulty: string;
  count: number;
}

export default function TakeExamPage() {
  const router = useRouter();
  const [step, setStep] = useState<'config' | 'instructions' | 'exam'>('config');
  const [config, setConfig] = useState<ExamConfig>({
    category: '',
    difficulty: '',
    count: 15,
  });
  const [agreed, setAgreed] = useState(false);

  const categories = [
    { value: 'backend', label: 'Backend Development', icon: '⚙️' },
    { value: 'frontend', label: 'Frontend Development', icon: '🎨' },
    { value: 'qa', label: 'Quality Assurance', icon: '🧪' },
    { value: 'data-engineering', label: 'Data Engineering', icon: '📊' },
    { value: 'devops', label: 'DevOps', icon: '🚀' },
    { value: 'mobile', label: 'Mobile Development', icon: '📱' },
    { value: 'fullstack', label: 'Full Stack', icon: '💻' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'bg-green-500', description: 'Good for beginners' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500', description: 'Intermediate level' },
    { value: 'hard', label: 'Hard', color: 'bg-red-500', description: 'Advanced challenges' },
  ];

  const handleStartExam = () => {
    if (!config.category || !config.difficulty) {
      alert('Please select both category and difficulty level');
      return;
    }
    setStep('instructions');
  };

  const handleBeginExam = () => {
    if (!agreed) {
      alert('Please agree to the exam rules before proceeding');
      return;
    }
    router.push(`/student/exam/take?category=${config.category}&difficulty=${config.difficulty}&count=${config.count}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📝 Technical Assessment
          </h1>
          <p className="text-gray-600">
            Test your knowledge and demonstrate your skills
          </p>
        </div>

        {/* Configuration Step */}
        {step === 'config' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configure Your Exam
              </h2>
              <p className="text-gray-600">
                Select the category and difficulty level for your assessment
              </p>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                1. Choose Your Category
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setConfig({ ...config, category: cat.value })}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      config.category === cat.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <div className="font-semibold text-gray-900">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                2. Select Difficulty Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {difficulties.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setConfig({ ...config, difficulty: diff.value })}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      config.difficulty === diff.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-12 h-12 ${diff.color} rounded-full mb-3 flex items-center justify-center`}>
                      <span className="text-2xl text-white">
                        {diff.value === 'easy' && '⭐'}
                        {diff.value === 'medium' && '⭐⭐'}
                        {diff.value === 'hard' && '⭐⭐⭐'}
                      </span>
                    </div>
                    <div className="font-bold text-gray-900 mb-1">{diff.label}</div>
                    <div className="text-sm text-gray-600">{diff.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                3. Number of Questions
              </label>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">Questions:</span>
                  <span className="text-3xl font-bold text-blue-600">{config.count}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="5"
                  value={config.count}
                  onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                  <span>30</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            {config.category && config.difficulty && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">📋 Exam Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Category:</span>
                    <span className="font-semibold text-blue-900">
                      {categories.find(c => c.value === config.category)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Difficulty:</span>
                    <span className="font-semibold text-blue-900 capitalize">{config.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Questions:</span>
                    <span className="font-semibold text-blue-900">{config.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Estimated Time:</span>
                    <span className="font-semibold text-blue-900">{config.count * 2} minutes</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleStartExam}
              disabled={!config.category || !config.difficulty}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Continue to Instructions →
            </button>
          </div>
        )}

        {/* Instructions Step */}
        {step === 'instructions' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Exam Instructions
              </h2>
              <p className="text-gray-600">
                Please read carefully before starting
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {/* Rules */}
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  <span>📌</span> Important Rules
                </h3>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>The exam will enter <strong>full-screen mode</strong>. Do not exit full-screen.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>Switching tabs or minimizing the window may be <strong>flagged</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>Your webcam may be monitored (if enabled by administrator).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>You cannot go back to previous questions once submitted.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>The exam will auto-submit when time expires.</span>
                  </li>
                </ul>
              </div>

              {/* What to Expect */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span>💡</span> What to Expect
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>You will receive <strong>{config.count} questions</strong> based on your selections.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Questions are primarily <strong>{config.difficulty}</strong> level, but may include other difficulties if needed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Each question has <strong>multiple choice answers</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Your progress will be <strong>saved automatically</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Results will be available <strong>immediately</strong> after submission.</span>
                  </li>
                </ul>
              </div>

              {/* Technical Requirements */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <span>🔧</span> Technical Requirements
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Stable internet connection required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Modern web browser (Chrome, Firefox, Safari, or Edge)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>JavaScript and cookies must be enabled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Close unnecessary applications to avoid distractions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I have read and understood all the instructions and rules. I agree to follow them during the exam.
                  I understand that any violation may result in disqualification.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('config')}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                ← Back
              </button>
              <button
                onClick={handleBeginExam}
                disabled={!agreed}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Begin Exam 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
