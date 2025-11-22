'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function CvAnalyzer() {
  const [cvText, setCvText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!cvText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/cv', { cvText });
      setAnalysis(res.data.data || res.data);
    } catch (error) {
      console.error('Error analyzing CV', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI CV Analyzer</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 h-fit">
          <h3 className="text-xl font-semibold mb-4">Submit your CV</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Paste the text content of your CV below to get an instant AI analysis of your strengths, weaknesses, and a score.
          </p>
          <textarea
            className="w-full h-96 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-gray-50 text-sm"
            placeholder="Paste your CV content here..."
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
          />
          <div className="mt-6 flex justify-end">
            <Button onClick={handleAnalyze} isLoading={loading} disabled={!cvText.trim()} className="w-full sm:w-auto">
              Analyze CV
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          {analysis ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="p-6 border-t-4 border-blue-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Overall Score</h3>
                  <div className="relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="36"
                        cx="40"
                        cy="40"
                      />
                      <circle
                        className="text-blue-600"
                        strokeWidth="8"
                        strokeDasharray={226}
                        strokeDashoffset={226 - (226 * analysis.score) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="36"
                        cx="40"
                        cy="40"
                      />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">{analysis.score}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
                  <p className="text-blue-800 text-sm">{analysis.summary}</p>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
                  <span>💪</span> Strengths
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-green-500 mt-1">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-red-500 mb-4 flex items-center gap-2">
                  <span>🎯</span> Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {analysis.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-red-500 mt-1">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>

              {analysis.suggestions && (
                <Card className="p-6">
                  <h4 className="font-semibold text-purple-600 mb-4 flex items-center gap-2">
                    <span>💡</span> Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-purple-500 mt-1">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12 bg-gray-50/50">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">Ready to Analyze</h3>
              <p className="text-center text-sm max-w-xs">
                Paste your CV on the left to receive a detailed AI analysis of your profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
