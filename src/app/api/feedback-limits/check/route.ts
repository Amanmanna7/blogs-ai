import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { 
  getFeedbackLimitFromUserPlan, 
  getLimitStartDate, 
  validateFeedbackGeneration,
  LimitConfig 
} from '@/types/feedback-limits';

export async function GET(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      // Get user's plan features
      const userPlan = await prisma.userPlan.findFirst({
        where: { 
          userId: user.id,
          status: 'ACTIVE'
        },
        include: {
          plan: {
            include: {
              features: true
            }
          }
        }
      });

      // Get user's plan features
      const userPlanFeatures = userPlan?.plan?.features?.map(f => f.featureSlug) || [];
      
      // Get limit configuration
      const limitConfig = getFeedbackLimitFromUserPlan(userPlanFeatures);
      
      // Get start date for the time period
      const startDate = getLimitStartDate(limitConfig.timePeriod);
      
      // Count existing feedback reports created by user in the time period
      const feedbackCount = await prisma.assessmentFeedback.count({
        where: {
          assessment: {
            userId: user.id,
            createdAt: {
              gte: startDate
            }
          }
        }
      });

      console.log('limitConfig', limitConfig);
      console.log('startDate', startDate);
      console.log('feedbackCount', feedbackCount);
      
      // Validate feedback generation
      const validation = validateFeedbackGeneration(
        feedbackCount, 
        limitConfig
      );

      return Response.json({
        success: true,
        data: {
          hasActivePlan: !!userPlan,
          feedbackLimit: limitConfig.feedbackReport,
          remainingFeedback: validation.remainingFeedback,
          feedbackCount,
          featureSlug: userPlanFeatures[0] || 'quiz-with-feedback',
          timePeriod: limitConfig.timePeriod,
          userPlanFeatures,
          isEligibleForFeedback: limitConfig.isEligibleForFeedback,
          canGenerateFeedback: validation.canGenerateFeedback,
          errors: validation.errors
        }
      });

    } catch (error) {
      console.error('Error checking feedback limits:', error);
      return Response.json({
        success: false,
        error: 'Failed to check feedback limits'
      });
    }
  })(req);
}
