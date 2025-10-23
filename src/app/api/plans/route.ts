import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/plans - Get all plans with their features
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        features: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST /api/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    const { name, description, price_per_month, status, features } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Plan description is required' },
        { status: 400 }
      );
    }

    if (price_per_month === undefined || price_per_month < 0) {
      return NextResponse.json(
        { error: 'Valid price per month is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Plan status is required' },
        { status: 400 }
      );
    }

    // Check if plan with this name already exists
    const existingPlan = await prisma.plan.findFirst({
      where: { name: name.trim() }
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'A plan with this name already exists' },
        { status: 409 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price_per_month: parseInt(price_per_month),
        status: status,
        features: {
          create: features?.map((feature: any) => ({
            feature: feature.feature.trim(),
            description: feature.description.trim(),
            featureSlug: feature.featureSlug.trim(),
            status: feature.status || 'ACTIVE'
          })) || []
        }
      },
      include: {
        features: true
      }
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
