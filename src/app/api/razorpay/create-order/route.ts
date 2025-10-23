import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
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
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user.id;

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Get the plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { features: true }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (plan.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Plan is not active' }, { status: 400 });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month duration

    // Create Razorpay order first
    const razorpayOrder = await razorpay.orders.create({
      amount: plan.price_per_month * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planName: plan.name,
        userId: userId,
      }
    });

    // Create UserPlan with PENDING status using Razorpay order ID
    const userPlan = await prisma.userPlan.create({
      data: {
        userId,
        planId,
        duration: 1, // 1 month
        startDate,
        endDate,
        status: 'PENDING',
        paidAmount: plan.price_per_month,
        orderId: razorpayOrder.id, // Use Razorpay order ID
      }
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: plan.price_per_month,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      userPlanId: userPlan.id,
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
