import { useState, useEffect, useCallback } from 'react';
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

interface UseQuizLimitsReturn {
  limitData: QuizLimitData | null;
  loading: boolean;
  error: string | null;
  checkLimits: (requestedQuestions: number) => Promise<void>;
  isValid: boolean;
  errors: string[];
}

export function useQuizLimits(): UseQuizLimitsReturn {
  const [limitData, setLimitData] = useState<QuizLimitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const checkLimits = useCallback(async (requestedQuestions: number) => {
    if (requestedQuestions < 3) {
      setIsValid(false);
      setErrors(['Minimum 3 questions required for a quiz.']);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/quiz-limits/check?questions=${requestedQuestions}`);
      const result = await response.json();

      console.log('result', result);
      
      if (result.success) {
        setLimitData(result.data);
        
        const { validation } = result.data;
        setIsValid(validation.canCreateQuiz);
        setErrors(validation.errors);
      } else {
        const errorMessage = result.error || 'Failed to check quiz limits';
        setError(errorMessage);
        setIsValid(false);
        setErrors([errorMessage]);
      }
    } catch (err) {
      const errorMessage = 'Failed to check quiz limits';
      setError(errorMessage);
      setIsValid(false);
      setErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    limitData,
    loading,
    error,
    checkLimits,
    isValid,
    errors
  };
}

export default useQuizLimits;
