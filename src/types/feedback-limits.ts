export enum TimePeriod {
  TODAY = 'today',           // From beginning of today
  YESTERDAY = 'yesterday',   // From beginning of yesterday
  WEEK = 'week',             // From beginning of this week
  MONTH = 'month'           // From beginning of this month
}

export interface LimitConfig {
  feedbackReport: number;
  timePeriod: TimePeriod;
  isEligibleForFeedback: boolean;
}

// Feature slugs for feedback limits
export enum FeatureSlug {
  QUIZ_WITH_FEEDBACK = 'quiz-with-feedback'
}

// Feedback Limits Configuration
export const FEEDBACK_LIMITS: Record<string, LimitConfig> = {
  [FeatureSlug.QUIZ_WITH_FEEDBACK]: {
    feedbackReport: -1, // Unlimited
    timePeriod: TimePeriod.TODAY,
    isEligibleForFeedback: true
  }
};

// Free tier limits (fallback)
export const FREE_TIER_FEEDBACK_LIMITS: LimitConfig = {
  feedbackReport: 0,
  timePeriod: TimePeriod.TODAY,
  isEligibleForFeedback: false
};

/**
 * Get feedback limit configuration for a specific feature slug
 * @param featureSlug - The feature slug to get limits for
 * @returns LimitConfig object with feedbackReport, timePeriod, and isEligibleForFeedback
 */
export function getFeedbackLimit(featureSlug: string): LimitConfig {
  return FEEDBACK_LIMITS[featureSlug] || FREE_TIER_FEEDBACK_LIMITS;
}

/**
 * Find the first matching feature slug from user's plan features
 * @param userPlanFeatures - Array of feature slugs from user's plan
 * @returns LimitConfig object for the first matching feature, or free tier limits
 */
export function getFeedbackLimitFromUserPlan(userPlanFeatures: string[]): LimitConfig {
  // Check if user has the quiz-with-feedback feature
  if (userPlanFeatures.includes(FeatureSlug.QUIZ_WITH_FEEDBACK)) {
    return FEEDBACK_LIMITS[FeatureSlug.QUIZ_WITH_FEEDBACK];
  }

  // If no matching feature found, return free tier limits
  return FREE_TIER_FEEDBACK_LIMITS;
}

/**
 * Get the start date based on time period
 * @param timePeriod - The time period to calculate start date for
 * @returns Date object representing the start of the time period
 */
export function getLimitStartDate(timePeriod: TimePeriod): Date {
  const now = new Date();
  
  switch (timePeriod) {
    case TimePeriod.TODAY:
      // Beginning of today (00:00:00)
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return today;
      
    case TimePeriod.YESTERDAY:
      // Beginning of yesterday (00:00:00)
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      return yesterday;
      
    case TimePeriod.WEEK:
      // Beginning of this week (Monday 00:00:00)
      const weekStart = new Date(now);
      const dayOfWeek = weekStart.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so 6 days back to Monday
      weekStart.setDate(weekStart.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
      
    case TimePeriod.MONTH:
      // Beginning of this month (1st day 00:00:00)
      const monthStart = new Date(now);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      return monthStart;
      
    default:
      // Fallback to yesterday
      const fallback = new Date(now);
      fallback.setDate(fallback.getDate() - 1);
      fallback.setHours(0, 0, 0, 0);
      return fallback;
  }
}

/**
 * Check if a user has unlimited feedback reports
 * @param limitConfig - The limit configuration to check
 * @returns boolean indicating if feedback reports are unlimited
 */
export function isUnlimitedFeedbackReports(limitConfig: LimitConfig): boolean {
  return limitConfig.feedbackReport === -1;
}

/**
 * Check if user is eligible for feedback feature
 * @param limitConfig - The limit configuration to check
 * @returns boolean indicating if user is eligible for feedback
 */
export function isEligibleForFeedback(limitConfig: LimitConfig): boolean {
  return limitConfig.isEligibleForFeedback;
}

/**
 * Get remaining feedback reports for a user
 * @param feedbackCount - Current feedback count
 * @param limitConfig - The limit configuration
 * @returns number of remaining feedback reports (-1 for unlimited)
 */
export function getRemainingFeedbackReports(feedbackCount: number, limitConfig: LimitConfig): number {
  if (isUnlimitedFeedbackReports(limitConfig)) {
    return -1;
  }
  return Math.max(0, limitConfig.feedbackReport - feedbackCount);
}

/**
 * Validate if user can generate feedback
 * @param feedbackCount - Current feedback count
 * @param limitConfig - The limit configuration
 * @returns object with validation result and remaining limits
 */
export function validateFeedbackGeneration(
  feedbackCount: number, 
  limitConfig: LimitConfig
): {
  canGenerateFeedback: boolean;
  remainingFeedback: number;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check if user is eligible for feedback
  if (!isEligibleForFeedback(limitConfig)) {
    errors.push('Feedback generation is not available in your current plan.');
    return {
      canGenerateFeedback: false,
      remainingFeedback: 0,
      errors
    };
  }
  
  // Check feedback limit
  const remainingFeedback = getRemainingFeedbackReports(feedbackCount, limitConfig);
  const canGenerateFeedback = isUnlimitedFeedbackReports(limitConfig) || remainingFeedback > 0;
  
  if (!canGenerateFeedback) {
    errors.push(`Feedback limit exceeded. You can generate ${limitConfig.feedbackReport} feedback report(s) per ${limitConfig.timePeriod}.`);
  }
  
  return {
    canGenerateFeedback,
    remainingFeedback,
    errors
  };
}
