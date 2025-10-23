import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUserId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's active subscription plan
    const activePlan = await prisma.userPlan.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        startDate: {
          lte: new Date(), // Start date is in the past or today
        },
        endDate: {
          gte: new Date(), // End date is in the future or today
        },
      },
      include: {
        plan: {
          include: {
            features: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Get the most recent active plan
      },
    });

    if (!activePlan) {
      return NextResponse.json({ 
        success: true, 
        hasActivePlan: false,
        activePlan: null 
      });
    }

    return NextResponse.json({
      success: true,
      hasActivePlan: true,
      activePlan: {
        id: activePlan.id,
        planName: activePlan.plan.name,
        planDescription: activePlan.plan.description,
        startDate: activePlan.startDate,
        endDate: activePlan.endDate,
        paidAmount: activePlan.paidAmount,
        features: activePlan.plan.features.map(feature => ({
          id: feature.id,
          feature: feature.feature,
          description: feature.description,
          featureSlug: feature.featureSlug,
        })),
      },
    });

  } catch (error) {
    console.error('Error fetching active plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active plan' },
      { status: 500 }
    );
  }
}
