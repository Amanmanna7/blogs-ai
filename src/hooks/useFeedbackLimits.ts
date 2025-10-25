import { useState, useEffect } from 'react';
import { 
  getFeedbackLimitFromUserPlan, 
  getLimitStartDate, 
  validateFeedbackGeneration,
  LimitConfig,
  isEligibleForFeedback
} from '@/types/feedback-limits';

interface FeedbackLimitData {
  hasActivePlan: boolean;
  feedbackLimit: number;
  remainingFeedback: number;
  feedbackCount: number;
  featureSlug: string;
  timePeriod: string;
  userPlanFeatures: string[];
  isEligibleForFeedback: boolean;
}

interface UseFeedbackLimitsReturn {
  limitData: FeedbackLimitData | null;
  checkLimits: () => Promise<void>;
  isValid: boolean;
  errors: string[];
  loading: boolean;
}

export function useFeedbackLimits(): UseFeedbackLimitsReturn {
  const [limitData, setLimitData] = useState<FeedbackLimitData | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const checkLimits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feedback-limits/check');
      console.log('response', response);
      const data = await response.json();

      if (data.success) {
        setLimitData(data.data);
        
        // Validate feedback generation
        const validation = validateFeedbackGeneration(
          data.data.feedbackCount, 
          {
            feedbackReport: data.data.feedbackLimit,
            timePeriod: data.data.timePeriod as any,
            isEligibleForFeedback: data.data.isEligibleForFeedback
          }
        );
        
        setIsValid(validation.canGenerateFeedback);
        setErrors(validation.errors);
      } else {
        setErrors([data.error || 'Failed to check feedback limits']);
        setIsValid(false);
      }
    } catch (error) {
      console.error('Error checking feedback limits:', error);
      setErrors(['Failed to check feedback limits']);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLimits();
  }, []);

  return {
    limitData,
    checkLimits,
    isValid,
    errors,
    loading
  };
}
