import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getMessageLimit, getMessageLimitFromUserPlan, getLimitStartDate, getRemainingMessages, isUnlimitedMessaging, FeatureSlug } from '@/types/messaging-limits';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const featureSlug = searchParams.get('feature') || FeatureSlug.AI_CHAT;
    
    if (!userId) {
      const limitConfig = getMessageLimit(featureSlug);
      return NextResponse.json({ 
        hasActivePlan: false, 
        messageLimit: limitConfig.messageLimit,
        remainingMessages: limitConfig.messageLimit,
        messageCount: 0,
        featureSlug,
        timePeriod: limitConfig.timePeriod
      });
    }

    // Get the database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      const limitConfig = getMessageLimit(featureSlug);
      return NextResponse.json({ 
        hasActivePlan: false, 
        messageLimit: limitConfig.messageLimit,
        remainingMessages: limitConfig.messageLimit,
        messageCount: 0,
        featureSlug,
        timePeriod: limitConfig.timePeriod
      });
    }

    // Check if user has an active plan
    const currentDate = new Date();
    const activePlan = await prisma.userPlan.findFirst({
      where: {
        userId: dbUser.id,
        status: 'ACTIVE',
        startDate: {
          lte: currentDate
        },
        endDate: {
          gte: currentDate
        }
      },
      include: {
        plan: {
          include: {
            features: true
          }
        }
      }
    });

    // Get user's plan features if they have an active plan
    let userPlanFeatures: string[] = [];
    if (activePlan) {
      userPlanFeatures = activePlan.plan.features.map(feature => feature.featureSlug);
    }
    console.log('userPlanFeatures', userPlanFeatures);

    // Get limit configuration based on user's plan features or fallback to requested feature
    const limitConfig = userPlanFeatures.length > 0 
      ? getMessageLimitFromUserPlan(userPlanFeatures)
      : getMessageLimit(featureSlug);

    // If user has active plan and unlimited access
    if (activePlan && isUnlimitedMessaging(limitConfig)) {
      return NextResponse.json({ 
        hasActivePlan: true, 
        messageLimit: -1, // Unlimited
        remainingMessages: -1, // Unlimited
        messageCount: 0,
        featureSlug: userPlanFeatures[0] || featureSlug,
        timePeriod: limitConfig.timePeriod,
        userPlanFeatures
      });
    }

    // For users with limits, check message count based on time period
    const startDate = getLimitStartDate(limitConfig.timePeriod);

    const messageCount = await prisma.chatMessage.count({
      where: {
        sender: 'USER',
        session: {
          userId: dbUser.id
        },
        createdAt: {
          gte: startDate
        }
      }
    });

    const remainingMessages = getRemainingMessages(messageCount, limitConfig);

    return NextResponse.json({ 
      hasActivePlan: !!activePlan, 
      messageLimit: limitConfig.messageLimit,
      remainingMessages,
      messageCount,
      featureSlug: userPlanFeatures[0] || featureSlug,
      timePeriod: limitConfig.timePeriod,
      userPlanFeatures
    });

  } catch (error) {
    console.error('Error checking user limits:', error);
    return NextResponse.json(
      { error: 'Failed to check user limits' },
      { status: 500 }
    );
  }
}
