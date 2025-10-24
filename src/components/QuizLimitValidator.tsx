'use client';

import { useState, useEffect } from 'react';
import { LimitConfig, TimePeriod } from '@/types/quiz-limits';

interface QuizLimitData {
  limitConfig: LimitConfig;
  currentUsage: {
    quizCount: number;
  };
  requestedQuestions: number;
  validation: {
    canCreateQuiz: boolean;
    remainingQuizzes: number;
    errors: string[];
  };
  timePeriod: {
    startDate: string;
    type: TimePeriod;
  };
}

interface QuizLimitValidatorProps {
  requestedQuestions: number;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
  onLimitDataChange?: (data: QuizLimitData | null) => void;
}

export default function QuizLimitValidator({ 
  requestedQuestions, 
  onValidationChange, 
  onLimitDataChange 
}: QuizLimitValidatorProps) {
  const [limitData, setLimitData] = useState<QuizLimitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestedQuestions >= 3) {
      checkQuizLimits();
    } else {
      onValidationChange(false, ['Minimum 3 questions required for a quiz.']);
      onLimitDataChange?.(null);
    }
  }, [requestedQuestions]);

  const checkQuizLimits = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/quiz-limits/check?questions=${requestedQuestions}`);
      const result = await response.json();
      console.log('result.data', result.data);
      
      if (result.success) {
        setLimitData(result.data);
        onLimitDataChange?.(result.data);
        
        const { validation } = result.data;
        onValidationChange(
          validation.canCreateQuiz,
          validation.errors
        );
      } else {
        setError(result.error || 'Failed to check quiz limits');
        onValidationChange(false, [result.error || 'Failed to check quiz limits']);
        onLimitDataChange?.(null);
      }
    } catch (err) {
      const errorMessage = 'Failed to check quiz limits';
      setError(errorMessage);
      onValidationChange(false, [errorMessage]);
      onLimitDataChange?.(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTimePeriod = (type: TimePeriod) => {
    switch (type) {
      case TimePeriod.TODAY:
        return 'today';
      case TimePeriod.YESTERDAY:
        return 'yesterday';
      case TimePeriod.WEEK:
        return 'this week';
      case TimePeriod.MONTH:
        return 'this month';
      default:
        return type;
    }
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Checking quiz limits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!limitData) {
    return null;
  }

  const { limitConfig, currentUsage, validation } = limitData;

  return (
    <div className="space-y-3">
      {/* Limit Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Quiz Limits</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Quiz Limit:</span>
            <span className="ml-2 font-medium">
              {formatLimit(limitConfig.quizLimit)} per {formatTimePeriod(limitConfig.timePeriod)}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Question Limit:</span>
            <span className="ml-2 font-medium">
              {formatLimit(limitConfig.questionLimit)} per assessment
            </span>
          </div>
        </div>
      </div>

      {/* Current Usage */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Current Usage</h4>
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Quizzes Created:</span>
            <span className="ml-2 font-medium">{currentUsage.quizCount}</span>
          </div>
        </div>
      </div>

      {/* Remaining Limits */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">Remaining</h4>
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div>
            <span className="text-green-700">Quizzes:</span>
            <span className="ml-2 font-medium">
              {formatLimit(validation.remainingQuizzes)}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2">Limits Exceeded</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {validation.canCreateQuiz && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 font-medium">
              You can create this quiz with {requestedQuestions} questions.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
