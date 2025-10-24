import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { 
  getQuizLimitFromUserPlan, 
  getLimitStartDate, 
  validateQuizCreation,
  LimitConfig 
} from '@/types/quiz-limits';

export async function GET(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const requestedQuestions = parseInt(searchParams.get('questions') || '3');
      
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
      const limitConfig = getQuizLimitFromUserPlan(userPlanFeatures);
      
      // Get start date for the time period
      const startDate = getLimitStartDate(limitConfig.timePeriod);

      console.log('limitConfig', limitConfig);
      console.log('startDate', startDate);
      
      // Count existing assessments created by user in the time period
      const quizCount = await prisma.assessment.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: startDate
          }
        }
      });
      
      // Count existing assessment questions created by user in the time period
      const questionCount = await prisma.assessmentQuestion.count({
        where: {
          assessment: {
            userId: user.id,
            createdAt: {
              gte: startDate
            }
          }
        }
      });

      console.log('quizCount', quizCount);
      console.log('questionCount', questionCount);
      
      // Validate quiz creation
      const validation = validateQuizCreation(
        quizCount, 
        limitConfig
      );
      
      return Response.json({
        success: true,
        data: {
          limitConfig,
          currentUsage: {
            quizCount
          },
          requestedQuestions,
          validation,
          timePeriod: {
            startDate,
            type: limitConfig.timePeriod
          }
        }
      });
    } catch (error) {
      console.error('Error checking quiz limits:', error);
      return Response.json(
        { success: false, error: 'Failed to check quiz limits' },
        { status: 500 }
      );
    }
  })(req);
}

export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { requestedQuestions = 3 } = body;
      
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
      const limitConfig = getQuizLimitFromUserPlan(userPlanFeatures);
      
      // Get start date for the time period
      const startDate = getLimitStartDate(limitConfig.timePeriod);
      
      // Count existing assessments created by user in the time period
      const quizCount = await prisma.assessment.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: startDate
          }
        }
      });
      
      // Count existing assessment questions created by user in the time period
      const questionCount = await prisma.assessmentQuestion.count({
        where: {
          assessment: {
            userId: user.id,
            createdAt: {
              gte: startDate
            }
          }
        }
      });
      
      // Validate quiz creation
      const validation = validateQuizCreation(
        quizCount, 
        limitConfig
      );
      
      if (!validation.canCreateQuiz) {
        return Response.json(
          { 
            success: false, 
            error: 'Quiz creation limit exceeded',
            details: validation.errors,
            limits: {
              limitConfig,
              currentUsage: {
                quizCount
              },
              remaining: {
                quizzes: validation.remainingQuizzes
              }
            }
          },
          { status: 403 }
        );
      }
      
      return Response.json({
        success: true,
        data: {
          canCreate: true,
          limitConfig,
          currentUsage: {
            quizCount
          },
          remaining: {
            quizzes: validation.remainingQuizzes
          }
        }
      });
    } catch (error) {
      console.error('Error validating quiz limits:', error);
      return Response.json(
        { success: false, error: 'Failed to validate quiz limits' },
        { status: 500 }
      );
    }
  })(req);
}
