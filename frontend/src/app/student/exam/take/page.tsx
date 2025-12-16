'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Question {
  _id: string;
  questionId: number;
  category: string;
  question: string;
  options: string[];
  difficulty: string;
  tags?: string[];
}

interface Answer {
  questionId: string;
  answer: string;
}

function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [fullscreenExitAttempts, setFullscreenExitAttempts] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const category = searchParams.get('category') || 'backend';
  const difficulty = searchParams.get('difficulty') || 'medium';
  const count = parseInt(searchParams.get('count') || '15');

  // Generate unique exam session ID
  const examSessionId = useRef(`exam_${category}_${Date.now()}`);

  // Get current question
  const currentQuestion = questions[currentIndex];

  // Check if current question is answered - calculate directly on every render
  // Extract ID from Mongoose document structure (_doc._id for Mongoose documents)
  const currentQuestionId = (currentQuestion as any)?._doc?._id || currentQuestion?._id || (currentQuestion as any)?._doc?.id || (currentQuestion as any)?.id;
  const isCurrentQuestionAnswered = currentQuestionId
    ? answers.some(a => a.questionId === currentQuestionId)
    : false;

  // 🔒 SECURITY: Save exam state to localStorage
  useEffect(() => {
    if (questions.length > 0 && !examCompleted) {
      const examState = {
        sessionId: examSessionId.current,
        questions,
        currentIndex,
        answers,
        timeLeft,
        startTime: startTime.toISOString(),
        tabSwitches,
        fullscreenExitAttempts,
        timestamp: Date.now()
      };
      localStorage.setItem(examSessionId.current, JSON.stringify(examState));
    }
  }, [questions, currentIndex, answers, timeLeft, tabSwitches, fullscreenExitAttempts, examCompleted, startTime]);

  // 🔒 SECURITY: Restore exam state on page load (if refreshed)
  useEffect(() => {
    const savedState = localStorage.getItem(examSessionId.current);
    if (savedState && questions.length === 0) {
      try {
        const state = JSON.parse(savedState);
        // Only restore if session is less than exam duration old
        const sessionAge = Date.now() - state.timestamp;
        const maxAge = count * 120 * 1000; // exam duration in ms

        if (sessionAge < maxAge) {
          setQuestions(state.questions || []);
          setCurrentIndex(state.currentIndex || 0);
          setAnswers(state.answers || []);
          setTimeLeft(state.timeLeft || 0);
          setTabSwitches(state.tabSwitches || 0);
          setFullscreenExitAttempts(state.fullscreenExitAttempts || 0);
        }
      } catch (e) {
        // Invalid state, ignore
      }
    }
  }, []);

  // 🔒 SECURITY: Prevent page refresh/close during exam
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!examCompleted && questions.length > 0) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress will be lost!';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examCompleted, questions.length]);

  // Format code blocks in text
  const formatTextWithCode = (text: string) => {
    if (!text) return null;

    // Split by common patterns: code:, query:, or detect SQL/C# blocks
    const patterns = [
      { regex: /\bcode:\s*(`[^`]+`)/gi, type: 'inline' },
      { regex: /\bquery:\s*(`[^`]+`)/gi, type: 'inline' },
      { regex: /`([^`]+)`/g, type: 'inline' },
      { regex: /(SELECT[\s\S]*?(?:;|\n|$))/gi, type: 'sql' },
      { regex: /(var\s+\w+[\s\S]*?;[\s\S]*?foreach[\s\S]*?})/gi, type: 'csharp' }
    ];

    let hasCode = false;
    patterns.forEach(p => {
      if (p.regex.test(text)) hasCode = true;
      p.regex.lastIndex = 0;
    });

    if (!hasCode) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    // Process text and extract code blocks
    const parts: React.JSX.Element[] = [];
    let remaining = text;
    let key = 0;

    // First, handle backtick code
    const backtickRegex = /`([^`]+)`/g;
    let match;
    let lastIndex = 0;

    while ((match = backtickRegex.exec(text)) !== null) {
      // Add text before
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(
          <span key={`text-${key++}`} className="whitespace-pre-wrap">{beforeText}</span>
        );
      }

      // Add code
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

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${key++}`} className="whitespace-pre-wrap">{text.substring(lastIndex)}</span>
      );
    }

    return <div className="leading-relaxed">{parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{text}</span>}</div>;
  };

  // Enter fullscreen
  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => { });
    }
  }, []);

  // 🔒 SECURITY: Exit fullscreen handler - AGGRESSIVE RE-ENTRY
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && questions.length > 0 && !examCompleted) {
        // Track exit attempt
        setFullscreenExitAttempts(prev => prev + 1);
        setTabSwitches(prev => prev + 1);
        setShowWarning(true);

        // IMMEDIATELY re-enter fullscreen (no delay)
        enterFullscreen();

        // Keep warning visible longer
        setTimeout(() => {
          setShowWarning(false);
        }, 5000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [questions.length, enterFullscreen, examCompleted]);

  // Tab visibility handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && questions.length > 0 && !examCompleted) {
        setTabSwitches(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [questions.length, examCompleted]);

  // Prevent right-click and keyboard shortcuts
  useEffect(() => {
    const preventActions = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        return false;
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keydown', preventActions);
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('keydown', preventActions);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch questions with primary difficulty
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(
          `${apiUrl}/questions/random?category=${category}&count=${count}&difficulty=${difficulty}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid - redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            alert('Your session has expired. Please login again.');
            router.push('/login');
            return;
          }
          const errorText = await response.text();
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }

        const data = await response.json();
        let fetchedQuestions = data.questions || [];

        // If we don't have enough questions, fetch more without difficulty filter
        if (fetchedQuestions.length < count) {
          const remaining = count - fetchedQuestions.length;
          const additionalResponse = await fetch(
            `${apiUrl}/questions/random?category=${category}&count=${remaining}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (additionalResponse.ok) {
            const additionalData = await additionalResponse.json();
            const additionalQuestions = additionalData.questions || [];

            // Filter out duplicates
            const existingIds = new Set(fetchedQuestions.map((q: Question) => q._id));
            const newQuestions = additionalQuestions.filter(
              (q: Question) => !existingIds.has(q._id)
            );

            fetchedQuestions = [...fetchedQuestions, ...newQuestions].slice(0, count);
          }
        }

        setQuestions(fetchedQuestions);
        setTimeLeft(fetchedQuestions.length * 120); // 2 minutes per question
        setLoading(false);
        enterFullscreen();
      } catch (error: any) {
        alert(`Failed to load questions: ${error.message}`);
        router.push('/student/exam');
      }
    };

    fetchQuestions();
  }, [category, difficulty, count, router, enterFullscreen]);

  // Timer
  useEffect(() => {
    if (questions.length === 0 || timeLeft === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions.length, timeLeft]);

  const handleAnswer = (answer: string) => {
    const question = questions[currentIndex];

    // Extract ID from Mongoose document structure FIRST
    const questionId = (question as any)?._doc?._id || question?._id || (question as any)?._doc?.id || (question as any)?.id;

    if (!questionId) {
      return;
    }

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, answer };
        return updated;
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleNext = () => {
    if (!isCurrentQuestionAnswered) {
      alert('Please answer the current question before proceeding.');
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    // Disable going back to previous questions
    return;
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // All questions must be answered (checked by disabled button)
    const unanswered = questions.length - answers.length;
    if (unanswered > 0) {
      alert(`You have ${unanswered} unanswered questions. Please answer all questions before submitting.`);
      return;
    }

    setSubmitting(true);
    setExamCompleted(true); // Set flag before exiting fullscreen

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/questions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          startedAt: startTime.toISOString(),
          answers: answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit exam');
      }

      const result = await response.json();

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      // 🔒 SECURITY: Clear saved exam state
      localStorage.removeItem(examSessionId.current);

      // Redirect to results page
      router.push(`/student/exam/results?attemptId=${result.attemptId}&score=${result.score}`);
    } catch (error: any) {
      // Error submitting exam
      alert(error.message || 'Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 300) return 'text-green-600';
    if (timeLeft > 120) return 'text-yellow-600';
    return 'text-red-600 animate-pulse';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-semibold">Loading your exam...</p>
          <p className="text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-white text-2xl font-semibold mb-2">No questions available</p>
          <p className="text-gray-400 mb-6">Please try selecting different options</p>
          <button
            onClick={() => router.push('/student/exam')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = answers.length;
  const currentAnswer = answers.find(a => a.questionId === currentQuestionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 bg-gradient-to-br from-red-600 to-red-800 bg-opacity-95 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center bg-white bg-opacity-10 p-12 rounded-3xl border-4 border-red-400 shadow-2xl">
            <div className="text-8xl mb-6 animate-bounce">⚠️</div>
            <h2 className="text-5xl font-bold mb-4 text-white">Warning!</h2>
            <p className="text-2xl text-red-100 mb-2">Security violation detected</p>
            <p className="text-xl text-red-200">This violation has been recorded</p>
            <div className="mt-6 space-y-2">
              <div className="px-6 py-3 bg-red-500 bg-opacity-30 rounded-xl border border-red-300">
                <p className="text-xl font-bold">Total violations: {tabSwitches}</p>
              </div>
              {fullscreenExitAttempts > 0 && (
                <div className="px-6 py-3 bg-red-500 bg-opacity-30 rounded-xl border border-red-300">
                  <p className="text-lg font-bold">Fullscreen exit attempts: {fullscreenExitAttempts}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-red-200 mt-4">Returning to fullscreen mode...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 bg-opacity-80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-sm text-gray-400">Category</div>
                <div className="font-semibold capitalize">{category}</div>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <div>
                <div className="text-sm text-gray-400">Question</div>
                <div className="font-semibold">{currentIndex + 1} / {questions.length}</div>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <div>
                <div className="text-sm text-gray-400">Answered</div>
                <div className="font-semibold">{answeredCount} / {questions.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {tabSwitches > 0 && (
                <div className="flex items-center gap-2 text-red-400">
                  <span>⚠️</span>
                  <span className="text-sm">{tabSwitches} violations</span>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-400">Time Remaining</div>
                <div className={`text-2xl font-bold font-mono ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Warning Banner */}
        <div className="mb-6 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-200 mb-1">Exam Rules:</h3>
              <ul className="text-sm text-yellow-100 space-y-1">
                <li>• You must answer each question before moving to the next</li>
                <li>• You cannot go back to previous questions</li>
                <li>• Answer carefully - each question can only be answered once</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 bg-opacity-60 backdrop-blur-md rounded-3xl p-10 border border-slate-600 shadow-2xl">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-300 rounded-full text-sm font-semibold border border-blue-400">
                    Question {currentIndex + 1}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${currentQuestion.difficulty === 'easy'
                    ? 'bg-green-500 bg-opacity-20 text-green-300 border-green-400'
                    : currentQuestion.difficulty === 'medium'
                      ? 'bg-yellow-500 bg-opacity-20 text-yellow-300 border-yellow-400'
                      : 'bg-red-500 bg-opacity-20 text-red-300 border-red-400'
                    }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <div className="text-2xl font-semibold leading-relaxed">
                  {formatTextWithCode(currentQuestion.question)}
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = currentAnswer?.answer === option;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-6 rounded-2xl text-left transition-all duration-200 border-2 ${isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 shadow-xl scale-[1.02] text-white'
                    : 'bg-slate-700 bg-opacity-50 border-slate-600 hover:bg-opacity-80 hover:border-slate-500 hover:shadow-lg'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all duration-200 ${isSelected ? 'bg-white text-blue-600 shadow-lg' : 'bg-slate-600 text-slate-300'
                      }`}>
                      {optionLetter}
                    </div>
                    <div className="flex-1 pt-1">
                      {formatTextWithCode(option)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-600">
            <button
              onClick={handlePrevious}
              disabled={true}
              className="px-8 py-3.5 bg-slate-700 rounded-xl font-semibold opacity-30 cursor-not-allowed shadow-lg"
            >
              ← Previous (Disabled)
            </button>

            <div className="flex gap-3">
              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answers.length < questions.length}
                  className={`px-10 py-3.5 rounded-xl font-bold text-lg transition-all duration-200 shadow-xl ${answers.length < questions.length || submitting
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-2xl cursor-pointer'
                    }`}
                >
                  {submitting ? 'Submitting...' : answers.length === questions.length ? 'Submit Exam 🎯' : 'Answer All to Submit'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!isCurrentQuestionAnswered}
                  className={`px-10 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg ${isCurrentQuestionAnswered
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl cursor-pointer'
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                >
                  {isCurrentQuestionAnswered ? 'Next →' : 'Answer to Continue'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-slate-800 bg-opacity-60 backdrop-blur-md rounded-2xl p-8 border border-slate-600 shadow-xl">
          <h3 className="font-bold text-lg mb-6 text-slate-200">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const isAnswered = answers.some(a => a.questionId === questions[index]._id);
              const isCurrent = index === currentIndex;
              const canNavigate = index <= currentIndex; // Can only go to current or previous answered questions

              return (
                <button
                  key={index}
                  onClick={() => {
                    // Prevent navigation to future questions or going back
                    if (index > currentIndex) {
                      alert('You must answer questions in order. Please complete the current question first.');
                      return;
                    }
                    if (index < currentIndex) {
                      alert('You cannot go back to previous questions.');
                      return;
                    }
                  }}
                  disabled={index !== currentIndex}
                  className={`aspect-square rounded-xl font-bold transition-all duration-200 text-sm ${isCurrent
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110 shadow-xl ring-4 ring-blue-400 ring-opacity-50 cursor-default'
                    : isAnswered
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-md opacity-70 cursor-not-allowed'
                      : 'bg-slate-700 text-slate-300 border-2 border-slate-600 opacity-50 cursor-not-allowed'
                    }`}
                  title={
                    isCurrent
                      ? `Current Question ${index + 1}`
                      : index < currentIndex
                        ? `Question ${index + 1} (Completed - Cannot go back)`
                        : `Question ${index + 1} (Locked - Answer current question first)`
                  }
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            ✓ Green = Answered • Blue = Current • Gray = Locked
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ExamTakePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ExamContent />
    </Suspense>
  );
}
