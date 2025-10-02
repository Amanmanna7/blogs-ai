'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QuestionType } from '@prisma/client';

interface Question {
  id: string;
  text: string;
  options: any;
  correctAnswer: any;
  explanation: string;
  type: QuestionType;
}

interface AssessmentQuestion {
  id: string;
  sequence: number;
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
}

export default function AssessmentPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [questionStatus, setQuestionStatus] = useState<Record<number, 'unvisited' | 'current' | 'answered' | 'skipped'>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [slug]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments?blogSlug=${slug}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setAssessment(data.data[0]);
        // Initialize question status
        const status: Record<number, 'unvisited' | 'current' | 'answered' | 'skipped'> = {};
        for (let i = 0; i < data.data[0].totalQuestions; i++) {
          status[i] = i === 0 ? 'current' : 'unvisited';
        }
        setQuestionStatus(status);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
    
    // Check if answer is meaningful (not empty, null, or empty array)
    const hasAnswer = answer && 
      (Array.isArray(answer) ? answer.length > 0 : answer !== '' && answer !== null);
    
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion]: hasAnswer ? 'answered' : 'skipped'
    }));
  };

  const navigateToQuestion = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion]: answers[currentQuestion] ? 'answered' : 'skipped',
      [questionIndex]: 'current'
    }));
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      navigateToQuestion(currentQuestion - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestion < (assessment?.totalQuestions || 0) - 1) {
      navigateToQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/assessment-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId: assessment?.id,
          answers: Object.entries(answers).map(([questionIndex, answer]) => ({
            questionId: assessment?.assessmentQuestions[parseInt(questionIndex)]?.question.id,
            answer
          }))
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to results page
        window.location.href = `/blogs/${slug}/assessment/results`;
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Assessment</h3>
          <p className="text-gray-600">Preparing your personalized quiz...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Assessment Not Found</h1>
          <p className="text-gray-600 mb-8">The assessment you're looking for doesn't exist or has been removed.</p>
          <a 
            href={`/blogs/${slug}`} 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  const currentQuestionData = assessment.assessmentQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === assessment.totalQuestions - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Responsive Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">{assessment.title}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></span>
                    Question {currentQuestion + 1} of {assessment.totalQuestions}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 ml-4">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-700 capitalize">{assessment.level}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {assessment.assessmentQuestions[currentQuestion]?.question.type.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {Math.round(((currentQuestion + 1) / assessment.totalQuestions) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestion + 1) / assessment.totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Responsive Question Navigation */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Question Navigation</h3>
              <div className="text-xs sm:text-sm text-gray-600">
                {Object.values(questionStatus).filter(status => status === 'answered').length} answered
              </div>
            </div>
            <div className="relative px-2 pt-2">
              <div className="flex overflow-x-auto gap-2 sm:gap-3 p-2 scrollbar-hide">
                {Array.from({ length: assessment.totalQuestions }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToQuestion(index)}
                    className={`group relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-md flex-shrink-0 ${
                      questionStatus[index] === 'current'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                        : questionStatus[index] === 'answered'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                        : questionStatus[index] === 'skipped'
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="relative z-10">{index + 1}</span>
                    {questionStatus[index] === 'answered' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full flex items-center justify-center">
                        <svg className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {/* Blur effect at the end */}
              <div className="absolute top-2 right-2 w-8 h-full bg-gradient-to-l from-white/80 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Mobile Responsive Question Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden mb-6 sm:mb-8">
          {/* Simplified Question Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">Q{currentQuestion + 1}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentQuestionData?.question.text}
              </h2>
            </div>
          </div>
          
          {/* Mobile Responsive Question Body */}
          <div className="p-4 sm:p-8">

            {/* Mobile Responsive Answer Options */}
            <div className="space-y-3 sm:space-y-4">
              {currentQuestionData?.question.type === 'TRUE_FALSE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      className={`group relative flex items-start p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                        answers[currentQuestion] === option
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 sm:border-3 mr-3 sm:mr-4 mt-0.5 flex-shrink-0 transition-all duration-300 ${
                        answers[currentQuestion] === option
                          ? 'border-blue-500 bg-blue-500 shadow-lg'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {answers[currentQuestion] === option && (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <span className="text-sm sm:text-md font-semibold text-gray-800">{option}</span>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">
                          {option === 'True' ? 'This statement is correct' : 'This statement is incorrect'}
                        </div>
                      </div>
                      {answers[currentQuestion] === option && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {currentQuestionData?.question.type === 'MCQ_SINGLE' && (
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(currentQuestionData?.question.options || {}).map(([key, value]) => (
                    <label
                      key={key}
                      className={`group relative flex items-start p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                        answers[currentQuestion] === key
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={key}
                        checked={answers[currentQuestion] === key}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 sm:border-3 mr-3 sm:mr-4 mt-0.5 flex-shrink-0 transition-all duration-300 ${
                        answers[currentQuestion] === key
                          ? 'border-blue-500 bg-blue-500 shadow-lg'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {answers[currentQuestion] === key && (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <span className="font-bold text-blue-600 text-base sm:text-md flex-shrink-0">{key.toUpperCase()}.</span>
                          <span className="text-base sm:text-md text-gray-800 leading-relaxed break-words hyphens-auto overflow-hidden">{value as string}</span>
                        </div>
                      </div>
                      {answers[currentQuestion] === key && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {currentQuestionData?.question.type === 'MCQ_MULTIPLE' && (
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(currentQuestionData?.question.options || {}).map(([key, value]) => (
                    <label
                      key={key}
                      className={`group relative flex items-start p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                        (answers[currentQuestion] || []).includes(key)
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(answers[currentQuestion] || []).includes(key)}
                        onChange={(e) => {
                          const currentAnswers = answers[currentQuestion] || [];
                          if (e.target.checked) {
                            handleAnswerChange([...currentAnswers, key]);
                          } else {
                            handleAnswerChange(currentAnswers.filter((a: string) => a !== key));
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 sm:border-3 mr-3 sm:mr-4 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        (answers[currentQuestion] || []).includes(key)
                          ? 'border-blue-500 bg-blue-500 shadow-lg'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {(answers[currentQuestion] || []).includes(key) && (
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <span className="font-bold text-blue-600 text-base sm:text-lg flex-shrink-0">{key.toUpperCase()}.</span>
                          <span className="text-base sm:text-lg text-gray-800 leading-relaxed break-words hyphens-auto overflow-hidden">{value as string}</span>
                        </div>
                      </div>
                      {(answers[currentQuestion] || []).includes(key) && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {currentQuestionData?.question.type === 'FILL_BLANK' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={answers[currentQuestion] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-4 sm:p-6 border-2 sm:border-3 border-gray-200 rounded-xl sm:rounded-2xl text-base sm:text-lg focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-6">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Be specific and concise in your answer
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress indicator above buttons */}
        <div className="flex justify-end mb-3">
          <div className="text-xs text-gray-600">
            {Object.values(questionStatus).filter(status => status === 'answered').length} of {assessment.totalQuestions} answered
          </div>
        </div>

        {/* Mobile Responsive Navigation Buttons */}
        <div className="flex flex-row justify-between items-center space-x-4">
          <button
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
            className="group flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer flex-1 sm:flex-none"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="group flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl cursor-pointer flex-1 sm:flex-none"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="group flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl cursor-pointer flex-1 sm:flex-none"
            >
              Next
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
