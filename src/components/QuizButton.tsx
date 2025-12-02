'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface QuizButtonProps {
  blogId?: string;
  chapterTopicId?: string;
  courseId?: string;
  blogSlug?: string;
}

interface Assessment {
  id: string;
  status: string;
  totalQuestions: number;
  assessmentQuestions: Array<{
    userAnswer: any;
    isCorrect: boolean;
  }>;
}

interface AssessmentResult {
  score: number;
  percentage: number;
  totalQuestions: number;
}

export default function QuizButton({ 
  blogId, 
  chapterTopicId, 
  courseId, 
  blogSlug 
}: QuizButtonProps) {
  const { isSignedIn, user } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn && (blogId || chapterTopicId || courseId || blogSlug)) {
      fetchAssessmentData();
    } else {
      setLoading(false);
    }
  }, [isSignedIn, blogId, chapterTopicId, courseId, blogSlug]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (blogId) params.append('blogId', blogId);
      if (chapterTopicId) params.append('chapterTopicId', chapterTopicId);
      if (courseId) params.append('courseId', courseId);
      if (blogSlug) params.append('blogSlug', blogSlug);

      const response = await fetch(`/api/assessments?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const latestAssessment = data.data[0];
        setAssessment(latestAssessment);
        
        // If assessment is completed, calculate results
        if (latestAssessment.status === 'COMPLETED') {
          const correctAnswers = latestAssessment.assessmentQuestions.filter((aq: any) => aq.isCorrect).length;
          const percentage = Math.round((correctAnswers / latestAssessment.totalQuestions) * 100);
          setResult({
            score: correctAnswers,
            percentage,
            totalQuestions: latestAssessment.totalQuestions
          });
        }
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuizUrl = () => {
    if (assessment?.status === 'COMPLETED') {
      return `/blogs/${blogSlug}/assessment/results`;
    } else if (assessment?.status === 'ACTIVE') {
      return `/blogs/${blogSlug}/assessment`;
    } else {
      return `/quiz?${new URLSearchParams({
        ...(blogId && { blogId }),
        ...(chapterTopicId && { chapterTopicId }),
        ...(courseId && { courseId }),
        ...(blogSlug && { slug: blogSlug })
      }).toString()}`;
    }
  };

  const getButtonText = () => {
    if (assessment?.status === 'COMPLETED') {
      return 'View Results';
    } else if (assessment?.status === 'ACTIVE') {
      return 'Resume Quiz';
    } else {
      return 'Start Quiz';
    }
  };

  const getButtonDescription = () => {
    if (assessment?.status === 'COMPLETED') {
      return 'Review your quiz performance';
    } else if (assessment?.status === 'ACTIVE') {
      return 'Continue where you left off';
    } else {
      return 'Test your knowledge';
    }
  };

  if (!isSignedIn) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-xl border-2 border-yellow-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">AI Quiz</h3>
              <p className="text-sm text-gray-600">Unlock personalized learning</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Features Grid */}
         <div className="grid grid-cols-2 gap-3 mb-4">
           <div className="flex items-center space-x-2">
             <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
               <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
               </svg>
             </div>
             <span className="text-xs font-medium text-gray-700">AI-Generated</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
               <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <span className="text-xs font-medium text-gray-700">Instant Feedback</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
               <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
             </div>
             <span className="text-xs font-medium text-gray-700">Progress Track</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
               <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
               </svg>
             </div>
             <span className="text-xs font-medium text-gray-700">Customizable</span>
           </div>
         </div>

        <Link
          href="/sign-in"
          className="group block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 relative overflow-hidden shadow-lg"
        >
          <span className="relative z-10 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Unlock AI Quizzes</span>
          </span>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-xl border-2 border-blue-200/60 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div>
              <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-xl border-2 border-blue-200/60 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">AI Quiz</h3>
          <p className="text-sm text-gray-600">{getButtonDescription()}</p>
        </div>
      </div>

      {/* Show result summary if assessment is completed */}
      {result && (
        <div className="mb-4 p-3 bg-white/60 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Completed</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{result.percentage}%</div>
              <div className="text-xs text-gray-500">{result.score}/{result.totalQuestions} correct</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>AI-Generated</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Instant Feedback</span>
        </div>
      </div>

      <Link
        href={getQuizUrl()}
        className="group block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 relative overflow-hidden shadow-lg"
      >
        <span className="relative z-10 flex items-center justify-center space-x-2">
          <span>{getButtonText()}</span>
          <svg 
            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
      </Link>
    </div>
  );
}
