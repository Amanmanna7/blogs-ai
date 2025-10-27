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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Assessment Complete!
            </h1>
            
            {/* Subtitle */}
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20 mb-4">
              <p className="text-lg font-semibold text-gray-700">{assessment.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-8">
        {/* Enhanced Score Summary */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-12 overflow-hidden mt-8">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/50 to-blue-100/50 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative">
            {/* Mobile Layout (stacked) */}
            <div className="md:hidden text-center">
              {/* Score Circle with Progress Bar */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 relative">
                  {/* Background circle */}
                  <svg className="w-32 h-32 transform rotate-0" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress circle */}
                    <path
                      className={`${
                        percentage >= 60 
                          ? 'text-green-500' 
                          : percentage >= 40 
                          ? 'text-yellow-500' 
                          : 'text-red-500'
                      }`}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={`${percentage}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className={`text-3xl font-bold ${
                        percentage >= 60 
                          ? 'text-green-600' 
                          : percentage >= 40 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Score Details */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                You scored {score} out of {assessment.totalQuestions}
              </h2>
              
              {/* Performance Message */}
              <div className={`inline-flex items-center px-6 py-3 rounded-full mb-4 ${
                percentage >= 80 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' : 
                percentage >= 60 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-yellow-200' : 
                'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
              }`}>
                <span className="font-semibold">
                  {percentage >= 80 ? '🎉 Excellent work!' : 
                   percentage >= 60 ? '👍 Good job!' : 
                   '💪 Keep studying to improve!'}
                </span>
              </div>
            </div>

            {/* Desktop Layout (side by side) */}
            <div className="hidden md:flex items-center justify-center">
              {/* Left side - Score Circle */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-40 h-40 relative">
                    {/* Background circle */}
                    <svg className="w-40 h-40 transform rotate-0" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Progress circle */}
                      <path
                        className={`${
                          percentage >= 60 
                            ? 'text-green-500' 
                            : percentage >= 40 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                        }`}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray={`${percentage}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className={`text-4xl font-bold ${
                          percentage >= 60 
                            ? 'text-green-600' 
                            : percentage >= 40 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Text Content */}
              <div className="ml-8 text-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  You scored {score} out of {assessment.totalQuestions}
                </h2>
                
                <div className={`inline-flex items-center px-6 py-3 rounded-full ${
                  percentage >= 80 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' : 
                  percentage >= 60 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-yellow-200' : 
                  'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                }`}>
                  <span className="font-semibold text-lg">
                    {percentage >= 80 ? '🎉 Excellent work!' : 
                     percentage >= 60 ? '👍 Good job!' : 
                     '💪 Keep studying to improve!'}
                  </span>
                </div>
              </div>
            </div>
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 overflow-hidden">
                <button
                  onClick={() => toggleAccordion('overall')}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-green-50/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Overall Feedback</h4>
                      <p className="text-sm text-gray-500">Comprehensive performance summary</p>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transform transition-all duration-200 ${
                      accordionOpen.overall ? 'rotate-180 text-green-500' : 'group-hover:text-green-500'
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
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-4 mt-1">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

        {/* Enhanced Question Review */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
              Question Review
            </h3>
            <p className="text-gray-600">Review your answers and learn from the explanations</p>
          </div>
          
          {results.map((result, index) => (
            <div key={index} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                      result.isCorrect 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-r from-red-400 to-pink-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">Question {index + 1}</h4>
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${
                          result.isCorrect 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{result.question.text}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">

                {/* Question Options */}
                {result.question.type === 'TRUE_FALSE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {['True', 'False'].map((option) => (
                      <div
                        key={option}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          option === result.correctAnswer
                            ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                            : option === result.userAnswer && !result.isCorrect
                            ? 'border-red-400 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-lg">{option}</span>
                          {option === result.correctAnswer && (
                            <div className="flex items-center text-green-600 font-medium">
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Correct
                            </div>
                          )}
                          {option === result.userAnswer && !result.isCorrect && (
                            <div className="flex items-center text-red-600 font-medium">
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Your Answer
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.question.type === 'MCQ_SINGLE' && (
                  <div className="space-y-3 mb-6">
                    {Object.entries(result.question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          key === result.correctAnswer
                            ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                            : key === result.userAnswer && !result.isCorrect
                            ? 'border-red-400 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              key === result.correctAnswer
                                ? 'bg-green-500 text-white'
                                : key === result.userAnswer && !result.isCorrect
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {key.toUpperCase()}
                            </div>
                            <span className="text-gray-800 leading-relaxed">{value as string}</span>
                          </div>
                          <div className="flex-shrink-0">
                            {key === result.correctAnswer && (
                              <div className="flex items-center text-green-600 font-medium">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Correct
                              </div>
                            )}
                            {key === result.userAnswer && !result.isCorrect && (
                              <div className="flex items-center text-red-600 font-medium">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Your Answer
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.question.type === 'MCQ_MULTIPLE' && (
                  <div className="space-y-3 mb-6">
                    {Object.entries(result.question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          result.correctAnswer && Array.isArray(result.correctAnswer) && result.correctAnswer.includes(key)
                            ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                            : (result.userAnswer || []).includes(key) && !result.isCorrect
                            ? 'border-red-400 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              result.correctAnswer && Array.isArray(result.correctAnswer) && result.correctAnswer.includes(key)
                                ? 'bg-green-500 text-white'
                                : (result.userAnswer || []).includes(key) && !result.isCorrect
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {key.toUpperCase()}
                            </div>
                            <span className="text-gray-800 leading-relaxed">{value as string}</span>
                          </div>
                          <div className="flex-shrink-0">
                            {result.correctAnswer && Array.isArray(result.correctAnswer) && result.correctAnswer.includes(key) && (
                              <div className="flex items-center text-green-600 font-medium">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Correct
                              </div>
                            )}
                            {(result.userAnswer || []).includes(key) && !result.correctAnswer.includes(key) && (
                              <div className="flex items-center text-red-600 font-medium">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Your Answer
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.question.type === 'FILL_BLANK' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl shadow-lg">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold text-green-800">Correct Answer</span>
                      </div>
                      <p className="text-green-900 font-medium">{result.correctAnswer}</p>
                    </div>
                    {result.userAnswer && (
                      <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-xl shadow-lg">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="font-semibold text-red-800">Your Answer</span>
                        </div>
                        <p className="text-red-900 font-medium">{result.userAnswer}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Explanation */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-blue-900">Explanation</h4>
                  </div>
                  <p className="text-blue-800 leading-relaxed text-lg">{result.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Back to Blog Button */}
        <div className="mt-12 text-center">
          <a
            href={`/blogs/${slug}${assessment?.chapterTopic?.id ? `?chapter=${assessment.chapterTopic.id}` : ''}`}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </a>
        </div>
      </div>
    </div>
  );
}
