export enum TimePeriod {
  TODAY = 'today',           // From beginning of today
  YESTERDAY = 'yesterday',   // From beginning of yesterday
  WEEK = 'week',             // From beginning of this week
  MONTH = 'month'           // From beginning of this month
}

export interface LimitConfig {
  quizLimit: number;
  timePeriod: TimePeriod;
  questionLimit: number; 
}

// Feature slugs for different quiz limits
export enum FeatureSlug {
  QUIZ_BASIC = 'quiz-basic',
  QUIZ_STANDARD = 'quiz-standard',
  QUIZ_PREMIUM = 'quiz-premium',
  QUIZ_UNLIMITED = 'quiz-unlimited'
}

// Quiz Limits Configuration
export const QUIZ_LIMITS: Record<string, LimitConfig> = {
  [FeatureSlug.QUIZ_BASIC]: {
    quizLimit: 1,
    timePeriod: TimePeriod.WEEK,
    questionLimit: 5
  },
  [FeatureSlug.QUIZ_STANDARD]: {
    quizLimit: 2,
    timePeriod: TimePeriod.TODAY,
    questionLimit: 10
  },
  [FeatureSlug.QUIZ_PREMIUM]: {
    quizLimit: 10,
    timePeriod: TimePeriod.TODAY,
    questionLimit: 10
  },
  [FeatureSlug.QUIZ_UNLIMITED]: {
    quizLimit: -1, // Unlimited
    timePeriod: TimePeriod.TODAY,
    questionLimit: -1 // Unlimited
  }
};

// Free tier limits (fallback)
export const FREE_TIER_QUIZ_LIMITS: LimitConfig = {
  quizLimit: 1,
  timePeriod: TimePeriod.WEEK,
  questionLimit: 5
};

/**
 * Get quiz limit configuration for a specific feature slug
 * @param featureSlug - The feature slug to get limits for
 * @returns LimitConfig object with quizLimit, timePeriod, and questionLimit
 */
export function getQuizLimit(featureSlug: string): LimitConfig {
  return QUIZ_LIMITS[featureSlug] || FREE_TIER_QUIZ_LIMITS;
}

/**
 * Find the first matching feature slug from user's plan features
 * @param userPlanFeatures - Array of feature slugs from user's plan
 * @returns LimitConfig object for the first matching feature, or free tier limits
 */
export function getQuizLimitFromUserPlan(userPlanFeatures: string[]): LimitConfig {
  // Check each feature slug in order of priority (highest to lowest)
  const priorityOrder = [
    FeatureSlug.QUIZ_UNLIMITED,
    FeatureSlug.QUIZ_PREMIUM,
    FeatureSlug.QUIZ_STANDARD,
    FeatureSlug.QUIZ_BASIC
  ];

  // Find the first matching feature from user's plan
  for (const featureSlug of priorityOrder) {
    if (userPlanFeatures.includes(featureSlug)) {
      return QUIZ_LIMITS[featureSlug];
    }
  }

  // If no matching feature found, return free tier limits
  return FREE_TIER_QUIZ_LIMITS;
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
 * Check if a user has unlimited quiz creation
 * @param limitConfig - The limit configuration to check
 * @returns boolean indicating if quiz creation is unlimited
 */
export function isUnlimitedQuizCreation(limitConfig: LimitConfig): boolean {
  return limitConfig.quizLimit === -1;
}

/**
 * Check if a user has unlimited question creation
 * @param limitConfig - The limit configuration to check
 * @returns boolean indicating if question creation is unlimited
 */
export function isUnlimitedQuestionCreation(limitConfig: LimitConfig): boolean {
  return limitConfig.questionLimit === -1;
}

/**
 * Get remaining quizzes for a user
 * @param quizCount - Current quiz count
 * @param limitConfig - The limit configuration
 * @returns number of remaining quizzes (-1 for unlimited)
 */
export function getRemainingQuizzes(quizCount: number, limitConfig: LimitConfig): number {
  if (isUnlimitedQuizCreation(limitConfig)) {
    return -1;
  }
  return Math.max(0, limitConfig.quizLimit - quizCount);
}

/**
 * Get remaining questions for a user
 * @param questionCount - Current question count
 * @param limitConfig - The limit configuration
 * @returns number of remaining questions (-1 for unlimited)
 */
export function getRemainingQuestions(questionCount: number, limitConfig: LimitConfig): number {
  if (isUnlimitedQuestionCreation(limitConfig)) {
    return -1;
  }
  return Math.max(0, limitConfig.questionLimit - questionCount);
}

/**
 * Validate if user can create a quiz
 * @param quizCount - Current quiz count
 * @param limitConfig - The limit configuration
 * @returns object with validation result and remaining limits
 */
export function validateQuizCreation(
  quizCount: number, 
  limitConfig: LimitConfig
): {
  canCreateQuiz: boolean;
  remainingQuizzes: number;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check quiz limit
  const remainingQuizzes = getRemainingQuizzes(quizCount, limitConfig);
  const canCreateQuiz = isUnlimitedQuizCreation(limitConfig) || remainingQuizzes > 0;
  
  if (!canCreateQuiz) {
    errors.push(`Quiz limit exceeded. You can create ${limitConfig.quizLimit} quiz(es) per ${limitConfig.timePeriod}.`);
  }
  
  return {
    canCreateQuiz,
    remainingQuizzes,
    errors
  };
}
