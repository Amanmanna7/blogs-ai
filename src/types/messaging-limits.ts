export enum TimePeriod {
  TODAY = 'today',           // From beginning of today
  YESTERDAY = 'yesterday',   // From beginning of yesterday
  WEEK = 'week',             // From beginning of this week
  MONTH = 'month'           // From beginning of this month
}

export interface LimitConfig {
  messageLimit: number;
  timePeriod: TimePeriod;
}

// Feature slugs for different messaging limits
export enum FeatureSlug {
  AI_CHAT = 'ai-chat',
  EXTENDED_DOUBT_CLEARNING = 'extended-doubt-clearning',
  ADVANCE_DOUBT_CLEARNING = 'advance-doubt-clearning',
  EXPERT_DOUBT_CLEARNING = 'expert-doubt-clearning'
}

// AI Message Limits Configuration
export const AI_MESSAGE_LIMITS: Record<string, LimitConfig> = {
  [FeatureSlug.AI_CHAT]: {
    messageLimit: 15,
    timePeriod: TimePeriod.YESTERDAY
  },
  [FeatureSlug.EXTENDED_DOUBT_CLEARNING]: {
    messageLimit: 50,
    timePeriod: TimePeriod.YESTERDAY
  },
  [FeatureSlug.ADVANCE_DOUBT_CLEARNING]: {
    messageLimit: 100,
    timePeriod: TimePeriod.TODAY
  },
  [FeatureSlug.EXPERT_DOUBT_CLEARNING]: {
    messageLimit: -1, // Unlimited
    timePeriod: TimePeriod.TODAY
  }
};

// Free tier limits (fallback)
export const FREE_TIER_LIMITS: LimitConfig = {
  messageLimit: 15,
  timePeriod: TimePeriod.YESTERDAY
};

/**
 * Get message limit configuration for a specific feature slug
 * @param featureSlug - The feature slug to get limits for
 * @returns LimitConfig object with messageLimit and timePeriod
 */
export function getMessageLimit(featureSlug: string): LimitConfig {
  return AI_MESSAGE_LIMITS[featureSlug] || FREE_TIER_LIMITS;
}

/**
 * Find the first matching feature slug from user's plan features
 * @param userPlanFeatures - Array of feature slugs from user's plan
 * @returns LimitConfig object for the first matching feature, or free tier limits
 */
export function getMessageLimitFromUserPlan(userPlanFeatures: string[]): LimitConfig {
  // Check each feature slug in order of priority (highest to lowest)
  const priorityOrder = [
    FeatureSlug.EXPERT_DOUBT_CLEARNING,
    FeatureSlug.ADVANCE_DOUBT_CLEARNING,
    FeatureSlug.EXTENDED_DOUBT_CLEARNING,
    FeatureSlug.AI_CHAT
  ];

  // Find the first matching feature from user's plan
  for (const featureSlug of priorityOrder) {
    if (userPlanFeatures.includes(featureSlug)) {
      return AI_MESSAGE_LIMITS[featureSlug];
    }
  }

  // If no matching feature found, return free tier limits
  return FREE_TIER_LIMITS;
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
 * Check if a user has unlimited messaging
 * @param limitConfig - The limit configuration to check
 * @returns boolean indicating if messaging is unlimited
 */
export function isUnlimitedMessaging(limitConfig: LimitConfig): boolean {
  return limitConfig.messageLimit === -1;
}

/**
 * Get remaining messages for a user
 * @param messageCount - Current message count
 * @param limitConfig - The limit configuration
 * @returns number of remaining messages (-1 for unlimited)
 */
export function getRemainingMessages(messageCount: number, limitConfig: LimitConfig): number {
  if (isUnlimitedMessaging(limitConfig)) {
    return -1;
  }
  return Math.max(0, limitConfig.messageLimit - messageCount);
}
