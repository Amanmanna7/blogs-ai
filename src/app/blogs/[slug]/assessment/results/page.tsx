'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFeedbackLimits } from '@/hooks/useFeedbackLimits';

interface Question {
  id: string;
  text: string;
  options: any;
  correctAnswers: any;
  explanation: string;
  type: string;
}

interface AssessmentQuestion {
  id: string;
  sequence: number;
  userAnswer: any;
  question: Question;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  level: string;
  totalQuestions: number;
  status: string;
  assessmentQuestions: AssessmentQuestion[];
  blog: {
    id: string;
    title: string;
    slug: string;
  };
  chapterTopic: {
    id: string;
  };
  feedback?: {
    id: string;
    rawResponse: {
      overall_feedback: string;
      key_improvement_areas: string[];
      question_level_feedback: string[];
    };
    overallSummary: string;
    createdAt: string;
  };
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState({
    improvements: true,
    questions: true,
    overall: true
  });

  // Feedback limits
  const { limitData, checkLimits, isValid, errors, loading: limitsLoading } = useFeedbackLimits();

  useEffect(() => {
    fetchAssessmentResults();
  }, [slug]);

  const fetchAssessmentResults = async () => {
    try {
      const response = await fetch(`/api/assessments/results?blogSlug=${slug}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setAssessment(data.data);
        calculateScore(data.data);
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async () => {
    if (!assessment) return;
    
    // Check limits first
    if (!isValid) {
      console.log('Feedback generation not allowed:', errors);
      return;
    }
    
    setGeneratingFeedback(true);
    try {
      const response = await fetch('/api/assessments/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId: assessment.id
        })
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        // Update assessment with feedback
        setAssessment(prev => prev ? { ...prev, feedback: data.data } : null);
        // Refresh limits after successful generation
        checkLimits();
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
    } finally {
      setGeneratingFeedback(false);
    }
  };

  const toggleAccordion = (section: keyof typeof accordionOpen) => {
    setAccordionOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateScore = (assessment: Assessment) => {
    let correctCount = 0;
    const questionResults = assessment.assessmentQuestions.map((assessmentQuestion) => {
      const isCorrect = checkAnswer(assessmentQuestion.question, assessmentQuestion.userAnswer);
      if (isCorrect) correctCount++;
      
      return {
        question: assessmentQuestion.question,
        userAnswer: assessmentQuestion.userAnswer,
        correctAnswer: assessmentQuestion.question.correctAnswers,
        isCorrect,
        explanation: assessmentQuestion.question.explanation
      };
    });

    setScore(correctCount);
    setResults(questionResults);
  };

  const checkAnswer = (question: Question, userAnswer: any) => {
    if (question.type === 'TRUE_FALSE' || question.type === 'MCQ_SINGLE' || question.type === 'FILL_BLANK') {
      return userAnswer === question.correctAnswers;
    } else if (question.type === 'MCQ_MULTIPLE') {
      if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswers)) {
        return false;
      }
      return userAnswer.length === question.correctAnswers.length &&
             userAnswer.every(answer => question.correctAnswers.includes(answer));
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h1>
          <p className="text-gray-600 mb-6">The assessment results you're looking for don't exist.</p>
          <a href={`/blogs/${slug}`} className="text-blue-600 hover:text-blue-800">
            ← Back to Blog
          </a>
        </div>
      </div>
    );
  }
  const percentage = Math.round((score / assessment.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
            <p className="text-gray-600">{assessment.title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Score Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">{percentage}%</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              You scored {score} out of {assessment.totalQuestions}
            </h2>
            <p className="text-gray-600">
              {percentage >= 80 ? 'Excellent work!' : 
               percentage >= 60 ? 'Good job!' : 
               'Keep studying to improve!'}
            </p>
          </div>
        </div>

        {/* AI Feedback Section */}
        {assessment.feedback ? (
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-purple-200/50 p-8 mb-8 mt-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">AI Feedback Report</h3>
              <p className="text-gray-600 text-lg">Personalized insights powered by artificial intelligence</p>
            </div>
            
            <div className="grid gap-6">
              {/* Key Improvement Areas */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200/50 overflow-hidden">
                <button
                  onClick={() => toggleAccordion('improvements')}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-orange-50/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Key Areas for Improvement</h4>
                      <p className="text-sm text-gray-500">Focus areas to enhance your understanding</p>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transform transition-all duration-200 ${
                      accordionOpen.improvements ? 'rotate-180 text-orange-500' : 'group-hover:text-orange-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {accordionOpen.improvements && (
                  <div className="px-6 pb-6 animate-fadeIn">
                    <div className="grid gap-4">
                      {assessment.feedback.rawResponse.key_improvement_areas.map((area, index) => (
                        <div key={index} className="group flex items-start p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200/50 hover:shadow-md transition-all duration-200">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-4 mt-1">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed font-medium">{area}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Question Level Feedback */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 overflow-hidden">
                <button
                  onClick={() => toggleAccordion('questions')}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Question-by-Question Analysis</h4>
                      <p className="text-sm text-gray-500">Detailed feedback for each question</p>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transform transition-all duration-200 ${
                      accordionOpen.questions ? 'rotate-180 text-blue-500' : 'group-hover:text-blue-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {accordionOpen.questions && (
                  <div className="px-6 pb-6 animate-fadeIn">
                    <div className="space-y-4">
                      {assessment.feedback.rawResponse.question_level_feedback.map((feedback, index) => (
                        <div key={index} className="group p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mr-3 mt-1">
                              <span className="text-white text-xs font-bold">Q{index + 1}</span>
                            </div>
                            <p className="text-gray-800 leading-relaxed">{feedback}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Overall Feedback */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-200/50 overflow-hidden">
                <button
                  onClick={() => toggleAccordion('overall')}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-purple-50/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Overall Assessment</h4>
                      <p className="text-sm text-gray-500">Comprehensive performance summary</p>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transform transition-all duration-200 ${
                      accordionOpen.overall ? 'rotate-180 text-purple-500' : 'group-hover:text-purple-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {accordionOpen.overall && (
                  <div className="px-6 pb-6 animate-fadeIn">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4 mt-1">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-3.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-lg font-medium">{assessment.feedback.rawResponse.overall_feedback}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 mt-12">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get Personalized AI Feedback</h3>
              <p className="text-gray-600 mb-6">
                Get detailed feedback on your performance with personalized recommendations for improvement.
              </p>
              
              {/* Show different content based on user eligibility */}
              {!limitData?.isEligibleForFeedback ? (
                // User doesn't have feedback feature
                !limitData?.hasActivePlan ? (
                  // Free users - Show attractive upgrade card
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-xl border-2 border-yellow-200 p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Unlock AI-Powered Feedback</h4>
                    
                    <div className="bg-yellow-100 rounded-lg p-3 mb-4">
                      <p className="text-xs text-yellow-800 font-medium">
                        💡 Upgrade to Pro plan to unlock AI feedback and accelerate your learning journey
                      </p>
                    </div>
                    
                    <div className="mb-4 flex justify-center">
                      <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/30 shadow-xl w-fit">
                        <h5 className="font-semibold text-gray-900 text-sm mb-3 text-center">What AI Feedback will help you with:</h5>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center text-xs text-gray-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>Identify your knowledge gaps and weak areas</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>Get personalized study recommendations</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>Understand why you got questions wrong</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>Track your learning progress over time</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <a
                      href="/profile?tab=subscription"
                      className="group block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 relative overflow-hidden shadow-lg"
                    >
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Unlock AI Feedback</span>
                      </span>
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    </a>
                  </div>
                ) : (
                  // Users with plans but no feedback access - Show attractive upgrade message
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Unlock AI-Powered Feedback</h4>
                    
                    <div className="bg-blue-100 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-800 font-medium">
                        💡 Upgrade to Pro plan to unlock AI feedback and accelerate your learning journey
                      </p>
                    </div>
                    
                    <div className="mb-4 flex justify-center">
                      <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/30 shadow-xl w-fit">
                        <h5 className="font-semibold text-gray-900 text-sm mb-3 text-center">What AI Feedback will help you with:</h5>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center text-xs text-gray-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>Identify your knowledge gaps and weak areas</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>Get personalized study recommendations</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>Understand why you got questions wrong</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>Track your learning progress over time</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-200 border-2 border-blue-300 rounded-lg p-3">
                      <p className="text-sm text-blue-900 font-semibold">
                        Your current plan doesn't include AI feedback. Upgrade to a higher plan after your current subscription ends to unlock this powerful feature.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                // User has feedback feature
                <button
                  onClick={generateFeedback}
                  disabled={generatingFeedback || !isValid}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {generatingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span>Generating Feedback...</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center mr-3">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" style={{animationDuration: '3s'}}>
                          <path fill="#fbbf24" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <svg className="w-4 h-4 animate-bounce ml-1" viewBox="0 0 24 24" style={{animationDelay: '0.5s'}}>
                          <path fill="#fcd34d" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <span>Generate AI Feedback</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Detailed Results */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Question Review</h3>
          
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900 mr-3">
                      Question {index + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-lg text-gray-900 mb-4">{result.question.text}</p>
                </div>
              </div>

              {/* Question Options */}
              {result.question.type === 'TRUE_FALSE' && (
                <div className="space-y-2 mb-4">
                  {['True', 'False'].map((option) => (
                    <div
                      key={option}
                      className={`p-3 rounded-lg border-2 ${
                        option === result.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : option === result.userAnswer && !result.isCorrect
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                      {option === result.correctAnswer && (
                        <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                      )}
                      {option === result.userAnswer && !result.isCorrect && (
                        <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.question.type === 'MCQ_SINGLE' && (
                <div className="space-y-2 mb-4">
                  {Object.entries(result.question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border-2 ${
                        key === result.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : key === result.userAnswer && !result.isCorrect
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium mr-2">{key.toUpperCase()}.</span>
                      <span>{value as string}</span>
                      {key === result.correctAnswer && (
                        <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                      )}
                      {key === result.userAnswer && !result.isCorrect && (
                        <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.question.type === 'MCQ_MULTIPLE' && (
                <div className="space-y-2 mb-4">
                  {Object.entries(result.question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border-2 ${
                        result.correctAnswer && Array.isArray(result.correctAnswer) && result.correctAnswer.includes(key)
                          ? 'border-green-500 bg-green-50'
                          : (result.userAnswer || []).includes(key) && !result.isCorrect
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium mr-2">{key.toUpperCase()}.</span>
                      <span>{value as string}</span>
                      {result.correctAnswer && Array.isArray(result.correctAnswer) && result.correctAnswer.includes(key) && (
                        <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                      )}
                      {(result.userAnswer || []).includes(key) && !result.correctAnswer.includes(key) && (
                        <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.question.type === 'FILL_BLANK' && (
                <div className="space-y-3 mb-4">
                  <div className="p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                    <span className="font-medium text-green-800">Correct Answer: </span>
                    <span className="text-green-900">{result.correctAnswer}</span>
                  </div>
                  {result.userAnswer && (
                    <div className="p-3 bg-red-50 border-2 border-red-500 rounded-lg">
                      <span className="font-medium text-red-800">Your Answer: </span>
                      <span className="text-red-900">{result.userAnswer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                <p className="text-blue-800">{result.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Blog Button */}
        <div className="mt-8 text-center">
          <a
            href={`/blogs/${slug}${assessment?.chapterTopic?.id ? `?chapter=${assessment.chapterTopic.id}` : ''}`}
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            ← Back to Blog
          </a>
        </div>
      </div>
    </div>
  );
}
