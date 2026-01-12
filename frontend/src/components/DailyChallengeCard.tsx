'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTodayChallenge, submitChallengeAnswer, TodayChallengeResponse } from '@/services/featuresService';

export default function DailyChallengeCard() {
  const [data, setData] = useState<TodayChallengeResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodayChallenge();
  }, []);

  const fetchTodayChallenge = async () => {
    try {
      const response = await getTodayChallenge();
      setData(response);
      
      // If already completed, show result
      if (response.challenge.completed && response.challenge.userAnswer) {
        setSelectedAnswer(response.challenge.userAnswer);
        setResult({
          isCorrect: response.challenge.isCorrect || false,
          correctAnswer: response.challenge.questionId.options[0], // This would need correct answer from backend
        });
      }
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !data) return;

    setIsSubmitting(true);
    try {
      const response = await submitChallengeAnswer(selectedAnswer);
      setResult({
        isCorrect: response.data.isCorrect,
        correctAnswer: response.data.correctAnswer,
      });
      
      // Update challenge data with new streak info
      setData({
        ...data,
        challenge: { 
          ...data.challenge, 
          completed: true, 
          userAnswer: selectedAnswer, 
          isCorrect: response.data.isCorrect 
        },
        streak: response.data.streak,
      });
    } catch (error) {
      console.error('Failed to submit challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { challenge, streak } = data;
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    hard: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full -ml-12 -mb-12 opacity-50"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Daily Challenge</h3>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {/* Streak Badge */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-blue-200">
            <span className="text-2xl">🔥</span>
            <div className="text-left">
              <div className="text-2xl font-bold text-blue-600">{streak.currentStreak}</div>
              <div className="text-xs text-gray-500">day streak</div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}`}>
              {challenge.difficulty.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
              {challenge.category}
            </span>
          </div>
          <p className="text-gray-900 font-medium leading-relaxed">
            {challenge.questionId.question}
          </p>
        </div>

        {/* Options */}
        {!challenge.completed ? (
          <div className="space-y-2 mb-4">
            {challenge.questionId.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                disabled={isSubmitting}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedAnswer === option && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {challenge.questionId.options.map((option, index) => {
              const isUserAnswer = option === challenge.userAnswer;
              const isCorrectAnswer = option === result?.correctAnswer;
              
              return (
                <div
                  key={index}
                  className={`w-full text-left p-4 rounded-xl border-2 ${
                    isCorrectAnswer
                      ? 'border-green-500 bg-green-50'
                      : isUserAnswer && !isCorrectAnswer
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCorrectAnswer && <span className="text-green-600">✓</span>}
                    {isUserAnswer && !isCorrectAnswer && <span className="text-red-600">✗</span>}
                    <span className={`${isCorrectAnswer ? 'text-green-900 font-semibold' : 'text-gray-700'}`}>
                      {option}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Button or Result */}
        {!challenge.completed ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        ) : (
          <div className={`p-4 rounded-xl ${result?.isCorrect ? 'bg-green-100 border-2 border-green-300' : 'bg-yellow-100 border-2 border-yellow-300'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{result?.isCorrect ? '🎉' : '📚'}</span>
              <span className={`font-bold text-lg ${result?.isCorrect ? 'text-green-900' : 'text-yellow-900'}`}>
                {result?.isCorrect ? 'Correct!' : 'Incorrect Answer'}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              {result?.isCorrect 
                ? 'Great job! Come back tomorrow for a new challenge.' 
                : 'Don\'t worry, learning from mistakes makes you stronger!'}
            </p>
            {!result?.isCorrect && result?.correctAnswer && (
              <div className="mt-3 pt-3 border-t border-yellow-300">
                <p className="text-sm font-semibold text-gray-700 mb-1">Correct Answer:</p>
                <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg font-medium">
                  ✓ {result.correctAnswer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Streak Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-600">Longest Streak:</span>
              <span className="ml-2 font-bold text-blue-600">{streak.longestStreak} days</span>
            </div>
            <div>
              <span className="text-gray-600">Total Completed:</span>
              <span className="ml-2 font-bold text-blue-600">{streak.totalChallengesCompleted}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
