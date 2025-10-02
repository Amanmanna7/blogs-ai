'use client';

import { useState, useEffect } from 'react';
import { QuestionLevel, QuestionType } from '@prisma/client';

interface UserPreference {
  id: string;
  level: QuestionLevel;
  allowedTypes: QuestionType[];
  totalQuestions: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface AssessmentUserPreferenceProps {
  blogId?: string;
  chapterTopicId?: string;
  courseId?: string;
  onAssessmentCreated?: (assessmentId: string) => void;
}

const QUESTION_LEVELS = [
  { value: 'EASY', label: 'Easy', description: 'Basic concepts and definitions' },
  { value: 'MEDIUM', label: 'Medium', description: 'Intermediate understanding' },
  { value: 'HARD', label: 'Hard', description: 'Advanced concepts and analysis' },
  { value: 'ADVANCE', label: 'Advanced', description: 'Expert-level knowledge' }
];

const QUESTION_TYPES = [
  { value: 'TRUE_FALSE', label: 'True/False', description: 'Simple yes/no questions' },
  { value: 'MCQ_SINGLE', label: 'Single Choice', description: 'Choose one correct answer' },
  { value: 'MCQ_MULTIPLE', label: 'Multiple Choice', description: 'Choose multiple correct answers' },
  { value: 'FILL_BLANK', label: 'Fill in the Blank', description: 'Complete the missing text' },
  { value: 'MIXED', label: 'Mixed', description: 'Various question types' }
];

export default function AssessmentUserPreference({
  blogId,
  chapterTopicId,
  courseId,
  onAssessmentCreated
}: AssessmentUserPreferenceProps) {
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [assessmentCreated, setAssessmentCreated] = useState(false);
  const [assessmentUrl, setAssessmentUrl] = useState<string | null>(null);

  // Form state
  const [level, setLevel] = useState<QuestionLevel>('MEDIUM');
  const [allowedTypes, setAllowedTypes] = useState<QuestionType[]>(['MCQ_SINGLE']);
  const [totalQuestions, setTotalQuestions] = useState(5);

  useEffect(() => {
    fetchUserPreference();
  }, []);

  const fetchUserPreference = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user-preferences');
      const data = await response.json();

      if (data.success && data.data) {
        setUserPreference(data.data);
        setLevel(data.data.level);
        setAllowedTypes(data.data.allowedTypes);
        setTotalQuestions(data.data.totalQuestions);
      }
    } catch (error) {
      console.error('Error fetching user preference:', error);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: QuestionType, checked: boolean) => {
    if (checked) {
      setAllowedTypes(prev => [...prev, type]);
    } else {
      setAllowedTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user-preferences', {
        method: userPreference ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          allowedTypes,
          totalQuestions
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserPreference(data.data);
        setIsEditing(false);
        
        // Create assessment if we have context
        if (blogId || chapterTopicId || courseId) {
          await createAssessment();
        }
      } else {
        setError(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const createAssessment = async () => {
    try {
      setGenerating(true);
      setQuizStarted(true);
      setError(null);
      
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'AI-Powered Quiz',
          description: 'Test your knowledge with AI-generated questions',
          level,
          allowedTypes,
          totalQuestions,
          blogId,
          chapterTopicId,
          courseId
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Call the callback if provided
        if (onAssessmentCreated) {
          onAssessmentCreated(data.data.id);
        }
        
        // Don't redirect immediately - let the user choose when to start the assessment
        setAssessmentCreated(true);
        
        // Set the assessment URL for the user to navigate to
        if (blogId && data.data.blog?.slug) {
          setAssessmentUrl(`/blogs/${data.data.blog.slug}/assessment`);
        } else if (chapterTopicId) {
          setAssessmentUrl(`/courses/${courseId}/assessment`);
        } else if (courseId) {
          setAssessmentUrl(`/courses/${courseId}/assessment`);
        }
        
      } else {
        setError(data.error || 'Failed to create assessment');
        setQuizStarted(false);
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      setError('Failed to create assessment');
      setQuizStarted(false);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userPreference && !isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">Quiz Preferences</h3>
              <p className="text-blue-100 hidden sm:block">Your personalized quiz settings are ready</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              disabled={quizStarted}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 cursor-pointer border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Edit Preferences
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Difficulty Level Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Difficulty</label>
                    <p className="text-lg font-bold text-blue-900">
                      {QUESTION_LEVELS.find(l => l.value === userPreference.level)?.label}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-blue-700">
                  {QUESTION_LEVELS.find(l => l.value === userPreference.level)?.description}
                </p>
              </div>
            </div>

            {/* Question Types Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">Question Types</label>
                    <p className="text-sm text-green-700">{userPreference.allowedTypes.length} selected</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userPreference.allowedTypes.map(type => (
                    <span
                      key={type}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800"
                    >
                      {QUESTION_TYPES.find(t => t.value === type)?.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Number of Questions Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Questions</label>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-purple-900 mr-2">
                        {userPreference.totalQuestions}
                      </span>
                      <span className="text-sm text-purple-700">
                        {userPreference.totalQuestions === 1 ? 'question' : 'questions'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            {quizStarted && !assessmentCreated && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Generating Quiz...</p>
                    <p className="text-xs text-blue-600">Please wait while we create your personalized quiz.</p>
                  </div>
                </div>
              </div>
            )}
            
            {assessmentCreated && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Quiz Created Successfully!</p>
                      <p className="text-xs text-green-600">Your personalized quiz is ready to begin.</p>
                    </div>
                  </div>
                  {assessmentUrl && (
                    <a
                      href={assessmentUrl}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Start Quiz
                    </a>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Generate Assessment</h4>
                <p className="text-sm text-gray-600">
                  {quizStarted ? 'Quiz is being generated...' : 'Your quiz is configured and ready to begin'}
                </p>
              </div>
              <button
                onClick={createAssessment}
                disabled={generating || quizStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold text-base hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center">
                  {generating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : assessmentCreated ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Quiz Created
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
                      </svg>
                      Start Quiz
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {userPreference ? 'Edit Quiz Preferences' : 'Set Up Your Quiz Preferences'}
        </h3>
        <p className="text-sm text-gray-600">
          Customize your quiz experience with personalized settings
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Difficulty Level */}
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-4">
            Difficulty Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QUESTION_LEVELS.map((levelOption) => (
              <label
                key={levelOption.value}
                className={`relative group cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                  level === levelOption.value
                    ? 'scale-105'
                    : 'hover:scale-102'
                }`}
              >
                <input
                  type="radio"
                  name="level"
                  value={levelOption.value}
                  checked={level === levelOption.value}
                  onChange={(e) => setLevel(e.target.value as QuestionLevel)}
                  className="sr-only"
                />
                <div className={`relative p-4 border-2 rounded-xl transition-all duration-200 ${
                  level === levelOption.value
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      level === levelOption.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {level === levelOption.value && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm transition-colors duration-200 ${
                        level === levelOption.value ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {levelOption.label}
                      </div>
                      <div className={`text-xs mt-1 transition-colors duration-200 ${
                        level === levelOption.value ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {levelOption.description}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Question Types */}
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-4">
            Question Types
            <span className="text-sm font-normal text-gray-500 ml-2">(Select one or more)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUESTION_TYPES.map((type) => (
              <label
                key={type.value}
                className="group cursor-pointer transition-all duration-200 transform hover:scale-102"
              >
                <div className={`flex items-center p-3 border-2 rounded-xl transition-all duration-200 ${
                  allowedTypes.includes(type.value as QuestionType)
                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                }`}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={allowedTypes.includes(type.value as QuestionType)}
                      onChange={(e) => handleTypeChange(type.value as QuestionType, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                      allowedTypes.includes(type.value as QuestionType)
                        ? 'bg-green-600 border-green-600'
                        : 'border-green-300 bg-white'
                    }`}>
                      {allowedTypes.includes(type.value as QuestionType) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className={`font-semibold text-sm transition-colors duration-200 ${
                      allowedTypes.includes(type.value as QuestionType) ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </div>
                    <div className={`text-xs mt-1 transition-colors duration-200 ${
                      allowedTypes.includes(type.value as QuestionType) ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {type.description}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-4">
            Number of Questions
          </label>
          <div className="relative">
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="relative">
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((totalQuestions - 3) / 7) * 100}%, #e5e7eb ${((totalQuestions - 3) / 7) * 100}%, #e5e7eb 100%)`
                  }}
                />
                {/* Custom thumb with number inside */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center pointer-events-none z-20 transition-all duration-200 hover:scale-110 hover:shadow-xl"
                  style={{
                    left: `calc(${((totalQuestions - 3) / 7) * 100}% - 16px)`,
                    top: '0.75rem'
                  }}
                >
                  <span className="text-white text-xs font-bold">
                    {totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          {userPreference && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving || allowedTypes.length === 0 || quizStarted}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              userPreference ? 'Update Preferences' : 'Save Preferences'
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 0;
          width: 0;
          background: transparent;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 0;
          width: 0;
          background: transparent;
          cursor: pointer;
          border: none;
        }
        
        .slider::-ms-thumb {
          height: 0;
          width: 0;
          background: transparent;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
